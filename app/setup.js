/* Shop onboarding · app.retainos.co/setup.html
   Creates the shop, its staff rows and the owner invites in one call (RPC onboard_shop).
   Numbers come from business_types, so nothing here has to match a workflow. */

var T = {
  en: {
    h1: "Set up a shop",
    sub: "Takes about two minutes. This writes the shop, its staff and the owner's access in one step.",
    s1: "1 · The business",
    s1note: "What clients see on the join page, and what routes the reminders.",
    lName: "Business name",
    lSlug: "Link name",
    slugNote: "Becomes join.retainos.co/{link}. Lowercase, no spaces.",
    lType: "Type of business",
    typeNote: "Sets the usual gap between visits, which drives the reminder timing.",
    lCity: "City",
    lState: "State",
    lZip: "ZIP",
    lPhone: "Business phone",
    s2: "2 · The program",
    s2note: "Default numbers come from the business type. Change them if this shop needs something different.",
    lLang: "Default language",
    lPlan: "Plan",
    lStart: "Stamps at join",
    lMile: "Stamps to the card",
    lTexts: "Texts a month",
    mileNote: "Two free stamps means the client earns the card in a few visits, not many.",
    lTier: "Getaways",
    lTool: "Booking system",
    lLink: "Booking link",
    s3: "3 · The people",
    s3note: "Staff are the names a client picks when joining. One per line, comma for their role.",
    lStaff: "Staff (one per line: Name, role)",
    lOwners: "Owner email",
    ownersNote: "They get dashboard access only. Votel stays internal at every plan.",
    submit: "Create the shop",
    working: "Creating…",
    rH: "Shop created",
    rNote: "The owner sees the dashboard, the QR page and the staff PIN pad — never Votel. Print the poster from the QR page.",
    rQr: "Open the QR page",
    rDash: "Dashboard",
    copy: "Copy link",
    copied: "Copied",
    back: "Dashboard",
    foot: "Powered by RetainOS",
    join: "Join link",
    staffN: "staff added",
    invN: "owner invited",
    invSending: "Sending the invite email to {n}…",
    invSent: "Invite email sent to {n}.",
    invFail: "Shop is created, but the email to {n} didn't go out.",
    invRetry: "Try the invite again in a minute.",
    cadence: "usually every {n} days",
    // errors
    auth_required: "Your session expired. Sign in again.",
    not_admin: "This login isn't set up to create shops.",
    bad_name: "Give the business a name.",
    bad_slug: "The link name is too short.",
    bad_type: "Pick a type of business.",
    bad_milestone: "Stamps to the card must be between 2 and 12.",
    bad_start: "Stamps at join must be lower than the card total.",
    slug_taken: "That link name is already taken. Try another."
  },
  es: {
    h1: "Configurar un negocio",
    sub: "Toma unos dos minutos. Crea el negocio, su equipo y el acceso del dueño en un solo paso.",
    s1: "1 · El negocio",
    s1note: "Lo que ven los clientes en la página de registro, y lo que define los recordatorios.",
    lName: "Nombre del negocio",
    lSlug: "Nombre del enlace",
    slugNote: "Queda en join.retainos.co/{enlace}. Minúsculas, sin espacios.",
    lType: "Tipo de negocio",
    typeNote: "Define el tiempo habitual entre visitas, que marca cuándo se recuerda.",
    lCity: "Ciudad",
    lState: "Estado",
    lZip: "Código postal",
    lPhone: "Teléfono del negocio",
    s2: "2 · El programa",
    s2note: "Los números vienen del tipo de negocio. Cámbialos si este negocio necesita otra cosa.",
    lLang: "Idioma por defecto",
    lPlan: "Plan",
    lStart: "Sellos al unirse",
    lMile: "Sellos para la tarjeta",
    lTexts: "Textos al mes",
    mileNote: "Dos sellos de regalo hacen que la tarjeta se gane en pocas visitas.",
    lTier: "Escapadas",
    lTool: "Sistema de reservas",
    lLink: "Enlace de reservas",
    s3: "3 · Las personas",
    s3note: "El equipo son los nombres que el cliente elige al unirse. Uno por línea, coma para el rol.",
    lStaff: "Equipo (uno por línea: Nombre, rol)",
    lOwners: "Correo del dueño",
    ownersNote: "Solo recibe acceso al panel. Votel queda interno en todos los planes.",
    submit: "Crear el negocio",
    working: "Creando…",
    rH: "Negocio creado",
    rNote: "El dueño ve el panel, la página del QR y el teclado del equipo — nunca Votel. Imprime el cartel desde la página del QR.",
    rQr: "Abrir el QR",
    rDash: "Panel",
    copy: "Copiar enlace",
    copied: "Copiado",
    back: "Panel",
    foot: "Con tecnología de RetainOS",
    join: "Enlace de registro",
    staffN: "personas agregadas",
    invN: "dueño invitado",
    invSending: "Enviando la invitación a {n}…",
    invSent: "Invitación enviada a {n}.",
    invFail: "El negocio está creado, pero el correo a {n} no salió.",
    invRetry: "Reintenta la invitación en un minuto.",
    cadence: "suele venir cada {n} días",
    auth_required: "La sesión caducó. Entra otra vez.",
    not_admin: "Este acceso no puede crear negocios.",
    bad_name: "Escribe el nombre del negocio.",
    bad_slug: "El nombre del enlace es muy corto.",
    bad_type: "Elige el tipo de negocio.",
    bad_milestone: "Los sellos para la tarjeta deben ser entre 2 y 12.",
    bad_start: "Los sellos al unirse deben ser menos que el total.",
    slug_taken: "Ese nombre de enlace ya existe. Prueba otro."
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
var types = [];
var slugTouched = false;

function t(k, vars) {
  var s = (T[lang] && T[lang][k]) || T.en[k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}
function $(id) { return document.getElementById(id); }
function val(id) { var el = $(id); return el ? el.value.trim() : ""; }

function paint() {
  document.documentElement.lang = lang;
  var map = {
    h1: "h1", sub: "sub", s1: "s1", s1note: "s1note", lName: "lName", lSlug: "lSlug",
    slugNote: "slugNote", lType: "lType", typeNote: "typeNote", lCity: "lCity",
    lState: "lState", lZip: "lZip", lPhone: "lPhone", s2: "s2", s2note: "s2note",
    lLang: "lLang", lPlan: "lPlan", lStart: "lStart", lMile: "lMile", lTexts: "lTexts",
    mileNote: "mileNote", lTier: "lTier", lTool: "lTool", lLink: "lLink", s3: "s3",
    s3note: "s3note", lStaff: "lStaff", lOwners: "lOwners", ownersNote: "ownersNote",
    submit: "submit", rH: "rH", rNote: "rNote", rQr: "rQr", rDash: "rDash", copy: "copy",
    back: "back", foot: "foot"
  };
  Object.keys(map).forEach(function (id) {
    if ($(id)) $(id).textContent = t(map[id]);
  });
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    b.onclick = function () {
      localStorage.setItem("ros.lang", b.getAttribute("data-lang"));
      location.reload();
    };
  });
  paintTypes();
  paintMile();
}

function paintTypes() {
  var sel = $("type");
  if (!sel || !types.length) return;
  var keep = sel.value || (types[0] && types[0].key);
  sel.innerHTML = "";
  types.forEach(function (bt) {
    var o = document.createElement("option");
    o.value = bt.key;
    o.textContent = (bt.industry || bt.key) + " · " + t("cadence", { n: bt.rebook_days || 28 });
    sel.appendChild(o);
  });
  sel.value = keep;
}

function stampsFor(days) {
  if (!days || days <= 30) return { milestone: 5, start: 2 };
  if (days <= 45) return { milestone: 4, start: 1 };
  return { milestone: 3, start: 1 };
}

function applyTypeDefaults() {
  var bt = types.filter(function (x) { return x.key === $("type").value; })[0];
  if (!bt) return;
  var d = stampsFor(bt.rebook_days);
  $("milestone").value = d.milestone;
  $("start").value = d.start;
  paintMile();
}

function paintMile() {
  var m = parseInt(val("milestone"), 10) || 0;
  var s = parseInt(val("start"), 10) || 0;
  $("mileNote").textContent = m && s >= 0 && m > s
    ? t("mileNote") + " (" + (m - s) + ")"
    : t("mileNote");
}

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

/* One email per owner. A failure here never undoes the shop: it already exists,
   so we report which address did not go out instead of throwing. */
function inviteOwners(emails) {
  var note = $("inviteNote");
  if (!note || !emails.length) return;
  note.classList.remove("hidden");
  note.textContent = t("invSending", { n: emails.join(", ") });
  var sent = [], failed = [];
  var chain = Promise.resolve();
  emails.forEach(function (email) {
    chain = chain.then(function () {
      return SB.inviteOwner(email).then(
        function () { sent.push(email); },
        function () { failed.push(email); }
      );
    });
  });
  chain.then(function () {
    var lines = [];
    if (sent.length) lines.push(t("invSent", { n: sent.join(", ") }));
    if (failed.length) lines.push(t("invFail", { n: failed.join(", ") }) + " " + t("invRetry"));
    note.textContent = lines.join(" ");
  });
}

function parseStaff(raw) {
  return raw.split("\n").map(function (line) {
    var parts = line.split(",");
    return { name: (parts[0] || "").trim(), role: (parts[1] || "").trim() || "staff" };
  }).filter(function (p) { return p.name.length > 0; });
}

if (!SB.session() && !SB.demo) location.replace("signin.html");

paint();

(SB.demo ? Promise.resolve([]) : SB.rest("business_types?select=key,industry,visit_word_en,visit_word_es,rebook_days&order=rebook_days"))
  .then(function (rows) {
    types = rows || [];
    paintTypes();
    applyTypeDefaults();
  })
  .catch(function () { types = []; });

$("type").onchange = applyTypeDefaults;
$("milestone").oninput = paintMile;
$("start").oninput = paintMile;

$("name").oninput = function () {
  if (!slugTouched) $("slug").value = slugify(this.value);
};
$("slug").oninput = function () {
  slugTouched = true;
  this.value = slugify(this.value);
};

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

$("submit").onclick = function () {
  var payload = {
    name: val("name"),
    slug: val("slug"),
    business_type: $("type").value,
    city: val("city"),
    state: val("state").toUpperCase(),
    zip: val("zip"),
    phone: val("phone"),
    language: $("lang").value,
    plan: $("plan").value,
    texts: parseInt(val("texts"), 10) || 100,
    stamps_at_join: parseInt(val("start"), 10),
    milestone: parseInt(val("milestone"), 10),
    destination_tier: $("tier").value,
    booking_tool: $("bookingTool").value,
    booking_link: val("bookingLink"),
    staff: parseStaff($("staff").value),
    owners: val("owners").split(",").map(function (s) { return s.trim(); }).filter(Boolean)
  };

  if (!payload.name) { say(t("bad_name"), "bad"); return; }
  if (!payload.slug) { say(t("bad_slug"), "bad"); return; }
  if (!payload.business_type) { say(t("bad_type"), "bad"); return; }

  $("submit").disabled = true;
  $("submit").textContent = t("working");
  say("");

  SB.rpc("onboard_shop", { p_shop: payload })
    .then(function (r) {
      $("submit").disabled = false;
      $("submit").textContent = t("submit");
      if (!r || !r.ok) { say(t(r && r.error) || (r && r.error) || "Error", "bad"); return; }
      $("joinUrl").value = r.join_url;
      $("rBody").innerHTML =
        "<div class='row'><span>" + t("join") + "</span><b>" + r.shop_id + "</b></div>" +
        "<div class='row'><span>" + t("lMile") + "</span><b>" + r.stamps_at_join + " → " + r.milestone + "</b></div>" +
        "<div class='row'><span>" + r.staff + "</span><b>" + t("staffN") + "</b></div>" +
        "<div class='row'><span>" + r.invited + "</span><b>" + t("invN") + "</b></div>";
      $("result").classList.remove("hidden");
      $("result").scrollIntoView({ behavior: "smooth", block: "start" });
      inviteOwners(payload.owners);
    })
    .catch(function (e) {
      $("submit").disabled = false;
      $("submit").textContent = t("submit");
      if (e.status === 401) { location.replace("signin.html"); return; }
      say(t(e.message) || e.message, "bad");
    });
};
