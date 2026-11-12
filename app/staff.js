var T = {
  en: {
    h1: "Log a visit",
    sub: "Enter your PIN and the client's mobile number.",
    lShop: "Which shop?",
    lPin: "Your 4-digit PIN",
    lPhone: "Client's 10-digit number",
    phoneHint: "Digits only. The number they joined with.",
    lType: "What was today's visit?",
    weekNote: "Every stamp is saved with your name and the time. A client can get one stamp per 7 days.",
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
    tooSoon: "Already stamped — {days} day(s) until this client's next stamp.",
    notMember: "Not a member yet. Send them the shop's join QR first.",
    unknownShop: "We don't recognise this shop code.",
    badPhone: "That number looks short — use 10 digits.",
    demo: "Demo mode — no Supabase key in config.js, so nothing is saved.",
    foot: "One stamp per client per week. Nothing sends from this page."
  },
  es: {
    h1: "Registrar una visita",
    sub: "Pon tu PIN y el número del cliente.",
    lShop: "¿En qué negocio?",
    lPin: "Tu PIN de 4 dígitos",
    lPhone: "Número del cliente (10 dígitos)",
    phoneHint: "Solo números. Con el que se registró.",
    lType: "¿Qué fue la visita de hoy?",
    weekNote: "Cada sello se guarda con tu nombre y la hora. El cliente puede recibir un sello cada 7 días.",
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
    tooSoon: "Ya tiene sello — faltan {days} día(s) para el próximo.",
    notMember: "Todavía no es miembro. Mándale el QR de registro del negocio.",
    unknownShop: "No reconocemos ese código de negocio.",
    badPhone: "Ese número parece corto: usa 10 dígitos.",
    demo: "Modo demo: no hay clave de Supabase en config.js, así que no se guarda nada.",
    foot: "Un sello por cliente por semana. Desde esta página no se envía nada."
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
  ["h1", "sub", "lShop", "lPin", "lPhone", "phoneHint", "lType", "weekNote", "submit", "foot"].forEach(function (id) {
    var el = document.getElementById(id);
    var key = { lPin: "lPin", lPhone: "lPhone", lType: "lType", phoneHint: "phoneHint", weekNote: "weekNote" }[id] || id;
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

function renderPin() {
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
      var map = {
        bad_pin: "badPin",
        too_soon: "tooSoon",
        not_member: "notMember",
        unknown_shop: "unknownShop",
        bad_phone: "badPhone"
      };
      say(t(map[res.error] || "badPin", { days: res.days_left }), "bad");
    })
    .catch(function (e) { say(e.message, "bad"); })
    .then(function () { btn.disabled = false; });
};

function done(r) {
  document.getElementById("form").classList.add("hidden");
  document.getElementById("shopPick").classList.add("hidden");
  document.getElementById("done").classList.remove("hidden");
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
