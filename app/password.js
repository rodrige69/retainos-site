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
    noSession: "Open the link from your email to set a password. You can ask for a new one on the sign-in page.",
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
    noSession: "Abre el enlace de tu correo para crear la contraseña. Puedes pedir otro en la página de entrada.",
    toSignin: "Volver a entrar",
    foot: "Con tecnología de RetainOS"
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || k; }
function $(id) { return document.getElementById(id); }

function paint() {
  document.documentElement.lang = lang;
  ["h1", "sub", "lPw", "lPw2", "save", "foot", "toSignin"].forEach(function (id) {
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

if (!SB.session() && !SB.demo) {
  $("formBlock").classList.add("hidden");
  say(t("noSession"), "bad");
  $("toSignin").classList.remove("hidden");
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
