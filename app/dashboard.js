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
    shareH: "Send a link",
    shareSub: "Hand a client your booking link or your payment link straight from your phone.",
    lBooking: "Booking link", lPay: "Payment link", share: "Share",
    bookingNone: "No booking link on file yet.",
    payHint: "Paste the link you use to get paid — Venmo, Cash App, Square, Zelle. Only you can see it.",
    payNote: "Only you can see this link. It never appears on the client pages.",
    payLoadFail: "Couldn't load your payment link just now. Everything else here still works — pull to refresh to try again.",
    partial: "Some of this page didn't load. Pull to refresh to try again.",
    cantLoad: "Couldn't load this — pull to refresh.",
    paySave: "Save", paySaved: "Saved.", bad_link: "That doesn't look like a link. It has to start with https://",
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
    shareH: "Enviar un enlace",
    shareSub: "Mándale a un cliente tu enlace de reservas o el de pago desde tu teléfono.",
    lBooking: "Enlace de reservas", lPay: "Enlace de pago", share: "Compartir",
    bookingNone: "Todavía no hay enlace de reservas.",
    payHint: "Pega el enlace con el que cobras: Venmo, Cash App, Square, Zelle. Solo tú lo ves.",
    payNote: "Solo tú ves este enlace. Nunca aparece en las páginas del cliente.",
    payLoadFail: "No pudimos cargar tu enlace de pago. Todo lo demás sigue funcionando: recarga para intentarlo otra vez.",
    partial: "Una parte de esta página no cargó. Recarga para intentarlo otra vez.",
    cantLoad: "No se pudo cargar esto. Recarga la página.",
    paySave: "Guardar", paySaved: "Listo.", bad_link: "Eso no parece un enlace. Tiene que empezar con https://",
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

var currentShop = null;
var settingsRow = {};
var settingsFailed = false;
var partialLoad = false;

/* Each panel on this page loads on its own. A failed request costs that panel
   and nothing else: the owner still sees their numbers, their clients and
   their links, and gets one line saying something is missing. */
var failedPanel = {};
function soft(i, p) {
  return p.catch(function () { failedPanel[i] = true; partialLoad = true; return { failed: true }; });
}
function arr(v) { return Array.isArray(v) ? v : []; }

/* The load notice has its own slot under the greeting, so it is never hidden
   behind the pending-payment banner (or whatever else #msg is saying). */
function notePartial() {
  if (!partialLoad) return;
  var n = $("loadNote");
  if (!n) return;
  n.textContent = t("partial");
  n.classList.remove("hidden");
}
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

function showEl(id) { var e = $(id); if (e) e.classList.remove("hidden"); }
function hideEl(id) { var e = $(id); if (e) e.classList.add("hidden"); }

/* The phone's own share sheet when it has one, copy otherwise: either way the
   owner never has to retype a link or find it in a back office. */
function shareLink(url, label, btn, input) {
  if (!url) return;
  if (navigator.share) {
    navigator.share({ title: label, url: url }).catch(function () {});
    return;
  }
  var done = function () {
    var old = btn.textContent;
    btn.textContent = t("copied");
    setTimeout(function () { btn.textContent = old; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done, done);
    return;
  }
  /* Last resort on an older phone: select the link so it can be held and copied. */
  if (input) { input.focus(); input.select(); }
}

function renderShare() {
  if (!currentShop) return;
  var link = currentShop.booking_link || "";
  $("bookingUrl").value = link;
  if (link) showEl("bookingRow"); else hideEl("bookingRow");

  if (settingsFailed) {
    hideEl("payRow");
    hideEl("payEdit");
    $("payNote").textContent = t("payLoadFail");
    return;
  }

  var pay = (settingsRow && settingsRow.payment_link) || "";
  $("payUrl").value = pay;
  if (pay) { showEl("payRow"); hideEl("payEdit"); }
  else { hideEl("payRow"); showEl("payEdit"); }
  $("payNote").textContent = pay ? t("payNote") : t("payHint");
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
$("shareH").textContent = t("shareH");
$("shareSub").textContent = t("shareSub");
$("lBooking").textContent = t("lBooking");
$("lPay").textContent = t("lPay");
$("bookingShare").textContent = t("share");
$("payShare").textContent = t("share");
$("paySave").textContent = t("paySave");
$("promoLink").textContent = t("promo");
$("adminLink").textContent = t("shops");
$("btnEn").setAttribute("aria-pressed", String(lang === "en"));
$("btnEs").setAttribute("aria-pressed", String(lang === "es"));
$("btnEn").onclick = function () { localStorage.setItem("ros.lang", "en"); location.reload(); };
$("btnEs").onclick = function () { localStorage.setItem("ros.lang", "es"); location.reload(); };
$("signout").onclick = function () { SB.signOut(); };

$("bookingShare").onclick = function () {
  shareLink(currentShop && currentShop.booking_link, t("lBooking"), this, $("bookingUrl"));
};
$("payShare").onclick = function () {
  shareLink(settingsRow && settingsRow.payment_link, t("lPay"), this, $("payUrl"));
};
$("paySave").onclick = function () {
  if (!currentShop) return;
  var btn = this;
  var link = $("payInput").value.trim();
  btn.disabled = true;
  SB.rpc("set_shop_payment", { p_shop: currentShop.id, p_link: link }).then(function (r) {
    btn.disabled = false;
    if (!r || !r.ok) { say(t(r && r.error) || "Error", "bad"); return; }
    settingsRow = { payment_link: r.payment_link };
    $("payInput").value = "";
    renderShare();
    say(t("paySaved"), "good");
  }).catch(function (e) {
    btn.disabled = false;
    if (e && e.status === 401) { location.replace("signin.html"); return; }
    say(t(e && e.message) || t("bad_link"), "bad");
  });
};

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

var ownersFailed = false;
(SB.demo
  ? Promise.reject({ status: 0, message: t("demo") })
  : SB.rest("shop_owners?select=shop_id,role").catch(function (e) {
      if (e && e.status === 401) throw e;
      ownersFailed = true;
      partialLoad = true;
      return [];
    }))
  .then(function (owners) {
    if (ownersFailed) {
      $("greet").textContent = t(greetKey);
      notePartial();
      return null;
    }
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
      soft(0, SB.rest("shops?select=name,texts_included,milestone,stamps_at_join,status,booking_link&id=eq." + shopId)),
      soft(1, SB.rest("v_shop_dashboard?select=*&shop_id=eq." + shopId)),
      soft(2, SB.rest("v_due_back?select=first_name,phone,days_out,rebook_days,last_visit_at&" + s + "&is_due=eq.true&order=days_out.desc&limit=6")),
      soft(3, SB.rest("rewards_issued?select=member_id,voucher_code,status,expires_at,issued_at&" + s + "&status=eq.issued&order=expires_at.asc&limit=4")),
      soft(4, SB.rest("members?select=id,first_name,last_name,joined_at,cycle_visits,phone&" + s + "&order=joined_at.desc&limit=500")),
      soft(5, SB.rest("messages?select=kind,sent_at&" + s + "&order=sent_at.desc&limit=1")),
      soft(6, SB.rest("referrals?select=referrer_id,friend_id,created_at&" + s + "&order=created_at.desc&limit=6")),
      soft(7, SB.rest("shop_settings?select=payment_link&shop_id=eq." + shopId))
    ]);
  })
  .then(function (out) {
    if (!out) return;
    var shop = arr(out[0])[0] || {};
    currentShop = shop;
    if (failedPanel[7]) settingsFailed = true;
    else settingsRow = arr(out[7])[0] || {};
    renderShare();
    var dash = arr(out[1])[0] || {};
    var due = arr(out[2]);
    var rewards = arr(out[3]);
    var members = arr(out[4]);
    var lastMsg = arr(out[5])[0];
    var referrals = arr(out[6]);
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

    $("heroDue").textContent = failedPanel[1] ? "—" : dueN;
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
    /* A dash, not a zero: a failed count is unknown, and "0 clients" would be
       the wrong thing to tell an owner with nine of them. */
    function num(v) { return failedPanel[1] ? "—" : v; }
    box.appendChild(kpi(num(membersN), t("members")));
    box.appendChild(kpi(num(visitsN), t("visits")));
    box.appendChild(kpi(num(readyN), t("ready")));
    box.appendChild(kpi(num(dueN), t("due")));
    box.appendChild(kpi(num(rewardsN), t("rewards")));

    var dueList = $("dueList");
    dueList.innerHTML = "";
    if (failedPanel[2]) {
      dueList.appendChild(emptyRow(t("cantLoad")));
    } else if (!due.length) {
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
    if (failedPanel[3]) {
      rw.appendChild(emptyRow(t("cantLoad")));
    } else if (!rewards.length) {
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
    var goal = shop.milestone || 10;
    if (failedPanel[4]) {
      rec.appendChild(emptyRow(t("cantLoad")));
    } else if (!newest.length) {
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
    notePartial();

    var rf = $("refList");
    rf.innerHTML = "";
    if (failedPanel[6]) {
      rf.appendChild(emptyRow(t("cantLoad")));
    } else if (!referrals.length) {
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
