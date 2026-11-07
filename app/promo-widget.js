/* Announcement shown to clients on their card, the claim page and the
   thank-you page. The owner writes it; nothing here can break a page — if the
   promo is off, empty or fails to load, the container stays hidden. */

(function () {
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function card(p) {
    var wrap = document.createElement("div");
    wrap.className = "promo";
    var html = "";
    if (p.image) {
      html += '<img src="' + esc(p.image) + '" alt="' + esc(p.title || "") + '" loading="lazy">';
    }
    html += '<div class="promoBody">';
    if (p.title) html += "<b>" + esc(p.title) + "</b>";
    if (p.body) html += "<p>" + esc(p.body) + "</p>";
    if (p.link) {
      html += '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
        esc(p.label || "Learn more") + " →</a>";
    }
    html += "</div>";
    wrap.innerHTML = html;
    return wrap;
  }

  function render(el, promo) {
    if (!el) return false;
    if (!promo || !promo.ok) {
      el.classList.add("hidden");
      el.innerHTML = "";
      return false;
    }
    el.innerHTML = "";
    el.appendChild(card(promo));
    el.classList.remove("hidden");
    return true;
  }

  window.ROS = window.ROS || {};
  window.ROS.promoCard = card;

  window.ROS.promo = function (el, shopId) {
    if (!el || !shopId || !window.SB || SB.demo) return;
    SB.rpc("get_shop_promo", { p_shop: shopId })
      .then(function (promo) { render(el, promo); })
      .catch(function () {});
  };

  window.ROS.renderPromo = render;
})();
