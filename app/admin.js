/* Shops · app.retainos.co/admin
   Every shop with its plan, its status and the one switch that decides whether
   clients can join. set_shop_status re-checks the admin in the database, so
   this page being reachable is cosmetic, not the gate. */

var T = {
  en: {
    h1: "Shops",
    sub: "A shop takes clients only once it's marked paid. Flip it here when the invoice clears.",
    newShop: "New shop",
    back: "Dashboard",
    count: "{n} shops",
    countOne: "1 shop",
    markPaid: "Mark paid",
    pause: "Pause",
    resume: "Turn back on",
    st_active: "Live",
    st_pending: "Invoice pending",
    st_paused: "Paused",
    plan_regulars: "Come Back",
    plan_full_book: "Booked Solid",
    plan_hands_off: "Day Off",
    subMain: "main account",
    subOwn: "sub-account {id}",
    none: "No shops yet.",
    notAdmin: "This login can't change shop status.",
    signin: "Session expired. Sign in again.",
    err: "That didn't work. Try again.",
    foot: "Powered by RetainOS"
  },
  es: {
    h1: "Negocios",
    sub: "Un negocio recibe clientes solo cuando está marcado como pagado. Cámbialo aquí cuando entre el pago.",
    newShop: "Nuevo negocio",
    back: "Panel",
    count: "{n} negocios",
    countOne: "1 negocio",
    markPaid: "Marcar pagado",
    pause: "Pausar",
    resume: "Reactivar",
    st_active: "Activo",
    st_pending: "Pago pendiente",
    st_paused: "Pausado",
    plan_regulars: "Come Back",
    plan_full_book: "Booked Solid",
    plan_hands_off: "Day Off",
    subMain: "cuenta principal",
    subOwn: "sub-cuenta {id}",
    none: "Todavía no hay negocios.",
    notAdmin: "Este acceso no puede cambiar el estado de los negocios.",
    signin: "La sesión caducó. Entra otra vez.",
    err: "No funcionó. Inténtalo de nuevo.",
    foot: "Con tecnología de RetainOS"
  }
};

var lang = localStorage.getItem("ros.lang") || "en";

function t(k, vars) {
  var s = (T[lang] && T[lang][k]) || T.en[k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}
function $(id) { return document.getElementById(id); }
function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

function paint() {
  document.documentElement.lang = lang;
  $("h1").textContent = t("h1");
  $("sub").textContent = t("sub");
  $("newShop").textContent = t("newShop");
  $("back").textContent = t("back");
  $("foot").textContent = t("foot");
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    b.onclick = function () {
      localStorage.setItem("ros.lang", b.getAttribute("data-lang"));
      location.reload();
    };
  });
}

function pill(status) {
  var cls = status === "active" ? "pill on" : status === "pending" ? "pill pend" : "pill off";
  return '<span class="' + cls + '">' + esc(t("st_" + status) || status) + "</span>";
}

function render(rows) {
  var list = $("list");
  list.innerHTML = "";
  $("count").textContent = rows.length === 1 ? t("countOne") : t("count", { n: rows.length });

  if (!rows.length) {
    list.appendChild(row(t("none")));
    return;
  }

  rows.forEach(function (s) {
    var next = s.status === "active" ? "paused" : "active";
    var label = next === "active" ? (s.status === "paused" ? "resume" : "markPaid") : "pause";
    var meta = [
      s.id,
      t("plan_" + s.plan) || s.plan,
      s.votel_subaccount_id ? t("subOwn", { id: s.votel_subaccount_id }) : t("subMain")
    ].join(" · ");

    var el = document.createElement("div");
    el.className = "row";
    el.innerHTML =
      '<div class="who"><span><b>' + esc(s.name) + "</b><small>" + esc(meta) + "</small></span></div>" +
      '<span class="meta" style="display:flex;gap:8px;align-items:center">' + pill(s.status) +
      '<button type="button" class="btn ghost sm" data-shop="' + esc(s.id) + '" data-next="' + next + '">' +
      esc(t(label)) + "</button></span>";
    list.appendChild(el);
  });

  list.querySelectorAll("button[data-shop]").forEach(function (b) {
    b.onclick = function () {
      flip(b.getAttribute("data-shop"), b.getAttribute("data-next"), b);
    };
  });
}

function row(html) {
  var el = document.createElement("div");
  el.className = "row";
  el.innerHTML = html;
  return el;
}

function flip(shopId, next, btn) {
  btn.disabled = true;
  say("");
  SB.rpc("set_shop_status", { p_shop: shopId, p_status: next })
    .then(function (r) {
      btn.disabled = false;
      if (!r || !r.ok) { say(t(r && r.error) || t("err"), "bad"); return; }
      load();
    })
    .catch(function (e) {
      btn.disabled = false;
      if (e && e.status === 401) { location.replace("signin.html"); return; }
      say((e && e.message) || t("err"), "bad");
    });
}

function load() {
  SB.rest("shops?select=id,name,plan,status,votel_subaccount_id&order=name")
    .then(function (rows) { render(rows || []); })
    .catch(function (e) {
      if (e && e.status === 401) { location.replace("signin.html"); return; }
      say((e && e.message) || t("err"), "bad");
    });
}

paint();

if (SB.demo) {
  say(t("notAdmin"), "bad");
} else if (!SB.session()) {
  location.replace("signin.html");
} else {
  SB.rpc("is_platform_admin").then(function (ok) {
    if (!ok) { say(t("notAdmin"), "bad"); return; }
    load();
  }).catch(function () { say(t("notAdmin"), "bad"); });
}
