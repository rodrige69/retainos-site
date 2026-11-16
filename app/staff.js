var T = {
  en: {
    h1: "Log a visit",
    sub: "Enter your PIN, then scan the client's QR. No QR? Type their number below.",
    lShop: "Which shop?",
    lPin: "Your 4-digit PIN",
    lPhone: "Client's 10-digit number",
    phoneHint: "Digits only. The number they joined with.",
    lType: "What was today's visit?",
    weekNote: "Every stamp is saved with your name and the time.",
    submit: "Log the visit",
    appointment: "Appointment",
    walk_in: "Walk-in",
    product: "Product",
    other: "Other",
    needPin: "Enter your 4-digit PIN.",
    needPhone: "Add the client's number.",
    done: "Stamped — {name}",
    donePlain: "Stamped",
    doneSub: "{staff} · {stamps} of {milestone}",
    reward: "Reward unlocked: {reward}. Voucher {code}.",
    noReward: "{left} more visit(s) to the next reward.",
    again: "Log another visit",
    badPin: "That PIN isn't right. Try again, or ask the owner to reset it.",
    tooSoon: "This client was already stamped recently.",
    ovReq: "Request override",
    ovSent: "A code was sent to the owner. Ask them for it and enter it here.",
    ovGo: "Stamp with code",
    ovBad: "That code isn't right or has expired.",
    ovNeedCode: "Enter the 6-digit code.",
    ovFail: "Couldn't send the code. Try again in a minute.",
    notMember: "Not a member yet. Send them the shop's join QR first.",
    unknownShop: "We don't recognise this shop code.",
    badPhone: "That number looks short — use 10 digits.",
    demo: "Demo mode — no Supabase key in config.js, so nothing is saved.",
    foot: "Powered by RetainOS",
    scanBtn: "Scan client's QR",
    scanHint: "Ask the client to open their card and tap Show my QR.",
    scanPoint: "Point the camera at the client's QR.",
    scanCancel: "Cancel",
    orType: "Or type the client's number instead:",
    confirmBtn: "Confirm visit",
    confirmCancel: "Cancel",
    confirmCount: "{stamps} of {milestone} stamps",
    camDenied: "The camera is blocked. Allow camera access for this page, or type the client's number below.",
    camNone: "This phone can't open the camera here. Type the client's number below.",
    notThisShop: "That QR isn't a card from this shop.",
    locked: "Too many wrong PINs. Try again in {minutes} minutes."
  },
  es: {
    h1: "Registrar una visita",
    sub: "Pon tu PIN y escanea el QR del cliente. ¿Sin QR? Escribe su número abajo.",
    lShop: "¿En qué negocio?",
    lPin: "Tu PIN de 4 dígitos",
    lPhone: "Número del cliente (10 dígitos)",
    phoneHint: "Solo números. Con el que se registró.",
    lType: "¿Qué fue la visita de hoy?",
    weekNote: "Cada sello se guarda con tu nombre y la hora.",
    submit: "Registrar la visita",
    appointment: "Cita",
    walk_in: "Sin cita",
    product: "Producto",
    other: "Otro",
    needPin: "Pon tu PIN de 4 dígitos.",
    needPhone: "Pon el número del cliente.",
    done: "Sello puesto — {name}",
    donePlain: "Sello puesto",
    doneSub: "{staff} · {stamps} de {milestone}",
    reward: "Premio desbloqueado: {reward}. Cupón {code}.",
    noReward: "Faltan {left} visita(s) para el próximo premio.",
    again: "Registrar otra visita",
    badPin: "Ese PIN no es correcto. Inténtalo otra vez o pide al dueño que lo cambie.",
    tooSoon: "Este cliente ya recibió un sello hace poco.",
    ovReq: "Pedir autorización",
    ovSent: "Se envió un código al dueño. Pídeselo y escríbelo aquí.",
    ovGo: "Sellar con el código",
    ovBad: "Ese código no es correcto o ya venció.",
    ovNeedCode: "Escribe el código de 6 dígitos.",
    ovFail: "No se pudo enviar el código. Intenta de nuevo en un minuto.",
    notMember: "Todavía no es miembro. Mándale el QR de registro del negocio.",
    unknownShop: "No reconocemos ese código de negocio.",
    badPhone: "Ese número parece corto: usa 10 dígitos.",
    demo: "Modo demo: no hay clave de Supabase en config.js, así que no se guarda nada.",
    foot: "Con tecnología de RetainOS",
    scanBtn: "Escanear el QR del cliente",
    scanHint: "Pídele al cliente que abra su tarjeta y toque Mostrar mi QR.",
    scanPoint: "Apunta la cámara al QR del cliente.",
    scanCancel: "Cancelar",
    orType: "O escribe el número del cliente:",
    confirmBtn: "Confirmar visita",
    confirmCancel: "Cancelar",
    confirmCount: "{stamps} de {milestone} sellos",
    camDenied: "La cámara está bloqueada. Permite el acceso a la cámara para esta página o escribe el número del cliente abajo.",
    camNone: "Este teléfono no puede abrir la cámara aquí. Escribe el número del cliente abajo.",
    notThisShop: "Ese QR no es una tarjeta de este negocio.",
    locked: "Demasiados PIN incorrectos. Inténtalo de nuevo en {minutes} minutos."
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
var pin = "";
var shop = new URLSearchParams(location.search).get("shop") || localStorage.getItem("ros.shop") || "";
var visitType = "appointment";

function t(k, vars) {
  var s = T[lang][k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}

function paint() {
  document.documentElement.lang = lang;
  ["h1", "sub", "lShop", "lPin", "lPhone", "phoneHint", "lType", "weekNote", "submit", "foot",
   "scanBtn", "scanHint", "scanPoint", "scanCancel", "orType", "confirmBtn", "confirmCancel", "ovReqBtn", "ovGoBtn", "ovSent"].forEach(function (id) {
    var el = document.getElementById(id);
    var key = { lPin: "lPin", lPhone: "lPhone", lType: "lType", phoneHint: "phoneHint", weekNote: "weekNote", ovReqBtn: "ovReq", ovGoBtn: "ovGo" }[id] || id;
    if (el && T[lang][key]) el.textContent = T[lang][key];
  });
  document.querySelectorAll("#types .chip").forEach(function (c) {
    c.textContent = t(c.dataset.type);
    c.setAttribute("aria-pressed", String(c.dataset.type === visitType));
    c.className = "chip" + (c.dataset.type === visitType ? " warn" : "");
  });
  document.getElementById("shopChip").textContent = shop || "·";
  if (SB.demo) {
    var d = document.getElementById("demoNote");
    d.textContent = t("demo");
    d.classList.remove("hidden");
  }
  renderPin();
}

var idleTimer = null;
function renderPin() {
  /* A PIN left on screen clears itself after 2 minutes of no taps. */
  clearTimeout(idleTimer);
  if (pin) idleTimer = setTimeout(function () { pin = ""; renderPin(); }, 120000);
  [].forEach.call(document.getElementById("slots").children, function (s, i) {
    s.className = i < pin.length ? "on" : "";
  });
}

function pad() {
  var box = document.getElementById("pad");
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "←"].forEach(function (k) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = k;
    b.onclick = function () {
      if (k === "clear") pin = "";
      else if (k === "←") pin = pin.slice(0, -1);
      else if (pin.length < 4) pin += k;
      renderPin();
    };
    box.appendChild(b);
  });
}

document.querySelectorAll("#types .chip").forEach(function (c) {
  c.onclick = function () {
    visitType = c.dataset.type;
    paint();
  };
});

document.getElementById("submit").onclick = function () {
  var phone = document.getElementById("phone").value.trim();
  if (pin.length !== 4) return say(t("needPin"), "bad");
  if (phone.replace(/\D/g, "").length < 10) return say(t("needPhone"), "bad");

  if (SB.demo) {
    return done({ member: "Client", staff: "Marcus", visits: 3, cycle: 3, milestone: 5 });
  }

  var btn = this;
  btn.disabled = true;
  SB.rpc("log_visit", { p_shop: shop, p_pin: pin, p_phone: phone, p_visit_type: visitType })
    .then(function (res) {
      if (!res) return say(T[lang].badPin, "bad");
      if (res.ok) { pin = ""; renderPin(); return done(res); }
      if (res.error === "too_soon") ovShow({ phone: phone });
      say(errText(res), "bad");
    })
    .catch(function (e) { say(e.message, "bad"); })
    .then(function () { btn.disabled = false; });
};

function errText(res) {
  if (!res) return t("badPin");
  var map = {
    bad_pin: "badPin",
    locked: "locked",
    too_soon: "tooSoon",
    not_member: "notMember",
    unknown_shop: "unknownShop",
    bad_phone: "badPhone",
    bad_override: "ovBad",
    send_failed: "ovFail"
  };
  return t(map[res.error] || "badPin", { days: res.days_left, minutes: res.minutes });
}

/* ---- Scan to stamp ----
   The client's card QR holds their card link (…&t=<token>). The camera reads it,
   the PIN-gated lookup shows who it is, and Confirm visit stamps through the same
   rules as typing the number. The scanner library only loads when Scan is tapped. */
var cam = null, scanning = false, scanTok = "", jsqrReady = null, ovWho = null;

function tokenFrom(text) {
  var s = String(text || "");
  var m = s.match(/[?&]t=([0-9a-fA-F-]{36})(?:&|$)/);
  var tok = m ? m[1] : s.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tok) ? tok.toLowerCase() : "";
}

function loadJsQR() {
  if (window.jsQR) return Promise.resolve();
  if (!jsqrReady) {
    jsqrReady = new Promise(function (ok, bad) {
      var el = document.createElement("script");
      el.src = "lib/jsQR.js";
      el.onload = ok;
      el.onerror = function () { jsqrReady = null; bad(new Error("scanner")); };
      document.head.appendChild(el);
    });
  }
  return jsqrReady;
}

function stopCam() {
  scanning = false;
  if (cam) { cam.getTracks().forEach(function (tr) { tr.stop(); }); cam = null; }
  document.getElementById("scanBox").classList.add("hidden");
}

function ovShow(who) {
  ovWho = who;
  document.getElementById("ovCode").value = "";
  document.getElementById("ovBox").classList.add("hidden");
  document.getElementById("ovReqBtn").classList.remove("hidden");
  document.getElementById("ovPanel").classList.remove("hidden");
}

function ovHide() {
  ovWho = null;
  document.getElementById("ovPanel").classList.add("hidden");
  document.getElementById("ovBox").classList.add("hidden");
  document.getElementById("ovCode").value = "";
}

function hideConfirm() {
  scanTok = "";
  ovHide();
  document.getElementById("confirmBox").classList.add("hidden");
}

function drawStamps(el, cycle, milestone) {
  el.innerHTML = "";
  for (var i = 0; i < milestone; i++) {
    var d = document.createElement("i");
    if (i < cycle) { d.className = "on"; d.textContent = "✓"; }
    else d.textContent = String(i + 1);
    el.appendChild(d);
  }
}

function fmtPhone(p) {
  var d = String(p || "").replace(/\D/g, "");
  if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
  return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : String(p || "");
}

function showConfirm(res, tok) {
  scanTok = tok;
  document.getElementById("msg").className = "msg hidden";
  document.getElementById("confirmWho").textContent = ((res.member || "") + " " + (res.last || "")).trim();
  document.getElementById("confirmPhone").textContent = fmtPhone(res.phone);
  drawStamps(document.getElementById("confirmStamps"), res.cycle, res.milestone);
  var note = t("confirmCount", { stamps: res.cycle, milestone: res.milestone });
  if (!res.can_stamp) note += " · " + t("tooSoon");
  document.getElementById("confirmNote").textContent = note;
  document.getElementById("confirmBtn").classList.toggle("hidden", !res.can_stamp);
  if (res.can_stamp) ovHide(); else ovShow({ token: tok });
  document.getElementById("confirmBox").classList.remove("hidden");
}

function scanTick() {
  if (!scanning) return;
  var v = document.getElementById("scanVideo");
  if (v.readyState >= 2 && v.videoWidth) {
    var c = document.getElementById("scanCanvas");
    var w = Math.min(v.videoWidth, 640);
    var h = Math.round(v.videoHeight * w / v.videoWidth);
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(v, 0, 0, w, h);
    var img = ctx.getImageData(0, 0, w, h);
    var code = window.jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
    var tok = code && code.data ? tokenFrom(code.data) : "";
    if (tok) { stopCam(); return lookup(tok); }
  }
  setTimeout(scanTick, 120);
}

function lookup(tok) {
  SB.rpc("lookup_card_for_staff", { p_shop: shop, p_pin: pin, p_token: tok })
    .then(function (res) {
      if (res && res.ok) return showConfirm(res, tok);
      if (res && res.error === "not_member") return say(t("notThisShop"), "bad");
      say(errText(res), "bad");
    })
    .catch(function (e) { say(e.message, "bad"); });
}

document.getElementById("scanBtn").onclick = function () {
  if (pin.length !== 4) return say(t("needPin"), "bad");
  hideConfirm();
  document.getElementById("msg").className = "msg hidden";
  if (SB.demo) return showConfirm({ member: "Client", last: "Demo", phone: "3055550142", cycle: 3, milestone: 5, can_stamp: true }, "demo");
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return say(t("camNone"), "bad");
  loadJsQR()
    .then(function () {
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    })
    .then(function (stream) {
      cam = stream;
      var v = document.getElementById("scanVideo");
      v.srcObject = stream;
      document.getElementById("scanBox").classList.remove("hidden");
      return v.play();
    })
    .then(function () { scanning = true; scanTick(); })
    .catch(function (e) {
      stopCam();
      say(t(e && e.name === "NotAllowedError" ? "camDenied" : "camNone"), "bad");
    });
};

document.getElementById("scanCancel").onclick = stopCam;
document.getElementById("confirmCancel").onclick = hideConfirm;

document.getElementById("phone").addEventListener("input", function () {
  if (ovWho && ovWho.phone) ovHide();
});

document.getElementById("ovReqBtn").onclick = function () {
  if (SB.demo) { document.getElementById("ovBox").classList.remove("hidden"); return; }
  var btn = this;
  btn.disabled = true;
  if (!ovWho) return;
  var req = ovWho.token
    ? SB.rpc("request_visit_override", { p_shop: shop, p_pin: pin, p_token: ovWho.token })
    : SB.rpc("request_visit_override_by_phone", { p_shop: shop, p_pin: pin, p_phone: ovWho.phone });
  req
    .then(function (res) {
      if (res && res.ok) {
        document.getElementById("msg").className = "msg hidden";
        btn.classList.add("hidden");
        document.getElementById("ovBox").classList.remove("hidden");
        return document.getElementById("ovCode").focus();
      }
      say(errText(res), "bad");
    })
    .catch(function (e) { say(e.message, "bad"); })
    .then(function () { btn.disabled = false; });
};

document.getElementById("ovGoBtn").onclick = function () {
  var code = document.getElementById("ovCode").value.replace(/\D/g, "");
  if (code.length !== 6) return say(t("ovNeedCode"), "bad");
  if (SB.demo) { hideConfirm(); return done({ member: "Client", staff: "Marcus", visits: 4, cycle: 4, milestone: 5 }); }
  var btn = this;
  btn.disabled = true;
  if (!ovWho) return;
  var go = ovWho.token
    ? SB.rpc("log_visit_by_token", { p_shop: shop, p_pin: pin, p_token: ovWho.token, p_visit_type: visitType, p_override_code: code })
    : SB.rpc("log_visit", { p_shop: shop, p_pin: pin, p_phone: ovWho.phone, p_visit_type: visitType, p_override_code: code });
  go
    .then(function (res) {
      if (res && res.ok) { hideConfirm(); ovHide(); return done(res); }
      say(errText(res), "bad");
    })
    .catch(function (e) { say(e.message, "bad"); })
    .then(function () { btn.disabled = false; });
};

document.getElementById("confirmBtn").onclick = function () {
  if (SB.demo) { hideConfirm(); return done({ member: "Client", staff: "Marcus", visits: 4, cycle: 4, milestone: 5 }); }
  var btn = this;
  btn.disabled = true;
  SB.rpc("log_visit_by_token", { p_shop: shop, p_pin: pin, p_token: scanTok, p_visit_type: visitType })
    .then(function (res) {
      hideConfirm();
      if (res && res.ok) return done(res);
      say(res && res.error === "not_member" ? t("notThisShop") : errText(res), "bad");
    })
    .catch(function (e) { hideConfirm(); say(e.message, "bad"); })
    .then(function () { btn.disabled = false; });
};

function done(r) {
  document.getElementById("form").classList.add("hidden");
  document.getElementById("shopPick").classList.add("hidden");
  document.getElementById("done").classList.remove("hidden");
  document.getElementById("again").textContent = t("again");
  document.getElementById("doneH").textContent = r.member ? t("done", { name: r.member }) : t("donePlain");
  document.getElementById("doneSub").textContent = t("doneSub", {
    staff: r.staff, stamps: r.cycle, milestone: r.milestone
  });
  var row = document.getElementById("doneStamps");
  row.innerHTML = "";
  for (var i = 0; i < r.milestone; i++) {
    var el = document.createElement("i");
    if (i < r.cycle) { el.className = "on"; el.textContent = "✓"; }
    else el.textContent = String(i + 1);
    row.appendChild(el);
  }
  document.getElementById("doneReward").textContent = r.reward
    ? t("reward", { reward: r.reward_name || r.reward, code: (r.voucher_code || "").toUpperCase() })
    : t("noReward", { left: Math.max(r.milestone - r.cycle, 0) });
}

document.getElementById("again").onclick = function () {
  document.getElementById("done").classList.add("hidden");
  document.getElementById("form").classList.remove("hidden");
  document.getElementById("phone").value = "";
  document.getElementById("msg").className = "msg hidden";
  ovHide();
  pin = "";
  renderPin();
};

function say(text, kind) {
  var m = document.getElementById("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

function boot() {
  pad();
  paint();
  if (shop) return;

  document.getElementById("shopPick").classList.remove("hidden");
  SB.rest("shops?select=id,name&order=name").then(function (rows) {
    var sel = document.getElementById("shopSel");
    sel.innerHTML = "";
    (rows || []).forEach(function (r) {
      var o = document.createElement("option");
      o.value = r.id;
      o.textContent = r.name;
      sel.appendChild(o);
    });
    sel.onchange = function () {
      shop = sel.value;
      localStorage.setItem("ros.shop", shop);
      document.getElementById("shopPick").classList.add("hidden");
      paint();
    };
  }).catch(function () {});
}

boot();
