/* Web Push sender shared by /api/push/*.
 *
 * Secrets: only PUSH_SEND_SECRET lives in Vercel. The VAPID keys are read from
 * the database (app_secrets, never readable with the public key) through a
 * function that requires that same secret. Nothing secret reaches the browser.
 *
 * Every message is "claimed" in push_log first, so the same stamp, reward or
 * reminder can never be pushed twice. Dead subscriptions (404/410) are revoked.
 * Email through Votel is untouched: push is sent in addition to it.
 */

const webpush = require("web-push");
const v = require("./votel");

const SECRET = () => process.env.PUSH_SEND_SECRET || "";
let vapidReady = null;

async function ensureVapid() {
  if (vapidReady) return vapidReady;
  const r = await v.rpc("get_push_config", { p_secret: SECRET() });
  const c = r.ok && r.body && r.body.ok ? r.body : null;
  if (!c || !c.public_key || !c.private_key) return false;
  webpush.setVapidDetails(c.subject || "mailto:support@retainos.co", c.public_key, c.private_key);
  vapidReady = true;
  return true;
}

function authorized(req, envNames) {
  const h = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || "");
  const got = h.replace(/^Bearer\s+/i, "").trim();
  if (!got) return false;
  return envNames.some(function (n) { return process.env[n] && got === process.env[n]; });
}

/* Message text, English or Spanish, by kind. */
function compose(kind, t, extra) {
  const es = (t.language || "en").toLowerCase().indexOf("es") === 0;
  const e = extra || {};
  const name = e.first_name ? String(e.first_name).split(" ")[0] : "";
  switch (kind) {
    case "stamp":
      return { title: t.shop, url: t.card_url,
        body: es ? "¡Sello agregado! Llevas " + (e.stamps != null ? e.stamps : "más") + " en tu tarjeta."
                 : "Stamp added! You're at " + (e.stamps != null ? e.stamps : "a new count") + " on your card." };
    case "reward":
      return { title: t.shop, url: e.claim_url || t.card_url,
        body: es ? "¡Ganaste " + (e.reward_name || "una recompensa") + "! Toca para reclamarla."
                 : "You earned " + (e.reward_name || "a reward") + "! Tap to claim it." };
    case "reminder":
      if (e.stage === "followup") {
        return { title: t.shop, url: t.card_url,
          body: es ? "¿Todavía pensando en tu próxima cita? Tu tarjeta te espera."
                   : "Still thinking about your next visit? Your card is waiting." };
      }
      return { title: t.shop, url: t.card_url,
        body: es ? (name ? "Hola " + name + ", " : "") + "ya casi es hora de tu próxima cita. Toca para reservar."
                 : (name ? "Hi " + name + ", " : "") + "it's about time for your next visit. Tap to book." };
    case "announcement":
      return { title: String(e.title || t.shop).slice(0, 60), url: e.url || t.card_url,
        body: String(e.body || "").slice(0, 180) };
    default:
      return null;
  }
}

/* Push one message to every device a client has turned on. */
async function sendToMember(memberId, kind, ref, extra) {
  const out = { member: memberId, kind: kind, sent: 0, failed: 0, skipped: null };
  if (!(await ensureVapid())) { out.skipped = "not_configured"; return out; }

  const claim = await v.rpc("claim_push", { p_secret: SECRET(), p_member: memberId, p_kind: kind, p_ref: String(ref) });
  if (!claim.ok || claim.body !== true) { out.skipped = "duplicate_or_forbidden"; return out; }

  const tr = await v.rpc("get_push_targets", { p_secret: SECRET(), p_member: memberId });
  const targets = tr.ok && tr.body && tr.body.ok ? tr.body.targets || [] : [];
  if (!targets.length) { out.skipped = "no_devices"; return out; }

  for (const t of targets) {
    const msg = compose(kind, t, extra);
    if (!msg || !msg.body) { out.skipped = "nothing_to_say"; continue; }
    const payload = JSON.stringify({ title: msg.title, body: msg.body, url: msg.url, tag: kind + ":" + ref });
    let ok = false, gone = false;
    try {
      await webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, payload, { TTL: 86400 });
      ok = true; out.sent++;
    } catch (err) {
      gone = err && (err.statusCode === 404 || err.statusCode === 410);
      out.failed++;
    }
    await v.rpc("mark_push_result", { p_secret: SECRET(), p_endpoint: t.endpoint, p_ok: ok, p_gone: !!gone });
  }
  return out;
}

module.exports = { authorized, sendToMember, ensureVapid, SECRET, compose };
