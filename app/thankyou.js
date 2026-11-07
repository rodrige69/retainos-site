/* Thank you · app.retainos.co/thankyou.html?shop=<shop>&t=<card token>&n=<name>
   The page that used to be the card. It now hands over a real link to the card,
   the two taps that save it to a phone, and the warning about the email. */

var T = {
  en: {
    h1: "You're in{name}",
    sub: "Your card sits at {shop}. One visit is one stamp.",
    linkLbl: "Your card link",
    copy: "Copy",
    copied: "Copied",
    openCard: "Open my card",
    saveH: "Save it to your phone",
    step1: "Open your card link and tap your browser's share button.",
    step2: "iPhone: scroll down and tap “Add to Home Screen”. Android: tap “Add to Home screen” or “Install app”.",
    step3: "It now sits on your home screen next to your other apps — no app store, nothing to download.",
    emailH: "Check your email",
    emailP: "We sent your card link to the email you gave us. It's the fastest way to get your card back if you change phones.",
    emailNote: "Don't see it? Look in spam or junk and mark it “not spam” so your stamps don't end up there.",
    optOut: "Texts are only about your visits and rewards. Reply STOP to opt out, HELP for help.",
    shopMeta: "Rewards club",
    demo: "Demo mode — no Supabase key in config.js.",
    foot: "Powered by RetainOS"
  },
  es: {
    h1: "Ya estás dentro{name}",
    sub: "Tu tarjeta vive en {shop}. Una visita es un sello.",
    linkLbl: "El enlace de tu tarjeta",
    copy: "Copiar",
    copied: "Copiado",
    openCard: "Abrir mi tarjeta",
    saveH: "Guárdala en tu teléfono",
    step1: "Abre el enlace de tu tarjeta y toca el botón de compartir del navegador.",
    step2: "iPhone: baja y toca “Añadir a pantalla de inicio”. Android: toca “Añadir a pantalla de inicio” o “Instalar app”.",
    step3: "Ya está en tu pantalla de inicio junto a tus otras apps: sin tienda de apps y nada que descargar.",
    emailH: "Revisa tu correo",
    emailP: "Enviamos el enlace de tu tarjeta al correo que nos diste. Es la forma más rápida de recuperarla si cambias de teléfono.",
    emailNote: "¿No lo ves? Mira en spam o correo no deseado y márcalo como “no es spam” para que tus sellos no acaben ahí.",
    optOut: "Solo enviamos mensajes por tus visitas y premios. Responde STOP para darte de baja, HELP para ayuda.",
    shopMeta: "Club de premios",
    demo: "Modo demo: no hay clave de Supabase en config.js.",
    foot: "Con tecnología de RetainOS"
  }
};

var params = new URLSearchParams(location.search);
var slug = params.get("shop") || "";
var token = params.get("t") || "";
var name = params.get("n") || "";
var lang = localStorage.getItem("ros.lang") || "en";

function t(k, vars) {
  var s = (T[lang] && T[lang][k]) || T.en[k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}
function $(id) { return document.getElementById(id); }

function paint(shop) {
  /* Decide the language before any string is written, so a Spanish shop never
     paints one pass in English. */
  if (shop && shop.default_language === "es") lang = "es";
  document.documentElement.lang = lang;
  $("h1").textContent = t("h1", { name: name ? ", " + name : "" });
  $("sub").textContent = t("sub", { shop: shop && shop.name ? shop.name : "" });
  ["linkLbl", "copy", "openCard", "saveH", "step1", "step2", "step3",
   "emailH", "emailP", "emailNote", "optOut", "foot"].forEach(function (id) {
    $(id).textContent = t(id);
  });
  $("shopMeta").textContent = t("shopMeta");
  if (shop && shop.name) {
    $("shopName").textContent = shop.name;
    $("badge").textContent = shop.name.charAt(0).toUpperCase();
  }
  if (SB.demo) {
    var d = $("demoNote");
    d.textContent = t("demo");
    d.classList.remove("hidden");
  }
}

function drawStamps(c) {
  var milestone = (c && c.milestone) || 5;
  var stamps = (c && c.stamps) || 0;
  var row = $("stampRow");
  row.innerHTML = "";
  for (var i = 0; i < milestone; i++) {
    var el = document.createElement("i");
    if (i < stamps) { el.className = "on"; el.textContent = "✓"; }
    else { el.textContent = String(i + 1); }
    row.appendChild(el);
  }
}

var cardLink = token
  ? location.origin + "/join.html?shop=" + encodeURIComponent(slug) + "&t=" + encodeURIComponent(token)
  : location.origin + "/join.html?shop=" + encodeURIComponent(slug);
$("cardUrl").value = cardLink;
$("openCard").href = cardLink;

$("copy").onclick = function () {
  var input = $("cardUrl");
  input.select();
  var done = function () {
    var b = $("copy");
    b.textContent = t("copied");
    setTimeout(function () { b.textContent = t("copy"); }, 1500);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, done);
  else { document.execCommand("copy"); done(); }
};

paint(null);

if (SB.demo) {
  drawStamps({ stamps: 2, milestone: 5 });
} else {
  if (slug) {
    SB.rest("shops?select=id,name,milestone,default_language&id=eq." + encodeURIComponent(slug))
      .then(function (rows) {
        var shop = rows && rows[0];
        if (shop) paint(shop);
        if (window.ROS && shop) ROS.promo($("promo"), shop.id);
        return shop;
      })
      .catch(function () {});
  }
  if (token) {
    SB.rpc("get_card", { p_token: token }).then(function (c) {
      if (c && c.ok) drawStamps(c);
    }).catch(function () {});
  }
}
