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
    okH: "Your reward is ready, {name}",
    okSub: "Show this code at {shop}.",
    expiry: "Use it by {date}.",
    noExpiry: "No expiry on this one.",
    okHow: "The counter enters this code and marks it used. A screenshot or this page both work.",
    optOut: "Texts are only about your visits and rewards. Reply STOP to opt out, HELP for help.",
    claimedH: "This reward was already used",
    claimedP: "It was marked used on {date}.",
    expiredH: "This reward has expired",
    expiredP: "It ran out on {date}. Keep visiting — the next card starts right away.",
    unknownH: "That code doesn't match a reward",
    unknownP: "Check the message for the exact code, or ask the shop to look it up by your phone number.",
    noCode: "No code given.",
    demo: "Demo mode — no Supabase key in config.js.",
    foot: "Powered by RetainOS"
  },
  es: {
    shopMeta: "Club de premios",
    askH: "El código de tu premio",
    askP: "Escribe el código de tu mensaje y te mostramos tu premio.",
    lCode: "Código del premio",
    lookup: "Ver mi premio",
    needCode: "Escribe el código de tu mensaje.",
    okH: "Tu premio está listo, {name}",
    okSub: "Muestra este código en {shop}.",
    expiry: "Úsalo antes del {date}.",
    noExpiry: "Este no caduca.",
    okHow: "En el mostrador escriben este código y lo marcan como usado. Sirve una captura o esta página.",
    optOut: "Solo enviamos mensajes por tus visitas y premios. Responde STOP para darte de baja, HELP para ayuda.",
    claimedH: "Este premio ya se usó",
    claimedP: "Se marcó como usado el {date}.",
    expiredH: "Este premio caducó",
    expiredP: "Caducó el {date}. Sigue viniendo: la siguiente tarjeta empieza enseguida.",
    unknownH: "Ese código no corresponde a un premio",
    unknownP: "Revisa el mensaje y copia el código exacto, o pide en el negocio que lo busquen por tu teléfono.",
    noCode: "No hay código.",
    demo: "Modo demo: no hay clave de Supabase en config.js.",
    foot: "Con tecnología de RetainOS"
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

function renderOk(r) {
  hide("askBlock");
  hide("badBlock");
  show("okBlock");
  $("okH").textContent = r.first_name ? t("okH", { name: r.first_name }) : t("okH", { name: "" }).replace(/,\s*$/, "");
  $("okSub").textContent = t("okSub", { shop: r.shop || "" });
  $("voucher").textContent = r.code || "";
  $("okExpiry").textContent = r.expires_at ? t("expiry", { date: fullDate(r.expires_at) }) : t("noExpiry");
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
