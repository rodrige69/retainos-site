/* Self-serve onboarding · app.retainos.co/start.html
   Account → shop → live. The shop, its staff and the owner link are written in
   one call (RPC create_my_shop), so nobody has to create shops by hand. */

var T = {
  en: {
    h1: "Set up your shop",
    sub: "A couple of fields and you're live: join link, QR poster, dashboard.",
    signupH: "1 · Your account",
    signupSub: "You'll own this shop and see its dashboard.",
    lEmail: "Email",
    lPw: "Password",
    signupBtn: "Create account",
    haveAcct: "Already have an account? Sign in at app.retainos.co/signin",
    pwShort: "Use at least 8 characters.",
    signupFail: "That didn't work. Try again in a minute.",
    checkEmail: "Check your email and open the link we sent — it brings you back here to finish.",
    shopH: "2 · Your business",
    shopSub: "This is what clients see when they scan your QR.",
    lName: "Business name",
    lType: "Type of business",
    lCity: "City",
    lPhone: "Phone",
    lStaff: "Team (one name per line, optional)",
    createBtn: "Create my shop",
    making: "Creating…",
    shopNote: "You can change any of this later.",
    doneH: "You're live",
    doneSub: "Your join link is ready. Put the QR on the counter and the first client starts the card.",
    joinLbl: "Your join link",
    copy: "Copy link",
    copied: "Copied",
    qr: "Get the QR poster",
    dash: "Open my dashboard",
    foot: "Powered by RetainOS",
    needName: "Add your business name first.",
    needEmail: "Add your email first.",
    bad_name: "Add your business name.",
    bad_slug: "That name can't be used as a link. Try another one.",
    bad_type: "Pick the type of business.",
    slug_taken: "That link name is taken — change the business name slightly.",
    bad_milestone: "Stamps to the card must be between 2 and 12.",
    bad_start: "Stamps at join must be lower than the card total.",
    auth_required: "Your session expired. Sign in again.",
    demo: "Demo mode — no Supabase key in config.js.",
    votelWait: "Adding this shop to Votel…",
    votelOk: "Added to Votel as a shop — its staff and its clients sit under {slug}.",
    votelLater: "Your shop is live. The Votel contact is waiting on its key, so RetainOS finishes that one step.",
    votelFail: "Your shop is live. The Votel contact didn't go through — tell RetainOS and we'll add it."
  },
  es: {
    h1: "Configura tu negocio",
    sub: "Unos pocos campos y ya está: enlace de registro, cartel con QR y panel.",
    signupH: "1 · Tu cuenta",
    signupSub: "Este negocio queda a tu nombre y ves su panel.",
    lEmail: "Correo",
    lPw: "Contraseña",
    signupBtn: "Crear cuenta",
    haveAcct: "¿Ya tienes cuenta? Entra en app.retainos.co/signin",
    pwShort: "Usa al menos 8 caracteres.",
    signupFail: "No funcionó. Inténtalo en un minuto.",
    checkEmail: "Revisa tu correo y abre el enlace que te enviamos: te trae de vuelta aquí para terminar.",
    shopH: "2 · Tu negocio",
    shopSub: "Esto es lo que ve el cliente cuando escanea tu QR.",
    lName: "Nombre del negocio",
    lType: "Tipo de negocio",
    lCity: "Ciudad",
    lPhone: "Teléfono",
    lStaff: "Equipo (un nombre por línea, opcional)",
    createBtn: "Crear mi negocio",
    making: "Creando…",
    shopNote: "Puedes cambiar todo esto después.",
    doneH: "Ya estás dentro",
    doneSub: "Tu enlace de registro está listo. Pon el QR en el mostrador y el primer cliente empieza la tarjeta.",
    joinLbl: "Tu enlace de registro",
    copy: "Copiar enlace",
    copied: "Copiado",
    qr: "Ver el cartel con QR",
    dash: "Abrir mi panel",
    foot: "Con tecnología de RetainOS",
    needName: "Escribe el nombre de tu negocio.",
    needEmail: "Escribe tu correo.",
    bad_name: "Escribe el nombre de tu negocio.",
    bad_slug: "Ese nombre no sirve como enlace. Prueba otro.",
    bad_type: "Elige el tipo de negocio.",
    slug_taken: "Ese enlace ya existe: cambia un poco el nombre del negocio.",
    bad_milestone: "Los sellos para la tarjeta deben ser entre 2 y 12.",
    bad_start: "Los sellos al unirse deben ser menos que el total.",
    auth_required: "La sesión caducó. Entra otra vez.",
    demo: "Modo demo: no hay clave de Supabase en config.js.",
    votelWait: "Agregando este negocio a Votel…",
    votelOk: "Agregado a Votel como negocio: su equipo y sus clientes quedan bajo {slug}.",
    votelLater: "Tu negocio ya está activo. El contacto en Votel espera su clave, así que RetainOS termina ese paso.",
    votelFail: "Tu negocio ya está activo. El contacto en Votel no se creó: avísale a RetainOS y lo agregamos."
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
var types = [];

function t(k, vars) {
  var s = (T[lang] && T[lang][k]) || T.en[k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}
function $(id) { return document.getElementById(id); }
function val(id) { var el = $(id); return el ? el.value.trim() : ""; }
function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}
function show(id) { $(id).classList.remove("hidden"); }
function hide(id) { $(id).classList.add("hidden"); }

function paint() {
  document.documentElement.lang = lang;
  ["h1", "sub", "signupH", "signupSub", "lEmail", "lPw", "signupBtn", "haveAcct",
   "shopH", "shopSub", "lName", "lType", "lCity", "lPhone", "lStaff", "createBtn",
   "shopNote", "doneH", "doneSub", "joinLbl", "copy", "qr", "dash", "foot"].forEach(function (id) {
    if ($(id)) $(id).textContent = t(id);
  });
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    b.onclick = function () {
      localStorage.setItem("ros.lang", b.getAttribute("data-lang"));
      location.reload();
    };
  });
  paintTypes();
}

function paintTypes() {
  var sel = $("type");
  if (!sel || !types.length) return;
  var keep = sel.value || types[0].key;
  sel.innerHTML = "";
  types.forEach(function (bt) {
    var o = document.createElement("option");
    o.value = bt.key;
    o.textContent = bt.industry || bt.key;
    sel.appendChild(o);
  });
  sel.value = keep;
}

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

paint();

if (SB.demo) {
  var d = $("demoNote");
  d.textContent = t("demo");
  d.classList.remove("hidden");
}

/* Business types decide the usual gap between visits, so the form never
   carries a number of its own. */
(SB.demo ? Promise.resolve([]) : SB.rest("business_types?select=key,industry,rebook_days&order=industry"))
  .then(function (rows) { types = rows || []; paintTypes(); })
  .catch(function () { types = []; });

$("email").value = "";
$("password").value = "";

$("signupBtn").onclick = function () {
  var email = val("email");
  var pw = $("password").value;
  if (!email) { $("email").focus(); return say(t("needEmail"), "bad"); }
  if (pw.length < 8) { $("password").focus(); return say(t("pwShort"), "bad"); }
  var btn = this;
  btn.disabled = true;
  SB.signUp(email, pw).then(function (res) {
    btn.disabled = false;
    if (res && res.access_token) {
      hide("signupBlock");
      show("shopBlock");
      say("");
      $("name").focus();
      return;
    }
    say(t("checkEmail"), "good");
  }).catch(function (e) {
    btn.disabled = false;
    say((e && e.message) || t("signupFail"), "bad");
  });
};

function parseStaff(raw) {
  return raw.split("\n").map(function (line) {
    var parts = line.split(",");
    return { name: (parts[0] || "").trim(), role: (parts[1] || "").trim() || "staff" };
  }).filter(function (p) { return p.name.length > 0; });
}

$("createBtn").onclick = function () {
  var name = val("name");
  if (!name) { $("name").focus(); return say(t("bad_name"), "bad"); }
  if (!$("type").value) return say(t("bad_type"), "bad");

  var payload = {
    name: name,
    slug: slugify(name),
    business_type: $("type").value,
    city: val("city"),
    phone: val("phone"),
    staff: parseStaff($("staff").value)
  };

  var btn = this;
  btn.disabled = true;
  btn.textContent = t("making");
  say("");

  SB.rpc("create_my_shop", { p_shop: payload }).then(function (r) {
    btn.disabled = false;
    btn.textContent = t("createBtn");
    if (!r || !r.ok) {
      if (r && r.error === "already_owned") { location.replace("dashboard.html"); return; }
      if (r && r.error === "auth_required") { location.replace("signin.html"); return; }
      say(t(r && r.error) || (r && r.error) || "Error", "bad");
      return;
    }
    $("joinUrl").value = r.join_url;
    $("qr").href = "onboard.html?shop=" + encodeURIComponent(r.shop_id);
    $("dash").href = "dashboard.html";
    hide("shopBlock");
    hide("signupBlock");
    show("doneBlock");
    syncVotel(r.shop_id);
  }).catch(function (e) {
    btn.disabled = false;
    btn.textContent = t("createBtn");
    if (e && e.status === 401) { location.replace("signin.html"); return; }
    say((e && e.message) || t("signupFail"), "bad");
  });
};

/* The shop already exists in Supabase at this point; the Votel contact is a
   second, best-effort step so a Votel outage never loses a signup. */
function syncVotel(shopId) {
  var note = $("votelNote");
  var s = SB.session();
  if (!note || !s || !s.access_token) return;
  note.textContent = t("votelWait");
  fetch("api/votel-shop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + s.access_token
    },
    body: JSON.stringify({ shop_id: shopId })
  }).then(function (r) {
    return r.json().catch(function () { return {}; });
  }).then(function (j) {
    if (j && j.ok) {
      note.textContent = t("votelOk", { slug: shopId });
      note.className = "hint good";
    } else if (j && j.error === "not_configured") {
      note.textContent = t("votelLater");
    } else {
      note.textContent = t("votelFail");
    }
  }).catch(function () {
    note.textContent = t("votelFail");
  });
}

$("copy").onclick = function () {
  var input = $("joinUrl");
  input.select();
  var done = function () {
    var b = $("copy");
    b.textContent = t("copied");
    setTimeout(function () { b.textContent = t("copy"); }, 1500);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, done);
  else { document.execCommand("copy"); done(); }
};

/* Signed in already? Go straight to the shop step, unless this login already
   owns a shop — then there is nothing to set up. */
if (!SB.demo) {
  if (SB.session()) {
    SB.rest("shop_owners?select=shop_id&limit=1").then(function (rows) {
      if (rows && rows.length) { location.replace("dashboard.html"); return; }
      hide("signupBlock");
      show("shopBlock");
      $("name").focus();
    }).catch(function () {
      hide("signupBlock");
      show("shopBlock");
    });
  } else {
    show("signupBlock");
  }
} else {
  show("signupBlock");
}
