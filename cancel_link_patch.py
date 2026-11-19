"""Add the Stripe customer-portal 'Manage or cancel' link to the footer and the Black Friday block (idempotent)."""
import glob, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
PORTAL = "https://billing.stripe.com/p/login/fZu9AT2fKeRY1BzbwydEs00"
n = 0
for f in glob.glob(os.path.join(HERE, "site", "**", "*.html"), recursive=True):
    h = o = open(f, encoding="utf-8").read()
    es = "/es/" in f.replace("\\", "/")
    if PORTAL not in h:
        lab = "Administrar o cancelar suscripción" if es else "Manage or cancel subscription"
        li = f'<li><a href="{PORTAL}" rel="noopener">{lab}</a></li>'
        # footer Company list: put before the Privacy policy item
        h = re.sub(r'(<li><a href="/(?:es/privacidad|privacy)">)', li + r'\1', h, count=1)
    a = f'<a href="{PORTAL}" rel="noopener">Cancel online</a>'
    h = h.replace("<strong>Cancel online any time before day 8</strong>", f"<strong>{a} any time before day 8</strong>")
    b = f'<a href="{PORTAL}" rel="noopener">Cancela en línea</a>'
    h = h.replace("<strong>Cancela en línea antes del día 8</strong>", f"<strong>{b} antes del día 8</strong>")
    if h != o:
        open(f, "w", encoding="utf-8").write(h); n += 1
print("cancel link patched", n)
