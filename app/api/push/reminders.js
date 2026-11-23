/* GET /api/push/reminders — daily "time to book again" pushes.
 * Run once a day by Vercel Cron (see vercel.json). Vercel sends
 * Authorization: Bearer <CRON_SECRET>; PUSH_SEND_SECRET is also accepted for a manual run.
 *
 * Who: opted-in clients whose rebook window just arrived (due date) or passed
 * by a week (one follow-up). Each is sent at most once per visit (push_log).
 */

const v = require("../../lib/votel");
const push = require("../../lib/push");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!push.SECRET()) { res.status(501).json({ ok: false, error: "not_configured" }); return; }
  if (!push.authorized(req, ["CRON_SECRET", "PUSH_SEND_SECRET"])) { res.status(401).json({ ok: false, error: "unauthorized" }); return; }

  try {
    const r = await v.rpc("get_push_reminders", { p_secret: push.SECRET() });
    const due = r.ok && r.body && r.body.ok ? r.body.due || [] : [];
    let sent = 0, failed = 0, skipped = 0;
    for (const d of due) {
      const out = await push.sendToMember(d.member_id, "reminder", d.ref, { stage: d.stage, first_name: d.first_name });
      sent += out.sent; failed += out.failed; if (out.skipped) skipped++;
    }
    res.status(200).json({ ok: true, due: due.length, sent: sent, failed: failed, skipped: skipped });
  } catch (err) {
    res.status(502).json({ ok: false, error: "failed" });
  }
};
