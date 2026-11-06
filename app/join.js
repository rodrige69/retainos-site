var T = {
  en: {
    h1: "Join our rewards club",
    sub: "Free to join. Every visit earns a stamp.",
    lPhone: "Your phone number",
    consent: "Text me my stamps and reminders from this shop. Message frequency varies, message and data rates may apply. Reply STOP to opt out.",
    join: "Join free",
    fine: "We only text about your own visits and rewards. Never for reviews.",
    needPhone: "Add your phone number.",
    needConsent: "Please tick the box so we're allowed to text you.",
    badPhone: "That number looks short — use 10 digits.",
    sub5: "The {n}th visit unlocks your {reward}.",
    subPlain: "Every visit earns a stamp.",
    hi: "You're in, {name}",
    hiReturn: "Welcome back, {name}",
    hiPlain: "You're in",
    hiBack: "Welcome back",
    cardSub: "{stamps} of {milestone} stamps",
    next: "{left} more visit(s) unlocks your {reward}.",
    ready: "Your reward is ready — show this at the counter.",
    note: "Nothing to download. Save this page to your home screen and it stays your card.",
    broken: "This code doesn't match a shop",
    brokenP: "Ask the front desk for the shop's code, or scan the QR on their counter.",
    demo: "Demo mode — no Supabase key in config.js, so nothing is saved.",
    foot: "Powered by RetainOS"
  },
  es: {
    h1: "Únete a nuestro club de premios",
    sub: "Es gratis. Cada visita gana un sello.",
    lPhone: "Tu número de teléfono",
    consent: "Quiero recibir mis sellos y recordatorios de este negocio por texto. La frecuencia varía; pueden aplicar cargos de mensajes y datos. Responde STOP para darte de baja.",
    join: "Unirme gratis",
    fine: "Solo te escribimos por tus visitas y premios. Nunca por reseñas.",
    needPhone: "Pon tu número de teléfono.",
    needConsent: "Marca la casilla para que podamos escribirte.",
    badPhone: "Ese número parece corto: usa 10 dígitos.",
    sub5: "La visita número {n} desbloquea tu {reward}.",
    subPlain: "Cada visita gana un sello.",
    hi: "Ya estás dentro, {name}",
    hiReturn: "Bienvenido de nuevo, {name}",
    hiPlain: "Ya estás dentro",
    hiBack: "Bienvenido de nuevo",
    cardSub: "{stamps} de {milestone} sellos",
    next: "Faltan {left} visita(s) para tu {reward}.",
    ready: "Tu premio está listo: muéstralo en el mostrador.",
    note: "Nada que descargar. Guarda esta página en tu inicio y será tu tarjeta.",
    broken: "Este código no corresponde a un negocio",
    brokenP: "Pídele el código al mostrador o escanea el QR de la caja.",
    demo: "Modo demo: no hay clave de Supabase en config.js, así que no se guarda nada.",
    foot: "Con tecnología de RetainOS"
  }
};

var slug = new URLSearchParams(location.search).get("shop");
if (!slug) {
  var parts = location.pathname.split("/").filter(Boolean);
  slug = parts.length ? parts[parts.length - 1].replace(/\.html$/, "") : "";
}

var shop = null;
var reward = { name: "hotel savings card" };
var lang = "en";
var tokenKey = "ros.card." + slug;

function t(k, vars) {
  var s = T[lang][k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}

function paint() {
  document.documentElement.lang = lang;
  document.getElementById("h1").textContent = t("h1");
  document.getElementById("lPhone").textContent = t("lPhone");
  document.getElementById("consentText").textContent = t("consent");
  document.getElementById("join").textContent = t("join");
  document.getElementById("fine").textContent = t("fine");
  document.getElementById("foot").textContent = t("foot");
  document.getElementById("brokenH").textContent = t("broken");
  document.getElementById("brokenP").textContent = t("brokenP");
  var sub = shop && shop.milestone
    ? t("sub5", { n: shop.milestone, reward: reward.name })
    : t("subPlain");
  document.getElementById("sub").textContent = sub;
  if (SB.demo) {
    var d = document.getElementById("demoNote");
    d.textContent = t("demo");
    d.classList.remove("hidden");
  }
}

function drawCard(c) {
  document.getElementById("form").classList.add("hidden");
  document.getElementById("card").classList.remove("hidden");
  var hiKey = c.returning ? (c.first_name ? "hiReturn" : "hiBack") : (c.first_name ? "hi" : "hiPlain");
  document.getElementById("cardHi").textContent = c.first_name ? t(hiKey, { name: c.first_name }) : t(hiKey);
  document.getElementById("cardSub").textContent = t("cardSub", { stamps: c.stamps, milestone: c.milestone });
  var row = document.getElementById("stampRow");
  row.innerHTML = "";
  for (var i = 0; i < (c.milestone || 5); i++) {
    var el = document.createElement("i");
    if (i < c.stamps) { el.className = "on"; el.textContent = "✓"; }
    else { el.textContent = String(i + 1); }
    row.appendChild(el);
  }
  var left = Math.max((c.milestone || 5) - c.stamps, 0);
  document.getElementById("cardNext").textContent = left === 0
    ? t("ready")
    : t("next", { left: left, reward: reward.name });
  document.getElementById("cardNote").textContent = t("note");
}

function broken() {
  document.getElementById("form").classList.add("hidden");
  document.getElementById("card").classList.add("hidden");
  document.getElementById("broken").classList.remove("hidden");
}

function boot() {
  paint();
  if (!slug) { broken(); return; }

  if (SB.demo) {
    shop = { id: slug, name: slug.replace(/-/g, " "), milestone: 5 };
    document.getElementById("shopName").textContent = shop.name;
    document.getElementById("badge").textContent = shop.name.charAt(0).toUpperCase();
    return;
  }

  SB.rest("shops?select=id,name,milestone,default_language&id=eq." + encodeURIComponent(slug))
    .then(function (rows) {
      if (!rows || !rows.length) { broken(); return; }
      shop = rows[0];
      lang = shop.default_language === "es" ? "es" : "en";
      document.getElementById("shopName").textContent = shop.name;
      document.getElementById("badge").textContent = shop.name.charAt(0).toUpperCase();
      document.getElementById("shopMeta").textContent = "";
      return SB.rest("rewards?select=name&plan_required=eq.regulars&kind=eq.hotel_card&order=amount_usd&limit=1")
        .then(function (r) {
          if (r && r.length) reward = r[0];
          paint();
          var saved = localStorage.getItem(tokenKey);
          if (saved) return SB.rpc("get_card", { p_token: saved }).then(function (c) {
            if (c && c.ok) drawCard(c); else localStorage.removeItem(tokenKey);
          });
        });
    })
    .catch(function () { broken(); });
}

document.getElementById("join").onclick = function () {
  var phone = document.getElementById("phone").value.trim();
  var consent = document.getElementById("consent").checked;
  if (!phone) { document.getElementById("phone").focus(); return say(t("needPhone")); }
  if (!consent) return say(t("needConsent"));
  if (phone.replace(/\D/g, "").length < 10) return say(t("badPhone"));

  if (SB.demo) {
    drawCard({ returning: false, first_name: "", stamps: 0, milestone: 5 });
    return;
  }

  var btn = this;
  btn.disabled = true;
  SB.rpc("join_shop", {
    p_shop: shop.id,
    p_phone: phone,
    p_language: lang,
    p_consent: T[lang].consent
  }).then(function (res) {
    if (!res || !res.ok) return say(t("badPhone"), "bad");
    localStorage.setItem(tokenKey, res.token);
    drawCard({ returning: res.returning, first_name: res.first_name, stamps: res.stamps, milestone: res.milestone });
  }).catch(function (e) { say(e.message, "bad"); })
    .then(function () { btn.disabled = false; });
};

function say(text, kind) {
  var m = document.getElementById("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

boot();
