#!/usr/bin/env python3
"""Three refined Comeback Loop variants + test sheet.
usage: python3 make_loop_variants.py <font-files-dir>
"""
import math, os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTDIR = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "svg-loop")
os.makedirs(OUT, exist_ok=True)

ORANGE, ORANGE_DK, INK, WHITE = "#C2410C", "#F97316", "#17191C", "#FFFFFF"
FONTS = {}


def font(w):
    if w not in FONTS:
        f = TTFont(os.path.join(FONTDIR, f"bricolage-grotesque-latin-{w}-normal.woff"))
        FONTS[w] = (f, f.getGlyphSet(), f.getBestCmap(), f["hmtx"], f["OS/2"].sCapHeight or 700)
    return FONTS[w]


def text_path(s, x, baseline, cap_px, weight=800, tracking=0.0):
    f, gs, cmap, hmtx, CAP = font(weight)
    sc, d, cx = cap_px / CAP, [], x
    for ch in s:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (sc, 0, 0, -sc, cx, baseline)))
        d.append(pen.getCommands())
        cx += hmtx[g][0] * sc + tracking * cap_px
    return " ".join(d), cx - x


def pt(a, r=30, c=50):
    return (c + r * math.cos(math.radians(a)), c + r * math.sin(math.radians(a)))


def arc(a1, a2, color, sw, cap="round", r=30):
    p1, p2 = pt(a1, r), pt(a2, r)
    large = 1 if (a2 - a1) % 360 > 180 else 0
    return f'<path d="M{p1[0]:.2f} {p1[1]:.2f} A{r} {r} 0 {large} 1 {p2[0]:.2f} {p2[1]:.2f}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="{cap}"/>'


def arrow(a, color, L, W, style="fill", sw=0, r=30, join="round"):
    p = pt(a, r)
    t = (-math.sin(math.radians(a)), math.cos(math.radians(a)))   # clockwise tangent
    n = (math.cos(math.radians(a)), math.sin(math.radians(a)))    # radial
    tip = (p[0] + L * t[0], p[1] + L * t[1])
    b1 = (p[0] + W * n[0], p[1] + W * n[1])
    b2 = (p[0] - W * n[0], p[1] - W * n[1])
    if style == "chevron":
        return f'<path d="M{b1[0]:.2f} {b1[1]:.2f} L{tip[0]:.2f} {tip[1]:.2f} L{b2[0]:.2f} {b2[1]:.2f}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
    return f'<path d="M{tip[0]:.2f} {tip[1]:.2f} L{b1[0]:.2f} {b1[1]:.2f} L{b2[0]:.2f} {b2[1]:.2f} Z" fill="{color}" stroke="{color}" stroke-width="2.5" stroke-linejoin="{join}"/>'


# ---------------------------------------------------------------- the three variants
def mark_friendly(c, c2=None):
    """A · Friendly 'Orbit': the client (dot) sits on the ring; the path goes all the way around and comes back to it."""
    c2 = c2 or c
    return arc(-12, 262, c, 13) + arrow(262, c, 15, 12) + f'<circle cx="{pt(-40)[0]:.2f}" cy="{pt(-40)[1]:.2f}" r="11" fill="{c2}"/>'


def mark_premium(c, c2=None):
    """B · Premium 'Fine loop': thinner line, open chevron, small center dot."""
    c2 = c2 or c
    return arc(-50, 248, c, 7) + arrow(254, c, 9, 9, "chevron", 7) + f'<circle cx="50" cy="50" r="7" fill="{c2}"/>'


def mark_tech(c, c2=None):
    """C · Tech 'Cut loop': flat-cut ends, sharp arrow, square-ish rhythm."""
    c2 = c2 or c
    return arc(-40, 232, c, 14, "butt") + arrow(232, c, 17, 15, join="miter") + f'<rect x="42" y="42" width="16" height="16" rx="3" fill="{c2}"/>'


def favicon_mark(c):
    """Simplified for 16-32px: thick ring with a gap and a dot. No arrowhead detail."""
    return arc(-12, 268, c, 18) + f'<circle cx="{pt(-40)[0]:.2f}" cy="{pt(-40)[1]:.2f}" r="12" fill="{c}"/>'


VARIANTS = [
    ("a-friendly", "A · Friendly (Orbit)", mark_friendly, 800, -0.01),
    ("b-premium", "B · Premium (Fine loop)", mark_premium, 600, 0.02),
    ("c-tech", "C · Tech (Cut loop)", mark_tech, 700, 0.0),
]


def svg(w, h, body, title="RetainOS"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>'


def lockup(mark, weight, track, ink, accent, mark_color=None, dot_color=None):
    cap = 48
    d1, w1 = text_path("Retain", 124, 74, cap, weight, track)
    d2, w2 = text_path("OS", 124 + w1 + cap * 0.02, 74, cap, weight, track)
    body = f'<g>{mark(mark_color or accent, dot_color)}</g><path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{accent}"/>'
    return svg(int(124 + w1 + w2 + cap * 0.02) + 4, 100, body)


def tile(mark_body, bg, rx=22):
    return svg(100, 100, f'<rect width="100" height="100" rx="{rx}" fill="{bg}"/><g transform="translate(15 15) scale(.7)">{mark_body}</g>', "RetainOS icon")


files = {}
for key, title, mark, w, tr in VARIANTS:
    files[f"{key}-logo.svg"] = lockup(mark, w, tr, INK, ORANGE)
    files[f"{key}-logo-dark.svg"] = lockup(mark, w, tr, WHITE, ORANGE_DK)
    files[f"{key}-logo-black.svg"] = lockup(mark, w, tr, INK, INK)
    files[f"{key}-logo-white.svg"] = lockup(mark, w, tr, WHITE, WHITE)
    files[f"{key}-mark.svg"] = svg(100, 100, mark(ORANGE))
    files[f"{key}-icon.svg"] = tile(mark(WHITE), ORANGE)
files["favicon.svg"] = tile(favicon_mark(WHITE), ORANGE, 24)
for n, c in files.items():
    open(os.path.join(OUT, n), "w").write(c)

# ---------------------------------------------------------------- test sheet
def im(f, h, extra=""):
    return f'<img src="svg-loop/{f}" style="height:{h}px;display:block;{extra}" alt="">'


rows = ""
for key, title, *_ in VARIANTS:
    rows += f'''<section><h2>{title}</h2><div class="row">
<div class="card cream big">{im(key + "-logo.svg", 78)}<span>Primary · website</span></div>
<div class="card dark big">{im(key + "-logo-dark.svg", 78)}<span class="l">On dark</span></div>
<div class="card white">{im(key + "-logo-black.svg", 34)}<div style="background:#17191C;padding:10px;border-radius:10px">{im(key + "-logo-white.svg", 34)}</div><span>One color · black / white</span></div>
<div class="card cream"><div class="avatar">{im(key + "-icon.svg", 112, "border-radius:50%")}</div><span>Instagram avatar</span></div>
<div class="card video"><div class="wm">{im(key + "-logo-white.svg", 26, "opacity:.75")}</div><span class="l">Video watermark</span></div>
<div class="card cream">{im(key + "-logo.svg", 28)}<div style="display:flex;gap:12px;align-items:center;margin-top:8px">{im(key + "-icon.svg", 32)}{im(key + "-icon.svg", 16)}{im("favicon.svg", 32)}{im("favicon.svg", 16)}</div><span>Header · favicon (detailed / simplified)</span></div>
</div></section>'''

html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;padding:32px;background:#ECEAE4;font-family:system-ui,sans-serif;color:#17191C;width:1640px}}
h1{{margin:0 0 4px;font-size:28px}} p{{margin:0 0 18px;color:#575C63}} h2{{font-size:18px;margin:22px 0 10px}}
.row{{display:grid;grid-template-columns:1.6fr 1.6fr 1.1fr .8fr 1.1fr 1fr;gap:12px}}
.card{{border-radius:16px;padding:20px;display:flex;flex-direction:column;justify-content:center;gap:10px;min-height:170px;position:relative}}
.cream{{background:#F6F5F1;border:1px solid #E3E1DB}} .dark{{background:#17191C}} .white{{background:#fff;border:1px solid #E3E1DB}}
.video{{background:linear-gradient(135deg,#3a2f2a,#7a5a48 45%,#c69c7d);justify-content:flex-end;align-items:flex-end}}
.wm{{position:absolute;right:16px;bottom:34px}}
.card span{{font-size:12px;color:#575C63}} .card span.l{{color:#E4E1DA}}
</style></head><body><h1>Comeback Loop · three refinements</h1><p>Each one breaks the "refresh button" look a different way. Same orange everywhere: #C2410C on light, #F97316 on dark.</p>{rows}</body></html>'''
open(os.path.join(HERE, "loop-variants.html"), "w").write(html)
print("wrote", len(files), "svgs + loop-variants.html")
