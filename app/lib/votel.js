/* Shared plumbing for the token-guarded Votel endpoints.
 *
 * These endpoints exist so Votel (or any automation) can do a few named things
 * without holding a database key that ignores row-level security. One secret,
 * VOTEL_API_TOKEN, is the whole credential; rotating it in Vercel revokes every
 * caller at once.
 *
 * The Supabase URL and anon key are public (they ship in config.js), so they are
 * read from there; SUPABASE_URL / SUPABASE_ANON_KEY still override them.
 */

const crypto = require("crypto");

let publicConfig = {};
try {
  const hadWindow = Object.prototype.hasOwnProperty.call(global, "window");
  const previous = global.window;
  global.window = global.window || {};
  require("../config.js");
  publicConfig = global.window.RETAINOS_CONFIG || {};
  if (hadWindow) global.window = previous;
  else delete global.window;
} catch (e) {
  publicConfig = {};
}

const SUPA_URL = (process.env.SUPABASE_URL || publicConfig.url || "").replace(/\/$/, "");
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || publicConfig.anonKey || "";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function configured() {
  return Boolean(process.env.VOTEL_API_TOKEN && SUPA_URL && SUPA_KEY);
}

function authorized(req) {
  const want = process.env.VOTEL_API_TOKEN || "";
  const header = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || "");
  const got = header.replace(/^Bearer\s+/i, "");
  if (!want || !got) return false;
  const a = Buffer.from(want);
  const b = Buffer.from(got);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function rpc(name, args) {
  /* The anon key on purpose: every call still goes through the same RPC the app
     uses, so the database rules stay the ones that decide, not this function. */
  const res = await fetch(SUPA_URL + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: {
      apikey: SUPA_KEY,
      Authorization: "Bearer " + SUPA_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args || {})
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
}

function body(req) {
  let b = req.body;
  if (typeof b === "string") {
    try {
      b = JSON.parse(b);
    } catch (e) {
      b = null;
    }
  }
  return b || {};
}

function text(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max || 200);
}

function requirePost(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method" });
    return false;
  }
  return true;
}

function guard(req, res) {
  if (!configured()) {
    res.status(501).json({ ok: false, error: "not_configured" });
    return false;
  }
  if (!authorized(req)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return false;
  }
  return true;
}

module.exports = { configured, authorized, rpc, body, text, requirePost, guard, UUID };
