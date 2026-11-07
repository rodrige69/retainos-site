/* Announcement editor · app.retainos.co/promo
   One message the owner controls, shown to clients on their card, the claim
   page and the thank-you page. Saved through set_shop_promo, which checks
   ownership in the database rather than trusting this page. */

var T = {
  en: {
    back: "← Dashboard",
    h1: "Your announcement",
    sub: "One message, in your words, on every page your clients see.",
    onLbl: "Show this to clients",
    lTitle: "Headline",
    lBody: "Message",
    lImage: "Image link",
    hintImage: "Paste a public https image link. No upload yet — Canva, your website, or any image host all work.",
    lLink: "Button link",
    lLabel: "Button text",
    save: "Save announcement",
    saved: "Saved. Clients see it the next time they open their card.",
    unsaved: "Nothing changed yet.",
    needSomething: "Write a headline, a message or add an image first.",
    badUrl: "Links must start with https://",
    previewH: "How clients see it",
    previewEmpty: "Nothing to show yet — fill the fields above.",
    where: "This appears on the client's card, on the reward claim page, and on the page right after they join.",
    authRequired: "Sign in again to save.",
    notOwner: "This login doesn't own that shop.",
    demo: "Demo mode — no Supabase key in config.js.",
    signin: "Session expired. Sign in again.",
    foot: "Powered by RetainOS",
    prevH: "Preview"
  },
  es: {
    back: "← Panel",
    h1: "Tu anuncio",
    sub: "Un mensaje, con tus palabras, en cada página que ven tus clientes.",
    onLbl: "Mostrar a los clientes",
    lTitle: "Titular",
    lBody: "Mensaje",
    lImage: "Enlace de la imagen",
    hintImage: "Pega un enlace https público. Aún no hay subida: Canva, tu web o cualquier sitio de imágenes sirven.",
    lLink: "Enlace del botón",
    lLabel: "Texto del botón",
    save: "Guardar anuncio",
    saved: "Guardado. Los clientes lo verán la próxima vez que abran su tarjeta.",
    unsaved: "Todavía no cambiaste nada.",
    needSomething: "Escribe un titular, un mensaje o añade una imagen.",
    badUrl: "Los enlaces deben empezar por https://",
    previewH: "Así lo ven los clientes",
    previewEmpty: "Aún no hay nada que mostrar: llena los campos de arriba.",
    where: "Aparece en la tarjeta del cliente, en la página del premio y en la página justo después de unirse.",
    authRequired: "Entra otra vez para guardar.",
    notOwner: "Este acceso no es dueño de ese negocio.",
    demo: "Modo demo: no hay clave de Supabase en config.js.",
    signin: "La sesión caducó. Entra otra vez.",
    foot: "Con tecnología de RetainOS",
    prevH: "Vista previa"
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
var shopId = null;
var dirty = false;

function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || k; }
function $(id) { return document.getElementById(id); }
function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

function paint() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.style.fontWeight = b.getAttribute("data-lang") === lang ? "800" : "600";
  });
  ["back", "h1", "sub", "onLbl", "lTitle", "lBody", "lImage", "hintImage",
   "lLink", "lLabel", "save", "previewH", "previewEmpty", "where", "foot"
  ].forEach(function (id) {
    var el = $(id);
    if (el) el.textContent = t(id);
  });
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.textContent = b.getAttribute("data-lang").toUpperCase();
  });
  preview();
}

function current() {
  return {
    ok: true,
    title: $("title").value.trim(),
    body: $("body").value.trim(),
    image: $("image").value.trim(),
    link: $("link").value.trim(),
    label: $("label").value.trim(),
    on: $("on").checked
  };
}

function preview() {
  var c = current();
  var hasSomething = c.title || c.body || c.image;
  var box = $("preview");
  box.innerHTML = "";
  $("previewEmpty").textContent = hasSomething ? "" : t("previewEmpty");
  if (!hasSomething) return;
  box.appendChild(window.ROS.promoCard(c));
  if (!c.on) box.style.opacity = "0.45";
  else box.style.opacity = "1";
}

function fill(p) {
  $("on").checked = Boolean(p && p.ok);
  $("title").value = (p && p.title) || "";
  $("body").value = (p && p.body) || "";
  $("image").value = (p && p.image) || "";
  $("link").value = (p && p.link) || "";
  $("label").value = (p && p.label) || "";
  preview();
}

function save() {
  var c = current();
  if (!c.title && !c.body && !c.image) return say(t("needSomething"), "bad");
  if (c.image && !/^https?:\/\//i.test(c.image)) return say(t("badUrl"), "bad");
  if (c.link && !/^https?:\/\//i.test(c.link)) return say(t("badUrl"), "bad");
  if (SB.demo) return say(t("saved"), "good");

  var btn = $("save");
  btn.disabled = true;
  SB.rpc("set_shop_promo", {
    p_shop: shopId,
    p_on: c.on,
    p_title: c.title,
    p_body: c.body,
    p_image: c.image || null,
    p_link: c.link || null,
    p_label: c.label || null
  }).then(function (r) {
    if (!r || !r.ok) return say(t(r && r.error) || t("signin"), "bad");
    dirty = false;
    say(t("saved"), "good");
  }).catch(function (e) {
    say((e && e.message) || t("signin"), "bad");
  }).then(function () { btn.disabled = false; });
}

document.querySelectorAll("[data-lang]").forEach(function (b) {
  b.onclick = function () {
    lang = b.getAttribute("data-lang");
    localStorage.setItem("ros.lang", lang);
    paint();
  };
});

["title", "body", "image", "link", "label", "on"].forEach(function (id) {
  var el = $(id);
  el.addEventListener("input", function () { dirty = true; preview(); });
  el.addEventListener("change", function () { dirty = true; preview(); });
});

$("save").onclick = save;

paint();

if (SB.demo) {
  $("demoNote").textContent = t("demo");
  $("demoNote").classList.remove("hidden");
  fill({ ok: true, title: "Free hot-towel finish", body: "This month with any cut and beard.", image: "", link: "", label: "" });
} else {
  if (!SB.session()) {
    location.replace("signin.html");
  } else {
    SB.rest("shop_owners?select=shop_id").then(function (rows) {
      if (!rows || !rows.length) return say(t("notOwner"), "bad");
      shopId = rows[0].shop_id;
      return SB.rpc("get_shop_promo", { p_shop: shopId }).then(fill);
    }).catch(function (e) {
      if (e && e.status === 401) { location.replace("signin.html"); return; }
      say((e && e.message) || t("signin"), "bad");
    });
  }
}
