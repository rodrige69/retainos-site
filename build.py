#!/usr/bin/env python3
"""Builds the RetainOS site (retainos.co) in English and Spanish.

Edit OFFER / REWARDS here, industry copy in verticals.py, styles in style.css,
then run:  python3 build.py        (needs: pip install segno)

Output in ./site:
  index.html, es/index.html                  homepage
  <slug>.html, es/<slug_es>.html             one public page per industry
  rewards.html, es/premios.html              reward details, terms and how it works
  go/<promo>/index.html                      hidden $0-setup promo pages (noindex)
  sitemap.xml, robots.txt
"""
import html, io, json, os, sys
import segno
from verticals import VERTICALS, GROUPS
import legal

DOMAIN = "https://retainos.co"
VOTEL_FORMS = {  # Votel form slugs (ai.clientcontactpro.com/f/<slug>)
    "contact": {"en": "mmAo", "es": "6Pbo"},
}
BOOKING = {"en": "retainos-revenue-recovery-call1", "es": "retainos-llamada-inicial"}  # Votel bookable slugs (sign-up = book the kickoff call)
GA_ID = "G-YSTD5HYECJ"  # Google Analytics 4 (same property as the old retainos.co pages)
HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Fill in before launch
# ---------------------------------------------------------------------------
OFFER = {
    "spots": "4", "end_en": "Nov 11, 2026", "end_es": "11 de noviembre de 2026", "live_days": "[X]",
    "contract_en": "[Month-to-month / your terms]", "contract_es": "[Mes a mes / tus términos]",
    "qr_url": "https://retainos.co",
}

# Votel checkout links (one order-form page per plan). Leave "" until Votel gives you the URL;
# empty buttons scroll to the sign-up form instead. Promo links should apply the $0 setup.
CHECKOUT = {
    "regulars": "", "full-book": "", "hands-off": "",
    "promo-regulars": "", "promo-full-book": "", "promo-hands-off": "",
}

# Reward wording. Destinations and fees change: no exact getaway amounts on the site,
# only one labeled example. Confirm the example with the rewards partner before launch.
REWARDS = {
    "dest_en": "more than 100 destinations, like Cancún, Orlando, Las Vegas, the Bahamas, the Dominican Republic and many more",
    "dest_es": "más de 100 destinos, como Cancún, Orlando, Las Vegas, las Bahamas, República Dominicana y muchos más",
    "nights_en": "usually 3 to 7 nights, depending on the destination",
    "nights_es": "normalmente de 3 a 7 noches, según el destino",
    "example_en": "For example, taxes and fees at US resorts have run about $20–$35 per night.",
    "example_es": "Por ejemplo, los impuestos y cargos en resorts de EE. UU. han sido de unos $20 a $35 por noche.",
}

LANG = None  # None = both languages in one file (promo pages); "en"/"es" = one language
e = html.escape


def T(en, es, tag="span", cls="", attrs=""):
    c = f' class="{cls}"' if cls else ""
    if LANG == "en":
        return f"<{tag}{c}{attrs}>{en}</{tag}>"
    if LANG == "es":
        return f"<{tag}{c}{attrs}>{es}</{tag}>"
    c2 = (" " + cls) if cls else ""
    return f'<{tag} class="en{c2}" lang="en"{attrs}>{en}</{tag}><{tag} class="es{c2}" lang="es"{attrs}>{es}</{tag}>'


def L(en, es):
    return es if LANG == "es" else en


def url(en, es):
    return es if LANG == "es" else en


def vurl(v):
    return url("/" + v["slug"], "/es/" + v["slug_es"])


def mode(v):
    return v.get("mode", "full")


def qr_svg(u):
    q = segno.make(u, error="m")
    buf = io.BytesIO()
    q.save(buf, kind="svg", scale=4, border=0, dark="#17191C", light=None, xmldecl=False, svgns=True, nl=False)
    return buf.getvalue().decode().replace("<svg ", '<svg role="img" aria-label="Sample QR code" class="qr" ', 1)


QR = qr_svg(OFFER["qr_url"])
LOGO_MARK = '<svg class="lm" viewBox="0 0 100 100" aria-hidden="true"><path d="M79.34 43.76 A30 30 0 1 1 45.82 20.29" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round"/><path d="M60.68 18.20 L44.15 8.41 L47.49 32.18 Z" fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="72.98" cy="30.72" r="11" fill="currentColor"/></svg>'
with open(os.path.join(HERE, "style.css"), encoding="utf-8") as _f:
    CSS = _f.read()

JS_SWAP = r"""(function(){var r=document.documentElement;function s(l){r.setAttribute('lang',l);document.querySelectorAll('[data-setlang]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-setlang')===l?'true':'false')});var t=document.querySelector('meta[name="title-'+l+'"]');if(t)document.title=t.content;try{localStorage.setItem('ros-lang',l)}catch(e){}}var q=null;try{q=new URLSearchParams(location.search).get('lang')}catch(e){}var v=null;try{v=localStorage.getItem('ros-lang')}catch(e){}s(q==='es'||q==='en'?q:(v==='es'?'es':'en'));document.querySelectorAll('[data-setlang]').forEach(function(b){b.addEventListener('click',function(){s(b.getAttribute('data-setlang'))})})})();"""

CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>'


def href(u):
    return f' href="{u}"'


# ---------------------------------------------------------------------------
# Building blocks
# ---------------------------------------------------------------------------
def head(title_en, title_es, desc_en, desc_es, noindex=False, alt=None, jsonld=None):
    robots = '<meta name="robots" content="noindex, nofollow">' if noindex else ""
    links = ""
    if alt:
        links = (f'<link rel="canonical" href="{DOMAIN}{url(*alt)}">'
                 f'<link rel="alternate" hreflang="en" href="{DOMAIN}{alt[0]}"><link rel="alternate" hreflang="es" href="{DOMAIN}{alt[1]}"><link rel="alternate" hreflang="x-default" href="{DOMAIN}{alt[0]}">')
    title, desc = L(title_en, title_es), L(desc_en, desc_es)
    ld = f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ""
    return f"""<!doctype html>
<html lang="{LANG or 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{robots}
<title>{e(title)}</title>
<meta name="title-en" content="{e(title_en)}"><meta name="title-es" content="{e(title_es)}">
<meta name="description" content="{e(desc)}">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website"><meta property="og:image" content="{DOMAIN}/og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="theme-color" content="#C2410C">
{links}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style>
{ld}
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA_ID}');
document.addEventListener('click',function(ev){{var a=ev.target.closest('a.btn,button.btn,[data-setlang]');if(!a)return;var l=a.hasAttribute('data-setlang')?'lang_'+a.getAttribute('data-setlang'):(a.textContent||'').trim().slice(0,60);gtag('event',a.hasAttribute('data-setlang')?'language_switch':'cta_click',{{label:l,page:location.pathname}});}});</script>
</head>
<body>"""


def topbar(alt=None, nav=True):
    if alt:
        cur = lambda l: ' aria-current="page"' if LANG == l else ""
        toggle = f'<nav class="lang" aria-label="Language / Idioma"><a href="{alt[0]}" hreflang="en"{cur("en")}>EN</a><a href="{alt[1]}" hreflang="es"{cur("es")}>ES</a></nav>'
    else:
        toggle = '<div class="lang" role="group" aria-label="Language / Idioma"><button type="button" data-setlang="en" aria-pressed="true">EN</button><button type="button" data-setlang="es" aria-pressed="false">ES</button></div>'
    links = ""
    learn = T("Learning Center", "Aprende", "a", "", href(url("/learn", "/es/aprende"))) if LANG else T('<a href="/learn">Learning Center</a>', '<a href="/es/aprende">Aprende</a>')
    if nav and LANG:
        links = ('<div class="nav">' + T("How it works", "Cómo funciona", "a", "", href("#how"))
                 + T("Industries", "Industrias", "a", "", href(url("/#industries", "/es#industries")))
                 + T("Rewards", "Premios", "a", "", href(url("/rewards", "/es/premios")))
                 + T("Plans", "Planes", "a", "", href("#plans")) + learn + "</div>")
    else:
        links = '<div class="nav">' + learn + "</div>"
    home = url("/", "/es") if LANG else "#top"
    return f'<header class="wrap top"><a class="logo" href="{home}" aria-label="RetainOS">{LOGO_MARK}<span>Retain<b>OS</b></span></a><div class="topr">{links}{toggle}</div></header>'


def dots(n=3, total=5):
    return '<div class="row" aria-hidden="true">' + "".join(f'<span class="dot{" on" if i < n else ""}"></span>' for i in range(total)) + "</div>"


def phone(v):
    care = mode(v) == "care"
    reply = T("Booked for Friday! 🙌", "¡Reservado para el viernes! 🙌")
    extra = "" if care else f"""<div class="prog"><strong>{T("Your reward progress", "Tu progreso")}</strong>{dots()}<small>{T("3 of 5 visits · $100 hotel savings card", "3 de 5 visitas · tarjeta de descuentos en hoteles de $100")}</small></div>"""
    if care:
        extra = f"""<div class="prog"><strong>{T("Confirmed", "Confirmado")}</strong><small>{T("Friday 10:30 AM · Deposit received", "Viernes 10:30 a. m. · Depósito recibido")}</small></div>"""
    return f"""<div class="phone"><div class="screen">
<div class="notch"></div>
<div class="from"><span class="sample">{T("SAMPLE", "EJEMPLO")}</span><strong>{e(v["biz"])}</strong>{T("Text message · Today 10:02 AM", "Mensaje de texto · Hoy 10:02 a. m.")}</div>
<div class="bubble">{T(e(v["msg_en"]), e(v["msg_es"]))}<span class="lnk">{T("Book your " + v["next_en"] + " →", "Reserva tu " + v["next_es"] + " →")}</span></div>
<div class="bubble me">{reply}</div>
{extra}
<div class="stop">{T("Reply STOP to opt out", "Responde STOP para no recibir más mensajes")}</div>
</div></div>"""


def hero(v, eyebrow, pill, h1, sub, cta, fine=None):
    pill_html = f'<span class="pill">{T(*pill)}</span>' if pill else ""
    fine_html = T(*fine, "p", "fine") if fine else ""
    return f"""<div class="wrap hero">
<div>
<div class="eyebrow">{T(*eyebrow)}{pill_html}</div>
{T(*h1, "h1")}
{T(*sub, "p", "sub")}
<div class="ctas"><a class="btn" href="{start_href()}">{T(*cta)}</a><a class="btn alt" href="#how">{T("See how it works", "Mira cómo funciona")}</a></div>
{fine_html}
</div>
<div>{phone(v)}</div>
</div>"""


def summary_block(en, es):
    return f'<section class="tint"><div class="wrap">{T("In short", "En resumen", "div", "kicker")}{T(en, es, "p", "lead lead-lg")}</div></section>'


def problem(v=None, tint=False):
    pain = T(v["pain_en"], v["pain_es"], "p", "lead") if v else ""
    if v and mode(v) == "care":
        return f"""<section{' class="tint"' if tint else ''}><div class="wrap">
{T("You're great at the work. Keeping clients on schedule is a second job.", "Eres excelente en lo que haces. Mantener a tus clientes al día es otro trabajo.", "h2")}
{pain}
{T("Remembering who's due. Chasing no-shows. Asking for reviews after a great visit. It all matters, and it's the first thing to slip on a busy day.", "Acordarte de a quién le toca volver. Perseguir a los que no llegaron. Pedir una reseña después de una buena visita. Todo eso importa, y es lo primero que se queda atrás en un día ocupado.", "p", "lead")}
</div></section>"""
    return f"""<section{' class="tint"' if tint else ''}><div class="wrap">
{T("You're great at the work. Keeping clients coming back is a second job.", "Eres excelente en lo que haces. Lograr que vuelvan es otro trabajo.", "h2")}
{pain}
{T("Remembering who's due back. Thanking your regulars. Asking happy clients to send a friend. It all matters, and it's the first thing to slip when you're booked solid.", "Acordarte de quién ya le toca volver. Agradecerle a tu clientela fiel. Pedirle a un cliente contento que te recomiende. Todo eso importa, y es lo primero que se queda atrás cuando tienes la agenda llena.", "p", "lead")}
{T("And discounts don't fix it. They fill one appointment and teach clients to wait for the next deal.", "Y los descuentos no lo resuelven. Llenan una cita y enseñan al cliente a esperar la próxima oferta.", "p", "lead")}
</div></section>"""


# Pages that show the "Full Picture" explainer (English video). Keys: English slug, "go-<promo>" for promo pages.
EXPLAINER = {"src": "/media/retainos-full-picture-explainer.mp4", "poster": "/media/retainos-explainer-poster.jpg"}
VIDEO_PAGES = {"hair-salon-loyalty-program", "barbershop-loyalty-program", "nail-lash-loyalty-program",
               "braiding-salon-loyalty-program", "salon-suite-owner-program", "go-salons", "go-barbershops", "go-nail-lash"}


def video(key):
    # key = this page's own video slot (one per page, per language), so each page can get its own video
    if key in VIDEO_PAGES:
        return f"""<div class="video has-video" data-video="{key}">
<video controls playsinline preload="none" poster="{EXPLAINER['poster']}" aria-label="RetainOS: the full picture">
<source src="{EXPLAINER['src']}" type="video/mp4"></video>
</div>"""
    return f"""<div class="video" data-video="{key}" role="img" aria-label="{L('Video placeholder', 'Espacio para video')}">
<!-- VIDEO [{key}]: replace this div's inner content with the YouTube embed iframe for this page -->
<div><div class="play" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>
{T("See how it works in 90 seconds", "Mira cómo funciona en 90 segundos", "p")}
{T("Video coming soon", "Video muy pronto", "p", "fine")}</div>
</div>"""


def step(n, h, p, visual):
    return f'<div class="step"><div class="n">{n}</div>{T(*h, "h3")}{T(*p, "p")}<div class="visual">{visual}</div></div>'


def mini_text(v, body_en, body_es, show_prog=True):
    prog = f'<div class="prog">{dots()}<small>{T("3 of 5 visits", "3 de 5 visitas")}</small></div>' if show_prog else ""
    return f'<div class="mini"><div class="from"><strong>{e(v["biz"])}</strong></div><div class="bubble">{T(e(body_en), e(body_es))}</div>{prog}</div>'


def how(v, key):
    if mode(v) == "care":
        booking = f"""<div class="book"><div class="biz">{e(v["biz"])}</div>{T("Pick a time", "Elige un horario", "small")}<div class="slots"><span>9:00</span><span class="on">10:30</span><span>1:15</span></div><div class="dep">{T("Deposit to hold your spot", "Depósito para reservar")}<b>{T("Paid ✓", "Pagado ✓")}</b></div></div>"""
        review_en = f"Thanks for visiting {v['biz']} today! If you have a minute, we'd love your honest review. It helps others find us."
        review_es = f"¡Gracias por visitar {v['biz']} hoy! Si tienes un minuto, nos encantaría tu reseña honesta. Ayuda a que otros nos encuentren."
        steps = (step(1, ("They book online and hold it with a deposit.", "Reservan en línea y aseguran su cita con un depósito."),
                      ("Fewer no-shows, and a missed call gets a text back with your booking link.", "Menos citas perdidas, y cada llamada sin contestar recibe un mensaje con tu enlace de reservas."), booking)
                 + step(2, ("We remind them when it's time.", "Les recordamos cuando les toca."),
                        (f"A friendly text goes out when they're due for their {v['next_en']}, in English or Spanish. No treatment details in messages.", f"Les llega un mensaje amable cuando les toca su {v['next_es']}, en español o en inglés. Los mensajes no incluyen detalles del tratamiento."),
                        mini_text(v, v["msg_en"], v["msg_es"], False))
                 + step(3, ("We ask for an honest review.", "Pedimos una reseña honesta."),
                        ("Every client gets the same simple request after a visit. No incentives, no filtering.", "Cada cliente recibe la misma solicitud sencilla después de su visita. Sin incentivos y sin filtros."),
                        mini_text(v, review_en, review_es, False)))
        kicker_h = ("Booking, reminders and reviews. Handled.", "Reservas, recordatorios y reseñas. Resuelto.")
    else:
        c = v["client"]
        step2 = (v.get("step2_en") or f"A friendly text goes out right when they're due for their {v['next_en']} (about every {v['timing_en']}), in English or Spanish.",
                 v.get("step2_es") or f"Les llega un mensaje amable justo cuando les toca su {v['next_es']} (más o menos cada {v['timing_es']}), en español o en inglés.")
        qr = f'<div class="qrcard"><div class="biz">{e(v["biz"])}</div>{QR}{T("Scan to earn your reward", "Escanea y gana tu premio", "div", "cta")}{T("Every visit counts", "Cada visita cuenta", "small")}</div>'
        reward = f"""<div class="reward"><div class="hd">{T(f"🎉 {c}, you earned a reward!", f"🎉 ¡{c}, ganaste un premio!")}</div><div class="bd">
<div class="hcard"><div class="amt">$100</div>{T("Hotel Savings Card", "Tarjeta de descuentos en hoteles", "div", "lbl")}{T("Compliments of " + e(v["biz"]), "Cortesía de " + e(v["biz"]), "div", "comp")}</div>
{T("Discounts or credits on eligible hotel bookings. Not cash or a gift card. Terms apply.", "Descuentos o créditos en reservas de hotel elegibles. No es efectivo ni tarjeta de regalo. Aplican términos.", "div", "terms")}
</div></div>"""
        who_en = "Parents earn" if mode(v) == "family" else "They earn"
        who_es = "Los padres ganan" if mode(v) == "family" else "Se ganan"
        steps = (step(1, ("They check in with a quick scan.", "Se registran con un escaneo rápido."),
                      (f"Clients scan your QR code {v['scan_en']}. Every visit counts toward a reward.", f"Tus clientes escanean tu código QR {v['scan_es']}. Cada visita cuenta para su premio."), qr)
                 + step(2, ("We remind them when it's time.", "Les recordamos cuando les toca."), step2, mini_text(v, v["msg_en"], v["msg_es"]))
                 + step(3, (f"{who_en} something worth coming back for.", f"{who_es} algo que vale la pena."),
                        ("Complimentary rewards for visits and referrals. You never touch your prices.", "Premios de cortesía por visitas y referidos. Tú no tocas tus precios."), reward))
        kicker_h = ("Three steps. You keep doing great work.", "Tres pasos. Tú sigues haciendo tu trabajo.")
    return f"""<section id="how"><div class="wrap">
{T("How it works", "Cómo funciona", "div", "kicker")}
{T(*kicker_h, "h2")}
<div class="steps">{steps}</div>
{video(key)}
</div></section>"""


def rewards_cards():
    R = REWARDS
    return f"""<div class="rw">
<div class="rwc"><div class="tag">{T("Every plan", "Todos los planes")}</div>{T("Hotel savings cards", "Tarjetas de descuentos en hoteles", "h3")}
{T("$100 to $500 in credits or discounts on eligible hotel bookings, through our rewards partner's booking site.", "De $100 a $500 en créditos o descuentos en reservas de hotel elegibles, en el sitio de reservas de nuestro socio de premios.", "p")}
<div class="pay">{T("<strong>Client pays:</strong> the discounted price of the stay they choose.", "<strong>El cliente paga:</strong> el precio con descuento de la estadía que elija.")}</div></div>
<div class="rwc"><div class="tag alt">{T("Add-on · Full Book &amp; Hands-Off", "Complemento · Agenda Llena y Sin Complicaciones")}</div>{T("Dining rewards", "Premios de restaurantes", "h3")}
{T("Discount offers of up to 50% off at more than 100,000 participating restaurants in the US and Canada.", "Ofertas de hasta 50% de descuento en más de 100,000 restaurantes participantes en EE. UU. y Canadá.", "p")}
<div class="pay">{T("<strong>Client pays:</strong> a small activation fee, unless you cover it.", "<strong>El cliente paga:</strong> un pequeño cargo de activación, a menos que tú lo cubras.")}</div></div>
<div class="rwc"><div class="tag alt">{T("Add-on · Full Book &amp; Hands-Off", "Complemento · Agenda Llena y Sin Complicaciones")}</div>{T("Getaway certificates", "Certificados de escapada", "h3")}
{T(f"Promotional resort stays in {R['dest_en']}, {R['nights_en']}. Some destinations offer all-inclusive resorts.", f"Estadías promocionales en resorts en {R['dest_es']}, {R['nights_es']}. Algunos destinos ofrecen resorts todo incluido.", "p")}
<div class="pay">{T("<strong>Client pays:</strong> taxes and fees for each night when activating, resort fees where they apply, and the meal plan at all-inclusive resorts. Flights not included. Terms apply.", "<strong>El cliente paga:</strong> impuestos y cargos por noche al activar, cargos del resort cuando apliquen y el plan de comidas en resorts todo incluido. No incluye vuelos. Aplican términos.")}</div></div>
</div>"""


def gets(v):
    rew = url("/rewards", "/es/premios") if LANG else "#rewards"
    link = T("See full reward details", "Ver todos los detalles de los premios", "a", "", href(rew)) if LANG else ""
    if mode(v) == "care":
        return f"""<section class="tint" id="rewards"><div class="wrap">
{T("About rewards", "Sobre los premios", "div", "kicker")}
{T("Booking first. Rewards only when they're allowed.", "Primero las reservas. Premios solo cuando están permitidos.", "h2")}
{T("Healthcare-related services have strict rules about gifts tied to visits or referrals. So visit and referral rewards stay off by default. You still get booking, deposits, reminders, missed-call text-back and review requests, plus staff contests for your team.", "Los servicios relacionados con la salud tienen reglas estrictas sobre regalos ligados a visitas o referidos. Por eso los premios por visitas y referidos están desactivados de entrada. Igual tienes reservas, depósitos, recordatorios, respuesta a llamadas perdidas y solicitudes de reseñas, además de concursos para tu equipo.", "p", "lead")}
{T(v["note_en"], v["note_es"], "p", "lead") if v.get("note_en") else ""}
<p class="note">{link}</p>
</div></section>"""
    who = ("What parents get", "Lo que reciben los padres") if mode(v) == "family" else ("What your clients get", "Lo que reciben tus clientes")
    note = T(v["note_en"], v["note_es"], "p", "callout") if v.get("note_en") else ""
    return f"""<section class="tint" id="rewards"><div class="wrap">
{T(*who, "div", "kicker")}
{T("Something to look forward to. No discounts needed.", "Algo que esperar con ganas. Sin descuentos.", "h2")}
{note}
<div class="gets">
<div class="get">{T("After 5 visits", "Después de 5 visitas", "div", "big")}{T("A complimentary $100 hotel savings card. Included in every plan.", "Una tarjeta de descuentos en hoteles de $100, de cortesía. Incluida en todos los planes.", "p")}</div>
<div class="get">{T("Refer a friend", "Recomienda a alguien", "div", "big")}{T("When the friend books and pays, you both get one.", "Cuando tu amistad reserva y paga, los dos reciben una.", "p")}</div>
<div class="get">{T("Your own perk", "Tu propio beneficio", "div", "big")}{T(f"On Full Book and up, add something of yours, like {v['perk_en']}.", f"Desde Agenda Llena, agrega algo tuyo, como {v['perk_es']}.", "p")}</div>
</div>
{rewards_cards()}
<p class="note">{T("Rewards are earned only for completed, paid visits and qualifying referrals. Never for reviews. Not cash or gift cards. Terms apply.", "Los premios se ganan solo por visitas completadas y pagadas y por referidos que califican. Nunca por reseñas. No son efectivo ni tarjetas de regalo. Aplican términos.")} {link}</p>
</div></section>"""


def plan(name, price, setup, for_, feats, promo, hi=False, key=""):
    lis = "".join(f"<li>{CHECK}<span>{T(a, b)}</span></li>" for a, b in feats)
    badge = f'<span class="badge">{T("Recommended", "Recomendado")}</span>' if hi else ""
    s = (f'{T("Setup:", "Instalación:")} <s>${setup}</s> $0' if promo
         else T(f"${setup} one-time setup · waived for pilot businesses", f"${setup} de instalación única · sin costo para negocios piloto"))
    link = CHECKOUT.get(("promo-" if promo else "") + key) or "#claim"
    btn = f'<a class="btn pbtn{" alt" if not hi else ""}" href="{link}">{T("Start with " + name[0].title(), "Empezar con " + name[1].title())}</a>'
    return f"""<div class="plan{' hi' if hi else ''}"><div class="nm">{T(*name)}{badge}</div>
<div class="pr">${price}<span>{T("/month", "/mes")}</span></div><div class="for">{T(*for_)}</div>
<div class="setup">{s}</div><ul>{lis}</ul>{btn}</div>"""


def plans(v, promo):
    care = mode(v) == "care"
    reg_feats = [("Keep your booking app", "Quédate con tu app de reservas"),
                 ("Visit rewards with a QR check-in", "Premios por visita con registro por QR"),
                 ("Complimentary hotel savings cards", "Tarjetas de descuentos en hoteles de cortesía"),
                 ("Referral tracking and automatic referral asks", "Seguimiento de referidos y solicitudes automáticas"),
                 ("Time-to-come-back reminders", "Recordatorios de cuándo volver"),
                 ("100 texts per month", "100 mensajes de texto al mes")]
    if care:
        reg_feats = [("Keep your booking app", "Quédate con tu app de reservas"),
                     ("Time-to-come-back reminders", "Recordatorios de cuándo volver"),
                     ("Review requests after every visit", "Solicitudes de reseña después de cada visita"),
                     ("Rewards off by default", "Premios desactivados de entrada"),
                     ("100 texts per month", "100 mensajes de texto al mes")]
    fb = [("Everything in Regulars", "Todo lo de Clientes Fieles"),
          ("Online booking, reminders and deposits", "Reservas en línea, recordatorios y depósitos"),
          ("Missed-call text-back", "Respuesta por texto a llamadas perdidas")]
    if not care:
        fb += [("Rewards under your business name", "Premios con el nombre de tu negocio"),
               (f"Add a perk of your own, like {v['perk_en']}", f"Agrega un beneficio propio, como {v['perk_es']}"),
               ("Option to add dining &amp; getaway rewards", "Opción de agregar premios de restaurantes y escapadas")]
    fb += [("We move your clients over", "Pasamos tus clientes por ti"), ("300 texts per month", "300 mensajes de texto al mes")]
    ho = [("Everything in Full Book", "Todo lo de Agenda Llena"),
          ("Win-back campaigns", "Campañas para recuperar clientes"),
          ("Done-for-you holiday promos", "Promociones de temporada hechas por nosotros"),
          ("Staff contests", "Concursos para tu equipo"),
          ("Monthly check-in and report", "Revisión y reporte mensual"),
          ("750 texts per month", "750 mensajes de texto al mes")]
    cards = (plan(("REGULARS", "CLIENTES FIELES"), 39, 99, ("Bring clients back", "Haz que vuelvan"), reg_feats, promo, key="regulars")
             + plan(("FULL BOOK", "AGENDA LLENA"), 79, 149, ("Fill the calendar", "Llena tu agenda"), fb, promo, hi=True, key="full-book")
             + plan(("HANDS-OFF", "SIN COMPLICACIONES"), 149, 249, ("Have it run for you", "Que funcione por ti"), ho, promo, key="hands-off"))
    h = ("Pick your plan. Setup is on us.", "Elige tu plan. La instalación corre por nuestra cuenta.") if promo else ("Simple plans. No commission. Ever.", "Planes simples. Sin comisiones. Nunca.")
    extra = ("Extra texts: $10 per 100." , "Mensajes extra: $10 por cada 100.") if care else (
        "Extra texts: $10 per 100. Dining &amp; getaway rewards: +$39/month on Full Book and Hands-Off.",
        "Mensajes extra: $10 por cada 100. Premios de restaurantes y escapadas: +$39/mes en Agenda Llena y Sin Complicaciones.")
    return f"""<section id="plans"><div class="wrap">
{T("Plans", "Planes", "div", "kicker")}{T(*h, "h2")}
<div class="plans">{cards}</div>
{T("No commission on your clients. Ever.", "Nunca cobramos comisión por tus clientes.", "p", "nocomm")}
{T(*extra, "p", "note")}
</div></section>"""


def after():
    O = OFFER
    return f"""<section class="tint"><div class="wrap">
{T("After you sign up", "Después de inscribirte", "div", "kicker")}{T("Live in days, not weeks.", "Funcionando en días, no en semanas.", "h2")}
<div class="after">
<div>{T("Pick a time for your <strong>15-minute kickoff call</strong>.", "Elige un horario para tu <strong>llamada de inicio de 15 minutos</strong>.")}</div>
<div>{T("On the call, we set up your program, your QR code and your first messages together.", "En la llamada configuramos juntos tu programa, tu código QR y tus primeros mensajes.")}</div>
<div>{T(f"You're live in {O['live_days']} days. We handle the rest.", f"En {O['live_days']} días estás funcionando. Del resto nos encargamos nosotros.")}</div>
</div></div></section>"""


# ------------------------------------------------------------------ FAQ data
def faq_owner(v=None):
    O, R = OFFER, REWARDS
    base = [
        ("Do I have to switch booking apps?", "No. Regulars works alongside the one you use now. Full Book adds our booking if you want it, and we move your clients over.",
         "¿Tengo que cambiar mi app de reservas?", "No. Clientes Fieles funciona junto con la que ya usas. Agenda Llena agrega nuestras reservas si las quieres, y pasamos tus clientes por ti."),
        ("Do you take a cut of my bookings?", "Never. One flat monthly price.", "¿Se quedan con un porcentaje de mis citas?", "Nunca. Un solo precio mensual fijo."),
        ("Can my clients get messages in Spanish?", "Yes. Every message comes in English or Spanish.", "¿Mis clientes pueden recibir mensajes en español?", "Sí. Cada mensaje llega en español o en inglés."),
    ]
    if v and mode(v) == "care":
        base += [
            ("Can I offer rewards?", "Visit and referral rewards stay off by default for healthcare-related services, because gifts tied to visits or referrals can break healthcare rules. Cash-pay services that aren't medical treatment may qualify after review. Staff contests are always available.",
             "¿Puedo ofrecer premios?", "Los premios por visitas y referidos están desactivados de entrada para servicios relacionados con la salud, porque los regalos ligados a visitas o referidos pueden ir contra las normas de salud. Los servicios de pago directo que no son tratamientos médicos pueden calificar después de revisarlos. Los concursos para tu equipo siempre están disponibles."),
            ("Do messages include treatment details?", "No. Reminders only say it's time to book, never what the treatment is.",
             "¿Los mensajes incluyen detalles del tratamiento?", "No. Los recordatorios solo dicen que ya toca reservar, nunca de qué tratamiento se trata."),
        ]
    else:
        base += [
            ("How can you offer hotel stays and dining rewards?", "Our rewards partner works with hotels and resorts that have empty rooms on certain dates. Hotels would rather fill a room at a wholesale rate than leave it empty, because guests spend on dining, spa and extras. Restaurants join to bring in new diners. That's why rewards can feel big without costing you big.",
             "¿Cómo pueden ofrecer estadías de hotel y premios de restaurantes?", "Nuestro socio de premios trabaja con hoteles y resorts que tienen habitaciones vacías en ciertas fechas. Prefieren llenarlas a precio de mayorista antes que dejarlas vacías, porque los huéspedes gastan en comida, spa y extras. Los restaurantes participan para atraer comensales nuevos. Por eso los premios se sienten grandes sin costarte mucho."),
            ("What rewards come with each plan?", "Every plan includes complimentary hotel savings cards. On Full Book and Hands-Off you can add a perk of your own, and for $39/month add dining rewards and getaway certificates.",
             "¿Qué premios incluye cada plan?", "Todos los planes incluyen tarjetas de descuentos en hoteles de cortesía. En Agenda Llena y Sin Complicaciones puedes agregar un beneficio propio y, por $39/mes, premios de restaurantes y certificados de escapada."),
            ("Where can clients travel?", f"Getaways cover {R['dest_en']}, {R['nights_en']}. Some resorts are all-inclusive. You can pick the destinations you offer, or let clients choose.",
             "¿A dónde pueden viajar los clientes?", f"Las escapadas incluyen {R['dest_es']}, {R['nights_es']}. Algunos resorts son todo incluido. Puedes elegir los destinos que ofreces o dejar que el cliente escoja."),
            ("Do clients pay anything for a getaway?", f"Yes, and we say so upfront. The stay is complimentary, but the client pays taxes and fees for each night when activating, plus resort fees where they apply. At all-inclusive resorts, the meal-and-drink plan is charged per person. Amounts vary by destination and are shown before they activate. {R['example_en']} Flights are not included. You can choose to cover the taxes and fees as an extra thank-you.",
             "¿El cliente paga algo por una escapada?", f"Sí, y lo decimos desde el principio. La estadía es de cortesía, pero el cliente paga impuestos y cargos por cada noche al activarla, más los cargos del resort cuando apliquen. En resorts todo incluido, el plan de comidas y bebidas se cobra por persona. Los montos varían según el destino y se muestran antes de activar. {R['example_es']} No incluye vuelos. Puedes cubrir los impuestos y cargos como un detalle extra."),
            ("Is this a timeshare pitch?", "No. No purchase or presentation is required to use a reward. The travel partner may offer optional upgrades when guests book, and guests can simply say no.",
             "¿Esto es una venta de tiempo compartido?", "No. Para usar un premio no hay que comprar nada ni asistir a ninguna presentación. El socio de viajes puede ofrecer mejoras opcionales al reservar, y el huésped simplemente puede decir que no."),
            ("What are the main getaway conditions?", "Activate within 7 days of receiving it, then travel within 18 months. Two adults (one 21+), book at least 30 days ahead, major holidays excluded, one getaway per household every 12 months, and guests must live at least 100 miles from the resort. Full terms come with every certificate.",
             "¿Cuáles son las condiciones principales de una escapada?", "Se activa dentro de 7 días después de recibirla y se viaja dentro de 18 meses. Dos adultos (uno mayor de 21), reserva con al menos 30 días de anticipación, sin feriados principales, una escapada por hogar cada 12 meses, y los huéspedes deben vivir a más de 100 millas del resort. Cada certificado incluye sus términos completos."),
            ("Do I have to handle the rewards myself?", "No. Rewards go out automatically by email or text under your business name, with reminders so clients don't miss the activation window. Booking and travel support come from our rewards partner.",
             "¿Tengo que encargarme yo de los premios?", "No. Los premios salen automáticamente por correo o mensaje con el nombre de tu negocio, con recordatorios para que no se pase el plazo de activación. Las reservas y la ayuda de viaje las da nuestro socio de premios."),
            ("Do clients get rewards for leaving reviews?", "No. Rewards are for visits and referrals only. That keeps you within Google's rules.",
             "¿Los clientes reciben premios por dejar reseñas?", "No. Los premios son solo por visitas y referidos. Así cumples con las reglas de Google."),
        ]
    base += [("Is there a contract?", O["contract_en"], "¿Hay contrato?", O["contract_es"])]
    return base


def faq_client():
    R = REWARDS
    return [
        ("Do I have to pay anything?", f"Hotel savings cards: you pay the discounted price of the stay you choose. Dining rewards: a small activation fee, unless the business covers it. Getaways: taxes and fees for each night when you activate, resort fees where they apply, and the meal plan at all-inclusive resorts (charged per person). Amounts vary by destination and you'll see them before activating. {R['example_en']}",
         "¿Tengo que pagar algo?", f"Tarjetas de hoteles: pagas el precio con descuento de la estadía que elijas. Premios de restaurantes: un pequeño cargo de activación, a menos que el negocio lo cubra. Escapadas: impuestos y cargos por cada noche al activar, cargos del resort cuando apliquen y el plan de comidas en resorts todo incluido (se cobra por persona). Los montos varían según el destino y los verás antes de activar. {R['example_es']}"),
        ("Are flights included?", "No. Getaways cover the hotel or resort stay. Flights, transportation and, outside all-inclusive resorts, meals and drinks are on you.",
         "¿Incluye vuelos?", "No. Las escapadas cubren la estadía en el hotel o resort. Los vuelos, el transporte y, fuera de los resorts todo incluido, las comidas y bebidas corren por tu cuenta."),
        ("Do I have to attend a sales presentation?", "No. Nothing to buy and no presentation required. You may be offered optional upgrades when you book; you can say no.",
         "¿Tengo que asistir a una presentación de ventas?", "No. No hay que comprar nada ni asistir a ninguna presentación. Al reservar te pueden ofrecer mejoras opcionales; puedes decir que no."),
        ("How long do I have to use it?", "Activate a getaway within 7 days of receiving it, then travel within 18 months. Book at least 30 days ahead.",
         "¿Cuánto tiempo tengo para usarlo?", "Activa la escapada dentro de 7 días después de recibirla y viaja dentro de 18 meses. Reserva con al menos 30 días de anticipación."),
        ("Can I sell it or trade it for cash?", "No. Rewards can't be sold, traded or exchanged for cash.",
         "¿Lo puedo vender o cambiar por dinero?", "No. Los premios no se pueden vender, intercambiar ni cambiar por efectivo."),
    ]


def faq_section(items, title=("Questions owners ask", "Preguntas frecuentes")):
    body = "".join(f"<details><summary>{T(qe, qs)}</summary><p>{T(ae, as_)}</p></details>" for qe, ae, qs, as_ in items)
    return f'<section id="faq"><div class="wrap">{T(*title, "h2")}<div class="faq">{body}</div></div></section>'


def faq_jsonld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": L(qe, qs), "acceptedAnswer": {"@type": "Answer", "text": L(ae, as_)}} for qe, ae, qs, as_ in items]}


def votel(kind):
    tag = lambda slug: f'<script src="https://ai.clientcontactpro.com/form-embed/v1.js" data-form-id="{slug}" data-transparent="1"></script>'
    f = VOTEL_FORMS[kind]
    if LANG:
        return tag(f[LANG])
    return T(tag(f["en"]), tag(f["es"]), "div")


def start_href():
    return url("/start", "/es/empezar") if LANG else "#claim"


def claim(h, sub):
    if LANG:
        go = f'<a class="btn big" href="{start_href()}">{L("Claim my pilot spot", "Quiero mi lugar")} &rarr;</a>'
        ask = f'<a class="ask" href="{url("/contact", "/es/contacto")}">{L("Have a question first? Contact us", "¿Tienes preguntas? Escríbenos")}</a>'
    else:
        go = T('<a class="btn big" href="/start">Claim my pilot spot &rarr;</a>', '<a class="btn big" href="/es/empezar">Quiero mi lugar &rarr;</a>', "div")
        ask = T('<a class="ask" href="/contact">Have a question first? Contact us</a>', '<a class="ask" href="/es/contacto">¿Tienes preguntas? Escríbenos</a>', "div")
    steps = "".join(f"<li>{T(a, b)}</li>" for a, b in [
        ("Pick a time for a 15-minute Google Meet call.", "Elige un horario para una llamada de 15 minutos por Google Meet."),
        ("Tell us about your business. It takes a minute.", "Cuéntanos sobre tu negocio. Toma un minuto."),
        ("We set everything up. You're live in days.", "Nosotros lo configuramos todo. Estás funcionando en días."),
    ])
    return f"""<section id="claim" style="padding-top:0"><div class="wrap"><div class="claim">
<div>{T(*h, "h2")}{T(*sub, "p", "lead")}</div>
<div class="claimbox"><ol class="csteps">{steps}</ol>{go}{ask}
{T(f'Your information stays private. See our <a href="{url("/privacy", "/es/privacidad")}">Privacy Policy</a> and <a href="{url("/terms", "/es/terminos")}">Terms</a>.', f'Tu información es privada. Lee nuestra <a href="{url("/privacy", "/es/privacidad")}">Política de privacidad</a> y nuestros <a href="{url("/terms", "/es/terminos")}">Términos</a>.', "p", "fine formnote")}</div>
</div></div></section>"""


# Industry card icons: (stroke color, tile background, svg paths)
IND_ICONS = {
    "beauty": ("#BE123C", "#FFE4E6", '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>'),
    "pets-auto": ("#0369A1", "#E0F2FE", '<circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 11c-3 0-6 4.5-6 7a2.5 2.5 0 0 0 3.5 2.3c.8-.4 1.6-.6 2.5-.6s1.7.2 2.5.6A2.5 2.5 0 0 0 18 18c0-2.5-3-7-6-7z"/>'),
    "home": ("#15803D", "#DCFCE7", '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    "family": ("#B45309", "#FEF3C7", '<path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z"/>'),
    "care": ("#6D28D9", "#EDE9FE", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M9 15.5l2 2 4-4"/>'),
    "owners": ("#C2410C", "#FFEFE3", '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M10 21v-4h4v4"/>'),
}


def ind_icon(key):
    c, bg, d = IND_ICONS[key]
    return (f'<span class="iicon" style="background:{bg};color:{c}" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{d}</svg></span>')


def industries():
    blocks = ""
    for gkey, gen, ges in GROUPS:
        items = [v for v in VERTICALS if v["group"] == gkey]
        links = "".join(f'<li><a href="{vurl(v)}">{L(v["ind_en"], v["ind_es"])}<span aria-hidden="true">→</span></a></li>' for v in items)
        blocks += f'<div class="igroup" style="--ic:{IND_ICONS[gkey][0]}"><div class="ihead">{ind_icon(gkey)}{T(gen, ges, "h3")}</div><ul>{links}</ul></div>'
    owner = f'<li><a href="{url("/salon-suite-owner-program", "/es/programa-para-duenos-de-suites-de-salon")}">{L("Salon Suite Owners", "Dueños de Suites de Salón")}<span aria-hidden="true">→</span></a></li>'
    blocks += f'<div class="igroup" style="--ic:{IND_ICONS["owners"][0]}"><div class="ihead">{ind_icon("owners")}{T("Building owners", "Dueños de edificios", "h3")}</div><ul>{owner}</ul></div>'
    return f"""<section id="industries"><div class="wrap">
{T("Industries", "Industrias", "div", "kicker")}
{T("Built for businesses with regulars.", "Hecho para negocios con clientes fieles.", "h2")}
{T("If your clients come back on a cycle and love to recommend you, it fits. Pick your industry to see how it works for you.", "Si tus clientes vuelven cada cierto tiempo y les encanta recomendarte, funciona para ti. Elige tu industria para ver cómo.", "p", "lead")}
<div class="igrid">{blocks}</div>
</div></section>"""


def why(v=None):
    first = ("Fewer no-shows", "Deposits, reminders and missed-call text-back keep your calendar full.", "Menos citas perdidas", "Depósitos, recordatorios y respuesta a llamadas perdidas mantienen tu agenda llena.") if v and mode(v) == "care" else \
        ("Rewards without discounts", "Clients earn hotel, dining and getaway rewards. Your prices stay where they are.", "Premios sin descuentos", "Tus clientes ganan premios de hoteles, restaurantes y escapadas. Tus precios no se tocan.")
    items = [first,
             ("Done for you", "We set everything up on a 15-minute call. No software to learn.", "Hecho por nosotros", "Configuramos todo en una llamada de 15 minutos. Sin programas que aprender."),
             ("English and Spanish", "Every message, reminder and reward reaches clients in the language they prefer.", "Español e inglés", "Cada mensaje, recordatorio y premio le llega a tu cliente en el idioma que prefiere."),
             ("No commission. Ever.", "One flat monthly price. Your clients stay yours.", "Sin comisiones. Nunca.", "Un precio mensual fijo. Tus clientes siguen siendo tuyos.")]
    cards = "".join(f'<div class="get">{T(a, c, "div", "big")}{T(b, d, "p")}</div>' for a, b, c, d in items)
    return f'<section class="tint"><div class="wrap">{T("Why RetainOS", "Por qué RetainOS", "div", "kicker")}{T("More than a punch card.", "Más que una tarjeta de sellos.", "h2")}<div class="gets g4">{cards}</div></div></section>'


# Social profiles: shown in the footer, on /links and in the homepage Organization schema.
# Icons are generic (camera, play button), not the platforms' logos.
SOCIAL = [
    ("Instagram", "https://www.instagram.com/retainos.co/", '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13.5" r="3.5"/>'),
    ("Facebook", "https://www.facebook.com/retainos", '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z"/>'),
    ("YouTube", "https://www.youtube.com/@retainos", '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>'),
]


def social_icon(d, size=20):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>')


def social_row():
    return '<div class="social">' + "".join(
        f'<a href="{u}" target="_blank" rel="noopener" aria-label="RetainOS on {n}">{social_icon(d)}<span>{n}</span></a>' for n, u, d in SOCIAL) + "</div>"


def footer():
    if not LANG:
        return (f'<footer><div class="wrap"><span>© 2026 {legal.COMPANY}. RetainOS</span>'
                + T('<a href="/contact">Contact</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>', '<a href="/es/contacto">Contacto</a> · <a href="/es/privacidad">Privacidad</a> · <a href="/es/terminos">Términos</a>', "span", "flinks")
                + T("Prices and terms subject to confirmation.", "Precios y términos sujetos a confirmación.") + '</div></footer>')
    loyal = [v for v in VERTICALS if mode(v) != "care"]
    care = [v for v in VERTICALS if mode(v) == "care"]
    li = lambda vs: "".join(f'<li><a href="{vurl(v)}">{L(v["ind_en"], v["ind_es"])}</a></li>' for v in vs)
    return f"""<footer class="big"><div class="wrap fcols">
<div><a class="logo" href="{url('/', '/es')}" aria-label="RetainOS">{LOGO_MARK}<span>Retain<b>OS</b></span></a>{T("More regulars. Less chasing.", "Más clientes fieles. Menos persecución.", "p")}{social_row()}</div>
<div>{T("Automated Loyalty &amp; Referral Programs", "Programas automatizados de lealtad y referidos", "h3")}<ul class="two">{li(loyal)}</ul>
{T("Rebooking &amp; Reminder Programs", "Programas de citas y recordatorios", "h3", "", ' style="margin-top:18px"')}<ul>{li(care)}</ul>
{T("For Building Owners", "Para dueños de edificios", "h3", "", ' style="margin-top:18px"')}<ul><li><a href="{url('/salon-suite-owner-program', '/es/programa-para-duenos-de-suites-de-salon')}">{L("Salon Suite Owners", "Dueños de Suites de Salón")}</a></li></ul></div>
<div>{T("Company", "Empresa", "h3")}<ul><li><a href="{url('/rewards', '/es/premios')}">{L("Reward details &amp; terms", "Detalles y términos de premios")}</a></li><li><a href="{url('/#faq', '/es#faq')}">{L("FAQ", "Preguntas frecuentes")}</a></li><li><a href="{url('/learn', '/es/aprende')}">{L("Learning Center", "Centro de aprendizaje")}</a></li><li><a href="{url('/contact', '/es/contacto')}">{L("Contact us", "Contáctanos")}</a></li><li><a href="{url('/privacy', '/es/privacidad')}">{L("Privacy policy", "Política de privacidad")}</a></li><li><a href="{url('/terms', '/es/terminos')}">{L("Terms of service", "Términos del servicio")}</a></li></ul></div>
</div><div class="wrap fbase"><span>© 2026 {legal.COMPANY}. {L("RetainOS is a service of", "RetainOS es un servicio de")} {legal.COMPANY}.</span>{T("Prices and terms subject to confirmation.", "Precios y términos sujetos a confirmación.")}</div></footer>"""


FAB_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'


def end(swap=False, fab=True):
    f = ""
    if fab:
        if LANG:
            f = f'<a class="fab" href="{url("/contact", "/es/contacto")}">{FAB_ICON}<span>{L("Questions?", "¿Preguntas?")}</span></a>'
        else:
            f = T(f'<a class="fab" href="/contact">{FAB_ICON}<span>Questions?</span></a>', f'<a class="fab" href="/es/contacto">{FAB_ICON}<span>¿Preguntas?</span></a>', "div")
    return f + (f"<script>{JS_SWAP}</script>" if swap else "") + "\n</body>\n</html>"


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------
HOME = {"biz": "Rosa Hair Studio", "client": "Maria", "scan_en": "at the front desk", "scan_es": "en la recepción",
        "next_en": "next visit", "next_es": "próxima visita", "timing_en": "few weeks", "timing_es": "pocas semanas",
        "perk_en": "a complimentary add-on service", "perk_es": "un servicio extra de cortesía",
        "msg_en": VERTICALS[0]["msg_en"], "msg_es": VERTICALS[0]["msg_es"]}

CLAIM_H = ("Your regulars already love you. Give them a reason to keep coming back.", "Tus clientes fieles ya te quieren. Dales una razón para seguir volviendo.")
CTA = ("Claim a pilot spot", "Quiero un lugar en el piloto")
FINE = ("Setup fee waived for pilot businesses · English and Spanish", "Sin costo de instalación para negocios piloto · Español e inglés")


def home_page():
    alt = ("/", "/es")
    items = faq_owner()
    ld = [{"@context": "https://schema.org", "@type": "Organization", "name": "RetainOS", "url": DOMAIN,
           "description": L("Automated loyalty and referral program for local service businesses.", "Programa automatizado de lealtad y referidos para negocios de servicios locales."), "sameAs": [u for _, u, _ in SOCIAL]}, faq_jsonld(items)]
    return "".join([
        head("RetainOS | Automated Loyalty & Referral Program for Local Businesses",
             "RetainOS | Programa automatizado de lealtad y referidos para negocios locales",
             "More regulars. Less chasing. Reward clients for coming back and referring friends, without cutting your prices. Done for you, in English and Spanish.",
             "Más clientes fieles. Menos persecución. Premia a tus clientes por volver y recomendarte, sin bajar tus precios. Hecho por nosotros, en español e inglés.",
             alt=alt, jsonld=ld),
        topbar(alt), '<main id="top">',
        hero(HOME, ("Automated Loyalty &amp; Referral Program", "Programa automatizado de lealtad y referidos"), None,
             ("More regulars. Less chasing.", "Más clientes fieles. Menos persecución."),
             ("Reward your regulars without cutting your prices. Clients earn complimentary rewards for coming back and referring friends. We set it up. It runs itself.",
              "Premia a tus clientes fieles sin bajar tus precios. Ganan premios de cortesía por volver y por recomendarte. Nosotros lo configuramos. Funciona solo."), CTA, FINE),
        problem(tint=True), how(HOME, L("home", "es-home")), industries(), gets(HOME), why(), plans(HOME, False), after(), faq_section(items),
        claim(CLAIM_H, ("Pilot spots are open now. Setup fee waived.", "Hay lugares abiertos en el piloto. Sin costo de instalación.")),
        "</main>", footer(), end()])


def vertical_page(v):
    alt = ("/" + v["slug"], "/es/" + v["slug_es"])
    items = faq_owner(v)
    care = mode(v) == "care"
    if care:
        title = (f"{v['seo_en']} Client Rebooking & Reminder Program | RetainOS", f"Programa de citas y recordatorios para {v['ind_es'].lower()} | RetainOS")
        label = (f"Client Rebooking &amp; Reminder Program for {v['ind_en']}", f"Programa de citas y recordatorios para {v['ind_es']}")
        sub = ("Online booking with deposits, timely reminders and honest review requests. We set it up. It runs itself.",
               "Reservas en línea con depósito, recordatorios a tiempo y solicitudes de reseñas honestas. Nosotros lo configuramos. Funciona solo.")
        summary = (f"RetainOS is a client rebooking and reminder program for {v['short_en']}. Clients book online with a deposit, get a text when they're due for their {v['next_en']}, and receive a simple request for an honest review. Missed calls get an instant text back. Visit and referral rewards stay off by default for healthcare-related services. We set everything up for you, in English and Spanish.",
                   f"RetainOS es un programa de citas y recordatorios para {v['short_es']}. Tus clientes reservan en línea con un depósito, reciben un mensaje cuando les toca su {v['next_es']} y una solicitud sencilla para dejar una reseña honesta. Las llamadas perdidas reciben un mensaje al instante. Los premios por visitas y referidos están desactivados de entrada para servicios relacionados con la salud. Nosotros lo configuramos todo, en español e inglés.")
        desc = (f"Client rebooking and reminder program for {v['short_en']}: booking with deposits, reminders and review requests. Done for you, in English and Spanish.",
                f"Programa de citas y recordatorios para {v['short_es']}: reservas con depósito, recordatorios y solicitudes de reseñas. Hecho por nosotros, en español e inglés.")
    else:
        title = (f"{v['seo_en']} Loyalty & Referral Program | RetainOS", f"Programa de lealtad y referidos para {v['ind_es'].lower()} | RetainOS")
        label = (f"Automated Loyalty &amp; Referral Program for {v['ind_en']}", f"Programa automatizado de lealtad y referidos para {v['ind_es']}")
        sub = ("Reward your regulars without cutting your prices. We set it up. It runs itself.",
               "Premia a tus clientes fieles sin bajar tus precios. Nosotros lo configuramos. Funciona solo.")
        who_en = "parents earn" if mode(v) == "family" else "clients earn"
        who_es = "los padres ganan" if mode(v) == "family" else "tus clientes ganan"
        summary = (f"RetainOS is an automated loyalty and referral program for {v['short_en']}. Visits are counted with a quick QR scan, reminders go out when it's time to come back, and {who_en} complimentary rewards, like hotel savings cards, for visits and referrals. Your prices stay the same. We set everything up for you, in English and Spanish.",
                   f"RetainOS es un programa automatizado de lealtad y referidos para {v['short_es']}. Las visitas se registran con un escaneo QR, los recordatorios salen cuando toca volver y {who_es} premios de cortesía, como tarjetas de descuentos en hoteles, por visitas y referidos. Tus precios no cambian. Nosotros lo configuramos todo, en español e inglés.")
        desc = (f"Automated loyalty and referral program for {v['short_en']}. Reward regulars without cutting your prices. Done for you, in English and Spanish.",
                f"Programa automatizado de lealtad y referidos para {v['short_es']}. Premia a tus clientes fieles sin bajar tus precios. Hecho por nosotros, en español e inglés.")
    ld = [{"@context": "https://schema.org", "@type": "Service", "name": L(label[0].replace("&amp;", "&"), label[1]),
           "provider": {"@type": "Organization", "name": "RetainOS", "url": DOMAIN}, "areaServed": "US", "availableLanguage": ["en", "es"]},
          faq_jsonld(items)]
    return "".join([
        head(*title, *desc, alt=alt, jsonld=ld), topbar(alt), '<main id="top">',
        hero(v, label, None, (v["h1_en"], v["h1_es"]), sub, CTA, FINE),
        summary_block(*summary), problem(v), how(v, L(v["slug"], "es-" + v["slug_es"])), gets(v), why(v), plans(v, False), after(), faq_section(items),
        claim(CLAIM_H if not care else ("Your clients already trust you. Make the next visit easy.", "Tus clientes ya confían en ti. Facilita su próxima visita."),
              (f"Pilot spots are open for {v['short_en']}. Setup fee waived.", f"Hay lugares abiertos en el piloto para {v['short_es']}. Sin costo de instalación.")),
        "</main>", footer(), end()])


def rewards_page():
    alt = ("/rewards", "/es/premios")
    R = REWARDS

    def block(title, rows):
        return f'<div class="tbox">{T(*title, "h3")}<ul>' + "".join(f"<li>{T(a, b)}</li>" for a, b in rows) + "</ul></div>"

    howwe = block(("How can a local business offer this?", "¿Cómo puede un negocio local ofrecer esto?"), [
        ("Hotels and resorts have empty rooms on certain dates. Our rewards partner fills them at wholesale rates, because a guest who spends on dining, spa and extras beats an empty room.", "Los hoteles y resorts tienen habitaciones vacías en ciertas fechas. Nuestro socio de premios las llena a precio de mayorista, porque un huésped que gasta en comida, spa y extras vale más que una habitación vacía."),
        ("Restaurants join the dining network to bring in new diners.", "Los restaurantes se unen a la red para atraer comensales nuevos."),
        ("So a business can give rewards that feel generous without discounting its own services.", "Así un negocio puede dar premios que se sienten generosos sin rebajar sus propios servicios."),
    ])
    hotel = block(("Hotel savings cards · every plan", "Tarjetas de descuentos en hoteles · todos los planes"), [
        ("$100, $200, $300 or $500 in credits or discounts on eligible hotel bookings, through our rewards partner's booking site.", "$100, $200, $300 o $500 en créditos o descuentos en reservas de hotel elegibles, en el sitio de reservas de nuestro socio de premios."),
        ("The client pays the discounted price of the stay they choose.", "El cliente paga el precio con descuento de la estadía que elija."),
        ("Not cash, not a gift card, and not a guaranteed saving on any one stay.", "No es efectivo, no es tarjeta de regalo y no garantiza un ahorro específico en una estadía."),
    ])
    dining = block(("Dining rewards · add-on for Full Book and Hands-Off", "Premios de restaurantes · complemento para Agenda Llena y Sin Complicaciones"), [
        ("Discount offers of up to 50% off at more than 100,000 participating restaurants in the US and Canada, local and national, all cuisines.", "Ofertas de hasta 50% de descuento en más de 100,000 restaurantes participantes en EE. UU. y Canadá, locales y nacionales, de todo tipo de comida."),
        ("A \"$100 dining reward\" is a value made up of discount offers. It is not $100 to spend and doesn't pay for a full meal.", "Un \"premio de restaurantes de $100\" es un valor formado por ofertas de descuento. No son $100 para gastar ni cubre una comida completa."),
        ("The client pays a small activation fee, unless the business covers it.", "El cliente paga un pequeño cargo de activación, a menos que el negocio lo cubra."),
    ])
    getaway = block(("Getaway certificates · add-on for Full Book and Hands-Off", "Certificados de escapada · complemento para Agenda Llena y Sin Complicaciones"), [
        (f"Promotional resort and hotel stays in {R['dest_en']}, {R['nights_en']}.", f"Estadías promocionales en resorts y hoteles en {R['dest_es']}, {R['nights_es']}."),
        ("Most stays are room-only. Some destinations, like select resorts in the Dominican Republic, offer all-inclusive stays where the meal-and-drink plan is charged per person.", "La mayoría de las estadías incluyen solo la habitación. Algunos destinos, como ciertos resorts en República Dominicana, ofrecen estadías todo incluido, donde el plan de comidas y bebidas se cobra por persona."),
        (f"<strong>What the client pays:</strong> taxes and fees for each night, paid in US dollars when activating, plus resort fees at check-in where they apply. Amounts vary by destination and are shown before activating. {R['example_en']}", f"<strong>Lo que paga el cliente:</strong> impuestos y cargos por cada noche, pagados en dólares al activar, más los cargos del resort al llegar cuando apliquen. Los montos varían según el destino y se muestran antes de activar. {R['example_es']}"),
        ("Not included: flights and transportation. Outside all-inclusive resorts, meals and drinks aren't included either.", "No incluye: vuelos ni transporte. Fuera de los resorts todo incluido, tampoco incluye comidas ni bebidas."),
        ("Activate within 7 days of receiving the certificate; travel within 18 months of activating.", "Se activa dentro de 7 días después de recibir el certificado; se viaja dentro de 18 meses después de activarlo."),
        ("Two adults, one at least 21. Photo ID and a credit card at check-in; passport for travel outside the US.", "Dos adultos, uno mayor de 21. Identificación con foto y tarjeta de crédito al llegar; pasaporte para viajar fuera de EE. UU."),
        ("Book at least 30 days ahead. Major holidays excluded. Subject to availability.", "Reserva con al menos 30 días de anticipación. Sin feriados principales. Sujeto a disponibilidad."),
        ("One getaway per household every 12 months; each destination once per household. Guests must live at least 100 miles from the resort. No group travel.", "Una escapada por hogar cada 12 meses; cada destino una sola vez por hogar. Los huéspedes deben vivir a más de 100 millas del resort. No se permiten viajes en grupo."),
        ("No purchase or presentation is required. The travel partner may offer optional upgrades; guests can say no.", "No hay que comprar nada ni asistir a presentaciones. El socio de viajes puede ofrecer mejoras opcionales; el huésped puede decir que no."),
        ("Businesses can choose to cover the taxes and fees as an extra thank-you.", "El negocio puede cubrir los impuestos y cargos como un detalle extra."),
    ])
    general = block(("For every reward", "Para todos los premios"), [
        ("Earned only for completed, paid visits and qualifying referrals, as set by the business. Never for reviews.", "Se ganan solo por visitas completadas y pagadas y por referidos que califican, según lo defina el negocio. Nunca por reseñas."),
        ("Healthcare-related services: visit and referral rewards stay off by default.", "Servicios relacionados con la salud: los premios por visitas y referidos están desactivados de entrada."),
        ("Fulfilled by a third-party rewards partner. RetainOS is not a travel agency and doesn't own hotels or restaurants.", "Los entrega un socio de premios externo. RetainOS no es una agencia de viajes ni es dueño de hoteles o restaurantes."),
        ("Rewards can't be sold, traded or exchanged for cash. Full terms come with every reward.", "Los premios no se pueden vender, intercambiar ni cambiar por efectivo. Cada premio incluye sus términos completos."),
    ])
    citems = faq_client()
    return "".join([
        head("Reward Details, Terms & How It Works | RetainOS", "Detalles, términos y cómo funcionan los premios | RetainOS",
             "What clients get and what they pay: hotel savings cards, dining rewards and getaway certificates, including all-inclusive resorts.",
             "Qué reciben y qué pagan tus clientes: tarjetas de descuentos en hoteles, premios de restaurantes y certificados de escapada, incluidos resorts todo incluido.",
             alt=alt, jsonld=faq_jsonld(citems)),
        topbar(alt, nav=False), '<main id="top"><section><div class="wrap">',
        T("Rewards", "Premios", "div", "kicker"), T("Reward details and terms", "Detalles y términos de los premios", "h1", "h1-sm"),
        T("Exactly what clients get, what they pay, and how it's possible. No surprises.", "Exactamente lo que reciben tus clientes, lo que pagan y cómo es posible. Sin sorpresas.", "p", "lead"),
        rewards_cards(), howwe, hotel, dining, getaway, general,
        T("Destinations, amounts and terms are set by our rewards partner and can change. The terms included with each reward are final.", "Los destinos, montos y términos los define nuestro socio de premios y pueden cambiar. Los términos incluidos con cada premio son los que aplican.", "p", "note"),
        "</div></section>", faq_section(citems, ("Questions clients ask", "Preguntas de los clientes")), "</main>", footer(), end()])


def legal_body(sections):
    out = []
    for h_en, h_es, paras in sections:
        out.append(T(h_en, h_es, "h2"))
        items, plain = [], []
        for en, es in paras:
            if en.startswith("• "):
                items.append(f"<li>{T(en[2:], es[2:])}</li>")
            else:
                if items:
                    out.append("<ul>" + "".join(items) + "</ul>"); items = []
                out.append(T(en, es, "p"))
        if items:
            out.append("<ul>" + "".join(items) + "</ul>")
    return "".join(out)


def legal_page(kind):
    if kind == "privacy":
        alt, sections = ("/privacy", "/es/privacidad"), legal.PRIVACY
        h = ("Privacy Policy", "Política de privacidad")
        title = ("Privacy Policy | RetainOS", "Política de privacidad | RetainOS")
        desc = ("How RetainOS collects, uses and protects information, including text messaging.", "Cómo RetainOS recopila, usa y protege la información, incluidos los mensajes de texto.")
    else:
        alt, sections = ("/terms", "/es/terminos"), legal.TERMS
        h = ("Terms of Service", "Términos del servicio")
        title = ("Terms of Service | RetainOS", "Términos del servicio | RetainOS")
        desc = ("Terms for using retainos.co and RetainOS services, including our text message program.", "Términos para usar retainos.co y los servicios de RetainOS, incluido nuestro programa de mensajes de texto.")
    other = ("/terms", "/es/terminos") if kind == "privacy" else ("/privacy", "/es/privacidad")
    other_l = ("Terms of Service", "Términos del servicio") if kind == "privacy" else ("Privacy Policy", "Política de privacidad")
    return "".join([
        head(*title, *desc, alt=alt), topbar(alt, nav=False), '<main id="top"><section><div class="wrap legal">',
        T("Legal", "Legal", "div", "kicker"), T(*h, "h1", "h1-sm"),
        T(f"Last updated: {legal.UPDATED_EN}", f"Última actualización: {legal.UPDATED_ES}", "p", "fine"),
        legal_body(sections),
        T("Questions", "Preguntas", "h2"),
        T(f'Send us a message through our <a href="/contact">contact page</a> or call {legal.COMPANY} at <a href="tel:{legal.PHONE_TEL}">{legal.PHONE}</a>. Mail: {legal.COMPANY}, {legal.ADDRESS}. See also our <a href="{other[0]}">{other_l[0]}</a>.',
          f'Escríbenos a través de nuestra <a href="/es/contacto">página de contacto</a> o llama a {legal.COMPANY} al <a href="tel:{legal.PHONE_TEL}">{legal.PHONE}</a>. Correo postal: {legal.COMPANY}, {legal.ADDRESS}. Consulta también nuestra página de <a href="{other[1]}">{other_l[1]}</a>.', "p"),
        "</div></section></main>", footer(), end()])


def start_page():
    alt = ("/start", "/es/empezar")
    slug = BOOKING[LANG]
    return "".join([
        head("Claim Your Pilot Spot | RetainOS", "Reserva tu lugar en el piloto | RetainOS",
             "Pick a time for a 15-minute kickoff call and claim your RetainOS pilot spot. Setup fee waived.",
             "Elige un horario para tu llamada de 15 minutos y reserva tu lugar en el piloto de RetainOS. Sin costo de instalación.", alt=alt),
        topbar(alt, nav=False), '<main id="top"><section><div class="wrap startp">',
        T("Pilot sign-up", "Inscripción al piloto", "div", "kicker"), T("Claim your pilot spot", "Reserva tu lugar en el piloto", "h1", "h1-sm"),
        T("Pick a time for a quick 15-minute Google Meet, then add your details. That's it. Setup fee waived.",
          "Elige un horario para una llamada rápida de 15 minutos por Google Meet y luego agrega tus datos. Eso es todo. Sin costo de instalación.", "p", "lead"),
        f'<div class="bookbox"><div id="booking-widget" data-slug="{slug}" data-mode="inline" data-api-url="https://ai.clientcontactpro.com"></div></div>',
        '<script type="module" src="https://ai.clientcontactpro.com/booking-widget/booking.js"></script>',
        T(f'Have a question first? <a href="/contact">Contact us</a>. Your information stays private: <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms</a>.',
          f'¿Tienes preguntas? <a href="/es/contacto">Escríbenos</a>. Tu información es privada: <a href="/es/privacidad">Política de privacidad</a> · <a href="/es/terminos">Términos</a>.', "p", "note"),
        "</div></section></main>", footer(), end()])


def contact_page():
    alt = ("/contact", "/es/contacto")
    return "".join([
        head("Contact Us | RetainOS", "Contáctanos | RetainOS",
             "Questions about RetainOS, your program or your information? Send us a message.",
             "¿Preguntas sobre RetainOS, tu programa o tu información? Envíanos un mensaje.", alt=alt),
        topbar(alt, nav=False), '<main id="top"><section><div class="wrap contact">',
        T("Contact", "Contacto", "div", "kicker"), T("Get in touch", "Escríbenos", "h1", "h1-sm"),
        T("Questions about RetainOS, your program or your information? Send us a message and we'll get back to you.",
          "¿Preguntas sobre RetainOS, tu programa o tu información? Envíanos un mensaje y te responderemos.", "p", "lead"),
        T(f'Prefer to call? <a href="tel:{legal.PHONE_TEL}">{legal.PHONE}</a>', f'¿Prefieres llamar? <a href="tel:{legal.PHONE_TEL}">{legal.PHONE}</a>', "p", "phoneline"),
        '<div class="embed light live">' + votel("contact") + '</div>',
        '<div class="tbox">', T("Already getting our texts?", "¿Ya recibes nuestros mensajes?", "h3"), "<ul>",
        f'<li>{T("Reply <strong>STOP</strong> to stop messages, or <strong>HELP</strong> for help.", "Responde <strong>STOP</strong> para dejar de recibir mensajes, o <strong>HELP</strong> para pedir ayuda.")}</li>',
        f'<li>{T("Questions about a reward? The terms that came with it explain how to use it. You can also ask the business that gave it to you.", "¿Preguntas sobre un premio? Los términos que venían con él explican cómo usarlo. También puedes preguntarle al negocio que te lo dio.")}</li>',
        f'<li>{T(f"To see, correct or delete your information, send us a message here.", "Para ver, corregir o borrar tu información, envíanos un mensaje aquí.")}</li>',
        "</ul></div>",
        T(f'{legal.COMPANY} · {legal.ADDRESS} · Phone: <a href="tel:{legal.PHONE_TEL}">{legal.PHONE}</a> · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms</a>', f'{legal.COMPANY} · {legal.ADDRESS} · Teléfono: <a href="tel:{legal.PHONE_TEL}">{legal.PHONE}</a> · <a href="/es/privacidad">Política de privacidad</a> · <a href="/es/terminos">Términos</a>', "p", "note"),
        "</div></section></main>", footer(), end(fab=False)])


def promo_page(v):
    O = OFFER
    items = faq_owner(v)
    return "".join([
        head(f"Automated Loyalty & Referral Program for {v['ind_en']} | RetainOS", f"Programa automatizado de lealtad y referidos para {v['ind_es']} | RetainOS",
             "Reward your regulars without cutting your prices. Founding offer: $0 setup.", "Premia a tus clientes fieles sin bajar tus precios. Oferta de fundadores: sin costo de instalación.", noindex=True),
        topbar(None, nav=False), '<main id="top">',
        hero(v, ("Automated Loyalty &amp; Referral Program for " + v["ind_en"], "Programa automatizado de lealtad y referidos para " + v["ind_es"]),
             ("Founding offer: $0 setup", "Oferta de fundadores: sin costo de instalación"), (v["h1_en"], v["h1_es"]),
             ("Reward your regulars without cutting your prices. We set it up. It runs itself.", "Premia a tus clientes fieles sin bajar tus precios. Nosotros lo configuramos. Funciona solo."),
             ("Claim my spot. No setup fee.", "Quiero mi lugar. Sin costo de instalación."),
             (f"Founding offer for the first {O['spots']} {v['short_en']} · Ends {O['end_en']}", f"Oferta para los primeros {O['spots']} {v['short_es']} · Termina el {O['end_es']}")),
        problem(tint=True), how(v, "go-" + v["promo"]), gets(v), plans(v, True), after(), faq_section(items),
        claim(CLAIM_H, (f"{O['spots']} founding spots for {v['short_en']} · $0 setup · Ends {O['end_en']}", f"{O['spots']} lugares para {v['short_es']} · Sin costo de instalación · Termina el {O['end_es']}")),
        "</main>", footer(), end(swap=True)])


def links_page():
    alt = ("/links", "/es/enlaces")
    rows = [
        (start_href(), ("Claim a pilot spot", "Quiero un lugar en el piloto"), True),
        (url("/#how", "/es#how"), ("See how it works", "Mira cómo funciona"), False),
        (url("/#industries", "/es#industries"), ("Find your industry", "Encuentra tu industria"), False),
        (url("/salon-suite-owner-program", "/es/programa-para-duenos-de-suites-de-salon"), ("For salon suite owners", "Para dueños de suites de salón"), False),
        (url("/learn", "/es/aprende"), ("Learning Center", "Centro de aprendizaje"), False),
        (url("/rewards", "/es/premios"), ("Reward details", "Detalles de los premios"), False),
        (url("/contact", "/es/contacto"), ("Contact us", "Contáctanos"), False),
    ]
    btns = "".join(f'<a class="btn{"" if hi else " alt"}" href="{u}">{L(*lab)}</a>' for u, lab, hi in rows)
    soc = "".join(f'<a class="btn alt" href="{u}" target="_blank" rel="noopener">{social_icon(d)}<span>{n}</span></a>' for n, u, d in SOCIAL)
    other = f'<a class="lswitch" href="{url("/es/enlaces", "/links")}">{L("Ver en español", "View in English")}</a>'
    return "".join([
        head("RetainOS | Links", "RetainOS | Enlaces",
             "More regulars. Less chasing. Automated loyalty and referral program for local businesses, in English and Spanish.",
             "Más clientes fieles. Menos persecución. Programa automatizado de lealtad y referidos para negocios locales, en español e inglés.",
             noindex=True, alt=alt),
        '<main id="top" class="linksp"><div class="lwrap">',
        f'<a class="logo" href="{url("/", "/es")}" aria-label="RetainOS">{LOGO_MARK}<span>Retain<b>OS</b></span></a>',
        T("More regulars. Less chasing.", "Más clientes fieles. Menos persecución.", "h1"),
        T("Automated loyalty and referral program for local businesses. English and Spanish.", "Programa automatizado de lealtad y referidos para negocios locales. Español e inglés.", "p", "lead"),
        f'<div class="lbtns">{btns}</div>', f'<div class="lsoc">{soc}</div>', other,
        "</div></main>", end(fab=False)])


def write(rel, content):
    p = os.path.join(HERE, "site", rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    global LANG
    urls = []
    for lang in ("en", "es"):
        LANG = lang
        pre = "" if lang == "en" else "es/"
        write(pre + "index.html", home_page()); urls.append("/" if lang == "en" else "/es")
        for v in VERTICALS:
            slug = v["slug"] if lang == "en" else v["slug_es"]
            write(pre + slug + ".html", vertical_page(v)); urls.append("/" + pre + slug)
        rp = "rewards" if lang == "en" else "premios"
        write(pre + rp + ".html", rewards_page()); urls.append("/" + pre + rp)
        for kind, en_s, es_s in (("privacy", "privacy", "privacidad"), ("terms", "terms", "terminos")):
            sl = en_s if lang == "en" else es_s
            write(pre + sl + ".html", legal_page(kind)); urls.append("/" + pre + sl)
        st = "start" if lang == "en" else "empezar"
        write(pre + st + ".html", start_page()); urls.append("/" + pre + st)
        import suites
        ss = suites.SLUG if lang == "en" else suites.SLUG_ES
        write(pre + ss + ".html", suites.page(sys.modules[__name__])); urls.append("/" + pre + ss)
        write(pre + ("links" if lang == "en" else "enlaces") + ".html", links_page())
        cs = "contact" if lang == "en" else "contacto"
        write(pre + cs + ".html", contact_page()); urls.append("/" + pre + cs)
    LANG = None
    for v in VERTICALS:
        if v.get("promo"):
            write(f"go/{v['promo']}/index.html", promo_page(v))
    import learn
    urls += learn.build(sys.modules[__name__])
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
          + "".join(f"<url><loc>{DOMAIN}{u}</loc></url>" for u in urls) + "</urlset>")
    write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {DOMAIN}/sitemap.xml\n")
    import shutil
    os.makedirs(os.path.join(HERE, "site", "media"), exist_ok=True)
    for src, dst in [("reels/retainos-full-picture-explainer-v2.mp4", "media/retainos-full-picture-explainer.mp4"), ("reels/retainos-explainer-poster.jpg", "media/retainos-explainer-poster.jpg")]:
        if os.path.exists(os.path.join(HERE, src)):
            shutil.copy(os.path.join(HERE, src), os.path.join(HERE, "site", dst))
    for src, dst in [("brand/svg-loop/favicon.svg", "favicon.svg"), ("brand/apple-touch-icon.png", "apple-touch-icon.png"), ("brand/og-image.png", "og-image.png")]:
        shutil.copy(os.path.join(HERE, src), os.path.join(HERE, "site", dst))
    print(f"built {len(urls)} public pages + {sum(1 for v in VERTICALS if v.get('promo'))} promo pages")


if __name__ == "__main__":
    main()
