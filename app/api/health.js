/* GET /api/health — which deployment is answering, and (admins only) what it can see.
 *
 * The public answer is deliberately boring: `ok` and the commit. Which
 * integration secrets exist is only useful to whoever operates the deployment,
 * so the detail needs a signed-in platform admin — the same `is_platform_admin`
 * rule the database uses, checked by calling it with the caller's own token.
 *
 * Never prints a value: the detail is booleans, so a leaked response still
 * cannot be replayed as a credential.
 */

function configValues() {
  /* config.js parks its values on window. If another module already required it
     in this same instance, the cached module never runs again and window is
     gone, so the read would flip between true and false per request. Drop it
     from the cache first so the answer is the same every time. */
  const out = {};
  try {
    const configPath = require.resolve("../config.js");
    delete require.cache[configPath];
    const hadWindow = Object.prototype.hasOwnProperty.call(global, "window");
    const previous = global.window;
    global.window = global.window || {};
    require(configPath);
    const cfg = global.window.RETAINOS_CONFIG || {};
    out.url = cfg.url || "";
    out.anonKey = cfg.anonKey || "";
    global.window = hadWindow ? previous : global.window;
    if (!hadWindow) delete global.window;
  } catch (e) {
    /* no config: env vars may still be set */
  }
  return out;
}

async function callerIsAdmin(req, url, key) {
  const header = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || "");
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const res = await fetch(url + "/rest/v1/rpc/is_platform_admin", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: "{}"
  });
  if (!res.ok) return false;
  const body = await res.json().catch(() => null);
  return body === true;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ ok: false, error: "method" });
    return;
  }

  const publicBody = {
    ok: true,
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7) || null
  };

  const cfg = configValues();
  const url = (process.env.SUPABASE_URL || cfg.url || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY || cfg.anonKey || "";

  let admin = false;
  if (url && key) {
    try {
      admin = await callerIsAdmin(req, url, key);
    } catch (e) {
      admin = false;
    }
  }
  if (!admin) {
    res.status(200).json(publicBody);
    return;
  }

  const has = (name) => Boolean(String(process.env[name] || "").trim());
  res.status(200).json({
    ok: true,
    commit: publicBody.commit,
    environment: process.env.VERCEL_ENV || null,
    supabase_url: Boolean(url),
    supabase_anon_key: Boolean(key),
    votel_api_key: has("VOTEL_API_KEY"),
    votel_api_token: has("VOTEL_API_TOKEN"),
    votel_email_from: has("VOTEL_EMAIL_FROM")
  });
};
