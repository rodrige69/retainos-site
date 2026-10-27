import os
S = "svg/"
def img(f, h): return f'<img src="{S}{f}" style="height:{h}px;display:block">'
rows = ""
for n, title in [("1-loop", "1 · Comeback Loop"), ("2-loop-r", "2 · Loop R"), ("3-wordmark", "3 · Loop in the name")]:
    logo, dark, icon = f"{n}-logo.svg", f"{n}-logo-dark.svg", f"{n}-app-icon.svg"
    rows += f'''<section><h2>{title}</h2><div class="row">
<div class="card cream">{img(logo,90)}</div>
<div class="card dark">{img(dark,90)}</div>
<div class="card white small"><div style="display:flex;gap:18px;align-items:center">{img(icon,96)}{img(icon,48)}{img(icon,32)}{img(icon,16)}</div><span>app / favicon sizes</span></div>
<div class="card cream mini">{img(logo,28)}<span>site header size</span></div>
</div></section>'''
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;padding:36px;background:#ECEAE4;font-family:system-ui,sans-serif;color:#17191C}}
h1{{margin:0 0 6px;font-size:28px}} p{{margin:0 0 24px;color:#575C63}}
h2{{font-size:18px;margin:26px 0 10px}}
.row{{display:grid;grid-template-columns:1.25fr 1.25fr 1fr .9fr;gap:14px}}
.card{{border-radius:16px;padding:26px;display:flex;flex-direction:column;justify-content:center;gap:10px;min-height:150px}}
.cream{{background:#F6F5F1;border:1px solid #E3E1DB}} .dark{{background:#17191C}} .white{{background:#fff;border:1px solid #E3E1DB}}
.card span{{font-size:12px;color:#575C63}}
</style></head><body><h1>RetainOS logo directions · warm orange</h1><p>Flat vector, works in one color, on light and dark, and down to a 16px browser icon.</p>{rows}</body></html>'''
open("logo-directions.html","w").write(html)
