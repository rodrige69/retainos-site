var T = {
  en: {
    h1: "Your join link and QR",
    sub: "One link per shop. The QR points at it, so printing a new poster never changes the sign-up flow.",
    lShop: "Shop",
    lJoin: "Client join link",
    joinNote: "This is the only address a client ever sees. It opens the join page and nothing else.",
    copy: "Copy",
    copied: "Copied",
    print: "Print this poster",
    printHint: "Print it at A4 or letter size and put one at the counter.",
    posterHead: "Scan to join our rewards club",
    posterSub: "Free to join. Every visit earns a stamp.",
    step: "Escanea para unirte · Scan to join",
    foot: "Powered by RetainOS",
    empty: "No shop linked to this login yet.",
    back: "Dashboard",
    signin: "Sign in again"
  },
  es: {
    h1: "Tu enlace y tu QR",
    sub: "Un enlace por negocio. El QR apunta ahí, así que imprimir un cartel nuevo no cambia el registro.",
    lShop: "Negocio",
    lJoin: "Enlace para que se unan los clientes",
    joinNote: "Es la única dirección que ve el cliente. Abre la página de registro y nada más.",
    copy: "Copiar",
    copied: "Copiado",
    print: "Imprimir este cartel",
    printHint: "Imprímelo en A4 o carta y pon uno en el mostrador.",
    posterHead: "Escanea y únete a nuestro club de premios",
    posterSub: "Es gratis. Cada visita gana un sello.",
    step: "Escanea para unirte · Scan to join",
    foot: "Con tecnología de RetainOS",
    empty: "Todavía no hay un negocio ligado a este acceso.",
    back: "Panel",
    signin: "Entrar otra vez"
  }
};

var lang = localStorage.getItem("ros.lang") || "en";
var JOIN_BASE = "https://join.retainos.co/";
var shops = [];

function t(k, vars) {
  var s = T[lang][k] || k;
  Object.keys(vars || {}).forEach(function (key) { s = s.replace("{" + key + "}", vars[key]); });
  return s;
}

function paint() {
  document.documentElement.lang = lang;
  document.getElementById("h1").textContent = t("h1");
  document.getElementById("sub").textContent = t("sub");
  document.getElementById("lShop").textContent = t("lShop");
  document.getElementById("lJoin").textContent = t("lJoin");
  document.getElementById("joinNote").textContent = t("joinNote");
  document.getElementById("copy").textContent = t("copy");
  document.getElementById("print").textContent = t("print");
  document.getElementById("printHint").textContent = t("printHint");
  document.getElementById("posterHead").textContent = t("posterHead");
  document.getElementById("posterSub").textContent = t("posterSub");
  document.getElementById("posterStep").textContent = t("step");
  document.getElementById("foot").textContent = t("foot");
  document.getElementById("back").textContent = t("back");
}

function select(slug) {
  var shop = shops.filter(function (s) { return s.id === slug; })[0] || shops[0];
  if (!shop) return;
  document.getElementById("shopSel").value = shop.id;
  document.getElementById("joinUrl").value = JOIN_BASE + shop.id;
  document.getElementById("qr").src = "qr/" + shop.id + ".svg";
  document.getElementById("qr").alt = shop.name + " QR";
  document.getElementById("posterShop").textContent = shop.name;
  document.getElementById("badge").textContent = shop.name.charAt(0).toUpperCase();
}

document.getElementById("shopSel").onchange = function () { select(this.value); };

document.getElementById("copy").onclick = function () {
  var input = document.getElementById("joinUrl");
  input.select();
  var done = function () {
    var b = document.getElementById("copy");
    b.textContent = t("copied");
    setTimeout(function () { b.textContent = t("copy"); }, 1500);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, done);
  else { document.execCommand("copy"); done(); }
};

document.getElementById("print").onclick = function () { window.print(); };

if (!SB.session() && !SB.demo) location.replace("signin.html");

(SB.demo ? Promise.reject({ status: 0, message: t("demo") }) : SB.rest("shop_owners?select=shop_id"))
  .then(function (owners) {
    if (!owners || !owners.length) {
      document.getElementById("sub").textContent = t("empty");
      return;
    }
    var ids = owners.map(function (o) { return o.shop_id; });
    return SB.rest("shops?select=id,name&id=in.(" + ids.join(",") + ")&order=name")
      .then(function (rows) {
        shops = rows || [];
        var sel = document.getElementById("shopSel");
        sel.innerHTML = "";
        shops.forEach(function (s) {
          var o = document.createElement("option");
          o.value = s.id;
          o.textContent = s.name;
          sel.appendChild(o);
        });
        select(shops[0] && shops[0].id);
      });
  })
  .catch(function (e) {
    if (e.status === 401) { location.replace("signin.html"); return; }
    document.getElementById("sub").textContent = e.message;
  });

paint();
