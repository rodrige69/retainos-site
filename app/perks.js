(function () {
  var $ = function (id) { return document.getElementById(id); };
  var lang = localStorage.getItem("ros.lang") === "es" ? "es" : "en";
  var TX = {
    en: {
      eyebrow: "Tier incentives", h1: "Perks & Rewards", sub: "Choose what your clients earn and how many visits it takes.",
      plans: ["Come Back", "Booked Solid", "Day Off"],
      scope: ["Come Back includes Hotel Savings Cards.", "Booked Solid adds Dining + Domestic US Getaways.", "Day Off adds Dining + International Getaways."],
      yours: "Your plan", preview: "Preview only. Switch to your own plan tab to make changes.",
      hotelH: "Hotel Savings Card", hotelP: "A $100 hotel savings card for loyal clients. Included in every plan.", hotelL: "Visits to earn it", hotelS: "Stamps on the card",
      diningH: "Dining & Local Perks", diningT: "$100 Dining Voucher", diningP: "Redeemable at partner restaurants. Delivered as an instant digital code.", diningL: "Visits to earn it", diningS: "Total stamps on the card",
      usH: "US Vacation Getaways", usT: "Offer US Vacation Getaways", usP: "3-night resort certificates for loyal guests.",
      intH: "International Getaways", intT: "Offer International Getaways", intP: "4-night all-inclusive escapes.",
      getL: "Visits to earn it", getS: "Total stamps on the card", dests: "Available destinations", destsP: "Clients pick one when they finish the card.",
      ownH: "Your own perk", ownP: "Optional. Something you give in the chair, like a free product or add-on.", ownPh: "Example: Free beard trim", ownL: "Visits to earn it",
      lockedN: "Included in a higher plan. Ask us to upgrade.", visits: "Visits", save: "Save rewards", saved: "Saved. Your clients' cards are updated.",
      bad_dining: "Dining needs more stamps than the hotel card.", bad_getaway: "The getaway needs more stamps than dining.", bad_hotel: "Hotel card needs 2 to 24 stamps.",
      signin: "Sign in again.", notOwner: "This login isn't linked to a shop.", fail: "Couldn't save. Try again."
    },
    es: {
      eyebrow: "Incentivos por nivel", h1: "Premios", sub: "Elige qué ganan tus clientes y cuántas visitas necesitan.",
      plans: ["Come Back", "Booked Solid", "Day Off"],
      scope: ["Come Back incluye Tarjetas de ahorro de hotel.", "Booked Solid añade Restaurantes + Escapadas en EE. UU.", "Day Off añade Restaurantes + Escapadas internacionales."],
      yours: "Tu plan", preview: "Solo vista previa. Cambia a la pestaña de tu plan para editar.",
      hotelH: "Tarjeta de ahorro de hotel", hotelP: "Una tarjeta de ahorro de hotel de $100 para clientes fieles. Incluida en todos los planes.", hotelL: "Visitas para ganarla", hotelS: "Sellos en la tarjeta",
      diningH: "Restaurantes y locales", diningT: "Cupón de restaurante de $100", diningP: "Se canjea en restaurantes aliados. Llega como código digital al instante.", diningL: "Visitas para ganarlo", diningS: "Sellos totales en la tarjeta",
      usH: "Escapadas en EE. UU.", usT: "Ofrecer escapadas en EE. UU.", usP: "Certificados de resort de 3 noches para clientes fieles.",
      intH: "Escapadas internacionales", intT: "Ofrecer escapadas internacionales", intP: "Escapadas todo incluido de 4 noches.",
      getL: "Visitas para ganarla", getS: "Sellos totales en la tarjeta", dests: "Destinos disponibles", destsP: "El cliente elige uno al completar la tarjeta.",
      ownH: "Tu propio premio", ownP: "Opcional. Algo que das en tu silla, como un producto o extra gratis.", ownPh: "Ejemplo: recorte de barba gratis", ownL: "Visitas para ganarlo",
      lockedN: "Incluido en un plan superior. Pídenos mejorar.", visits: "Visitas", save: "Guardar premios", saved: "Guardado. Las tarjetas de tus clientes se actualizaron.",
      bad_dining: "El restaurante necesita más sellos que la tarjeta de hotel.", bad_getaway: "La escapada necesita más sellos que el restaurante.", bad_hotel: "La tarjeta de hotel necesita de 2 a 24 sellos.",
      signin: "Entra otra vez.", notOwner: "Este acceso no está ligado a un negocio.", fail: "No se pudo guardar. Intenta otra vez."
    }
  };
  var DEST = {
    us: ["Orlando, FL|Theme park resort stay", "Las Vegas, NV|Strip luxury resort getaway", "Miami, FL|South Beach coastal retreat", "New York, NY|Manhattan boutique stay", "Tampa, FL|Gulf coast bay getaway"],
    intl: ["Cancún, Mexico|Riviera beachfront resort stay", "Punta Cana, Dominican Republic|All-inclusive tropical escape", "Puerto Plata, Dominican Republic|Oceanfront luxury villa experience"]
  };
  var RANK = { regulars: 0, full_book: 1, hands_off: 2 };
  var shopId = new URLSearchParams(location.search).get("shop") || localStorage.getItem("ros.shop") || "";
  var own = 0, view = 0, plan = "regulars", dirty = false;
  var S = { hotel: 5, dining: null, getaway: null, places: null, ownText: "", ownStamps: null };
  function t(k) { return TX[lang][k] || k; }
  function say(m, bad) { var e = $("msg"); e.textContent = m || ""; e.className = "msg" + (m ? (bad ? " bad" : " good") : ""); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function stepper(label, sub, val, min, max, on, disabled) {
    var w = el("div", "stepper");
    w.appendChild(el("div", "lbl", esc(label) + "<small>" + esc(sub) + "</small>"));
    var c = el("div", "ctl"), m = el("button", "", "−"), p = el("button", "", "+"), o = el("output", "", val + " " + t("visits"));
    m.type = p.type = "button"; m.disabled = p.disabled = disabled;
    m.setAttribute("aria-label", "-"); p.setAttribute("aria-label", "+");
    m.onclick = function () { if (val > min) on(val - 1); };
    p.onclick = function () { if (val < max) on(val + 1); };
    c.appendChild(m); c.appendChild(o); c.appendChild(p); w.appendChild(c);
    return w;
  }
  function toggle(on, change, disabled) {
    var l = el("label", "switch"), i = el("input"), s = el("i");
    i.type = "checkbox"; i.checked = on; i.disabled = disabled;
    i.onchange = function () { change(i.checked); };
    l.appendChild(i); l.appendChild(s); return l;
  }
  function touch() { dirty = true; say(""); paint(); }

  function paint() {
    document.documentElement.lang = lang;
    $("eyebrow").textContent = t("eyebrow"); $("h1").textContent = t("h1"); $("sub").textContent = t("sub");
    $("save").textContent = t("save");
    var tabs = $("ptabs"); tabs.innerHTML = "";
    TX[lang].plans.forEach(function (n, i) {
      var b = el("button", i === view ? "on" : "", esc(n)); b.type = "button";
      b.onclick = function () { view = i; paint(); }; tabs.appendChild(b);
    });
    var ro = view !== own;
    var sc = $("scope"); sc.innerHTML = "";
    sc.appendChild(el("p", "", esc(TX[lang].scope[view])));
    if (ro) sc.appendChild(el("div", "note", esc(t("preview"))));
    $("save").style.display = ro ? "none" : "";

    var box = $("sections"); box.innerHTML = "";
    var locked = view > own;
    // hotel
    var hc = el("div", "card pcard"); hc.style.marginTop = "14px";
    hc.appendChild(el("div", "prow", "<h2>" + esc(t("hotelH")) + "</h2><span class='tag'>" + (view === 0 ? "ALL PLANS" : "ALL PLANS") + "</span>"));
    hc.appendChild(el("p", "", esc(t("hotelP"))));
    hc.appendChild(stepper(t("hotelL"), t("hotelS"), S.hotel, 2, 22, function (v) {
      S.hotel = v; if (S.dining != null && S.dining <= v) S.dining = v + 1; if (S.getaway != null && S.getaway <= (S.dining || v)) S.getaway = (S.dining || v) + 1; touch();
    }, ro));
    box.appendChild(hc);
    if (view >= 1) {
      var dc = el("div", "card pcard" + (locked ? " locked" : "")); dc.style.marginTop = "14px";
      dc.appendChild(el("div", "prow", "<h2>" + esc(t("diningH")) + "</h2><span class='tag'>" + esc(TX[lang].plans[1]) + " & " + esc(TX[lang].plans[2]) + "</span>"));
      var r = el("div", "prow"); r.style.marginTop = "10px";
      r.appendChild(el("div", "", "<b style='font-family:Newsreader,serif;font-size:17px'>" + esc(t("diningT")) + "</b><p>" + esc(t("diningP")) + "</p>"));
      r.appendChild(toggle(S.dining != null, function (on) { S.dining = on ? S.hotel + 1 : null; if (!on) S.getaway = null; touch(); }, ro || locked));
      dc.appendChild(r);
      if (S.dining != null) dc.appendChild(stepper(t("diningL"), t("diningS"), S.dining, S.hotel + 1, 23, function (v) {
        S.dining = v; if (S.getaway != null && S.getaway <= v) S.getaway = v + 1; touch();
      }, ro || locked));
      if (locked) dc.appendChild(el("div", "note", esc(t("lockedN"))));
      box.appendChild(dc);

      var intl = view === 2, key = intl ? "intl" : "us";
      var gc = el("div", "card pcard" + (locked ? " locked" : "")); gc.style.marginTop = "14px";
      gc.appendChild(el("div", "prow", "<h2>" + esc(t(key + "H")) + "</h2><span class='tag gold'>" + esc(TX[lang].plans[view]) + "</span>"));
      var gr = el("div", "prow"); gr.style.marginTop = "10px";
      gr.appendChild(el("div", "", "<b style='font-family:Newsreader,serif;font-size:17px'>" + esc(t(key + "T")) + "</b><p>" + esc(t(key + "P")) + "</p>"));
      gr.appendChild(toggle(S.getaway != null, function (on) { S.getaway = on ? (S.dining || S.hotel) + 1 : null; touch(); }, ro || locked));
      gc.appendChild(gr);
      if (S.getaway != null) {
        gc.appendChild(stepper(t("getL"), t("getS"), S.getaway, (S.dining || S.hotel) + 1, 24, function (v) { S.getaway = v; touch(); }, ro || locked));
        gc.appendChild(el("p", "", "<b>" + esc(t("dests")) + "</b><br>" + esc(t("destsP"))));
        var chosen = S.places == null ? null : S.places.split(";").map(function (x) { return x.trim(); });
        DEST[key].forEach(function (d) {
          var parts = d.split("|"), row = el("label", "dest"), cb = el("input");
          cb.type = "checkbox"; cb.disabled = ro || locked;
          cb.checked = chosen == null ? true : chosen.indexOf(parts[0]) > -1;
          cb.onchange = function () {
            var all = DEST[key].map(function (x) { return x.split("|")[0]; });
            var cur = S.places == null ? all.slice() : S.places.split(";").map(function (x) { return x.trim(); }).filter(Boolean);
            var i = cur.indexOf(parts[0]);
            if (cb.checked && i < 0) cur.push(parts[0]); if (!cb.checked && i > -1) cur.splice(i, 1);
            S.places = cur.join("; "); dirty = true; say("");
          };
          row.appendChild(cb); row.appendChild(el("span", "", esc(parts[0]) + "<small>" + esc(parts[1]) + "</small>"));
          gc.appendChild(row);
        });
      }
      if (locked) gc.appendChild(el("div", "note", esc(t("lockedN"))));
      box.appendChild(gc);
    }
    // own perk (only on your own plan)
    if (view === own) {
      var oc = el("div", "card pcard"); oc.style.marginTop = "14px";
      oc.appendChild(el("div", "prow", "<h2>" + esc(t("ownH")) + "</h2>"));
      oc.appendChild(el("p", "", esc(t("ownP"))));
      var inp = el("input"); inp.type = "text"; inp.maxLength = 200; inp.placeholder = t("ownPh"); inp.value = S.ownText || ""; inp.style.marginTop = "10px";
      inp.oninput = function () {
        S.ownText = inp.value; dirty = true; say("");
        if (S.ownText && S.ownStamps == null) { S.ownStamps = S.hotel; paintOwnStep(); }
        if (!S.ownText) { S.ownStamps = null; paintOwnStep(); }
      };
      oc.appendChild(inp);
      var slot = el("div"); slot.id = "ownStep"; oc.appendChild(slot); box.appendChild(oc);
      paintOwnStep();
    }
  }
  function paintOwnStep() {
    var s = $("ownStep"); if (!s) return; s.innerHTML = "";
    if (S.ownText && S.ownStamps != null) s.appendChild(stepper(t("ownL"), "", S.ownStamps, 1, 24, function (v) { S.ownStamps = v; dirty = true; paintOwnStep(); }, false));
  }

  function save() {
    var btn = $("save"); btn.disabled = true;
    SB.rpc("set_my_rewards", { p_shop: shopId, p_cfg: { hotel: S.hotel, dining: S.dining, getaway: S.getaway, places: S.getaway != null ? S.places : null, own_text: S.ownText || "", own_stamps: S.ownStamps } })
      .then(function (r) {
        if (!r || !r.ok) return say(TX[lang][r && r.error] || t("fail"), true);
        dirty = false; say(t("saved"));
      }).catch(function (e) { say((e && e.message) || t("fail"), true); })
      .then(function () { btn.disabled = false; });
  }

  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.onclick = function () { lang = b.getAttribute("data-lang"); localStorage.setItem("ros.lang", lang); paint(); };
  });
  $("save").onclick = save;
  window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  paint();
  if (!SB.session() && !SB.demo) { location.replace("signin.html"); return; }
  function load() {
    return SB.rpc("get_my_rewards", { p_shop: shopId }).then(function (r) {
      if (!r || !r.ok) return say(r && r.error === "not_owner" ? t("notOwner") : t("signin"), true);
      plan = r.plan; own = view = RANK[plan] || 0;
      S.hotel = r.hotel || 5; S.dining = r.dining || null; S.getaway = r.getaway || null;
      S.places = r.places || null; S.ownText = r.own_text || ""; S.ownStamps = r.own_stamps || null;
      if (own === 0) { S.dining = null; S.getaway = null; }
      paint();
    });
  }
  (shopId ? Promise.resolve() : SB.rest("shop_owners?select=shop_id").then(function (rows) { if (rows && rows.length) shopId = rows[0].shop_id; }))
    .then(load).catch(function (e) { if (e && e.status === 401) { location.replace("signin.html"); return; } say((e && e.message) || t("signin"), true); });
})();
