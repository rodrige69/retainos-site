/* "Turn on notifications" on the client's card (Phase 2 push pilot).
 *
 * - Shows nothing at all until push is configured on the server (/api/push/key
 *   answers 501 before that), so this file is safe to ship ahead of time.
 * - Asks for permission ONLY when the client taps the button: consent first.
 * - iPhone: push only works once the card is on the home screen, so there we
 *   show a short "add to home screen first" tip instead of the button.
 * - Turning off removes the subscription on the server and on the phone.
 * The card itself never depends on any of this.
 */
(function () {
  if (!document.getElementById("card")) return;

  var es = function () {
    var l = (document.documentElement.lang || navigator.language || "en").toLowerCase();
    return l.indexOf("es") === 0;
  };
  var T = {
    on:      ["Turn on notifications", "Activar notificaciones"],
    onHint:  ["Get a ping when you earn a stamp or a reward, and a friendly reminder when it's time to book.",
              "Recibe un aviso cuando ganes un sello o una recompensa, y un recordatorio cuando sea hora de reservar."],
    isOn:    ["Notifications are on ✓", "Notificaciones activadas ✓"],
    off:     ["Turn off", "Desactivar"],
    blocked: ["Notifications are blocked for this site in your phone's settings.",
              "Las notificaciones están bloqueadas para este sitio en la configuración de tu teléfono."],
    ios:     ["Want notifications? First add this card to your Home Screen (Share → Add to Home Screen), then open it from there.",
              "¿Quieres notificaciones? Primero agrega esta tarjeta a tu pantalla de inicio (Compartir → Añadir a pantalla de inicio) y ábrela desde ahí."],
    fail:    ["Couldn't turn on notifications. Please try again.", "No se pudieron activar. Inténtalo de nuevo."]
  };
  function t(k) { return T[k][es() ? 1 : 0]; }

  var supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var standalone = window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

  var box, publicKey = null, started = false;

  function token() {
    var q = new URLSearchParams(location.search).get("t");
    if (q) return q;
    var u = document.getElementById("cardUrl");
    var m = u && u.value ? u.value.match(/[?&]t=([0-9a-f-]{36})/i) : null;
    return m ? m[1] : null;
  }

  function keyBytes(b64) {
    var pad = "=".repeat((4 - (b64.length % 4)) % 4);
    var raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function render(state) {
    if (!box) {
      box = document.createElement("div");
      box.id = "pushBox";
      box.style.marginTop = "16px";
      var done = document.getElementById("doneBtn");
      done.parentNode.insertBefore(box, done);
    }
    box.innerHTML = "";
    var p = document.createElement("p"); p.className = "hint"; p.style.margin = "6px 0 0";
    if (state === "ios") { p.textContent = t("ios"); box.appendChild(p); return; }
    if (state === "blocked") { p.textContent = t("blocked"); box.appendChild(p); return; }
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn block ghost";
    if (state === "on") {
      p.textContent = t("isOn"); p.style.fontWeight = "600";
      b.textContent = t("off"); b.onclick = turnOff;
      box.appendChild(p); box.appendChild(b);
    } else {
      b.textContent = t("on"); b.onclick = turnOn;
      p.textContent = state === "fail" ? t("fail") : t("onHint");
      box.appendChild(b); box.appendChild(p);
    }
  }

  function registration() {
    return navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(function () {
      return navigator.serviceWorker.ready;
    });
  }

  function turnOn() {
    var tok = token();
    if (!tok || !publicKey) return;
    Notification.requestPermission().then(function (perm) {
      if (perm !== "granted") { render(perm === "denied" ? "blocked" : "off"); return; }
      return registration().then(function (reg) {
        return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
      }).then(function (sub) {
        var j = sub.toJSON();
        return SB.rpc("save_push_subscription", {
          p_token: tok, p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth,
          p_ua: navigator.userAgent.slice(0, 300)
        });
      }).then(function (r) { render(r && r.ok ? "on" : "fail"); });
    }).catch(function () { render("fail"); });
  }

  function turnOff() {
    var tok = token();
    registration().then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) { render("off"); return; }
      var endpoint = sub.endpoint;
      return SB.rpc("remove_push_subscription", { p_token: tok, p_endpoint: endpoint })
        .catch(function () {})
        .then(function () { return sub.unsubscribe(); })
        .then(function () { render("off"); });
    }).catch(function () { render("off"); });
  }

  function start() {
    if (started || !token()) return;
    started = true;
    fetch("/api/push/key", { credentials: "include" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (k) {
        if (!k || !k.key) return;               // push not switched on yet: show nothing
        publicKey = k.key;
        if (isIOS && !standalone) { render("ios"); return; }
        if (!supported) return;
        if (Notification.permission === "denied") { render("blocked"); return; }
        return registration().then(function (reg) { return reg.pushManager.getSubscription(); })
          .then(function (sub) { render(sub && Notification.permission === "granted" ? "on" : "off"); });
      })
      .catch(function () { /* no box: card works as before */ });
  }

  /* Start once the card is on screen (after joining, or when opening a card link). */
  var card = document.getElementById("card");
  if (!card.classList.contains("hidden")) start();
  new MutationObserver(function () { if (!card.classList.contains("hidden")) start(); })
    .observe(card, { attributes: true, attributeFilter: ["class"] });
})();
