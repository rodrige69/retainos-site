/* RetainOS service worker — Phase 1: installability only.
 *
 * On purpose this worker caches NOTHING and has no fetch handler, so every
 * request goes straight to the network exactly as it did before. Stamp counts,
 * rewards and card data can therefore never be served stale, and one client's
 * card can never be shown to another from a shared cache.
 *
 * Phase 2 (opt-in push) will add "push" and "notificationclick" handlers here.
 * Nothing in this file sends or asks for notifications.
 */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });
