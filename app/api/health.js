/* GET /api/health — what this deployment can see.
 *
 * Booleans only: it never prints a value and never proves a key works, it just
 * says whether the name exists in the running environment. That is enough to
 * tell "the variable was saved but the deployment is older" apart from "the
 * variable went into another project".
 */

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ ok: false, error: "method" });
    return;
  }

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

  const has = (name) => Boolean(String(process.env[name] || "").trim());

  res.status(200).json({
    ok: true,
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7) || null,
    environment: process.env.VERCEL_ENV || null,
    supabase_url: has("SUPABASE_URL") || Boolean(publicConfig.url),
    supabase_anon_key: has("SUPABASE_ANON_KEY") || Boolean(publicConfig.anonKey),
    votel_api_key: has("VOTEL_API_KEY"),
    votel_api_token: has("VOTEL_API_TOKEN"),
    votel_email_from: has("VOTEL_EMAIL_FROM")
  });
};
