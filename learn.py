"""RetainOS Learning Center (/learn). Articles live in content/learn/<slug>.md (English).
Edit ARTICLES below for order, category, image and dates, then run build.py.
Images: Unsplash License (free commercial use); credit shown under each image.
"""
import html, json, os, re

PUBLISHED = "2026-10-27"   # first publication date (set to the day the article goes live on retainos.co)
UTM = "?utm_source=retainos&utm_medium=referral"

ARTICLES = [
    {"slug": "get-repeat-customers-without-discounts", "cat": "Repeat customers",
     "img": "photo-1593702275687-f8b402bf1fb5", "alt": "Barber trimming a client's hair in a barbershop",
     "by": "Michael DeMoya", "by_url": "https://unsplash.com/@demoya", "photo_url": "https://unsplash.com/photos/Q82AM6BWBPM",
     "related": ["small-business-loyalty-programs", "bring-back-salon-clients", "experience-based-loyalty-rewards"]},
    {"slug": "small-business-loyalty-programs", "cat": "Loyalty programs",
     "img": "photo-1632345031435-8727f6897d53", "alt": "Nail technician giving a client a manicure at a nail salon",
     "by": "Giorgio Trovato", "by_url": "https://unsplash.com/@giorgiotrovato", "photo_url": "https://unsplash.com/photos/gb6gtiTZKB8",
     "related": ["get-repeat-customers-without-discounts", "automated-customer-rewards", "customer-retention-rate"]},
    {"slug": "salon-barbershop-referral-program", "cat": "Referrals",
     "img": "photo-1653762381632-2945469edb7b", "alt": "Two friends talking over drinks at a café table",
     "by": "Brooke Cagle", "by_url": "https://unsplash.com/@brookecagle", "photo_url": "https://unsplash.com/photos/uzxx6p4CHdQ",
     "related": ["small-business-loyalty-programs", "experience-based-loyalty-rewards", "automated-customer-rewards"]},
    {"slug": "bring-back-salon-clients", "cat": "Repeat customers",
     "img": "photo-1580618672591-eb180b1a973f", "alt": "Hairstylist blow-drying a client's hair in a salon",
     "by": "Adam Winger", "by_url": "https://unsplash.com/@awcreativeut", "photo_url": "https://unsplash.com/photos/FkAZqQJTbXM",
     "related": ["get-repeat-customers-without-discounts", "salon-barbershop-referral-program", "customer-retention-rate"]},
    {"slug": "experience-based-loyalty-rewards", "cat": "Rewards",
     "img": "photo-1540541338287-41700207dee6", "alt": "Resort swimming pool overlooking the ocean",
     "by": "Paolo Nicolello", "by_url": "https://unsplash.com/@paul_nic", "photo_url": "https://unsplash.com/photos/2gOxKj594nM",
     "related": ["small-business-loyalty-programs", "automated-customer-rewards", "salon-barbershop-referral-program"]},
    {"slug": "customer-retention-rate", "cat": "Measurement",
     "img": "photo-1753351052277-a7ff634f0bd5", "alt": "Two small business owners smiling behind their shop counter",
     "by": "Vitaly Gariev", "by_url": "https://unsplash.com/@silverkblack", "photo_url": "https://unsplash.com/photos/C0yfUl0YXuI",
     "related": ["bring-back-salon-clients", "small-business-loyalty-programs", "automated-customer-rewards"]},
    {"slug": "automated-customer-rewards", "cat": "Rewards",
     "img": "photo-1753164597612-5e71b83fda91", "alt": "Shop owner on the phone while working on a laptop",
     "by": "Vitaly Gariev", "by_url": "https://unsplash.com/@silverkblack", "photo_url": "https://unsplash.com/photos/kk4J92iaSBk",
     "related": ["experience-based-loyalty-rewards", "customer-retention-rate", "salon-barbershop-referral-program"]},
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


def load(a):
    t = open(os.path.join(HERE, "content", "learn", a["slug"] + ".md"), encoding="utf-8").read()
    fm, body = re.match(r"---\n(.*?)\n---\n(.*)", t, re.S).groups()
    meta = dict(re.findall(r'^(\w+): "(.*)"$', fm, re.M))
    body = re.sub(r"^# .*\n", "", body.strip() + "\n", count=1)
    a.update(meta)
    a["body"] = body
    a["words"] = len(re.findall(r"\w+", body))
    a["mins"] = max(3, round(a["words"] / 220))
    return a


def render_body(body):
    """Returns (intro_html, short_answer_html, sections[(id, title, html)], faq[(q, a)])."""
    blocks = re.split(r"\n(?=## )", "\n" + body)
    intro, short, sections, faq = [], "", [], []
    def paras(txt):
        out, lst = [], []
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
                if chunk.startswith("**Short answer:**"):
                    short = inline(chunk.replace("**Short answer:**", "").strip())
                else:
                    intro.append(chunk)
            continue
        title, rest = (b[3:].split("\n", 1) + [""])[:2]
        if title.startswith("Frequently Asked Questions"):
            for q in re.split(r"\n(?=### )", "\n" + rest.strip()):
                q = q.strip()
                if q.startswith("### "):
                    qq, aa = (q[4:].split("\n", 1) + [""])[:2]
                    faq.append((inline(qq.strip()), paras(aa)))
            continue
        cls = "example" if "Illustrative" in title else ""
        sections.append((slugify(title), inline(title), paras(rest), cls))
    return paras("\n\n".join(intro)), short, sections, faq


FITS = """<div class="fitbox">
<div class="kicker">How RetainOS fits</div>
<h2 id="how-retainos-fits">Loyalty and referrals, done for you</h2>
<p>RetainOS is an automated loyalty and referral program for local service businesses. Clients check in with a quick QR scan that your team confirms, get a friendly reminder when they're due back, and earn complimentary rewards. By default, that's a $100 hotel savings card after 5 visits, and one for both people when a referred friend completes a first paid visit. Your prices stay the same. We set everything up for you, in English and Spanish.</p>
<p class="fine">Rewards are never given for reviews. For healthcare-related services such as med spas, visit and referral rewards stay off by default.</p>
<div class="ctas"><a class="btn" href="/start">Claim a pilot spot</a><a class="btn alt" href="/#how">See how it works</a></div>
<p class="fine"><a href="/#plans">Plans and pricing</a> · <a href="/rewards">Reward details and terms</a></p>
</div>"""

DISCLOSE = """<aside class="disclose" aria-label="Disclosures">
<h2 id="disclosures">Disclosures</h2>
<p><strong>Examples are hypothetical.</strong> Names, amounts, calculations and messages in this article are illustrative, not industry benchmarks or RetainOS results. No improvement in repeat visits, referrals or revenue is guaranteed.</p>
<p><strong>Rewards.</strong> Hotel savings cards are discounts or credits on eligible bookings, not cash, a gift card or a prepaid stay. Dining rewards are discount offers at participating restaurants and may carry an activation fee. Getaway certificates can involve taxes, nightly or resort fees, meal plans at some properties, and travel costs. Each reward's written terms apply. <a href="/rewards">Full reward details</a>.</p>
<p><strong>Messages.</strong> Send marketing texts and emails only to people who agreed to receive them, and honor opt-outs (STOP) right away. This article is general information, not legal advice.</p>
</aside>"""


def header(b):
    return (f'<header class="wrap top"><a class="logo" href="/" aria-label="RetainOS">{b.LOGO_MARK}<span>Retain<b>OS</b></span></a>'
            '<div class="topr"><div class="nav"><a href="/learn">Learning Center</a><a href="/#how">How it works</a><a href="/#plans">Plans</a></div>'
            '<a class="btn sm" href="/start">Claim a pilot spot</a></div></header>')


def card(a, big=False):
    return (f'<a class="lcard{" big" if big else ""}" href="/learn/{a["slug"]}">'
            f'<img src="{img_url(a, 900 if big else 600)}" alt="{html.escape(a["alt"])}" loading="lazy" width="{900 if big else 600}" height="{600 if big else 400}">'
            f'<div class="lc"><span class="tag">{a["cat"]}</span><h3>{html.escape(a["title"])}</h3>'
            f'<p>{html.escape(a["meta_description"])}</p><span class="rt">{a["mins"]} min read</span></div></a>')


def article_page(b, a, by_slug):
    intro, short, sections, faq = render_body(a["body"])
    url = f"{b.DOMAIN}/learn/{a['slug']}"
    toc_items = [(sid, t) for sid, t, _, _ in sections] + ([("faq", "Frequently asked questions")] if faq else []) + [("how-retainos-fits", "How RetainOS fits")]
    toc = "".join(f'<li><a href="#{sid}">{t}</a></li>' for sid, t in toc_items)
    body = "".join(f'<section class="{cls}" aria-labelledby="{sid}"><h2 id="{sid}">{t}</h2>{h}</section>' if cls else f'<h2 id="{sid}">{t}</h2>{h}' for sid, t, h, cls in sections)
    faqh = ""
    if faq:
        faqh = '<h2 id="faq">Frequently asked questions</h2><div class="faqv">' + "".join(f"<h3>{q}</h3>{ans}" for q, ans in faq) + "</div>"
    rel = "".join(card(by_slug[s]) for s in a["related"])
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "headline": a["title"], "description": a["meta_description"],
         "image": [img_url(a, 1200)], "datePublished": PUBLISHED, "dateModified": PUBLISHED,
         "author": {"@type": "Organization", "name": "RetainOS", "url": b.DOMAIN + "/"},
         "publisher": {"@type": "Organization", "name": "RetainOS", "url": b.DOMAIN + "/", "logo": {"@type": "ImageObject", "url": b.DOMAIN + "/apple-touch-icon.png"}},
         "mainEntityOfPage": {"@type": "WebPage", "@id": url}, "inLanguage": "en-US", "articleSection": a["cat"], "wordCount": a["words"]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": b.DOMAIN + "/"},
            {"@type": "ListItem", "position": 2, "name": "Learning Center", "item": b.DOMAIN + "/learn"},
            {"@type": "ListItem", "position": 3, "name": a["title"], "item": url}]}]}
    pretty = "October 27, 2026" if PUBLISHED == "2026-10-27" else PUBLISHED
    h = b.head(a["seo_title"], a["seo_title"], a["meta_description"], a["meta_description"], jsonld=ld)
    h = h.replace("</head>", f'<link rel="canonical" href="{url}"><meta property="og:url" content="{url}"><meta property="og:type" content="article"><meta property="article:published_time" content="{PUBLISHED}"></head>', 1)
    h = h.replace('<meta property="og:type" content="website">', '', 1)
    h = h.replace(f'content="{b.DOMAIN}/og-image.png"', f'content="{img_url(a, 1200)}"', 1)
    return "".join([h, header(b), '<main id="top"><article class="wrap post">',
        f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span>›</span> <a href="/learn">Learning Center</a> <span>›</span> <span aria-current="page">{html.escape(a["title"])}</span></nav>',
        f'<div class="phead"><span class="tag">{a["cat"]}</span><h1>{html.escape(a["title"])}</h1>',
        f'<p class="pmeta">By RetainOS · <time datetime="{PUBLISHED}">Updated {pretty}</time> · {a["mins"]} min read</p></div>',
        f'<figure class="hero-img"><img src="{img_url(a, 1400)}" alt="{html.escape(a["alt"])}" width="1400" height="788" fetchpriority="high">'
        f'<figcaption>Photo by <a href="{a["by_url"]}{UTM}" rel="nofollow">{a["by"]}</a> on <a href="{a["photo_url"]}{UTM}" rel="nofollow">Unsplash</a></figcaption></figure>',
        '<div class="pgrid"><aside class="toc"><details open><summary>On this page</summary><ol>' + toc + '</ol></details></aside><div class="prose">',
        f'<div class="quick"><div class="kicker">Quick answer</div><p>{short}</p></div>' if short else "",
        intro, body, faqh, FITS, DISCLOSE, "</div></div>",
        f'<section class="related"><h2>Keep reading</h2><div class="lgrid">{rel}</div></section>',
        "</article></main>", '<script>if(matchMedia("(max-width:920px)").matches){var d=document.querySelector(".toc details");if(d)d.removeAttribute("open")}</script>', b.footer(), b.end()])


def index_page(b, arts):
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "name": "RetainOS Learning Center", "url": b.DOMAIN + "/learn",
         "description": "Practical guides on repeat customers, loyalty programs, referrals and rewards for local service businesses.",
         "hasPart": [{"@type": "BlogPosting", "headline": a["title"], "url": f"{b.DOMAIN}/learn/{a['slug']}"} for a in arts]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": b.DOMAIN + "/"},
            {"@type": "ListItem", "position": 2, "name": "Learning Center", "item": b.DOMAIN + "/learn"}]}]}
    title = "Learning Center: Loyalty, Referrals & Repeat Customers | RetainOS"
    desc = "Practical, plain-English guides for local service businesses on repeat customers, loyalty programs, referrals, rewards and retention."
    h = b.head(title, title, desc, desc, jsonld=ld).replace("</head>", f'<link rel="canonical" href="{b.DOMAIN}/learn"></head>', 1)
    cats = []
    for a in arts:
        if a["cat"] not in cats:
            cats.append(a["cat"])
    chips = '<button class="chip on" data-f="all">All guides</button>' + "".join(f'<button class="chip" data-f="{slugify(c)}">{c}</button>' for c in cats)
    grid = "".join(card(a).replace('<a class="lcard"', f'<a class="lcard{" isfeat" if i == 0 else ""}" data-cat="{slugify(a["cat"])}"', 1) for i, a in enumerate(arts))
    groups = f'<section class="lsec"><h2 id="guides">All guides</h2><div class="lgrid" id="lgrid">{grid}</div></section>'
    js = ("<script>(function(){var bs=document.querySelectorAll('.chip[data-f]'),cs=document.querySelectorAll('#lgrid .lcard'),ft=document.querySelector('.featured');"
          "bs.forEach(function(b){b.addEventListener('click',function(){var f=b.getAttribute('data-f');bs.forEach(function(x){x.classList.toggle('on',x===b)});"
          "if(ft)ft.style.display=f==='all'?'':'none';cs.forEach(function(c){var show=f==='all'?!c.classList.contains('isfeat'):c.getAttribute('data-cat')===f;c.style.display=show?'flex':'none'})})})})();</script>")
    return "".join([h, header(b), '<main id="top"><div class="wrap learn">',
        '<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span>›</span> <span aria-current="page">Learning Center</span></nav>',
        '<div class="kicker">Learning Center</div><h1 class="h1-sm">More regulars. Less chasing.</h1>',
        f'<p class="lead">{desc} No hype, no made-up results. Just what works and how to measure it.</p>',
        f'<div class="chips">{chips}</div>',
        f'<div class="featured">{card(arts[0], big=True)}</div>', groups, js,
        '<div class="fitbox"><h2>Want this done for you?</h2><p>RetainOS sets up visit rewards, referrals and reminders for your business, in English and Spanish, without cutting your prices.</p><div class="ctas"><a class="btn" href="/start">Claim a pilot spot</a><a class="btn alt" href="/#how">See how it works</a></div></div>',
        "</div></main>", b.footer(), b.end()])


def build(b):
    b.LANG = "en"
    arts = [load(dict(a)) for a in ARTICLES]
    by = {a["slug"]: a for a in arts}
    for a in arts:
        b.write(f"learn/{a['slug']}.html", article_page(b, a, by))
    b.write("learn/index.html", index_page(b, arts))
    b.LANG = None
    return ["/learn"] + [f"/learn/{a['slug']}" for a in arts]
