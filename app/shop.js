/* Public shop card · app.retainos.co/<shop> (served as shop.html?shop=<shop>)
   Everything here is public on purpose: name, type, address, phone, booking
   link, website, Instagram. Missing pieces are simply not shown. */
var T = {
  en: {
    book: "Book now", join: "Join our rewards club", joinNote: "Free. A stamp every visit, rewards you'll actually use.",
    call: "Call", directions: "Directions", website: "Website", instagram: "Instagram",
    foot: "Powered by RetainOS", brokenH: "We can't find that shop",
    brokenP: "Check the link, or ask the shop for their card link.",
    types: { barbershop: "Barbershop", hair_salon: "Hair salon", braiding: "Braiding salon", nails: "Nail salon", lash: "Lash & brow studio", spa: "Massage & spa" }
  },
  es: {
    book: "Reservar", join: "Únete al club de premios", joinNote: "Gratis. Un sello cada visita, premios que sí usarás.",
    call: "Llamar", directions: "Cómo llegar", website: "Sitio web", instagram: "Instagram",
    foot: "Con tecnología de RetainOS", brokenH: "No encontramos ese negocio",
    brokenP: "Revisa el enlace o pídele al negocio su enlace de tarjeta.",
    types: { barbershop: "Barbería", hair_salon: "Salón de belleza", braiding: "Salón de trenzas", nails: "Salón de uñas", lash: "Pestañas y cejas", spa: "Masajes y spa" }
  }
};
var params = new URLSearchParams(location.search);
var slug = params.get("shop");
var lang = params.get("l") === "es" ? "es" : "en";
var shop = null;

function $(id) { return document.getElementById(id); }
function safeUrl(u) { return /^https?:\/\/\S+$/i.test(u || "") ? u : ""; }

function paint() {
  document.documentElement.lang = lang;
  $("en").className = lang === "en" ? "on" : "";
  $("es").className = lang === "es" ? "on" : "";
  var L = T[lang];
  $("foot").textContent = L.foot;
  $("brokenH").textContent = L.brokenH;
  $("brokenP").textContent = L.brokenP;
  if (!shop) return;
  $("book").textContent = L.book;
  $("join").textContent = L.join;
  $("joinNote").textContent = L.joinNote;
  $("shopType").textContent = L.types[shop.business_type] || "";
  var q = "join.html?shop=" + encodeURIComponent(shop.id) + "&l=" + lang;
  if (params.get("ref")) q += "&ref=" + encodeURIComponent(params.get("ref"));
  $("join").href = q;

  var line = [shop.address, [shop.city, shop.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
  $("where").textContent = line;
  $("where").hidden = !line;

  var reach = $("reach");
  reach.innerHTML = "";
  function add(href, label, ext) {
    var a = document.createElement("a");
    a.href = href; a.textContent = label;
    if (ext) { a.target = "_blank"; a.rel = "noopener"; }
    reach.appendChild(a);
  }
  var digits = (shop.phone || "").replace(/\D/g, "");
  if (digits.length >= 10) add("tel:+" + (digits.length === 10 ? "1" : "") + digits, L.call);
  var place = [shop.name, shop.address, shop.city, shop.state, shop.zip].filter(Boolean).join(" ");
  if (shop.address || shop.city) add("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place), L.directions, true);
  if (safeUrl(shop.website)) add(shop.website, L.website, true);
  if (shop.instagram) add("https://instagram.com/" + encodeURIComponent(shop.instagram), L.instagram, true);
  reach.hidden = !reach.children.length;
}

["en", "es"].forEach(function (k) { $(k).onclick = function () { lang = k; paint(); }; });

paint();
if (!slug) { $("broken").hidden = false; }
else {
  SB.rest("shops?select=id,name,business_type,default_language,logo_url,owner_photo_url,address,city,state,zip,phone,booking_link,website,instagram&id=eq." + encodeURIComponent(slug))
    .then(function (rows) {
      shop = rows && rows[0];
      if (!shop) { $("broken").hidden = false; return; }
      if (!params.get("l") && shop.default_language === "es") lang = "es";
      document.title = shop.name + " · RetainOS";
      $("shopName").textContent = shop.name;
      ROS.brand(shop);
      var b = $("book");
      if (safeUrl(shop.booking_link)) { b.href = shop.booking_link; b.hidden = false; }
      $("page").hidden = false;
      paint();
    })
    .catch(function () { $("broken").hidden = false; });
}
