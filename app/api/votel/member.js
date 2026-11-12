/* POST /api/votel/member — put a client on a shop's card.
 *
 * Body: { shop, phone, consent, first?, last?, email?, language?, ref? }
 *   ref       a member's referral code, when the friend arrived through one.
 *   consent   the exact wording the client agreed to. It is stored on the member
 *             row with the timestamp, so it is required, never assumed.
 *
 * Same behaviour as the join page, including the shop's starting stamps: the
 * call is idempotent per phone number and returns `returning: true` for someone
 * who is already on the card.
 */

const v = require("../../lib/votel");

module.exports = async (req, res) => {
  if (!v.requirePost(req, res)) return;
  if (!v.guard(req, res)) return;

  const b = v.body(req);
  const shop = v.text(b.shop, 60);
  const phone = v.text(b.phone, 32);
  const consent = v.text(b.consent, 600);
  if (!shop || !phone) {
    res.status(400).json({ ok: false, error: "shop_phone_required" });
    return;
  }
  if (!consent) {
    res.status(400).json({ ok: false, error: "consent_required" });
    return;
  }

  try {
    const r = await v.rpc("join_shop", {
      p_shop: shop,
      p_phone: phone,
      p_language: v.text(b.language, 5) === "es" ? "es" : "en",
      p_consent: consent,
      p_first: v.text(b.first, 80) || null,
      p_last: v.text(b.last, 80) || null,
      p_email: v.text(b.email, 160) || null,
      p_ref: v.text(b.ref, 20) || null
    });
    if (!r.ok) {
      res.status(502).json({ ok: false, error: "supabase_error", status: r.status });
      return;
    }
    res.status(200).json(r.body);
  } catch (err) {
    res.status(502).json({ ok: false, error: "failed" });
  }
};
