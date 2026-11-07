/* POST /api/votel/card — read one client's stamp card.
 *
 * Body: { token }   the card token from the join link (join.html?...&t=<token>).
 *
 * Returns the same shape get_card returns: name, stamps, milestone, reward,
 * visits, last_visit. Read-only.
 */

const v = require("../../lib/votel");

module.exports = async (req, res) => {
  if (!v.requirePost(req, res)) return;
  if (!v.guard(req, res)) return;

  const b = v.body(req);
  const token = v.text(b.token, 64);
  if (!token || !v.UUID.test(token)) {
    res.status(400).json({ ok: false, error: "bad_token" });
    return;
  }

  try {
    const r = await v.rpc("get_card", { p_token: token });
    if (!r.ok) {
      res.status(502).json({ ok: false, error: "supabase_error", status: r.status });
      return;
    }
    res.status(200).json(r.body);
  } catch (err) {
    res.status(502).json({ ok: false, error: "failed" });
  }
};
