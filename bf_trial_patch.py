import glob, re, sys
EN_OLD = "BLACK FRIDAY SPECIAL: Skip the $99 setup fee on Come Back and Booked Solid. Grab it while it lasts!"
EN_NEW = "BLACK FRIDAY SPECIAL: Skip the $99 setup fee on Come Back and Booked Solid. Ends December 1. Every plan starts with a 7-day complimentary trial."
ES_OLD = "BLACK FRIDAY: Sin costo de instalación ($99) en Regresa y Agenda Llena. ¡Aprovéchalo mientras dure!"
ES_NEW = "BLACK FRIDAY: Sin costo de instalación ($99) en Regresa y Agenda Llena. Termina el 1 de diciembre. Todos los planes inician con 7 días de prueba sin costo."
NOTE_EN_OLD = "Black Friday: setup fees waived on Come Back and Booked Solid."
NOTE_EN_NEW = "Black Friday: setup fees waived on Come Back and Booked Solid. Offer ends December 1."
NOTE_ES_OLD = "Black Friday: sin costo de instalación en Regresa y Agenda Llena."
NOTE_ES_NEW = "Black Friday: sin costo de instalación en Regresa y Agenda Llena. La oferta termina el 1 de diciembre."
CLAIM_EN = "Setup fee waived for Black Friday."
CLAIM_EN_NEW = "Setup fee waived for Black Friday (ends December 1). 7-day complimentary trial."
CLAIM_ES = "Sin costo de instalación por Black Friday."
CLAIM_ES_NEW = "Sin costo de instalación por Black Friday (hasta el 1 de diciembre). 7 días de prueba sin costo."
# trial line under each plan price (not Day Off / call plans)
PR_RE = re.compile(r'<div class="pr">\$(?:39|79|49)<span>.*?</span></div>')
TRIAL_BI = '<div class="trial"><span class="en" lang="en">7-day complimentary trial</span><span class="es" lang="es">7 días de prueba sin costo</span></div>'
TRIAL_EN='<div class="trial">7-day complimentary trial</div>'
TRIAL_ES='<div class="trial">7 días de prueba sin costo</div>'
CSS = ".trial{font-weight:700;font-size:14px;color:var(--accent-dk);margin:2px 0 6px}"
n=0
for f in glob.glob("site/**/*.html", recursive=True):
    s = open(f, encoding="utf-8").read(); o = s
    for a,b in [(EN_OLD,EN_NEW),(ES_OLD,ES_NEW),(NOTE_EN_OLD+"<",NOTE_EN_NEW+"<"),(NOTE_ES_OLD+"<",NOTE_ES_NEW+"<"),(CLAIM_EN,CLAIM_EN_NEW),(CLAIM_ES,CLAIM_ES_NEW)]:
        if b not in s: s = s.replace(a,b)
    if 'class="trial"' not in s:
        s = PR_RE.sub(lambda m: m.group(0)+(TRIAL_BI if 'class="en"' in m.group(0) else (TRIAL_ES if f.replace(chr(92),'/').startswith('site/es/') else TRIAL_EN)), s)
        if '.trial{' not in s: s = s.replace("</style>", CSS+"</style>",1)
    if s != o: open(f,"w",encoding="utf-8").write(s); n+=1
print("patched", n)
