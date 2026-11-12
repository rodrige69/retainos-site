/* Owner dashboard · app.retainos.co/dashboard.html
   Read-only. Every number comes from rows the owner can already see under RLS:
   shops, v_shop_dashboard, v_due_back, rewards_issued, members, messages. */

var T = {
  en: {
    greetM: "Good morning", greetA: "Good afternoon", greetE: "Good evening",
    prog: "{stamps} stamps to the card · {start} added when a client joins",
    heroDueK: "clients past their usual gap",
    heroDueOne: "client past their usual gap",
    meterLabel: "Texts this month",
    meterUsed: "{used} of {total} used",
    meterNone: "No messages sent yet this month",
    lastSend: "Last send {d}",
    members: "Members", visits: "Visits this week", ready: "One visit from a reward",
    due: "Due back", rewards: "Rewards issued",
    dueH: "Due back", dueSub: "Clients past their usual gap for this shop.",
    insightH: "What to do today", insightSub: "Read off your own numbers.",
    rewardsH: "Rewards waiting", recentH: "Newest clients",
    refH: "Referrals", refBy: "brought by {who}", refJoined: "joined {d}",
    noRefs: "No referrals yet. Every client's card has an invite link on it.",
    none: "Nobody is overdue right now.",
    insReady: "{n} one visit from a reward",
    insDue: "{n} past their usual gap — worth a personal nudge",
    insTexts: "{used} of {total} texts used this month",
    insAllGood: "Everyone is inside their usual rhythm. Nothing to chase today.",
    insEmpty: "No clients yet. Share the join link and the first one starts the card.",
    noRewards: "No rewards issued yet.",
    noClients: "No clients yet — share your join link.",
    joined: "Joined {d}",
    stampsNow: "{n} of {total} stamps",
    atGoal: "Reward ready",
    useBy: "Use by {d}",
    daysOut: "{n} days out",
    lastVisit: "Last visit {d}",
    cadence: "usually every {n} days",
    qr: "QR & links", promo: "Announcement", shops: "Shops", out: "Sign out",
    text: "Text", textAria: "Text {name} from your own phone",
    msgDue: "Hi {name}, it's {shop}. You're about due for your usual — want me to hold a spot this week?",
    msgNew: "Hi {name}, thanks for joining {shop}. When would you like to come in?",
    pendingNote: "This shop is waiting on payment. Clients can't join until it is marked paid on the Shops page.",
    empty: "No shop on this login yet.",
    emptyCta: "Set up your shop →",
    demo: "Demo mode — no Supabase key in config.js.",
    signin: "Session expired. Sign in again."
  },
  es: {
    greetM: "Buenos días", greetA: "Buenas tardes", greetE: "Buenas noches",
    prog: "{stamps} sellos para la tarjeta · {start} al unirse",
    heroDueK: "clientes pasados de su ritmo",
    heroDueOne: "cliente pasado de su ritmo",
    meterLabel: "Textos este mes",
    meterUsed: "{used} de {total} usados",
    meterNone: "Todavía no se enviaron mensajes este mes",
    lastSend: "Último envío {d}",
    members: "Miembros", visits: "Visitas esta semana", ready: "A una visita del premio",
    due: "Por volver", rewards: "Premios emitidos",
    dueH: "Por volver", dueSub: "Clientes pasados de su ritmo habitual en este negocio.",
    insightH: "Qué hacer hoy", insightSub: "Leído de tus propios números.",
    rewardsH: "Premios por usar", recentH: "Clientes nuevos",
    refH: "Referidos", refBy: "traído por {who}", refJoined: "se unió {d}",
    noRefs: "Aún no hay referidos. La tarjeta de cada cliente lleva su enlace para invitar.",
    none: "Ahora mismo nadie está atrasado.",
    insReady: "{n} a una visita de un premio",
    insDue: "{n} pasados de su ritmo — vale un mensaje personal",
    insTexts: "{used} de {total} textos usados este mes",
    insAllGood: "Todos están dentro de su ritmo. Nada que perseguir hoy.",
    insEmpty: "Aún no hay clientes. Comparte el enlace y el primero empieza la tarjeta.",
    noRewards: "Todavía no hay premios emitidos.",
    noClients: "Aún no hay clientes: comparte tu enlace.",
    joined: "Se unió {d}",
    stampsNow: "{n} de {total} sellos",
    atGoal: "Premio listo",
    useBy: "Úsalo antes del {d}",
    daysOut: "{n} días",
    lastVisit: "Última visita {d}",
    cadence: "suele venir cada {n} días",
    qr: "QR y enlaces", promo: "Anuncio", shops: "Negocios", out: "Salir",
    text: "Mensaje", textAria: "Escribele a {name} desde tu propio teléfono",
    msgDue: "Hola {name}, te saluda {shop}. Ya toca tu visita de siempre, ¿te aparto un lugar esta semana?",
    msgNew: "Hola {name}, gracias por unirte a {shop}. ¿Cuándo te gustaría venir?",
    pendingNote: "Este negocio espera el pago. Los clientes no pueden unirse hasta marcarlo como pagado en la página Negocios.",
    empty: "Este acceso aún no tiene negocio.",
    emptyCta: "Configura tu negocio →",
    demo: "Modo demo: no hay clave de Supabase en config.js.",
    signin: "La sesión caducó. Entra otra vez."
  }
};

var lang = localStorage.getItem("ros.lang") || "en";

function t(k, vars) {
  var s = (T[lang] && T[lang][k]) || T.en[k] || k;
  Object.keys(vars || {}).forEach(function (key) {
    s = s.replace("{" + key + "}", vars[key]);
  });
  return s;
}
function $(id) { return document.getElementById(id); }
function locale() { return lang === "es" ? "es-US" : "en-US"; }
function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
function day(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(locale(), { month: "short", day: "numeric" });
}
function initials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
}
function one(n, single, many) { return n === 1 ? single : many; }
/* Tap to reach a client from the owner's own phone. Nothing is sent by
   RetainOS here: the dashboard only builds a link the phone already knows how
   to open, so it is a person writing to a person and no messaging registration
   is involved. */
function reach(phone, name, body) {
  var digits = String(phone == null ? "" : phone).replace(/\D/g, "");
  if (digits.length < 10) return "";
  var e164 = digits.length === 10 ? "1" + digits : digits;
  var text = encodeURIComponent(body || "");
  return '<span class="reach">' +
    '<a href="sms:+' + e164 + "?&body=" + text + '" aria-label="' + esc(t("textAria", { name: name || "" })) + '">' +
    esc(t("text")) + "</a>" +
    '<a href="https://wa.me/' + e164 + "?text=" + text + '" target="_blank" rel="noopener">WhatsApp</a>' +
    "</span>";
}

function withBooking(line, bookingLink) {
  return bookingLink ? line + " " + bookingLink : line;
}

function row(html) {
  var d = document.createElement("div");
  d.className = "row";
  d.innerHTML = html;
  return d;
}
function say(text, kind) {
  var m = $("msg");
  m.textContent = text;
  m.className = "msg" + (kind ? " " + kind : "");
}

document.documentElement.lang = lang;
$("signout").textContent = t("out");
$("qrLink").textContent = t("qr");
$("dueH").textContent = t("dueH");
$("dueSub").textContent = t("dueSub");
$("insightH").textContent = t("insightH");
$("insightSub").textContent = t("insightSub");
$("rewardsH").textContent = t("rewardsH");
$("recentH").textContent = t("recentH");
$("refH").textContent = t("refH");
$("promoLink").textContent = t("promo");
$("adminLink").textContent = t("shops");
$("btnEn").setAttribute("aria-pressed", String(lang === "en"));
$("btnEs").setAttribute("aria-pressed", String(lang === "es"));
$("btnEn").onclick = function () { localStorage.setItem("ros.lang", "en"); location.reload(); };
$("btnEs").onclick = function () { localStorage.setItem("ros.lang", "es"); location.reload(); };
$("signout").onclick = function () { SB.signOut(); };

var hour = new Date().getHours();
var greetKey = hour < 12 ? "greetM" : hour < 18 ? "greetA" : "greetE";
$("today").textContent = new Date().toLocaleDateString(locale(), {
  weekday: "short", month: "short", day: "numeric"
});

if (SB.demo) {
  var d = $("demoNote");
  d.textContent = t("demo");
  d.classList.remove("hidden");
}
if (!SB.session() && !SB.demo) location.replace("signin.html");

function kpi(n, k) {
  var el = document.createElement("div");
  el.className = "kpi";
  el.innerHTML = '<div class="n">' + esc(n) + '</div><div class="k">' + esc(k) + "</div>";
  return el;
}

function emptyRow(text) {
  return row('<span class="hint" style="margin:0">' + esc(text) + "</span>");
}

/* The shop list is a platform-admin screen; the dashboard only links to it. */
if (!SB.demo) {
  SB.rpc("is_platform_admin").then(function (isAdmin) {
    if (isAdmin) $("adminLink").classList.remove("hidden");
  }).catch(function () {});
}

(SB.demo ? Promise.reject({ status: 0, message: t("demo") }) : SB.rest("shop_owners?select=shop_id,role"))
  .then(function (owners) {
    if (!owners || !owners.length) {
      $("greet").textContent = t(greetKey);
      var m = $("msg");
      m.className = "msg";
      m.innerHTML = esc(t("empty")) + ' <a href="start.html">' + esc(t("emptyCta")) + "</a>";
      return null;
    }
    var s = "shop_id=eq." + encodeURIComponent(owners[0].shop_id);
    var shopId = encodeURIComponent(owners[0].shop_id);
    return Promise.all([
      SB.rest("shops?select=name,texts_included,milestone,stamps_at_join,status,booking_link&id=eq." + shopId),
      SB.rest("v_shop_dashboard?select=*&shop_id=eq." + shopId),
      SB.rest("v_due_back?select=first_name,phone,days_out,rebook_days,last_visit_at&" + s + "&is_due=eq.true&order=days_out.desc&limit=6"),
      SB.rest("rewards_issued?select=member_id,voucher_code,status,expires_at,issued_at&" + s + "&status=eq.issued&order=expires_at.asc&limit=4"),
      SB.rest("members?select=id,first_name,last_name,joined_at,cycle_visits,phone&" + s + "&order=joined_at.desc&limit=500"),
      SB.rest("messages?select=kind,sent_at&" + s + "&order=sent_at.desc&limit=1"),
      SB.rest("referrals?select=referrer_id,friend_id,created_at&" + s + "&order=created_at.desc&limit=6")
    ]);
  })
  .then(function (out) {
    if (!out) return;
    var shop = out[0][0] || {};
    var dash = out[1][0] || {};
    var due = out[2] || [];
    var rewards = out[3] || [];
    var members = out[4] || [];
    var lastMsg = out[5][0];
    var referrals = out[6] || [];
    var newest = members.slice(0, 5);

    var names = {};
    members.forEach(function (m) {
      names[m.id] = [m.first_name, m.last_name].filter(Boolean).join(" ") || m.first_name;
    });
    function nameOf(id) { return names[id] || null; }

    var membersN = dash.members || 0;
    var visitsN = dash.visits_this_week || 0;
    var readyN = dash.rewards_ready || 0;
    var dueN = dash.due_back || 0;
    var rewardsN = dash.rewards_issued || 0;
    var msgsN = dash.messages_this_month || 0;
    var textsTotal = shop.texts_included || 0;

    $("greet").textContent = t(greetKey) + (shop.name ? ", " + shop.name : "");
    if (shop.status && shop.status !== "active") say(t("pendingNote"));
    $("plan").textContent = shop.milestone
      ? t("prog", { stamps: shop.milestone, start: shop.stamps_at_join || 0 })
      : "";

    $("heroDue").textContent = dueN;
    $("heroDueK").textContent = dueN === 1 ? t("heroDueOne") : t("heroDueK");

    $("meterLabel").textContent = t("meterLabel");
    var pct = textsTotal ? Math.min(100, Math.round((msgsN / textsTotal) * 100)) : 0;
    $("meterFill").style.width = pct + "%";
    $("meterNote").textContent = textsTotal
      ? t("meterUsed", { used: msgsN, total: textsTotal }) +
        (lastMsg && lastMsg.sent_at ? " · " + t("lastSend", { d: day(lastMsg.sent_at) }) : "")
      : t("meterNone");

    var box = $("kpis");
    box.innerHTML = "";
    box.appendChild(kpi(membersN, t("members")));
    box.appendChild(kpi(visitsN, t("visits")));
    box.appendChild(kpi(readyN, t("ready")));
    box.appendChild(kpi(dueN, t("due")));
    box.appendChild(kpi(rewardsN, t("rewards")));

    var dueList = $("dueList");
    dueList.innerHTML = "";
    if (!due.length) {
      dueList.appendChild(emptyRow(t("none")));
    } else {
      due.forEach(function (m) {
        var who = esc(m.first_name || "—");
        dueList.appendChild(row(
          '<div class="who"><span class="init">' + esc(initials(m.first_name)) + "</span>" +
          "<span><b>" + who + "</b><small>" +
          t("lastVisit", { d: day(m.last_visit_at) }) + " · " +
          t("cadence", { n: m.rebook_days || 28 }) + "</small>" +
          reach(m.phone, m.first_name, withBooking(t("msgDue", { name: m.first_name || "", shop: shop.name || "" }), shop.booking_link)) +
          "</span></div>" +
          '<span class="meta">' + t("daysOut", { n: m.days_out }) + "</span>"
        ));
      });
    }

    var ins = $("insights");
    ins.innerHTML = "";
    var lines = [];
    if (!membersN) {
      lines.push(t("insEmpty"));
    } else {
      if (readyN) lines.push(t("insReady", { n: readyN }));
      if (dueN) lines.push(t("insDue", { n: dueN }));
      if (textsTotal) lines.push(t("insTexts", { used: msgsN, total: textsTotal }));
      if (!lines.length) lines.push(t("insAllGood"));
    }
    lines.forEach(function (text) {
      var el = document.createElement("div");
      el.className = "insight";
      el.innerHTML = "<span>" + esc(text) + "</span>";
      ins.appendChild(el);
    });

    var rw = $("rewardList");
    rw.innerHTML = "";
    if (!rewards.length) {
      rw.appendChild(emptyRow(t("noRewards")));
    } else {
      rewards.forEach(function (r) {
        rw.appendChild(row(
          "<span><b>" + esc(nameOf(r.member_id) || "—") + "</b><small>" +
          esc(r.voucher_code || r.status || "") + "</small></span>" +
          '<span class="meta">' + esc(r.expires_at ? t("useBy", { d: day(r.expires_at) }) : "") + "</span>"
        ));
      });
    }

    /* Newest clients, not raw visits: a brand-new signup is the thing an owner
       wants to see, and it is the only row that proves the join link is working. */
    var rec = $("recentList");
    rec.innerHTML = "";
    var goal = shop.milestone || 5;
    if (!newest.length) {
      rec.appendChild(emptyRow(t("noClients")));
    } else {
      newest.forEach(function (m) {
        var stamps = m.cycle_visits || 0;
        rec.appendChild(row(
          '<div class="who"><span class="init">' + esc(initials(m.first_name)) + "</span>" +
          "<span><b>" + esc(nameOf(m.id) || "—") + "</b><small>" +
          t("joined", { d: day(m.joined_at) }) + " · " +
          t("stampsNow", { n: stamps, total: goal }) + "</small>" +
          reach(m.phone, m.first_name, withBooking(t("msgNew", { name: m.first_name || "", shop: shop.name || "" }), shop.booking_link)) +
          "</span></div>" +
          '<span class="meta">' + esc(stamps >= goal ? t("atGoal") : "") + "</span>"
        ));
      });
    }

    /* Who brought whom: the row is written when the friend joins, so this is
       attribution from the database, not a guess from timestamps. */
    var rf = $("refList");
    rf.innerHTML = "";
    if (!referrals.length) {
      rf.appendChild(emptyRow(t("noRefs")));
    } else {
      referrals.forEach(function (r) {
        var friend = nameOf(r.friend_id) || "—";
        var who = nameOf(r.referrer_id) || "—";
        rf.appendChild(row(
          '<div class="who"><span class="init">' + esc(initials(friend)) + "</span>" +
          "<span><b>" + esc(friend) + "</b><small>" +
          esc(t("refJoined", { d: day(r.created_at) }) + " · " + t("refBy", { who: who })) +
          "</small></span></div>"
        ));
      });
    }
  })
  .catch(function (e) {
    if (e && e.status === 401) { location.replace("signin.html"); return; }
    say((e && e.message) || t("signin"), "bad");
  });
