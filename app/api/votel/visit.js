/* POST /api/votel/visit — log one visit for a client.
 *
 * Body: { shop, phone, pin, visit_type? }
 *   pin           a staff PIN at that shop (the same one the counter pad uses),
 *                 which is what authorises a visit; there is no DB key anywhere.
 *   visit_type    free text, defaults to "appointment".
 *
 * Answers with the log_visit result unchanged, so a workflow can branch on
 * ok / too_soon / not_member / bad_pin without understanding HTTP codes.
 */

const v = require("../../lib/votel");

module.exports = async (req, res) => {
  if (!v.requirePost(req, res)) return;
  if (!v.guard(req, res)) return;

  const b = v.body(req);
  const shop = v.text(b.shop, 60);
  const phone = v.text(b.phone, 32);
  const pin = v.text(b.pin, 12);
  if (!shop || !phone || !pin) {
    res.status(400).json({ ok: false, error: "shop_phone_pin_required" });
    return;
  }

  try {
    const r = await v.rpc("log_visit", {
      p_shop: shop,
      p_pin: pin,
      p_phone: phone,
      p_visit_type: v.text(b.visit_type, 40) || "appointment"
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
