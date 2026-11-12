/* Join the card · app.retainos.co/join.html?shop=<shop>
   Captures first name, last name, mobile and email with the text consent, then
   sends the client to the thank-you page with a link to their card.

   Opening that link again (?t=<card token>) shows the card on any phone, which
   is what replaces "save this page to your home screen". */

var T = {
  en: {
    h1: "Join our rewards club",
    sub: "Free to join. Every visit earns a stamp.",
    lFirst: "First name",
    lLast: "Last name",
    lPhone: "Mobile number",
    lEmail: "Email",
    consent: "I agree to get texts from this shop about my stamps and rewards. Msg frequency varies. Msg & data rates may apply. Reply HELP for help, STOP to opt out.",
    startNote: "You start with {n} stamps on your card.",
    startNone: "Your first visit starts the card.",
    join: "Join free",
    fine: "We only text about your own visits and rewards. Never for reviews.",
    needFirst: "Add your first name.",
    needLast: "Add your last name.",
    needPhone: "Add your mobile number.",
    needEmail: "Add your email.",
    badEmail: "That email doesn't look right.",
    needConsent: "Please tick the box so we're allowed to text you.",
    badPhone: "That number looks short — use 10 digits.",
    sub10: "A stamp every visit. A reward at 5, and a bigger one at 10.",
    subPlain: "Every visit earns a stamp.",
    hi: "You're in, {name}",
    hiReturn: "Welcome back, {name}",
    hiPlain: "You're in",
    hiBack: "Welcome back",
    cardSub: "{stamps} of {milestone} stamps",
    next: "{left} more visit(s) unlocks your {reward}.",
    ready: "Your reward is ready — show this at the counter.",
    linkLbl: "Your card link",
    copy: "Copy",
    copied: "Copied",
    note: "Keep this link: it opens your card on any phone. Tap it, then add it to your home screen and it's one tap from now on.",
    refLbl: "Invite a friend",
    refNote: "Send this link. Whoever joins with it gets credited to you, and the shop sees who brought them.",
    refCopy: "Copy",
    refCopied: "Copied",
    broken: "This code doesn't match a shop",
    brokenP: "Ask the front desk for the shop's code, or scan the QR on their counter.",
    demo: "Demo mode — no Supabase key in config.js, so nothing is saved.",
    foot: "Powered by RetainOS"
  },
  es: {
    h1: "Únete a nuestro club de premios",
    sub: "Es gratis. Cada visita gana un sello.",
    lFirst: "Nombre",
    lLast: "Apellido",
    lPhone: "Número de celular",
    lEmail: "Correo",
    consent: "Acepto recibir mensajes de este negocio sobre mis sellos y premios. La frecuencia varía. Pueden aplicar cargos de mensajes y datos. Responde HELP para ayuda, STOP para darte de baja.",
    startNote: "Empiezas con {n} sellos en tu tarjeta.",
    startNone: "Tu primera visita empieza la tarjeta.",
    join: "Unirme gratis",
    fine: "Solo te escribimos por tus visitas y premios. Nunca por reseñas.",
    needFirst: "Escribe tu nombre.",
    needLast: "Escribe tu apellido.",
    needPhone: "Pon tu número de celular.",
    needEmail: "Escribe tu correo.",
    badEmail: "Ese correo no parece correcto.",
    needConsent: "Marca la casilla para que podamos escribirte.",
    badPhone: "Ese número parece corto: usa 10 dígitos.",
    sub10: "Un sello por visita. Un premio a las 5 y uno más grande a las 10.",
    subPlain: "Cada visita gana un sello.",
    hi: "Ya estás dentro, {name}",
    hiReturn: "Bienvenido de nuevo, {name}",
    hiPlain: "Ya estás dentro",
    hiBack: "Bienvenido de nuevo",
    cardSub: "{stamps} de {milestone} sellos",
    next: "Faltan {left} visita(s) para tu {reward}.",
    ready: "Tu premio está listo: muéstralo en el mostrador.",
    linkLbl: "El enlace de tu tarjeta",
    copy: "Copiar",
    copied: "Copiado",
    note: "Guarda este enlace: abre tu tarjeta en cualquier teléfono. Tócalo y agrégalo a tu pantalla de inicio para tenerlo a un toque.",
    refLbl: "Invita a un amigo",
    refNote: "Comparte este enlace. Quien se una con él queda a tu nombre, y el negocio ve quién lo trajo.",
    refCopy: "Copiar",
    refCopied: "Copiado",
    broken: "Este código no corresponde a un negocio",
    brokenP: "Pídele el código al mostrador o escanea el QR de la caja.",
    demo: "Modo demo: no hay clave de Supabase en config.js, así que no se guarda nada.",
    foot: "Con tecnología de RetainOS"
  }
};

var params = new URLSearchParams(location.search);
var slug = params.get("shop");
var incoming = params.get("t");
var referredBy = params.get("ref");
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
function $(id) { return document.getElementById(id); }
function show(id) { $(id).classList.remove("hidden"); }
function hide(id) { $(id).classList.add("hidden"); }

function paint() {
  document.documentElement.lang = lang;
  ["h1", "sub", "lFirst", "lLast", "lPhone", "lEmail", "join", "fine",
   "foot", "brokenH", "brokenP", "linkLbl", "copy", "refLbl", "refCopy"].forEach(function (id) {
    $(id).textContent = t(id);
  });
  /* The consent wording is the legal bit: it is stored verbatim with the member. */
  $("consentText").textContent = t("consent");
  $("sub").textContent = shop && shop.milestone ? t("sub10") : t("subPlain");
  $("startNote").textContent = shop && shop.stamps_at_join
    ? t("startNote", { n: shop.stamps_at_join })
    : t("startNone");
  if (SB.demo) {
    var d = $("demoNote");
    d.textContent = t("demo");
    d.classList.remove("hidden");
  }
}

function cardUrl(token) {
  return location.origin + "/join.html?shop=" + encodeURIComponent(slug) + "&t=" + encodeURIComponent(token);
}

function drawCard(c, token) {
  hide("form");
  hide("broken");
  show("card");
  var hiKey = c.returning ? (c.first_name ? "hiReturn" : "hiBack") : (c.first_name ? "hi" : "hiPlain");
  $("cardHi").textContent = c.first_name ? t(hiKey, { name: c.first_name }) : t(hiKey);
  $("cardSub").textContent = t("cardSub", { stamps: c.stamps, milestone: c.milestone });
  var rewards = c.rewards && c.rewards.length ? c.rewards : [{ at: c.milestone || 5, name: reward.name }];
  var total = c.milestone || 10;
  var row = $("stampRow");
  row.innerHTML = "";
  for (var i = 0; i < total; i++) {
    var el = document.createElement("i");
    var stop = rewards.filter(function (r) { return r.at === i + 1; })[0];
    if (i < c.stamps) { el.className = "on"; el.textContent = "✓"; }
    else { el.textContent = stop ? "★" : String(i + 1); }
    if (stop) {
      el.className = (el.className + " prize").trim();
      el.setAttribute("title", stop.name || "");
    }
    row.appendChild(el);
  }

  /* The next stop is the only thing a client needs to know: how many visits
     until the next thing they get. */
  var next = rewards.filter(function (r) { return r.at > c.stamps; })[0];
  $("cardNext").textContent = next
    ? t("next", { left: next.at - c.stamps, reward: next.name || "" })
    : t("ready");
  $("cardUrl").value = cardUrl(token);
  if (c.ref_code) {
    $("refUrl").value = location.origin + "/join.html?shop=" + encodeURIComponent(slug) +
      "&ref=" + encodeURIComponent(c.ref_code);
    $("refNote").textContent = t("refNote");
    show("refBox");
  } else {
    hide("refBox");
  }
  $("cardNote").textContent = t("note");
}

function broken() {
  hide("form");
  hide("card");
  show("broken");
}

function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

/* A card link carries its own token, so it works on a new phone with no
   history. Remember it here too and the next visit lands on the card directly. */
function loadCard(token) {
  return SB.rpc("get_card", { p_token: token }).then(function (c) {
    if (!c || !c.ok) { localStorage.removeItem(tokenKey); broken(); return false; }
    localStorage.setItem(tokenKey, token);
    drawCard(c, token);
    if (window.ROS && shop) ROS.promo($("promo"), shop.id);
    return true;
  });
}

function boot() {
  paint();
  if (!slug) { broken(); return; }

  if (SB.demo) {
    shop = { id: slug, name: slug.replace(/-/g, " "), milestone: 5, stamps_at_join: 2 };
    $("shopName").textContent = shop.name;
    $("badge").textContent = shop.name.charAt(0).toUpperCase();
    paint();
    return;
  }

  SB.rest("shops?select=id,name,milestone,stamps_at_join,default_language&id=eq." + encodeURIComponent(slug))
    .then(function (rows) {
      if (!rows || !rows.length) { broken(); return; }
      shop = rows[0];
      lang = shop.default_language === "es" ? "es" : "en";
      $("shopName").textContent = shop.name;
      $("badge").textContent = shop.name.charAt(0).toUpperCase();
      $("shopMeta").textContent = "";
      paint();
      return SB.rest("rewards?select=name&plan_required=eq.regulars&kind=eq.hotel_card&order=amount_usd&limit=1")
        .then(function (r) {
          if (r && r.length) reward = r[0];
          paint();
          var token = incoming || localStorage.getItem(tokenKey);
          if (token) return loadCard(token);
        });
    })
    .catch(function () { broken(); });
}

$("join").onclick = function () {
  var first = $("first").value.trim();
  var last = $("last").value.trim();
  var phone = $("phone").value.trim();
  var email = $("email").value.trim();
  var consent = $("consent").checked;

  if (!first) { $("first").focus(); return say(t("needFirst"), "bad"); }
  if (!last) { $("last").focus(); return say(t("needLast"), "bad"); }
  if (!phone) { $("phone").focus(); return say(t("needPhone"), "bad"); }
  if (phone.replace(/\D/g, "").length < 10) { $("phone").focus(); return say(t("badPhone"), "bad"); }
  if (!email || email.indexOf("@") < 1 || email.indexOf(".") < 0) {
    $("email").focus();
    return say(t(email ? "badEmail" : "needEmail"), "bad");
  }
  if (!consent) return say(t("needConsent"), "bad");

  if (SB.demo) {
    drawCard({ returning: false, first_name: first, stamps: 2, milestone: 5 }, "demo-token");
    return;
  }

  var btn = this;
  btn.disabled = true;
  SB.rpc("join_shop", {
    p_shop: shop.id,
    p_phone: phone,
    p_language: lang,
    p_consent: T[lang].consent,
    p_first: first,
    p_last: last,
    p_email: email,
    p_ref: referredBy || null
  }).then(function (res) {
    if (!res || !res.ok) {
      return say(t(res && res.error) || "Error", "bad");
    }
    localStorage.setItem(tokenKey, res.token);
    /* keepalive so the request survives the redirect to the thank-you page,
       which is the page that tells them to check their email. */
    try {
      fetch("api/votel/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: res.token }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
    if (res.returning) {
      drawCard({ returning: true, first_name: res.first_name, stamps: res.stamps, milestone: res.milestone, ref_code: res.ref_code }, res.token);
      return;
    }
    location.href = "thankyou.html?shop=" + encodeURIComponent(shop.id) +
      "&t=" + encodeURIComponent(res.token) +
      "&n=" + encodeURIComponent(first);
  }).catch(function (e) {
    say((e && e.message) || "Error", "bad");
  }).then(function () { btn.disabled = false; });
};

$("refCopy").onclick = function () {
  var input = $("refUrl");
  input.select();
  var done = function () {
    var b = $("refCopy");
    b.textContent = t("refCopied");
    setTimeout(function () { b.textContent = t("refCopy"); }, 1500);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, done);
  else { document.execCommand("copy"); done(); }
};

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

boot();
