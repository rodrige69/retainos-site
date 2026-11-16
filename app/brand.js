/* Shop identity for client pages. Shows the shop's logo and, when there is one,
   the owner's photo. If either fails to load, the initial circle stays: a page
   never shows a broken picture. */
window.ROS = window.ROS || {};
ROS.brand = function (shop) {
  if (!shop) return;
  var badge = document.getElementById("badge");
  if (!badge) return;
  var initial = shop.name ? shop.name.charAt(0).toUpperCase() : "·";
  badge.textContent = initial;
  if (shop.logo_url) {
    var img = new Image();
    img.alt = shop.name || "";
    img.onload = function () { badge.textContent = ""; badge.appendChild(img); };
    img.src = shop.logo_url;
  }
  if (shop.owner_photo_url && !document.getElementById("ownerPhoto")) {
    var p = new Image();
    p.id = "ownerPhoto";
    p.className = "ownerPhoto";
    p.alt = "";
    p.onload = function () {
      var head = badge.parentNode;
      if (head && !document.getElementById("ownerPhoto")) head.appendChild(p);
    };
    p.src = shop.owner_photo_url;
  }
};
