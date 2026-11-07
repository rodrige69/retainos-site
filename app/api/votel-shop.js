/* POST /api/votel-shop — puts a newly created shop into Votel.
 *
 * Runs on the server so the Votel key never reaches the browser. The browser
 * sends only the shop id plus the owner's Supabase access token; everything
 * else is read back from Supabase with that token, so a caller can only ever
 * sync a shop they own.
 *
 * The contact is shaped like the ones already in Votel: company = the business,
 * owner email as the contact email, and the ros-* tags that group shops
 * (ros-shop:<slug> is what puts every one of a shop's people under it).
 *
 * Env: VOTEL_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY.
 */

const MCP_URL = "https://ai.clientcontactpro.com/mcp";

const INDUSTRY_GROUP = {
  barbershop: "beauty",
  hair_salon: "beauty",
  braiding: "beauty",
  brow: "beauty",
  nails: "beauty",
  esthetics: "beauty",
  tattoo: "beauty",
  spa: "wellness",
  massage: "wellness"
};

function shopTags(shop) {
  const tags = ["ros-shop-owner", "ros-shop:" + shop.id];
  if (shop.business_type) {
    tags.push("ros-niche:" + shop.business_type);
    const group = INDUSTRY_GROUP[shop.business_type] || shop.industry || shop.business_type;
    if (group) tags.push("ros-industry:" + String(group).toLowerCase().replace(/\s+/g, "-"));
  }
  if (shop.plan) tags.push("ros-plan:" + shop.plan);
  return tags;
}

/* MCP is JSON-RPC over an SSE stream: initialize, say hello, then call a tool. */
async function mcp(payload, sessionId) {
  const headers = {
    Authorization: "Bearer " + process.env.VOTEL_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream"
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  const res = await fetch(MCP_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  const text = await res.text();
  const nextSession = res.headers.get("mcp-session-id") || sessionId;

  let out = null;
  for (const line of text.split("\n")) {
    if (line.startsWith("data:")) {
      try {
        out = JSON.parse(line.slice(5).trim());
      } catch (e) {
        /* a partial or non-JSON frame: keep looking */
      }
    }
  }
  if (!out && text.trim().startsWith("{")) out = JSON.parse(text);
  if (!res.ok) throw new Error("votel_http_" + res.status);
  if (out && out.error) throw new Error(out.error.message || "votel_error");
  return { out, sessionId: nextSession };
}

function contactIdFrom(out) {
  const structured = out && out.result && out.result.structuredContent;
  if (structured) {
    const c = structured.contact || structured;
    if (c && c.id) return c.id;
  }
  const content = out && out.result && out.result.content;
  const text = Array.isArray(content) ? content.map((c) => c.text || "").join("\n") : "";
  const match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
}

async function supa(path, token, init) {
  const res = await fetch(process.env.SUPABASE_URL.replace(/\/$/, "") + path, {
    ...init,
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      ...((init && init.headers) || {})
    }
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method" });
    return;
  }
  if (!process.env.VOTEL_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    res.status(501).json({ ok: false, error: "not_configured" });
    return;
  }

  const auth = (req.headers && (req.headers.authorization || req.headers.Authorization)) || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) {
    res.status(401).json({ ok: false, error: "auth_required" });
    return;
  }

  let payload = req.body;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      payload = null;
    }
  }
  const shopId = payload && payload.shop_id;
  if (!shopId || typeof shopId !== "string") {
    res.status(400).json({ ok: false, error: "bad_shop" });
    return;
  }

  try {
    /* RLS on shop_owners answers this with rows only if this token owns the shop. */
    const owned = await supa(
      "/rest/v1/shop_owners?select=shop_id&shop_id=eq." + encodeURIComponent(shopId),
      token
    );
    if (!owned.ok || !Array.isArray(owned.body) || owned.body.length === 0) {
      res.status(403).json({ ok: false, error: "not_owner" });
      return;
    }

    const shopRes = await supa(
      "/rest/v1/shops?select=id,name,phone,city,state,zip,business_type,industry,plan,votel_contact_id" +
        "&id=eq." + encodeURIComponent(shopId),
      token
    );
    const shop = shopRes.ok && Array.isArray(shopRes.body) ? shopRes.body[0] : null;
    if (!shop) {
      res.status(404).json({ ok: false, error: "unknown_shop" });
      return;
    }
    if (shop.votel_contact_id) {
      res.status(200).json({ ok: true, skipped: true, contact_id: shop.votel_contact_id });
      return;
    }

    const me = await supa("/auth/v1/user", token);
    const ownerEmail = me.ok && me.body ? me.body.email : null;

    const args = {
      company: shop.name,
      lifecycle_stage: "customer",
      tags: shopTags(shop)
    };
    if (ownerEmail) args.email = ownerEmail;
    if (shop.phone) args.phone = shop.phone;
    if (shop.city) args.city = shop.city;
    if (shop.state) args.state = shop.state;
    if (shop.zip) args.postal_code = shop.zip;

    const init = await mcp({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "retainos-site", version: "1" }
      }
    });
    const sessionId = init.sessionId;
    try {
      await mcp({ jsonrpc: "2.0", method: "notifications/initialized" }, sessionId);
    } catch (e) {
      /* notifications may be answered with 202/empty; not fatal */
    }

    const created = await mcp(
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "create_contact", arguments: args }
      },
      sessionId
    );
    const contactId = contactIdFrom(created.out);
    if (!contactId) {
      res.status(502).json({ ok: false, error: "no_contact_id" });
      return;
    }

    const saved = await supa("/rest/v1/rpc/set_shop_votel_contact", token, {
      method: "POST",
      body: JSON.stringify({ p_shop: shop.id, p_contact: contactId })
    });
    if (!saved.ok) {
      res.status(502).json({ ok: false, error: "not_saved", contact_id: contactId });
      return;
    }

    res.status(200).json({ ok: true, contact_id: contactId, tags: args.tags });
  } catch (err) {
    /* Never send the key or the raw Votel body back to the browser. */
    res.status(502).json({ ok: false, error: "votel_failed", detail: String(err && err.message).slice(0, 80) });
  }
};
