(function () {
  var $ = function (id) { return document.getElementById(id); };
  var lang = localStorage.getItem("ros.lang") === "es" ? "es" : "en";
  var TX = {
    en: {
      eyebrow: "Owner terminal", h1: "Settings", sub: "Staff, PINs, shop details and your account.",
      linksH: "Shortcuts", qr: "QR & Links", qrS: "Poster and join link", promo: "Announcement", promoS: "Message on your clients' cards", hours: "Hours", hoursS: "Edit on the dashboard", perks: "Perks & Rewards", perksS: "Set reward levels",
      staffH: "Staff & PINs", staffP: "Staff type their 4-digit PIN on the Scan screen to log a visit. Each active PIN must be different.",
      none: "No staff yet.", active: "Active", off: "Off", change: "Change PIN", turnOff: "Turn off", turnOn: "Turn on", newPin: "New 4-digit PIN", savePin: "Save PIN", cancel: "Cancel",
      addH: "Add a team member", lName: "Name", lPin: "4-digit PIN", add: "Add team member",
      shopH: "Shop details", lShop: "Shop name", lPhone: "Phone", lAddr: "Address", lWeb: "Website", lIg: "Instagram", saveShop: "Save details",
      acctH: "Account", pwd: "Change password", out: "Sign out",
      saved: "Saved.", added: "Added.", bad_name: "Enter a name.", bad_pin: "PIN must be exactly 4 digits.", pin_taken: "That PIN is already used by someone else. Pick another.",
      not_owner: "This login isn't linked to a shop.", fail: "Couldn't save. Try again."
    },
    es: {
      eyebrow: "Terminal del dueño", h1: "Ajustes", sub: "Personal, PIN, datos del negocio y tu cuenta.",
      linksH: "Atajos", qr: "QR y enlaces", qrS: "Póster y enlace para unirse", promo: "Anuncio", promoS: "Mensaje en las tarjetas", hours: "Horario", hoursS: "Edítalo en el panel", perks: "Premios", perksS: "Define los niveles",
      staffH: "Personal y PIN", staffP: "El personal escribe su PIN de 4 dígitos en Escanear para registrar una visita. Cada PIN activo debe ser distinto.",
      none: "Aún no hay personal.", active: "Activo", off: "Apagado", change: "Cambiar PIN", turnOff: "Apagar", turnOn: "Activar", newPin: "Nuevo PIN de 4 dígitos", savePin: "Guardar PIN", cancel: "Cancelar",
      addH: "Agregar a alguien del equipo", lName: "Nombre", lPin: "PIN de 4 dígitos", add: "Agregar al equipo",
      shopH: "Datos del negocio", lShop: "Nombre del negocio", lPhone: "Teléfono", lAddr: "Dirección", lWeb: "Sitio web", lIg: "Instagram", saveShop: "Guardar datos",
      acctH: "Cuenta", pwd: "Cambiar contraseña", out: "Salir",
      saved: "Guardado.", added: "Agregado.", bad_name: "Escribe un nombre.", bad_pin: "El PIN debe tener exactamente 4 dígitos.", pin_taken: "Ese PIN ya lo usa otra persona. Elige otro.",
      not_owner: "Este acceso no está ligado a un negocio.", fail: "No se pudo guardar. Intenta otra vez."
    }
  };
  var shopId = new URLSearchParams(location.search).get("shop") || localStorage.getItem("ros.shop") || "";
  var staff = [], editing = null;
  function t(k) { return TX[lang][k] || k; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function say(id, m, bad) { var e = $(id); e.textContent = m || ""; e.className = "msg" + (m ? (bad ? " bad" : " good") : ""); }
  function err(r) { return TX[lang][r && r.error] || t("fail"); }
  function q() { return shopId ? "?shop=" + encodeURIComponent(shopId) : ""; }

  function paintStatic() {
    document.documentElement.lang = lang;
    ["eyebrow", "h1", "sub", "linksH", "staffH", "staffP", "addH", "lName", "lPin", "shopH", "lShop", "lPhone", "lAddr", "lWeb", "lIg", "acctH"].forEach(function (k) { $(k).textContent = t(k); });
    $("addStaff").textContent = t("add"); $("saveShop").textContent = t("saveShop"); $("pwd").textContent = t("pwd"); $("out").textContent = t("out");
    var L = $("links"); L.innerHTML = "";
    [["onboard.html", "qr"], ["promo", "promo"], ["dashboard.html#hoursCard", "hours"], ["perks.html" + q(), "perks"]].forEach(function (x) {
      var a = document.createElement("a"); a.href = x[0]; a.className = "slink";
      a.innerHTML = "<b>" + esc(t(x[1])) + "</b><small>" + esc(t(x[1] + "S")) + "</small><span>›</span>";
      L.appendChild(a);
    });
  }

  function paintStaff() {
    var box = $("staffList"); box.innerHTML = "";
    if (!staff.length) { box.innerHTML = "<p>" + esc(t("none")) + "</p>"; return; }
    staff.forEach(function (s) {
      var row = document.createElement("div"); row.className = "srow" + (s.active ? "" : " off");
      row.innerHTML = "<div class='sinfo'><b>" + esc(s.name) + "</b><small>" + esc(s.role || "") + " · " + esc(s.active ? t("active") : t("off")) + "</small></div>";
      var acts = document.createElement("div"); acts.className = "sacts";
      var b1 = document.createElement("button"); b1.type = "button"; b1.className = "mini"; b1.textContent = t("change");
      b1.onclick = function () { editing = editing === s.id ? null : s.id; paintStaff(); };
      var b2 = document.createElement("button"); b2.type = "button"; b2.className = "mini"; b2.textContent = s.active ? t("turnOff") : t("turnOn");
      b2.onclick = function () {
        SB.rpc("set_my_staff_active", { p_shop: shopId, p_staff: s.id, p_active: !s.active }).then(function (r) {
          if (!r || !r.ok) return say("staffMsg", err(r), true);
          say("staffMsg", t("saved")); loadStaff();
        }).catch(function (e) { say("staffMsg", (e && e.message) || t("fail"), true); });
      };
      acts.appendChild(b1); acts.appendChild(b2); row.appendChild(acts);
      if (editing === s.id) {
        var ed = document.createElement("div"); ed.className = "sedit";
        ed.innerHTML = "<input type='text' inputmode='numeric' maxlength='4' placeholder='" + esc(t("newPin")) + "' autocomplete='off'>";
        var inp = ed.firstChild;
        var ok = document.createElement("button"); ok.type = "button"; ok.className = "btn"; ok.textContent = t("savePin");
        ok.onclick = function () {
          SB.rpc("set_my_staff_pin", { p_shop: shopId, p_staff: s.id, p_pin: inp.value.trim() }).then(function (r) {
            if (!r || !r.ok) return say("staffMsg", err(r), true);
            editing = null; say("staffMsg", t("saved")); loadStaff();
          }).catch(function (e) { say("staffMsg", (e && e.message) || t("fail"), true); });
        };
        ed.appendChild(ok); row.appendChild(ed);
      }
      box.appendChild(row);
    });
  }
  function loadStaff() {
    return SB.rpc("list_my_staff", { p_shop: shopId }).then(function (r) {
      if (!r || !r.ok) return say("staffMsg", err(r), true);
      staff = r.staff || []; paintStaff();
    });
  }

  $("addStaff").onclick = function () {
    var btn = $("addStaff"); btn.disabled = true;
    SB.rpc("add_my_staff", { p_shop: shopId, p_name: $("sName").value, p_pin: $("sPin").value.trim(), p_role: "staff" }).then(function (r) {
      if (!r || !r.ok) return say("staffMsg", err(r), true);
      $("sName").value = ""; $("sPin").value = ""; say("staffMsg", t("added")); return loadStaff();
    }).catch(function (e) { say("staffMsg", (e && e.message) || t("fail"), true); }).then(function () { btn.disabled = false; });
  };
  $("saveShop").onclick = function () {
    var btn = $("saveShop"); btn.disabled = true;
    SB.rpc("update_my_shop", { p_shop: shopId, p_cfg: { name: $("fName").value, phone: $("fPhone").value, address: $("fAddr").value, website: $("fWeb").value, instagram: $("fIg").value } }).then(function (r) {
      if (!r || !r.ok) return say("shopMsg", err(r), true);
      say("shopMsg", t("saved"));
    }).catch(function (e) { say("shopMsg", (e && e.message) || t("fail"), true); }).then(function () { btn.disabled = false; });
  };
  $("out").onclick = function () { SB.signOut(); };
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.onclick = function () { lang = b.getAttribute("data-lang"); localStorage.setItem("ros.lang", lang); paintStatic(); paintStaff(); };
  });

  paintStatic();
  if (!SB.session() && !SB.demo) { location.replace("signin.html"); return; }
  function boot() {
    return Promise.all([
      SB.rpc("get_my_shop", { p_shop: shopId }).then(function (r) {
        if (!r || !r.ok) return say("shopMsg", err(r), true);
        $("fName").value = r.name || ""; $("fPhone").value = r.phone || ""; $("fAddr").value = r.address || ""; $("fWeb").value = r.website || ""; $("fIg").value = r.instagram || "";
      }),
      loadStaff()
    ]);
  }
  (shopId ? Promise.resolve() : SB.rest("shop_owners?select=shop_id").then(function (rows) { if (rows && rows.length) shopId = rows[0].shop_id; }))
    .then(function () { paintStatic(); return boot(); })
    .catch(function (e) { if (e && e.status === 401) { location.replace("signin.html"); return; } say("staffMsg", (e && e.message) || t("fail"), true); });
})();
