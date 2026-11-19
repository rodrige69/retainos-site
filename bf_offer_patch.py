#!/usr/bin/env python3
"""Add the Black Friday offer block (video + offer stack + countdown + CTA) to the
hair and braiding salon pages. Idempotent: skips a page that already has id="blackfriday".
Run from the repo root:  python3 bf_offer_patch.py
Same caveat as bf_trial_patch.py: build.py does not know this block, so re-running
build.py would drop it. Re-run this script afterwards.
Deadline: Dec 1, 2026 11:59:59 PM ET (EST, UTC-5) = 2026-12-02T04:59:59Z."""
import re, sys

CHECK = ('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" '
         'stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
         '<path d="M5 12l5 5 9-10"></path></svg>')

CSS = """
#blackfriday{background:var(--dark);color:#F3F1EC;padding:56px 0}
#blackfriday .bfgrid{display:grid;grid-template-columns:1.1fr .9fr;gap:36px;align-items:center}
#blackfriday .bfk{display:inline-block;background:#FFD60A;color:#111;font-weight:800;font-size:13px;letter-spacing:.6px;text-transform:uppercase;border-radius:999px;padding:6px 14px;margin-bottom:16px}
#blackfriday h2{color:#fff;margin:0 0 12px}
#blackfriday .bflead{color:#E4E1DA;font-size:18px;margin:0 0 20px}
#blackfriday video{width:100%;border-radius:18px;background:#000;display:block;aspect-ratio:16/9;object-fit:cover}
#blackfriday ul.bfl{list-style:none;margin:0 0 20px;padding:0;display:grid;gap:12px}
#blackfriday ul.bfl li{display:flex;gap:12px;align-items:flex-start;font-size:17px;color:#F3F1EC}
#blackfriday ul.bfl svg{flex:none;margin-top:3px}
#blackfriday .bfcount{display:flex;gap:10px;margin:0 0 20px;align-items:stretch}
#blackfriday .bfcount div{background:var(--dark2);border:1px solid #3a3e45;border-radius:12px;padding:10px 6px;min-width:64px;text-align:center}
#blackfriday .bfcount b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:28px;line-height:1.1;color:#FFD60A}
#blackfriday .bfcount span{font-size:12px;color:#C9C6BF;text-transform:uppercase;letter-spacing:.5px}
#blackfriday .bfends{color:#C9C6BF;font-size:14px;margin:-8px 0 20px}
#blackfriday .btn{background:#FFD60A;color:#111;width:100%}
#blackfriday .btn:hover{background:#fff;color:#111}
#blackfriday .bfalt{display:block;text-align:center;margin-top:14px;color:#fff;font-weight:700}
#blackfriday .bffine{color:#C9C6BF;font-size:13.5px;margin:16px 0 0}
@media (max-width:920px){#blackfriday .bfgrid{grid-template-columns:1fr}#blackfriday{padding:40px 0}}
"""

JS = """<script>(function(){var end=Date.UTC(2026,11,2,4,59,59);var s=document.getElementById('blackfriday');if(!s)return;
function p(n){return n<10?'0'+n:''+n}
function tick(){var t=end-Date.now();if(t<=0){s.style.display='none';var b=document.querySelector('.bfbar');if(b)b.style.display='none';return false}
var d=Math.floor(t/864e5),h=Math.floor(t%864e5/36e5),m=Math.floor(t%36e5/6e4),x=Math.floor(t%6e4/1e3);
var e=s.querySelector('[data-bf]');if(e){e.querySelector('[data-d]').textContent=d;e.querySelector('[data-h]').textContent=p(h);e.querySelector('[data-m]').textContent=p(m);e.querySelector('[data-s]').textContent=p(x)}return true}
if(tick()){setInterval(tick,1000)}})();</script>"""

PAGES = {
 "site/hair-salon-loyalty-program.html": dict(
  anchor='<section class="tint"><div class="wrap"><div class="kicker">In short</div>',
  hero_old='<a class="btn" href="#come-back"><span>Start with Come Back · $39/month</span></a>',
  hero_new='<a class="btn" href="#blackfriday"><span>Claim the Black Friday offer</span></a>',
  video="/media/retainos-explainer-salon-blackfriday.mp4",
  poster="/media/retainos-explainer-salon-blackfriday-poster.jpg",
  primary="https://retainos-come-back-11112220-cb257563.b-cdn.net/offer",
  alt="https://retainos-booked-solid-11112244-70f50fe0.b-cdn.net/offer",
  t=dict(
   kicker="Black Friday · Ends December 1",
   h2="Get your salon's rewards program running with $0 setup.",
   lead="Watch how RetainOS brings your regulars back, then start your 7-day complimentary trial.",
   aria="RetainOS Black Friday explainer video for salons",
   bullets=["<strong>$99 setup fee waived</strong> on Come Back and Booked Solid. We set everything up for you.",
            "<strong>7-day complimentary trial.</strong> Your card is not charged until day 8.",
            "<strong>Cancel online any time before day 8</strong> and you will not be charged. After that, month to month.",
            "<strong>No commission</strong>, and your prices stay the same."],
   d="days", h="hours", m="min", s="sec",
   ends="Offer ends December 1 at 11:59 PM ET.",
   cta="Start my 7-day trial · Come Back $39/mo",
   altcta="Want more? See Booked Solid · $79/mo &rarr;",
   fine="Setup fee waived through December 1 on Come Back and Booked Solid. After the 7-day complimentary trial, billed monthly until you cancel. Terms &amp; Conditions apply."),
 ),
 "site/es/programa-de-lealtad-para-salones.html": dict(
  anchor='<section class="tint"><div class="wrap"><div class="kicker">En resumen</div>',
  hero_old='<a class="btn" href="#come-back"><span>Empieza con Regresa · $39 al mes</span></a>',
  hero_new='<a class="btn" href="#blackfriday"><span>Aprovecha la oferta de Black Friday</span></a>',
  video="/media/retainos-explainer-salon-blackfriday-es.mp4",
  poster="/media/retainos-explainer-salon-blackfriday-es-poster.jpg",
  primary="https://retainos-regresa-es-11112333-8fa98bda.b-cdn.net/offer",
  alt="https://retainos-agenda-llena-es-11112333-df31b1c4.b-cdn.net/offer",
  t=dict(
   kicker="Black Friday · Termina el 1 de diciembre",
   h2="Activa el programa de recompensas de tu salón sin costo de instalación.",
   lead="Mira cómo RetainOS hace que tus clientas y clientes vuelvan, y empieza tu prueba sin costo de 7 días.",
   aria="Video explicativo de Black Friday de RetainOS para salones",
   bullets=["<strong>Sin costo de instalación ($99)</strong> en Regresa y Agenda Llena. Nosotros configuramos todo por ti.",
            "<strong>7 días de prueba sin costo.</strong> No se cobra tu tarjeta hasta el día 8.",
            "<strong>Cancela en línea antes del día 8</strong> y no se te cobra. Después, mes a mes.",
            "<strong>Sin comisiones</strong>, y tus precios no cambian."],
   d="días", h="horas", m="min", s="seg",
   ends="La oferta termina el 1 de diciembre a las 11:59 PM (hora del Este).",
   cta="Empezar mi prueba de 7 días · Regresa $39/mes",
   altcta="¿Quieres más? Mira Agenda Llena · $79/mes &rarr;",
   fine="Sin costo de instalación hasta el 1 de diciembre en Regresa y Agenda Llena. Después de la prueba sin costo de 7 días, se cobra cada mes hasta que canceles. Aplican los Términos y Condiciones."),
 ),
}

# Braiding salon pages: same offer block, same videos, hero button repointed.
import copy
for src, dst, old, new in [
 ("site/hair-salon-loyalty-program.html", "site/braiding-salon-loyalty-program.html",
  '<a class="btn" href="#plans"><span>Claim your spot</span></a>',
  '<a class="btn" href="#blackfriday"><span>Claim the Black Friday offer</span></a>'),
 ("site/es/programa-de-lealtad-para-salones.html", "site/es/programa-de-lealtad-para-salones-de-trenzas.html",
  '<a class="btn" href="#plans"><span>Reserva tu lugar</span></a>',
  '<a class="btn" href="#blackfriday"><span>Aprovecha la oferta de Black Friday</span></a>'),
]:
    PAGES[dst] = dict(copy.deepcopy(PAGES[src]), hero_old=old, hero_new=new)

def block(c):
    t = c["t"]
    lis = "".join(f"<li>{CHECK}<span>{b}</span></li>" for b in t["bullets"])
    return (
f'<section id="blackfriday"><div class="wrap bfgrid">'
f'<div><video controls playsinline preload="metadata" poster="{c["poster"]}" aria-label="{t["aria"]}">'
f'<source src="{c["video"]}" type="video/mp4"></video></div>'
f'<div><span class="bfk">{t["kicker"]}</span><h2>{t["h2"]}</h2><p class="bflead">{t["lead"]}</p>'
f'<ul class="bfl">{lis}</ul>'
f'<div class="bfcount" data-bf aria-hidden="true"><div><b data-d>0</b><span>{t["d"]}</span></div>'
f'<div><b data-h>00</b><span>{t["h"]}</span></div><div><b data-m>00</b><span>{t["m"]}</span></div>'
f'<div><b data-s>00</b><span>{t["s"]}</span></div></div>'
f'<p class="bfends">{t["ends"]}</p>'
f'<a class="btn big" href="{c["primary"]}">{t["cta"]}</a>'
f'<a class="bfalt" href="{c["alt"]}">{t["altcta"]}</a>'
f'<p class="bffine">{t["fine"]}</p></div></div></section>')

for path, c in PAGES.items():
    html = open(path, encoding="utf-8").read()
    if 'id="blackfriday"' in html:
        print("skip (already patched):", path); continue
    for k in ("anchor", "hero_old"):
        if html.count(c[k]) != 1:
            sys.exit(f"{path}: expected exactly one match for {k}, found {html.count(c[k])}")
    html = html.replace(c["hero_old"], c["hero_new"])
    html = html.replace(c["anchor"], block(c) + c["anchor"])
    i = html.rfind("</style>")
    html = html[:i] + CSS + html[i:]
    html = html.replace("</body>", JS + "</body>", 1)
    open(path, "w", encoding="utf-8").write(html)
    print("patched:", path)
