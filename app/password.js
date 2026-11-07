/* Set a password · app.retainos.co/password.html
   Reached from a reset or invite link (the session comes in on the URL), or
   directly while signed in. Writes through the auth user endpoint. */

var T = {
  en: {
    h1: "Set your password",
    sub: "Pick something you'll remember. Once it's saved you can sign in with it from any device.",
    lPw: "New password",
    lPw2: "Type it again",
    save: "Save password",
    saving: "Saving…",
    done: "Password saved. You're signed in.",
    go: "Go to dashboard",
    short: "Use at least 8 characters.",
    mismatch: "The two passwords don't match.",
    fail: "That didn't save. Try again.",
    noSession: "Open the link from your email to set a password, or ask for a new one below.",
    expired: "That link was already used or has expired. Get a fresh one below.",
    linkBad: "That link didn't work. Get a fresh one below.",
    lEmail: "Your email",
    resend: "Send me a new link",
    resent: "Check your inbox — a fresh link is on its way.",
    needEmail: "Type your email first.",
    resendFail: "That didn't send. Try again in a minute.",
    rate: "A link was just sent. Wait a minute before asking again.",
    toSignin: "Back to sign in",
    foot: "Powered by RetainOS"
  },
  es: {
    h1: "Crea tu contraseña",
    sub: "Elige algo que recuerdes. Cuando la guardes podrás entrar con ella desde cualquier equipo.",
    lPw: "Contraseña nueva",
    lPw2: "Escríbela otra vez",
    save: "Guardar contraseña",
    saving: "Guardando…",
    done: "Contraseña guardada. Ya estás dentro.",
    go: "Ir al panel",
    short: "Usa al menos 8 caracteres.",
    mismatch: "Las dos contraseñas no coinciden.",
    fail: "No se guardó. Inténtalo otra vez.",
    noSession: "Abre el enlace de tu correo para crear la contraseña, o pide otro abajo.",
    expired: "Ese enlace ya se usó o caducó. Pide uno nuevo abajo.",
    linkBad: "Ese enlace no funcionó. Pide uno nuevo abajo.",
    lEmail: "Tu correo",
    resend: "Mándame un enlace nuevo",
    resent: "Revisa tu correo: el enlace nuevo va en camino.",
    needEmail: "Escribe tu correo primero.",
    resendFail: "No se envió. Inténtalo en un minuto.",
    rate: "Ya se envió un enlace. Espera un minuto antes de pedir otro.",
    toSignin: "Volver a entrar",
    foot: "Con tecnología de RetainOS"
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || k; }
function $(id) { return document.getElementById(id); }

function paint() {
  document.documentElement.lang = lang;
  ["h1", "sub", "lPw", "lPw2", "save", "foot", "toSignin", "lEmail", "resend"].forEach(function (id) {
    if ($(id)) $(id).textContent = t(id);
  });
  $("btnEn").setAttribute("aria-pressed", String(lang === "en"));
  $("btnEs").setAttribute("aria-pressed", String(lang === "es"));
}

function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

$("btnEn").onclick = function () { lang = "en"; localStorage.setItem("ros.lang", lang); location.reload(); };
$("btnEs").onclick = function () { lang = "es"; localStorage.setItem("ros.lang", lang); location.reload(); };

paint();

/* The link carried an error: a used, expired or rejected token. */
var linkError = null;
try { linkError = localStorage.getItem("ros.linkError"); localStorage.removeItem("ros.linkError"); } catch (e) {}

if (!SB.session() && !SB.demo) {
  $("formBlock").classList.add("hidden");
  $("resendBlock").classList.remove("hidden");
  say(t(linkError ? (linkError.indexOf("expired") >= 0 ? "expired" : "linkBad") : "noSession"), "bad");
  $("toSignin").classList.remove("hidden");

  $("resend").onclick = function () {
    var email = $("email").value.trim();
    if (!email) { $("email").focus(); return say(t("needEmail"), "bad"); }
    var btn = this;
    btn.disabled = true;
    SB.sendRecovery(email).then(function () {
      say(t("resent"), "good");
    }).catch(function (e) {
      say(e && e.status === 429 ? t("rate") : t("resendFail"), "bad");
    }).then(function () { btn.disabled = false; });
  };
} else {
  $("save").onclick = function () {
    var pw = $("pw").value;
    var pw2 = $("pw2").value;
    if (pw.length < 8) { $("pw").focus(); return say(t("short"), "bad"); }
    if (pw !== pw2) { $("pw2").focus(); return say(t("mismatch"), "bad"); }

    var btn = this;
    btn.disabled = true;
    btn.textContent = t("saving");
    SB.updatePassword(pw).then(function () {
      try { localStorage.removeItem("ros.recover"); } catch (e) {}
      $("formBlock").classList.add("hidden");
      say(t("done"), "good");
      $("go").classList.remove("hidden");
    }).catch(function (e) {
      btn.disabled = false;
      btn.textContent = t("save");
      if (e && e.status === 401) {
        $("formBlock").classList.add("hidden");
        $("toSignin").classList.remove("hidden");
        return say(t("noSession"), "bad");
      }
      say((e && e.message) || t("fail"), "bad");
    });
  };

  $("pw2").addEventListener("keydown", function (e) {
    if (e.key === "Enter") $("save").click();
  });
}
