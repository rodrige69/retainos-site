/* POST /api/push/send — push one event to opted-in clients.
 * Auth: Authorization: Bearer <PUSH_SEND_SECRET>
 *
 * Stamp / reward (sent automatically by the database after a visit):
 *   { member_id, kind: "stamp"|"reward", ref, stamps?, reward_name?, claim_url? }
 * Shop announcement (owner or Votel workflow):
 *   { shop_id, kind: "announcement", ref, title, body, url? }
 *
 * "ref" makes each message unique: sending the same ref twice does nothing.
 */

const v = require("../../lib/votel");
const push = require("../../lib/push");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!v.requirePost(req, res)) return;
  if (!push.SECRET()) { res.status(501).json({ ok: false, error: "not_configured" }); return; }
  if (!push.authorized(req, ["PUSH_SEND_SECRET"])) { res.status(401).json({ ok: false, error: "unauthorized" }); return; }

  const b = v.body(req);
  const kind = v.text(b.kind, 20);
  const ref = v.text(b.ref, 120);
  if (!ref || ["stamp", "reward", "announcement"].indexOf(kind) < 0) {
    res.status(400).json({ ok: false, error: "bad_request" }); return;
  }

  try {
    if (kind === "announcement") {
      const shop = v.text(b.shop_id, 80);
      const body = v.text(b.body, 180);
      if (!shop || !body) { res.status(400).json({ ok: false, error: "bad_request" }); return; }
      const m = await v.rpc("get_push_shop_members", { p_secret: push.SECRET(), p_shop: shop });
      const ids = m.ok && m.body && m.body.ok ? m.body.members || [] : [];
      const results = [];
      for (const id of ids) {
        results.push(await push.sendToMember(id, "announcement", shop + ":" + ref,
          { title: v.text(b.title, 60), body: body, url: v.text(b.url, 400) }));
      }
      res.status(200).json({ ok: true, members: ids.length,
        sent: results.reduce((a, r) => a + r.sent, 0), failed: results.reduce((a, r) => a + r.failed, 0) });
      return;
    }

    const member = v.text(b.member_id, 64);
    if (!member || !v.UUID.test(member)) { res.status(400).json({ ok: false, error: "bad_member" }); return; }
    const r = await push.sendToMember(member, kind, ref, {
      stamps: b.stamps, reward_name: v.text(b.reward_name, 80), claim_url: v.text(b.claim_url, 400) });
    res.status(200).json(Object.assign({ ok: true }, r));
  } catch (err) {
    res.status(502).json({ ok: false, error: "failed" });
  }
};
