#!/usr/bin/env python3
"""Generates RetainOS logo directions as SVG (text converted to outlines).
Font: Bricolage Grotesque ExtraBold (OFL), read from FONT_PATH.
"""
import math, os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT_PATH = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "svg")
os.makedirs(OUT, exist_ok=True)

ORANGE = "#C2410C"      # brand orange (passes contrast on cream and white)
ORANGE_DK = "#F97316"   # brighter orange for dark backgrounds
INK = "#17191C"
WHITE = "#FFFFFF"

font = TTFont(FONT_PATH)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font["head"].unitsPerEm
hmtx = font["hmtx"]
CAP = font["OS/2"].sCapHeight or 700


def text_path(s, x, baseline, cap_px, tracking=-0.01):
    """Return (svg path d, advance width in px) for string s."""
    scale = cap_px / CAP
    d, cx = [], x
    for ch in s:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        tp = TransformPen(pen, (scale, 0, 0, -scale, cx, baseline))
        gs[g].draw(tp)
        d.append(pen.getCommands())
        cx += hmtx[g][0] * scale + tracking * cap_px * 10
    return " ".join(d), cx - x


# ---------------------------------------------------------------- marks
def loop_mark(color, dot=True, cx=50, cy=50, r=30, sw=12, start=-60, end=200):
    """Comeback loop: an almost-closed circle with an arrowhead, around a dot (the client)."""
    a1, a2 = math.radians(start), math.radians(end)
    p1 = (cx + r * math.cos(a1), cy + r * math.sin(a1))
    p2 = (cx + r * math.cos(a2), cy + r * math.sin(a2))
    d = (-math.sin(a2), math.cos(a2))          # clockwise tangent at the end
    n = (math.cos(a2), math.sin(a2))  # radial direction, perpendicular to the tangent
    tip = (p2[0] + 13 * d[0], p2[1] + 13 * d[1])
    base = (p2[0] - 3 * d[0], p2[1] - 3 * d[1])
    b1 = (base[0] + 11 * n[0], base[1] + 11 * n[1])
    b2 = (base[0] - 11 * n[0], base[1] - 11 * n[1])
    arc = f'<path d="M{p1[0]:.2f} {p1[1]:.2f} A{r} {r} 0 1 1 {p2[0]:.2f} {p2[1]:.2f}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>'
    head = f'<path d="M{tip[0]:.2f} {tip[1]:.2f} L{b1[0]:.2f} {b1[1]:.2f} L{b2[0]:.2f} {b2[1]:.2f} Z" fill="{color}" stroke="{color}" stroke-width="3" stroke-linejoin="round"/>'
    dotc = f'<circle cx="{cx}" cy="{cy}" r="{r * 0.3:.1f}" fill="{color}"/>' if dot else ""
    return arc + head + dotc


def r_mark(color, accent):
    """Loop R: the bowl of the R is an arrow that curves back toward the stem."""
    sw = 14
    return (f'<path d="M28 86 V16 H42" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="M42 16 H52 A21 21 0 0 1 52 58 H52" fill="none" stroke="{accent}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="M37 58 L55 43 L55 73 Z" fill="{accent}" stroke="{accent}" stroke-width="3" stroke-linejoin="round"/>'
            f'<path d="M58 66 L74 86" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>')


def svg(w, h, body, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>'


def wordmark(x, baseline, cap, ink, accent):
    d1, w1 = text_path("Retain", x, baseline, cap)
    d2, w2 = text_path("OS", x + w1 + cap * 0.02, baseline, cap)
    return f'<path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{accent}"/>', w1 + w2 + cap * 0.02


def wordmark_loopO(x, baseline, cap, ink, accent):
    """'Retain' + loop-as-O + 'S'."""
    d1, w1 = text_path("Retain", x, baseline, cap)
    o_size = cap * 1.06
    ox = x + w1 + cap * 0.05
    scale = o_size / 74.0  # loop spans 13..87 in its 100 box (r=30, stroke 14)
    gx = ox - 13 * scale
    gy = baseline - cap / 2 - 50 * scale
    loop = f'<g transform="translate({gx:.2f} {gy:.2f}) scale({scale:.4f})">{loop_mark(accent, dot=False, sw=14, start=-40, end=250)}</g>'
    d3, w3 = text_path("S", ox + o_size + cap * 0.04, baseline, cap)
    total = (ox + o_size + cap * 0.04 + w3) - x
    return f'<path d="{d1}" fill="{ink}"/>{loop}<path d="{d3}" fill="{accent}"/>', total


def lockup(mark_body, ink, accent, title, loopO=False):
    cap = 50
    if loopO:
        wm, ww = wordmark_loopO(0, 75, cap, ink, accent)
        return svg(int(ww) + 4, 100, wm, title)
    wm, ww = wordmark(122, 75, cap, ink, accent)
    return svg(int(122 + ww) + 4, 100, f'<g>{mark_body}</g>{wm}', title)


def app_icon(mark_body, bg, title):
    return svg(100, 100, f'<rect width="100" height="100" rx="22" fill="{bg}"/><g transform="translate(14 14) scale(.72)">{mark_body}</g>', title)


files = {
    # Direction 1: Comeback Loop
    "1-loop-logo.svg": lockup(loop_mark(ORANGE), INK, ORANGE, "RetainOS"),
    "1-loop-logo-dark.svg": lockup(loop_mark(ORANGE_DK), WHITE, ORANGE_DK, "RetainOS"),
    "1-loop-mark.svg": svg(100, 100, loop_mark(ORANGE), "RetainOS mark"),
    "1-loop-app-icon.svg": app_icon(loop_mark(WHITE), ORANGE, "RetainOS icon"),
    # Direction 2: Loop R
    "2-loop-r-logo.svg": lockup(r_mark(INK, ORANGE), INK, ORANGE, "RetainOS"),
    "2-loop-r-logo-dark.svg": lockup(r_mark(WHITE, ORANGE_DK), WHITE, ORANGE_DK, "RetainOS"),
    "2-loop-r-mark.svg": svg(100, 100, r_mark(INK, ORANGE), "RetainOS mark"),
    "2-loop-r-app-icon.svg": app_icon(r_mark(WHITE, "#FFD3B5"), ORANGE, "RetainOS icon"),
    # Direction 3: Loop in the wordmark
    "3-wordmark-logo.svg": lockup(None, INK, ORANGE, "RetainOS", loopO=True),
    "3-wordmark-logo-dark.svg": lockup(None, WHITE, ORANGE_DK, "RetainOS", loopO=True),
    "3-wordmark-app-icon.svg": app_icon(loop_mark(WHITE, dot=False, sw=14, start=-40, end=250), ORANGE, "RetainOS icon"),
}
for name, content in files.items():
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)
print("wrote", len(files), "files to", OUT)
