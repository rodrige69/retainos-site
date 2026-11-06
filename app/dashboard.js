var T = {
  en: {
    greet: "Good morning",
    dueH: "Due back",
    dueSub: "Clients past their usual gap for this shop.",
    members: "Members",
    visits: "Visits this week",
    due: "Due back",
    ready: "Rewards ready",
    rewards: "Rewards issued",
    msgs: "Messages this month",
    none: "Nobody is overdue right now.",
    empty: "Your login isn't linked to a shop yet. That gets set up on your kickoff call.",
    qr: "QR & links",
    out: "Sign out",
    days: "{n} days out",
    cadence: "usually every {n} days",
    demo: "Demo mode — no Supabase key in config.js.",
    signin: "Session expired. Sign in again.",
    plan: "{plan} · {texts} texts a month"
  },
  es: {
    greet: "Buenos días",
    dueH: "Por volver",
    dueSub: "Clientes pasados de su ritmo habitual en este negocio.",
    members: "Miembros",
    visits: "Visitas esta semana",
    due: "Por volver",
    ready: "Premios listos",
    rewards: "Premios emitidos",
    msgs: "Mensajes este mes",
    none: "Ahora mismo nadie está atrasado.",
    empty: "Tu acceso todavía no está ligado a un negocio. Eso se configura en la llamada de inicio.",
    qr: "QR y enlaces",
    out: "Salir",
    days: "{n} días",
    cadence: "suele venir cada {n} días",
    demo: "Modo demo: no hay clave de Supabase en config.js.",
    signin: "La sesión caducó. Entra otra vez.",
    plan: "{plan} · {texts} textos al mes"
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
function t(k, vars) {
  var s = T[lang][k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}

document.getElementById("signout").textContent = t("out");
document.getElementById("qrLink").textContent = t("qr");
document.getElementById("dueH").textContent = t("dueH");
document.getElementById("dueSub").textContent = t("dueSub");
document.getElementById("signout").onclick = function () { SB.signOut(); };

if (SB.demo) {
  var d = document.getElementById("demoNote");
  d.textContent = t("demo");
  d.classList.remove("hidden");
}

if (SB.captureRedirect()) { /* fall through and load */ }

if (!SB.session() && !SB.demo) {
  location.replace("signin.html");
}

function kpi(n, k) {
  var el = document.createElement("div");
  el.className = "kpi";
  el.innerHTML = '<div class="n">' + n + '</div><div class="k">' + k + "</div>";
  return el;
}

function say(text, kind) {
  var m = document.getElementById("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

(SB.demo ? Promise.reject({ status: 0, message: t("demo") }) : SB.rest("shop_owners?select=shop_id,role"))
  .then(function (owners) {
    if (!owners || !owners.length) {
      document.getElementById("greet").textContent = t("greet");
      say(t("empty"));
      return;
    }
    var shopId = owners[0].shop_id;
    return Promise.all([
      SB.rest("shops?select=name,plan,texts_included&id=eq." + encodeURIComponent(shopId)),
      SB.rest("v_shop_dashboard?select=*&shop_id=eq." + encodeURIComponent(shopId)),
      SB.rest("v_due_back?select=first_name,days_out,rebook_days&shop_id=eq." + encodeURIComponent(shopId) + "&is_due=eq.true&order=days_out.desc&limit=8")
    ]).then(function (out) {
      var shop = out[0][0] || {};
      var dash = out[1][0] || {};
      var due = out[2] || [];

      document.getElementById("greet").textContent = t("greet") + ", " + (shop.name || "");
      document.getElementById("plan").textContent = shop.plan
        ? t("plan", { plan: shop.plan, texts: shop.texts_included })
        : "";

      var box = document.getElementById("kpis");
      box.innerHTML = "";
      box.appendChild(kpi(dash.members || 0, t("members")));
      box.appendChild(kpi(dash.visits_this_week || 0, t("visits")));
      box.appendChild(kpi(dash.due_back || 0, t("due")));
      box.appendChild(kpi(dash.rewards_ready || 0, t("ready")));
      box.appendChild(kpi(dash.rewards_issued || 0, t("rewards")));
      box.appendChild(kpi(dash.messages_this_month || 0, t("msgs")));

      var list = document.getElementById("dueList");
      list.innerHTML = "";
      if (!due.length) {
        list.innerHTML = '<div class="row">' + t("none") + "</div>";
      } else {
        due.forEach(function (m) {
          var r = document.createElement("div");
          r.className = "row";
          r.innerHTML = "<span><b>" + (m.first_name || "—") + "</b><br><small class='hint'>" +
            t("cadence", { n: m.rebook_days }) + "</small></span><b>" +
            t("days", { n: m.days_out }) + "</b>";
          list.appendChild(r);
        });
      }
    });
  })
  .catch(function (e) {
    if (e.status === 401) { location.replace("signin.html"); return; }
    say(e.message, "bad");
  });
