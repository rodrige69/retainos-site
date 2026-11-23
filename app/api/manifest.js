/* GET /api/manifest?shop=<slug> — the install manifest for one shop's card.
 *
 * The home-screen app is named after the shop ("Fade Lab Barbershop Rewards"),
 * so clients see their salon on their phone, not RetainOS. If the shop has a
 * logo it is offered as the icon; the RetainOS icons always stay in the list as
 * the fallback. Unknown shop, bad slug or any lookup problem -> the generic
 * manifest, so installing never breaks.
 *
 * Reads only the public shop name/logo (the same fields the join page already
 * shows to anyone) with the public anon key.
 */

const BRAND_ICONS = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
];

function configValues() {
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
  } catch (e) { /* fall back to env vars */ }
  return out;
}

function manifest(name, shortName, icons) {
  return {
    name: name,
    short_name: shortName,
    description: "Your stamps and rewards, one tap away.",
    display: "standalone",
    scope: "/",
    background_color: "#FCF9F3",
    theme_color: "#FCF9F3",
    icons: icons
  };
}

/* Home-screen labels show about 12 characters. */
function shortLabel(shop) {
  if (shop.length <= 12) return shop;
  let out = "";
  for (const w of shop.split(/\s+/)) {
    const next = out ? out + " " + w : w;
    if (next.length > 12) break;
    out = next;
  }
  return out || shop.slice(0, 12);
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");

  const fallback = manifest("My Rewards Card", "Rewards", BRAND_ICONS);
  const slug = String((req.query && req.query.shop) || "").toLowerCase();
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) { res.status(200).send(JSON.stringify(fallback)); return; }

  const cfg = configValues();
  const url = (process.env.SUPABASE_URL || cfg.url || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY || cfg.anonKey || "";
  if (!url || !key) { res.status(200).send(JSON.stringify(fallback)); return; }

  try {
    const r = await fetch(url + "/rest/v1/shops?select=name,logo_url&id=eq." + encodeURIComponent(slug), {
      headers: { apikey: key, Authorization: "Bearer " + key }
    });
    const rows = r.ok ? await r.json() : [];
    const shop = rows && rows[0];
    if (!shop || !shop.name) { res.status(200).send(JSON.stringify(fallback)); return; }

    const name = String(shop.name).trim().slice(0, 60);
    const icons = BRAND_ICONS.slice();
    if (shop.logo_url && /^https:\/\//i.test(shop.logo_url)) {
      icons.unshift({ src: shop.logo_url, sizes: "any", purpose: "any" });
    }
    res.status(200).send(JSON.stringify(manifest(name + " Rewards", shortLabel(name), icons)));
  } catch (e) {
    res.status(200).send(JSON.stringify(fallback));
  }
};
