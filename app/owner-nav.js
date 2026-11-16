/* Bottom tab bar for the owner pages (QR & links, Announcement). The dashboard
   has the same bar built in. The staff scan screen is for staff, so it has none. */
(function () {
  if (document.getElementById("tabbar")) return;
  var lang = localStorage.getItem("ros.lang") === "es" ? "es" : "en";
  var L = lang === "es"
    ? { home: "Inicio", scan: "Escanear", perks: "Premios", settings: "Ajustes" }
    : { home: "Home", scan: "Scan", perks: "Perks", settings: "Settings" };
  var here = location.pathname.replace(/^\/+/, "").replace(/\.html$/, "");
  var shop = "";
  try { shop = localStorage.getItem("ros.shop") || ""; } catch (e) {}
  var items = [
    ["dashboard.html", L.home, "dashboard"],
    ["staff.html" + (shop ? "?shop=" + encodeURIComponent(shop) : ""), L.scan, "staff"],
    ["perks.html" + (shop ? "?shop=" + encodeURIComponent(shop) : ""), L.perks, "perks"],
    ["settings.html" + (shop ? "?shop=" + encodeURIComponent(shop) : ""), L.settings, "settings"]
  ];
  var nav = document.createElement("nav");
  nav.className = "tabbar noprint";
  nav.id = "tabbar";
  nav.setAttribute("aria-label", "Main");
  items.forEach(function (it) {
    var a = document.createElement("a");
    a.href = it[0];
    a.textContent = it[1];
    if (here === it[2] || (it[2] === "settings" && (here === "onboard" || here === "promo"))) a.className = "on";
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
})();
