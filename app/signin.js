var T = {
  en: {
    h1: "Sign in to your dashboard",
    sub: "Your login is set up on your kickoff call.",
    lEmail: "Email",
    lPw: "Password",
    signin: "Sign in",
    toLink: "Email me a link instead",
    notePw: "Forgot it? Ask for a reset and we'll send a new one.",
    forgot: "Forgot your password?",
    resetSent: "Check your inbox — the reset link is on its way.",
    resetFail: "That didn't send. Try again in a minute.",
    send: "Send me a link",
    lCode: "Or type the 6-digit code from the email",
    verify: "Sign in with the code",
    toPw: "Use my password instead",
    sent: "Check your inbox — the link is on its way.",
    need: "Add your email first.",
    bad: "That code didn't work. Ask for a new link.",
    badCreds: "That email and password don't match.",
    rate: "Too many tries. Wait a minute and try again.",
    demo: "Demo mode — no Supabase key in config.js yet.",
    foot: "No account yet? Claim a pilot spot at retainos.co."
  },
  es: {
    h1: "Entra a tu panel",
    sub: "Tu acceso se crea en la llamada de inicio.",
    lEmail: "Email",
    lPw: "Contraseña",
    signin: "Entrar",
    toLink: "Mejor mándame un enlace",
    notePw: "¿La olvidaste? Pide un cambio y te mandamos una nueva.",
    forgot: "¿Olvidaste tu contraseña?",
    resetSent: "Revisa tu correo: el enlace para cambiarla va en camino.",
    resetFail: "No se envió. Inténtalo en un minuto.",
    send: "Enviarme el enlace",
    lCode: "O escribe el código de 6 dígitos del email",
    verify: "Entrar con el código",
    toPw: "Usar mi contraseña",
    sent: "Revisa tu correo: el enlace va en camino.",
    need: "Escribe tu email primero.",
    bad: "Ese código no funcionó. Pide un enlace nuevo.",
    badCreds: "El email y la contraseña no coinciden.",
    rate: "Demasiados intentos. Espera un minuto y vuelve a probar.",
    demo: "Modo demo: todavía no hay clave de Supabase en config.js.",
    foot: "¿Aún no tienes cuenta? Pide tu lugar del piloto en retainos.co."
  }
};

var lang = localStorage.getItem("ros.lang") || "en";

function t(k) { return T[lang][k] || k; }

function apply() {
  document.documentElement.lang = lang;
  document.getElementById("h1").textContent = t("h1");
  document.getElementById("sub").textContent = t("sub");
  document.getElementById("lEmail").textContent = t("lEmail");
  document.getElementById("lPw").textContent = t("lPw");
  document.getElementById("signinBtn").textContent = t("signin");
  document.getElementById("toLink").textContent = t("toLink");
  document.getElementById("forgot").textContent = t("forgot");
  document.getElementById("notePw").textContent = t("notePw");
  document.getElementById("send").textContent = t("send");
  document.getElementById("lCode").textContent = t("lCode");
  document.getElementById("verify").textContent = t("verify");
  document.getElementById("toPw").textContent = t("toPw");
  document.getElementById("foot").textContent = t("foot");
  document.getElementById("btnEn").setAttribute("aria-pressed", String(lang === "en"));
  document.getElementById("btnEs").setAttribute("aria-pressed", String(lang === "es"));
  if (SB.demo) {
    var n = document.getElementById("demoNote");
    n.textContent = t("demo");
    n.classList.remove("hidden");
  }
}

function say(text, kind) {
  var m = document.getElementById("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

function clearMsg() { document.getElementById("msg").className = "msg hidden"; }

document.getElementById("btnEn").onclick = function () { lang = "en"; localStorage.setItem("ros.lang", lang); apply(); };
document.getElementById("btnEs").onclick = function () { lang = "es"; localStorage.setItem("ros.lang", lang); apply(); };

document.getElementById("signinBtn").onclick = function () {
  var email = document.getElementById("email").value.trim();
  var pw = document.getElementById("password").value;
  if (!email) { document.getElementById("email").focus(); return say(t("need"), "bad"); }
  if (!pw) { document.getElementById("password").focus(); return say(t("badCreds"), "bad"); }
  var btn = this;
  btn.disabled = true;
  SB.signInWithPassword(email, pw).then(function (res) {
    if (res && res.access_token) { location.replace("dashboard.html"); return; }
    say(t("badCreds"), "bad");
  }).catch(function (err) {
    say(err.status === 429 ? t("rate") : t("badCreds"), "bad");
  }).then(function () { btn.disabled = false; });
};

document.getElementById("forgot").onclick = function () {
  var email = document.getElementById("email").value.trim();
  if (!email) { document.getElementById("email").focus(); return say(t("need"), "bad"); }
  var btn = this;
  btn.disabled = true;
  SB.sendRecovery(email).then(function () {
    say(t("resetSent"));
  }).catch(function (err) {
    say(err.status === 429 ? t("rate") : t("resetFail"), "bad");
  }).then(function () { btn.disabled = false; });
};

document.getElementById("toLink").onclick = function () {
  document.getElementById("pwBlock").classList.add("hidden");
  document.getElementById("linkBlock").classList.remove("hidden");
  clearMsg();
};

document.getElementById("toPw").onclick = function () {
  document.getElementById("linkBlock").classList.add("hidden");
  document.getElementById("step2").classList.add("hidden");
  document.getElementById("pwBlock").classList.remove("hidden");
  clearMsg();
};

document.getElementById("send").onclick = function () {
  var email = document.getElementById("email").value.trim();
  if (!email) { document.getElementById("email").focus(); return say(t("need"), "bad"); }
  var btn = this;
  btn.disabled = true;
  SB.sendMagicLink(email).then(function () {
    document.getElementById("step2").classList.remove("hidden");
    say(SB.demo ? t("demo") : t("sent"));
    document.getElementById("code").focus();
  }).catch(function (err) {
    say(err.status === 429 ? t("rate") : err.message, "bad");
  }).then(function () { btn.disabled = false; });
};

document.getElementById("verify").onclick = function () {
  var email = document.getElementById("email").value.trim();
  var code = document.getElementById("code").value.trim();
  var btn = this;
  btn.disabled = true;
  SB.verifyCode(email, code).then(function (res) {
    if (res && res.access_token) { location.replace("dashboard.html"); return; }
    say(SB.demo ? t("demo") : t("bad"), "bad");
  }).catch(function () { say(t("bad"), "bad"); })
    .then(function () { btn.disabled = false; });
};

document.getElementById("password").addEventListener("keydown", function (e) {
  if (e.key === "Enter") document.getElementById("signinBtn").click();
});

if (SB.captureRedirect()) location.replace("dashboard.html");
apply();
