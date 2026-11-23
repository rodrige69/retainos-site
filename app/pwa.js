/* Makes the card installable to the home screen.
 * - Points the manifest at this shop's version, so the installed app is named
 *   after the shop (with the RetainOS icon as fallback when there is no logo).
 * - Names the iPhone home-screen icon after the shop too.
 * - Registers the no-cache service worker.
 * If anything fails, the page keeps working exactly as before: the card link
 * and email access never depend on installation. */
(function () {
  function shortLabel(n) {
    if (n.length <= 12) return n;
    var out = "", w = n.split(/\s+/);
    for (var i = 0; i < w.length; i++) { var nx = out ? out + " " + w[i] : w[i]; if (nx.length > 12) break; out = nx; }
    return out || n.slice(0, 12);
  }
  try {
    var shop = (new URLSearchParams(location.search).get("shop") || "").toLowerCase();
    if (/^[a-z0-9-]{2,80}$/.test(shop)) {
      var link = document.querySelector('link[rel="manifest"]');
      if (link) link.href = "/api/manifest?shop=" + encodeURIComponent(shop);
      /* iPhone uses this meta for the icon label; fill it once the page shows the shop name. */
      var setIosTitle = function () {
        var el = document.getElementById("shopName");
        var name = el && el.textContent ? el.textContent.trim() : "";
        var meta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (name && meta) meta.setAttribute("content", shortLabel(name));
        return !!name;
      };
      if (!setIosTitle()) {
        var tries = 0, t = setInterval(function () { if (setIosTitle() || ++tries > 20) clearInterval(t); }, 250);
      }
    }
  } catch (e) { /* keep the generic manifest */ }

  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () {});
  });
})();
