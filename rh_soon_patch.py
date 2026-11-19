"""Right Hand / Mano Derecha: replace buy button with a 'Coming soon' label (idempotent). Remove once launched."""
import glob, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
ST = ('display:block;text-align:center;padding:14px 18px;border-radius:12px;border:2px dashed #9aa0a6;'
      'color:#9aa0a6;font-weight:700;cursor:default')
pat = re.compile(r'<a class="btn pbtn" href="https://retainos-(?:right-hand|mano-derecha-es)-[^"]+">([^<]*)</a>')
n = 0
for f in glob.glob(os.path.join(HERE, "site", "**", "*.html"), recursive=True):
    h = open(f, encoding="utf-8").read()
    if "data-rh-soon" in h or not pat.search(h):
        continue
    es = "/es/" in f.replace("\\", "/")
    label = "Próximamente" if es else "Coming soon"
    h = pat.sub(f'<span class="btn pbtn" data-rh-soon style="{ST}">{label}</span>', h)
    h = re.sub(r'(<div class="addbuy"><div class="pr">.*?</div>)<div class="trial">[^<]*</div>', r'\1', h, flags=re.S)
    open(f, "w", encoding="utf-8").write(h); n += 1
print("rh_soon patched", n)
