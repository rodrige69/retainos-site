"""RetainOS Learning Center (/learn). Articles live in content/learn/<slug>.md (English).
Edit ARTICLES below for order, category, image and dates, then run build.py.
Images: Unsplash License (free commercial use); credit shown under each image.
"""
import html, json, os, re

PUBLISHED = "2026-10-27"   # first publication date (set to the day the article goes live on retainos.co)
UTM = "?utm_source=retainos&utm_medium=referral"

ARTICLES = [
    {"slug": "get-repeat-customers-without-discounts", "slug_es": "clientes-que-vuelven-sin-descuentos", "cat_es": "Clientes que vuelven", "alt_es": "Barbero cortándole el pelo a un cliente en una barbería", "cat": "Repeat customers",
     "img": "photo-1593702275687-f8b402bf1fb5", "alt": "Barber trimming a client's hair in a barbershop",
     "by": "Michael DeMoya", "by_url": "https://unsplash.com/@demoya", "photo_url": "https://unsplash.com/photos/Q82AM6BWBPM",
     "related": ["small-business-loyalty-programs", "bring-back-salon-clients", "experience-based-loyalty-rewards"]},
    {"slug": "small-business-loyalty-programs", "slug_es": "programas-de-lealtad-para-pequenos-negocios", "cat_es": "Programas de lealtad", "alt_es": "Técnica de uñas haciéndole la manicura a una clienta en un salón de uñas", "cat": "Loyalty programs",
     "img": "photo-1632345031435-8727f6897d53", "alt": "Nail technician giving a client a manicure at a nail salon",
     "by": "Giorgio Trovato", "by_url": "https://unsplash.com/@giorgiotrovato", "photo_url": "https://unsplash.com/photos/gb6gtiTZKB8",
     "related": ["get-repeat-customers-without-discounts", "automated-customer-rewards", "customer-retention-rate"]},
    {"slug": "salon-barbershop-referral-program", "slug_es": "programa-de-referidos-para-salones-y-barberias", "cat_es": "Referidos", "alt_es": "Dos amigas conversando con unas bebidas en la mesa de un café", "cat": "Referrals",
     "img": "photo-1653762381632-2945469edb7b", "alt": "Two friends talking over drinks at a café table",
     "by": "Brooke Cagle", "by_url": "https://unsplash.com/@brookecagle", "photo_url": "https://unsplash.com/photos/uzxx6p4CHdQ",
     "related": ["small-business-loyalty-programs", "experience-based-loyalty-rewards", "automated-customer-rewards"]},
    {"slug": "bring-back-salon-clients", "slug_es": "recuperar-clientes-de-salon", "cat_es": "Clientes que vuelven", "alt_es": "Estilista secando el pelo de una clienta en un salón", "cat": "Repeat customers",
     "img": "photo-1580618672591-eb180b1a973f", "alt": "Hairstylist blow-drying a client's hair in a salon",
     "by": "Adam Winger", "by_url": "https://unsplash.com/@awcreativeut", "photo_url": "https://unsplash.com/photos/FkAZqQJTbXM",
     "related": ["get-repeat-customers-without-discounts", "salon-barbershop-referral-program", "customer-retention-rate"]},
    {"slug": "experience-based-loyalty-rewards", "slug_es": "premios-de-lealtad-basados-en-experiencias", "cat_es": "Premios", "alt_es": "Piscina de un resort con vista al mar", "cat": "Rewards",
     "img": "photo-1540541338287-41700207dee6", "alt": "Resort swimming pool overlooking the ocean",
     "by": "Paolo Nicolello", "by_url": "https://unsplash.com/@paul_nic", "photo_url": "https://unsplash.com/photos/2gOxKj594nM",
     "related": ["small-business-loyalty-programs", "automated-customer-rewards", "salon-barbershop-referral-program"]},
    {"slug": "customer-retention-rate", "slug_es": "tasa-de-retencion-de-clientes", "cat_es": "Medición", "alt_es": "Dos dueños de un pequeño negocio sonriendo detrás del mostrador", "cat": "Measurement",
     "img": "photo-1753351052277-a7ff634f0bd5", "alt": "Two small business owners smiling behind their shop counter",
     "by": "Vitaly Gariev", "by_url": "https://unsplash.com/@silverkblack", "photo_url": "https://unsplash.com/photos/C0yfUl0YXuI",
     "related": ["bring-back-salon-clients", "small-business-loyalty-programs", "automated-customer-rewards"]},
    {"slug": "automated-customer-rewards", "slug_es": "premios-automaticos-para-clientes", "cat_es": "Premios", "alt_es": "Dueño de una tienda hablando por teléfono mientras trabaja en su laptop", "cat": "Rewards",
     "img": "photo-1753164597612-5e71b83fda91", "alt": "Shop owner on the phone while working on a laptop",
     "by": "Vitaly Gariev", "by_url": "https://unsplash.com/@silverkblack", "photo_url": "https://unsplash.com/photos/kk4J92iaSBk",
     "related": ["experience-based-loyalty-rewards", "customer-retention-rate", "salon-barbershop-referral-program"]},
    {"slug": "fill-salon-suites-keep-renters", "slug_es": "como-llenar-suites-de-salon", "cat_es": "Suites de salón", "alt_es": "Tres sillas de salón negras frente a espejos redondos en una pared oscura", "cat": "Salon suites",
     "img": "photo-1600948836101-f9ffda59d250", "alt": "Three black salon chairs facing round mirrors on a dark wall",
     "by": "Greg Trowman", "by_url": "https://unsplash.com/@gregtrow", "photo_url": "https://unsplash.com/photos/jsuWg7IXx1k",
     "published": "2026-10-28", "date_en": "October 28, 2026", "date_es": "28 de octubre de 2026", "faq_ld": True, "fits": "suites",
     "related": ["salon-barbershop-referral-program", "experience-based-loyalty-rewards", "customer-retention-rate"]},
]

HERE = os.path.dirname(os.path.abspath(__file__))


def img_url(a, w):
    return f"https://images.unsplash.com/{a['img']}?ixlib=rb-4.1.0&auto=format&fit=crop&w={w}&q=75"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    def link(m):
        text, u = m.group(1), m.group(2)
        u = u.replace("https://retainos.co", "")
        return f'<a href="{html.escape(u)}">{text}</a>'
    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, s)


S = {
    "en": {"base": "/learn", "home": "/", "start": "/start", "how": "/#how", "plans": "/#plans", "rewards": "/rewards", "contact": "/contact",
           "lc": "Learning Center", "homel": "Home", "by": "By RetainOS", "upd": "Updated", "min": "min read", "quick": "Quick answer",
           "toc": "On this page", "faq": "Frequently asked questions", "fits": "How RetainOS fits", "keep": "Keep reading",
           "photo": "Photo by", "on": "on", "claim": "Claim a pilot spot", "seehow": "See how it works", "plansl": "Plans",
           "all": "All guides", "date": "October 27, 2026", "inlang": "en-US", "disc": "Disclosures"},
    "es": {"base": "/es/aprende", "home": "/es", "start": "/es/empezar", "how": "/es#how", "plans": "/es#plans", "rewards": "/es/premios", "contact": "/es/contacto",
           "lc": "Centro de aprendizaje", "homel": "Inicio", "by": "Por RetainOS", "upd": "Actualizado el", "min": "min de lectura", "quick": "Respuesta rápida",
           "toc": "En esta página", "faq": "Preguntas frecuentes", "fits": "Cómo encaja RetainOS", "keep": "Sigue leyendo",
           "photo": "Foto de", "on": "en", "claim": "Quiero un lugar en el piloto", "seehow": "Mira cómo funciona", "plansl": "Planes",
           "all": "Todas las guías", "date": "27 de octubre de 2026", "inlang": "es-US", "disc": "Información importante"},
}


def path(lang, a=None):
    base = S[lang]["base"]
    if a is None:
        return base
    return f'{base}/{a["slug"] if lang == "en" else a["slug_es"]}'


def load(a, lang):
    fn = a["slug"] + ".md" if lang == "en" else os.path.join("es", a["slug_es"] + ".md")
    t = open(os.path.join(HERE, "content", "learn", fn), encoding="utf-8").read()
    fm, body = re.match(r"---\n(.*?)\n---\n(.*)", t, re.S).groups()
    meta = dict(re.findall(r'^(\w+): "(.*)"$', fm, re.M))
    meta.pop("slug", None)
    body = re.sub(r"^# .*\n", "", body.strip() + "\n", count=1)
    a.update(meta)
    a["body"] = body
    a["words"] = len(re.findall(r"\w+", body))
    a["mins"] = max(3, round(a["words"] / 220))
    if lang == "es":
        a["cat"], a["alt"] = a["cat_es"], a["alt_es"]
    return a


SHORT = ("**Short answer:**", "**Respuesta corta:**")


def render_body(body):
    blocks = re.split(r"\n(?=## )", "\n" + body)
    intro, short, sections, faq = [], "", [], []
    def paras(txt):
        out = []
        for chunk in re.split(r"\n\s*\n", txt.strip()):
            chunk = chunk.strip()
            if not chunk:
                continue
            lines = chunk.split("\n")
            if all(l.startswith("- ") for l in lines):
                out.append("<ul>" + "".join(f"<li>{inline(l[2:])}</li>" for l in lines) + "</ul>")
            elif chunk.startswith("### "):
                out.append(f"<h3>{inline(chunk[4:])}</h3>")
            else:
                out.append(f"<p>{inline(' '.join(lines))}</p>")
        return "".join(out)
    for b in blocks:
        b = b.strip("\n")
        if not b:
            continue
        if not b.startswith("## "):
            for chunk in re.split(r"\n\s*\n", b.strip()):
                m = next((k for k in SHORT if chunk.startswith(k)), None)
                if m:
                    short = inline(chunk.replace(m, "").strip())
                else:
                    intro.append(chunk)
            continue
        title, rest = (b[3:].split("\n", 1) + [""])[:2]
        if title.startswith(("Frequently Asked Questions", "Preguntas frecuentes")):
            for q in re.split(r"\n(?=### )", "\n" + rest.strip()):
                q = q.strip()
                if q.startswith("### "):
                    qq, aa = (q[4:].split("\n", 1) + [""])[:2]
                    faq.append((inline(qq.strip()), paras(aa)))
            continue
        cls = "example" if ("Illustrative" in title or "ilustrativo" in title) else ""
        sections.append((slugify(title), inline(title), paras(rest), cls))
    return paras("\n\n".join(intro)), short, sections, faq


FITS_SUITES = {
    "en": ("Lease rewards and renter loyalty, done for you",
           "RetainOS for salon suite owners rewards renters for signing, renewing and referring another pro who signs, with complimentary hotel savings cards and getaway certificates instead of free rent. Every renter can also use RetainOS with their own clients, as an amenity of your building. We set everything up for you, in English and Spanish.",
           "Lease rewards are earned only after a signed lease and a cleared payment. Rewards are never cash or rent credit.",
           "See the program for suite owners", "/salon-suite-owner-program"),
    "es": ("Premios por contrato y lealtad para inquilinos, hechos por nosotros",
           "RetainOS para dueños de suites de salón premia al inquilino por firmar, renovar y referir a otro profesional que firme, con tarjetas de descuentos en hoteles y certificados de escapada de cortesía en lugar de renta regalada. Además, cada inquilino puede usar RetainOS con sus propios clientes, como un beneficio de tu edificio. Nosotros lo configuramos todo, en español e inglés.",
           "Los premios por contrato se ganan solo con un contrato firmado y un pago acreditado. Nunca son efectivo ni crédito de renta.",
           "Ver el programa para dueños de suites", "/es/programa-para-duenos-de-suites-de-salon"),
}


def fits(lang, kind=None):
    t = S[lang]
    if kind == "suites":
        h2, p1, p2, l1, u1 = FITS_SUITES[lang]
        return (f'<div class="fitbox"><div class="kicker">{t["fits"]}</div><h2 id="how-retainos-fits">{h2}</h2><p>{p1}</p><p class="fine">{p2}</p>'
                f'<div class="ctas"><a class="btn" href="{u1}">{l1}</a><a class="btn alt" href="{t["start"]}">{t["claim"]}</a></div>'
                f'<p class="fine"><a href="{t["rewards"]}">{"Reward details and terms" if lang == "en" else "Detalles y términos de los premios"}</a></p></div>')
    if lang == "en":
        h2, p1, p2 = ("Loyalty and referrals, done for you",
            "RetainOS is an automated loyalty and referral program for local service businesses. Clients check in with a quick QR scan that your team confirms, get a friendly reminder when they're due back, and earn complimentary rewards. By default, that's a $100 hotel savings card after 5 visits, and one for both people when a referred friend completes a first paid visit. Your prices stay the same. We set everything up for you, in English and Spanish.",
            "Rewards are never given for reviews. For healthcare-related services such as med spas, visit and referral rewards stay off by default.")
        l1, l2 = "Plans and pricing", "Reward details and terms"
    else:
        h2, p1, p2 = ("Lealtad y referidos, hechos por nosotros",
            "RetainOS es un programa automatizado de lealtad y referidos para negocios de servicios locales. Tus clientes se registran con un escaneo QR rápido que tu equipo confirma, reciben un recordatorio amable cuando les toca volver y ganan premios de cortesía. De entrada, es una tarjeta de descuentos en hoteles de $100 después de 5 visitas, y una para cada persona cuando un amigo referido completa su primera visita pagada. Tus precios no cambian. Nosotros lo configuramos todo, en español e inglés.",
            "Los premios nunca se dan por reseñas. Para servicios relacionados con la salud, como los med spas, los premios por visitas y referidos están desactivados de entrada.")
        l1, l2 = "Planes y precios", "Detalles y términos de los premios"
    return (f'<div class="fitbox"><div class="kicker">{t["fits"]}</div><h2 id="how-retainos-fits">{h2}</h2><p>{p1}</p><p class="fine">{p2}</p>'
            f'<div class="ctas"><a class="btn" href="{t["start"]}">{t["claim"]}</a><a class="btn alt" href="{t["how"]}">{t["seehow"]}</a></div>'
            f'<p class="fine"><a href="{t["plans"]}">{l1}</a> · <a href="{t["rewards"]}">{l2}</a></p></div>')


def disclose(lang):
    t = S[lang]
    if lang == "en":
        ps = [("Examples are hypothetical.", "Names, amounts, calculations and messages in this article are illustrative, not industry benchmarks or RetainOS results. No improvement in repeat visits, referrals or revenue is guaranteed."),
              ("Rewards.", f'Hotel savings cards are discounts or credits on eligible bookings, not cash, a gift card or a prepaid stay. Dining rewards are discount offers at participating restaurants and may carry an activation fee. Getaway certificates can involve taxes, nightly or resort fees, meal plans at some properties, and travel costs. Each reward\'s written terms apply. <a href="{t["rewards"]}">Full reward details</a>.'),
              ("Messages.", "Send marketing texts and emails only to people who agreed to receive them, and honor opt-outs (STOP) right away. This article is general information, not legal advice.")]
    else:
        ps = [("Los ejemplos son hipotéticos.", "Los nombres, montos, cálculos y mensajes de este artículo son ilustrativos, no promedios de la industria ni resultados de RetainOS. No se garantiza ninguna mejora en visitas repetidas, referidos o ingresos."),
              ("Premios.", f'Las tarjetas de descuentos en hoteles son descuentos o créditos en reservas elegibles, no efectivo, ni tarjeta de regalo, ni una estadía prepagada. Los premios de restaurantes son ofertas de descuento en restaurantes participantes y pueden tener un cargo de activación. Los certificados de escapada pueden incluir impuestos, cargos por noche o del resort, planes de comida en algunos hoteles y costos de viaje. Aplican los términos escritos de cada premio. <a href="{t["rewards"]}">Detalles completos de los premios</a>.'),
              ("Mensajes.", "Envía mensajes de texto y correos de mercadeo solo a quien aceptó recibirlos, y respeta de inmediato a quien pida darse de baja (STOP). Este artículo es información general, no asesoría legal.")]
    return f'<aside class="disclose" aria-label="{t["disc"]}"><h2 id="disclosures">{t["disc"]}</h2>' + "".join(f"<p><strong>{a}</strong> {b}</p>" for a, b in ps) + "</aside>"


def header(b, lang, alt):
    t = S[lang]
    cur = lambda l: ' aria-current="page"' if lang == l else ""
    toggle = f'<nav class="lang" aria-label="Language / Idioma"><a href="{alt[0]}" hreflang="en"{cur("en")}>EN</a><a href="{alt[1]}" hreflang="es"{cur("es")}>ES</a></nav>'
    return (f'<header class="wrap top"><a class="logo" href="{t["home"]}" aria-label="RetainOS">{b.LOGO_MARK}<span>Retain<b>OS</b></span></a>'
            f'<div class="topr"><div class="nav"><a href="{t["base"]}">{"Learning Center" if lang == "en" else "Aprende"}</a><a href="{t["how"]}">{"Cómo funciona" if lang == "es" else "How it works"}</a><a href="{t["plans"]}">{t["plansl"]}</a></div>'
            f'<a class="btn sm" href="{t["start"]}">{"Quiero mi lugar" if lang == "es" else "Claim a pilot spot"}</a>{toggle}</div></header>')


def card(a, lang, big=False):
    w = 900 if big else 600
    return (f'<a class="lcard{" big" if big else ""}" href="{path(lang, a)}">'
            f'<img src="{img_url(a, w)}" alt="{html.escape(a["alt"])}" loading="lazy" width="{w}" height="{600 if big else 400}">'
            f'<div class="lc"><span class="tag">{a["cat"]}</span><h3>{html.escape(a["title"])}</h3>'
            f'<p>{html.escape(a["meta_description"])}</p><span class="rt">{a["mins"]} {S[lang]["min"]}</span></div></a>')


def crumbs(lang, last=None):
    t = S[lang]
    if last is None:
        return f'<nav class="crumbs" aria-label="Breadcrumb"><a href="{t["home"]}">{t["homel"]}</a> <span>›</span> <span aria-current="page">{t["lc"]}</span></nav>'
    return f'<nav class="crumbs" aria-label="Breadcrumb"><a href="{t["home"]}">{t["homel"]}</a> <span>›</span> <a href="{t["base"]}">{t["lc"]}</a> <span>›</span> <span aria-current="page">{html.escape(last)}</span></nav>'


def article_page(b, a, by_slug, lang):
    t = S[lang]
    intro, short, sections, faq = render_body(a["body"])
    alt = (path("en", a), path("es", a))
    url = b.DOMAIN + path(lang, a)
    toc_items = [(sid, x) for sid, x, _, _ in sections] + ([("faq", t["faq"])] if faq else []) + [("how-retainos-fits", t["fits"])]
    toc = "".join(f'<li><a href="#{sid}">{x}</a></li>' for sid, x in toc_items)
    body = "".join(f'<section class="{cls}" aria-labelledby="{sid}"><h2 id="{sid}">{x}</h2>{h}</section>' if cls else f'<h2 id="{sid}">{x}</h2>{h}' for sid, x, h, cls in sections)
    faqh = f'<h2 id="faq">{t["faq"]}</h2><div class="faqv">' + "".join(f"<h3>{q}</h3>{ans}" for q, ans in faq) + "</div>" if faq else ""
    rel = "".join(card(by_slug[s], lang) for s in a["related"])
    pub = a.get("published", PUBLISHED)
    shown = a.get("date_" + lang, t["date"])
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "headline": a["title"], "description": a["meta_description"],
         "image": [img_url(a, 1200)], "datePublished": pub, "dateModified": pub,
         "author": {"@type": "Organization", "name": "RetainOS", "url": b.DOMAIN + "/"},
         "publisher": {"@type": "Organization", "name": "RetainOS", "url": b.DOMAIN + "/", "logo": {"@type": "ImageObject", "url": b.DOMAIN + "/apple-touch-icon.png"}},
         "mainEntityOfPage": {"@type": "WebPage", "@id": url}, "inLanguage": t["inlang"], "articleSection": a["cat"], "wordCount": a["words"]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": t["homel"], "item": b.DOMAIN + t["home"]},
            {"@type": "ListItem", "position": 2, "name": t["lc"], "item": b.DOMAIN + t["base"]},
            {"@type": "ListItem", "position": 3, "name": a["title"], "item": url}]}]}
    if a.get("faq_ld") and faq:
        strip = lambda x: re.sub(r"<[^>]+>", "", html.unescape(x)).strip()
        ld["@graph"].append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(ans)}} for q, ans in faq]})
    h = b.head(a["seo_title"], a["seo_title"], a["meta_description"], a["meta_description"], alt=alt, jsonld=ld)
    h = h.replace('<meta property="og:type" content="website">', '', 1)
    h = h.replace(f'content="{b.DOMAIN}/og-image.png"', f'content="{img_url(a, 1200)}"', 1)
    h = h.replace("</head>", f'<meta property="og:url" content="{url}"><meta property="og:type" content="article"><meta property="article:published_time" content="{pub}"></head>', 1)
    return "".join([h, header(b, lang, alt), '<main id="top"><article class="wrap post">', crumbs(lang, a["title"]),
        f'<div class="phead"><span class="tag">{a["cat"]}</span><h1>{html.escape(a["title"])}</h1>',
        f'<p class="pmeta">{t["by"]} · <time datetime="{pub}">{t["upd"]} {shown}</time> · {a["mins"]} {t["min"]}</p></div>',
        f'<figure class="hero-img"><img src="{img_url(a, 1400)}" alt="{html.escape(a["alt"])}" width="1400" height="788" fetchpriority="high">'
        f'<figcaption>{t["photo"]} <a href="{a["by_url"]}{UTM}" rel="nofollow">{a["by"]}</a> {t["on"]} <a href="{a["photo_url"]}{UTM}" rel="nofollow">Unsplash</a></figcaption></figure>',
        f'<div class="pgrid"><aside class="toc"><details open><summary>{t["toc"]}</summary><ol>' + toc + '</ol></details></aside><div class="prose">',
        f'<div class="quick"><div class="kicker">{t["quick"]}</div><p>{short}</p></div>' if short else "",
        intro, body, faqh, fits(lang, a.get("fits")), disclose(lang), "</div></div>",
        f'<section class="related"><h2>{t["keep"]}</h2><div class="lgrid">{rel}</div></section>',
        "</article></main>", '<script>if(matchMedia("(max-width:920px)").matches){var d=document.querySelector(".toc details");if(d)d.removeAttribute("open")}</script>',
        b.footer(), b.end()])


def index_page(b, arts, lang):
    t = S[lang]
    alt = (S["en"]["base"], S["es"]["base"])
    if lang == "en":
        title = "Learning Center: Loyalty, Referrals & Repeat Customers | RetainOS"
        desc = "Practical, plain-English guides for local service businesses on repeat customers, loyalty programs, referrals, rewards and retention."
        extra = "No hype, no made-up results. Just what works and how to measure it."
        h1, cta_h, cta_p = "More regulars. Less chasing.", "Want this done for you?", "RetainOS sets up visit rewards, referrals and reminders for your business, in English and Spanish, without cutting your prices."
    else:
        title = "Centro de aprendizaje: lealtad, referidos y clientes que vuelven | RetainOS"
        desc = "Guías prácticas y en lenguaje sencillo para negocios de servicios locales sobre clientes que vuelven, programas de lealtad, referidos, premios y retención."
        extra = "Sin exageraciones ni resultados inventados. Solo lo que funciona y cómo medirlo."
        h1, cta_h, cta_p = "Más clientes fieles. Menos persecución.", "¿Quieres que lo hagamos por ti?", "RetainOS configura los premios por visitas, los referidos y los recordatorios para tu negocio, en español e inglés, sin bajar tus precios."
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "name": f"RetainOS {t['lc']}", "url": b.DOMAIN + t["base"], "description": desc, "inLanguage": t["inlang"],
         "hasPart": [{"@type": "BlogPosting", "headline": a["title"], "url": b.DOMAIN + path(lang, a)} for a in arts]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": t["homel"], "item": b.DOMAIN + t["home"]},
            {"@type": "ListItem", "position": 2, "name": t["lc"], "item": b.DOMAIN + t["base"]}]}]}
    h = b.head(title, title, desc, desc, alt=alt, jsonld=ld)
    cats = []
    for a in arts:
        if a["cat"] not in cats:
            cats.append(a["cat"])
    chips = f'<button class="chip on" data-f="all">{t["all"]}</button>' + "".join(f'<button class="chip" data-f="{slugify(c)}">{c}</button>' for c in cats)
    grid = "".join(card(a, lang).replace('<a class="lcard"', f'<a class="lcard{" isfeat" if i == 0 else ""}" data-cat="{slugify(a["cat"])}"', 1) for i, a in enumerate(arts))
    js = ("<script>(function(){var bs=document.querySelectorAll('.chip[data-f]'),cs=document.querySelectorAll('#lgrid .lcard'),ft=document.querySelector('.featured');"
          "bs.forEach(function(b){b.addEventListener('click',function(){var f=b.getAttribute('data-f');bs.forEach(function(x){x.classList.toggle('on',x===b)});"
          "if(ft)ft.style.display=f==='all'?'':'none';cs.forEach(function(c){var show=f==='all'?!c.classList.contains('isfeat'):c.getAttribute('data-cat')===f;c.style.display=show?'flex':'none'})})})})();</script>")
    return "".join([h, header(b, lang, alt), '<main id="top"><div class="wrap learn">', crumbs(lang),
        f'<div class="kicker">{t["lc"]}</div><h1 class="h1-sm">{h1}</h1>',
        f'<p class="lead">{desc} {extra}</p>', f'<div class="chips">{chips}</div>',
        f'<div class="featured">{card(arts[0], lang, big=True)}</div>',
        f'<section class="lsec"><h2 id="guides">{t["all"]}</h2><div class="lgrid" id="lgrid">{grid}</div></section>', js,
        f'<div class="fitbox"><h2>{cta_h}</h2><p>{cta_p}</p><div class="ctas"><a class="btn" href="{t["start"]}">{t["claim"]}</a><a class="btn alt" href="{t["how"]}">{t["seehow"]}</a></div></div>',
        "</div></main>", b.footer(), b.end()])


def build(b):
    urls = []
    for lang in ("en", "es"):
        b.LANG = lang
        arts = [load(dict(a), lang) for a in ARTICLES]
        by = {a["slug"]: a for a in arts}
        pre = "learn" if lang == "en" else "es/aprende"
        for a in arts:
            b.write(f"{pre}/{a['slug'] if lang == 'en' else a['slug_es']}.html", article_page(b, a, by, lang))
            urls.append(path(lang, a))
        b.write(f"{pre}/index.html", index_page(b, arts, lang))
        urls.append(S[lang]["base"])
    b.LANG = None
    return urls
