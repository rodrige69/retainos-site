/* GET /api/push/key — the public VAPID key the card needs to turn push on.
 * Public by design (it is the "public" half). 501 until push is configured. */

const v = require("../../lib/votel");

module.exports = async (req, res) => {
  const secret = process.env.PUSH_SEND_SECRET || "";
  if (!secret) { res.status(501).json({ ok: false, error: "not_configured" }); return; }
  try {
    const r = await v.rpc("get_push_config", { p_secret: secret });
    const key = r.ok && r.body && r.body.ok ? r.body.public_key : null;
    if (!key) { res.status(501).json({ ok: false, error: "not_configured" }); return; }
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).json({ ok: true, key: key });
  } catch (err) {
    res.status(502).json({ ok: false, error: "failed" });
  }
};
