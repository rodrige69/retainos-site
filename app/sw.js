/* RetainOS service worker — Phase 1: installability only.
 *
 * On purpose this worker caches NOTHING and has no fetch handler, so every
 * request goes straight to the network exactly as it did before. Stamp counts,
 * rewards and card data can therefore never be served stale, and one client's
 * card can never be shown to another from a shared cache.
 *
 * Phase 2 adds the "push" and "notificationclick" handlers below. This file
 * never asks for permission; the card does that only when a client taps
 * "turn on notifications".
 */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });

/* Phase 2 — show a push (only ever sent to clients who turned it on) and open
 * the right page when it is tapped. Still no caching. */
self.addEventListener("push", function (event) {
  var d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : "" }; }
  event.waitUntil(self.registration.showNotification(d.title || "Rewards", {
    body: d.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: d.tag || undefined,
    data: { url: d.url || "/" }
  }));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url === url && "focus" in list[i]) return list[i].focus();
    }
    return self.clients.openWindow(url);
  }));
});
