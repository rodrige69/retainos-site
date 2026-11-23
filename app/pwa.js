/* Registers the no-cache service worker so the card can be installed to the
 * home screen. If anything fails, the page keeps working exactly as before:
 * the card link and email access never depend on installation. */
(function () {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () {});
  });
})();
