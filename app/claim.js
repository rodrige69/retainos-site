/* Claim a reward · app.retainos.co/claim?code=<voucher>
   The link that goes out when a client reaches the milestone. It reads the
   voucher through get_reward, so it can say "ready", "already used on …" or
   "expired" instead of showing a dead page. */

var T = {
  en: {
    shopMeta: "Rewards club",
    askH: "Your reward code",
    askP: "Type the code from your message and we'll show your reward.",
    lCode: "Reward code",
    lookup: "Show my reward",
    needCode: "Type the code from your message.",
    okH: "Your reward was delivered, {name}",
    okSub: "We emailed it to you from {shop}.",
    expiry: "Use it by {date}.",
    noExpiry: "No expiry on this one.",
    okHow: "Look for an email with the subject \"You've been awarded a complimentary Hotel Savings Card\". Check spam or promotions if you don't see it. Copy the code in that email and tap its button to redeem. The email also has a video that shows how.",
    optOut: "",
    claimedH: "This reward was already used",
    claimedP: "It was marked used on {date}.",
    expiredH: "This reward has expired",
    expiredP: "It ran out on {date}. Keep visiting — the next card starts right away.",
    unknownH: "That code doesn't match a reward",
    unknownP: "Check the message for the exact code, or ask the shop to look it up by your phone number.",
    noCode: "No code given.",
    demo: "Demo mode — no Supabase key in config.js.",
    foot: "Powered by RetainOS",
    gaH: "Pick your getaway, {name}", gaSub: "Choose where you want to go. We send your details to our travel partner to finish booking.",
    lDest: "Destination", fees: "Taxes & fees: {fee} per person for the whole stay, paid when you book.", lName: "Full name", lEmail: "Email", lPhone: "Phone (optional)",
    gaGo: "Redeem my getaway", nights: "nights", needName: "Type your full name.", needEmail: "Type a valid email.", gaFail: "We couldn't finish. Check your connection and tap the button again. Your reward is still safe.",
    gaDoneH: "Your getaway request is in", gaDoneP: "Check your email for the next step from our travel partner. Look in spam or promotions too."
  },
  es: {
    shopMeta: "Club de premios",
    askH: "El código de tu premio",
    askP: "Escribe el código de tu mensaje y te mostramos tu premio.",
    lCode: "Código del premio",
    lookup: "Ver mi premio",
    needCode: "Escribe el código de tu mensaje.",
    okH: "Tu premio fue enviado, {name}",
    okSub: "Te lo enviamos por correo de parte de {shop}.",
    expiry: "Úsalo antes del {date}.",
    noExpiry: "Este no caduca.",
    okHow: "Busca un correo con el asunto \"You've been awarded a complimentary Hotel Savings Card\" (llega en inglés). Revisa spam o promociones si no lo ves. Copia el código de ese correo y toca su botón para canjear. El correo también tiene un video que explica cómo.",
    optOut: "",
    claimedH: "Este premio ya se usó",
    claimedP: "Se marcó como usado el {date}.",
    expiredH: "Este premio caducó",
    expiredP: "Caducó el {date}. Sigue viniendo: la siguiente tarjeta empieza enseguida.",
    unknownH: "Ese código no corresponde a un premio",
    unknownP: "Revisa el mensaje y copia el código exacto, o pide en el negocio que lo busquen por tu teléfono.",
    noCode: "No hay código.",
    demo: "Modo demo: no hay clave de Supabase en config.js.",
    foot: "Con tecnología de RetainOS",
    gaH: "Elige tu escapada, {name}", gaSub: "Elige a dónde quieres ir. Enviamos tus datos a nuestro socio de viajes para terminar la reserva.",
    lDest: "Destino", fees: "Impuestos y tarifas: {fee} por persona por toda la estadía, se pagan al reservar.", lName: "Nombre completo", lEmail: "Correo", lPhone: "Teléfono (opcional)",
    gaGo: "Canjear mi escapada", nights: "noches", needName: "Escribe tu nombre completo.", needEmail: "Escribe un correo válido.", gaFail: "No pudimos terminar. Revisa tu conexión y toca el botón otra vez. Tu premio sigue a salvo.",
    gaDoneH: "Tu solicitud de escapada fue enviada", gaDoneP: "Revisa tu correo para el siguiente paso de nuestro socio de viajes. Mira también en spam o promociones."
  }
};

var params = new URLSearchParams(location.search);
var code = (params.get("code") || params.get("c") || params.get("voucher") || params.get("r") || "").trim();
if (!code) {
  var bits = location.pathname.split("/").filter(Boolean);
  var last = bits.length ? decodeURIComponent(bits[bits.length - 1]) : "";
  if (last && last !== "claim" && !/\.html$/.test(last)) code = last;
}

var lang = localStorage.getItem("ros.lang") || "en";
var shopId = params.get("shop") || "";

function t(k, vars) {
  var s = (T[lang] && T[lang][k]) || T.en[k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}
function $(id) { return document.getElementById(id); }
function show(id) { $(id).classList.remove("hidden"); }
function hide(id) { $(id).classList.add("hidden"); }
function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
function fullDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}

function paint() {
  document.documentElement.lang = lang;
  ["shopMeta", "askH", "askP", "lCode", "lookup", "foot", "okHow", "optOut"].forEach(function (key) {
    var el = $(key === "optOut" ? "okOptOut" : key);
    if (el) el.textContent = t(key);
  });
  if (SB.demo) {
    var d = $("demoNote");
    d.textContent = t("demo");
    d.classList.remove("hidden");
  }
}

function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

function renderBad(title, body, detail) {
  hide("askBlock");
  hide("okBlock");
  show("badBlock");
  $("badH").textContent = title;
  $("badP").textContent = body || "";
  $("badMsg").textContent = detail || "";
  $("badMsg").style.display = detail ? "" : "none";
}

var FBDE = { sender: "15900-17584", business: 20404, script: "https://members.marketingboost.com/jsapi/fbDE_redeem_vacation.js" };
var current = null;
function money(n) { return "$" + Number(n).toFixed(2); }
function renderGetaway(r) {
  current = r;
  hide("askBlock"); hide("badBlock"); hide("okBlock"); show("gaBlock");
  $("badge").textContent = (r.shop || "·").charAt(0).toUpperCase(); $("shopName").textContent = r.shop || "";
  $("gaH").textContent = t("gaH", { name: r.first_name || "" }).replace(/,\s*$/, "").replace(/\s+$/, "");
  ["gaSub", "lDest", "lName", "lEmail", "lPhone", "gaGo"].forEach(function (k) { $(k).textContent = t(k); });
  $("gaName").value = [r.first_name, r.last_name].filter(Boolean).join(" ");
  var sel = $("gaDest"); sel.innerHTML = "";
  r.destinations.forEach(function (d) {
    var o = document.createElement("option"); o.value = d.id; o.textContent = d.name + " · " + d.nights + " " + t("nights");
    if (String(r.picked) === String(d.id)) o.selected = true; sel.appendChild(o);
  });
  function fee() {
    var d = r.destinations.filter(function (x) { return String(x.id) === sel.value; })[0];
    $("gaFees").textContent = d && d.total_fee != null ? t("fees", { fee: money(d.total_fee) }) : "";
  }
  sel.onchange = fee; fee();
  $("gaGo").onclick = redeemGetaway;
}
function gaSay(m, bad) { var e = $("gaMsg"); e.textContent = m || ""; e.className = "msg" + (m ? (bad ? " bad" : " good") : ""); }
function redeemGetaway() {
  var name = $("gaName").value.trim(), email = $("gaEmail").value.trim(), phone = $("gaPhone").value.replace(/\D/g, "");
  if (name.length < 2) return gaSay(t("needName"), true);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return gaSay(t("needEmail"), true);
  var dest = parseInt($("gaDest").value, 10), btn = $("gaGo");
  btn.disabled = true; gaSay("");
  SB.rpc("begin_getaway_redeem", { p_code: current.code, p_dest: dest }).then(function (b) {
    if (!b || !b.ok) throw new Error(b && b.error || "fail");
    return new Promise(function (resolve, reject) {
      var go = function () {
        try {
          var detail = { fbDE_sender: FBDE.sender, fbDE_fullname: name, fbDE_email: email, fbDE_destination: dest, fbDE_business: FBDE.business,
            fbDE_message: (current.shop || "RetainOS") + " · RetainOS voucher " + current.code };
          if (phone.length >= 10) { detail.fbDE_countrycode = 1; detail.fbDE_phone = parseInt(phone.slice(-10), 10); }
          window.fbDERedeemVacation(detail); resolve();
        } catch (e) { reject(e); }
      };
      if (typeof window.fbDERedeemVacation === "function") return go();
      var s = document.createElement("script"); s.src = FBDE.script; s.onload = go; s.onerror = function () { reject(new Error("script")); };
      document.body.appendChild(s);
    });
  }).then(function () {
    return SB.rpc("finish_getaway_redeem", { p_code: current.code });
  }).then(function () {
    hide("gaBlock"); show("gaDone"); $("gaDoneH").textContent = t("gaDoneH"); $("gaDoneP").textContent = t("gaDoneP");
  }).catch(function () { gaSay(t("gaFail"), true); btn.disabled = false; });
}

function renderOk(r) {
  if (r.kind === "getaway" && r.destinations && r.destinations.length) return renderGetaway(r);
  hide("askBlock");
  hide("badBlock");
  show("okBlock");
  $("okH").textContent = r.first_name ? t("okH", { name: r.first_name }) : t("okH", { name: "" }).replace(/,\s*$/, "");
  $("okSub").textContent = t("okSub", { shop: r.shop || "" });
  $("voucher").style.display = "none";
  $("okExpiry").style.display = "none";
  $("okOptOut").style.display = "none";
  if (r.shop_id) {
    $("badge").textContent = (r.shop || "·").charAt(0).toUpperCase();
    $("shopName").textContent = r.shop || "";
    if (window.ROS) ROS.promo($("promo"), r.shop_id);
  }
}

function lookup(value) {
  var clean = String(value || "").trim();
  if (!clean) { say(t("needCode"), "bad"); return; }
  say("");
  if (SB.demo) {
    renderOk({ code: clean.toUpperCase(), first_name: "Dana", shop: "Fade Lab Barbershop", expires_at: null });
    return;
  }
  SB.rpc("get_reward", { p_code: clean }).then(function (r) {
    if (!r || !r.ok) {
      renderBad(t("unknownH"), t("unknownP"), r && r.error === "no_code" ? t("noCode") : "");
      return;
    }
    if (r.status === "claimed") {
      renderBad(t("claimedH"), t("claimedP", { date: fullDate(r.claimed_at) }), r.code);
      return;
    }
    if (r.status === "expired") {
      renderBad(t("expiredH"), t("expiredP", { date: fullDate(r.expires_at) }), r.code);
      return;
    }
    renderOk(r);
  }).catch(function () {
    renderBad(t("unknownH"), t("unknownP"), "");
  });
}

paint();

if (SB.demo) {
  $("shopName").textContent = "Fade Lab Barbershop";
  $("badge").textContent = "F";
}

if (code) {
  lookup(code);
} else {
  show("askBlock");
  $("lookup").onclick = function () { lookup($("codeInput").value); };
  $("codeInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") lookup($("codeInput").value);
  });
}

/* Only used when the link did not carry a shop: fill the header from the reward. */
if (shopId && !code) {
  SB.rest("shops?select=name&id=eq." + encodeURIComponent(shopId)).then(function (rows) {
    if (rows && rows.length) {
      $("shopName").textContent = rows[0].name;
      $("badge").textContent = rows[0].name.charAt(0).toUpperCase();
    }
  }).catch(function () {});
}
