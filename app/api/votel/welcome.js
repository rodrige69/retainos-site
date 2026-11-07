/* /api/votel/welcome — emails a client their card link right after they join.
 *
 * Browser-facing, so it does NOT use VOTEL_API_TOKEN (a secret in the page would
 * be public). The card token is the credential: member_receipt returns exactly
 * one member, and only for the token that member already holds. The email is
 * sent through Votel from the shop's RetainOS sender identity, so the client can
 * get their card back after changing phones — which is what the thank-you page
 * promises.
 */

const { rpc, body, text, requirePost, UUID } = require("../../lib/votel.js");

const MCP = "https://ai.clientcontactpro.com/mcp";
const FROM = process.env.VOTEL_EMAIL_FROM || "support@retainos.co";

async function mcpCall(tool, args) {
  const key = process.env.VOTEL_API_KEY;
  if (!key) return { ok: false, error: "not_configured" };

  const base = {
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream"
  };

  const hello = await fetch(MCP, {
    method: "POST",
    headers: base,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "retainos", version: "1" }
      }
    })
  });
  const session = hello.headers.get("mcp-session-id");
  if (!session) return { ok: false, error: "handshake" };
  const headers = Object.assign({}, base, { "mcp-session-id": session });

  await fetch(MCP, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })
  }).catch(() => {});

  const res = await fetch(MCP, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: tool, arguments: args }
    })
  });

  const raw = await res.text();
  let out = null;
  raw.split("\n").forEach((line) => {
    if (!line.startsWith("data:")) return;
    try { out = JSON.parse(line.slice(5).trim()); } catch (e) {}
  });
  if (!out) return { ok: false, error: "no_response" };
  if (out.error) return { ok: false, error: "mcp", detail: out.error.message };
  const result = out.result || {};
  const content = Array.isArray(result.content) ? result.content : [];
  const said = content.map((c) => c.text || "").join("\n");
  return { ok: !result.isError, text: said };
}

function emailBody(m) {
  return [
    "Hi " + (m.first_name || "there") + ",",
    "",
    "You're in at " + m.shop + ". Your card is here:",
    "",
    m.card_url,
    "",
    "Open that link and add it to your phone's home screen, so it's one tap at the counter.",
    "One visit is one stamp. You're at " + (m.stamps || 0) + " of " + (m.milestone || 5) + ".",
    "",
    "Lost the link? Reply to this email and ask, or give the shop your phone number.",
    "",
    "Texts are only about your visits and rewards. Reply STOP to opt out, HELP for help.",
    "",
    "— " + m.shop
  ].join("\n");
}

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;

  const b = body(req);
  const token = text(b.token, 60);
  if (!UUID.test(token)) return res.status(400).json({ ok: false, error: "bad_token" });

  const card = await rpc("member_receipt", { p_token: token });
  if (!card.ok) return res.status(502).json({ ok: false, error: "database" });
  if (!card.body || !card.body.ok) return res.status(404).json({ ok: false, error: "unknown_card" });

  const m = card.body;
  if (!m.email) return res.status(200).json({ ok: false, error: "no_email" });

  const sent = await mcpCall("send_email", {
    to: m.email,
    from: FROM,
    subject: m.shop + ": your reward card",
    body: emailBody(m),
    send_immediately: true
  });

  if (!sent.ok) {
    return res.status(sent.error === "not_configured" ? 503 : 502).json({
      ok: false,
      error: sent.error,
      detail: sent.detail || sent.text || null
    });
  }

  return res.status(200).json({ ok: true, sent: true, to: m.email, reply: sent.text || null });
};
