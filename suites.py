"""Salon suite owners page (B2B): /salon-suite-owner-program and /es/programa-para-duenos-de-suites-de-salon.

The buyer is the building owner or manager, not the stylist. Three plays:
lease-signing reward, renter-refers-renter, renewal reward, plus RetainOS as an amenity in every suite.
Pricing is per building and still to be confirmed, so the page asks for a quote instead of showing numbers.
"""

SLUG, SLUG_ES = "salon-suite-owner-program", "programa-para-duenos-de-suites-de-salon"
IND = ("Salon Suite Owners", "Dueños de Suites de Salón")
BIZ = "Palm Row Salon Suites"


def faq_items():
    return [
        ("Who is this for?", "Owners and managers of salon suite buildings, booth-rental salons and beauty co-working spaces. You're the customer. Your renters get RetainOS for their own clients as a perk of leasing with you.",
         "¿Para quién es esto?", "Para dueños y administradores de edificios de suites de salón, salones que rentan cabinas y espacios de trabajo compartido de belleza. Tú eres el cliente. Tus inquilinos reciben RetainOS para sus propios clientes como beneficio por rentar contigo."),
        ("Why not just offer a month of free rent?", "A month of free rent costs you a full month of income on every lease, and it teaches renters to shop for the next deal. A complimentary getaway or hotel savings card feels bigger to the renter and costs you far less than a month's rent. You can still use concessions; this gives you another option.",
         "¿Por qué no ofrecer un mes sin pagar renta?", "Un mes sin renta te cuesta un mes completo de ingresos en cada contrato y le enseña al inquilino a buscar la próxima oferta. Una escapada o una tarjeta de descuentos en hoteles de cortesía se siente más grande para el inquilino y te cuesta mucho menos que un mes de renta. Igual puedes dar concesiones; esto te da otra opción."),
        ("When is a lease reward earned?", "After the lease is signed and the first payment clears. For renewals, after the renewal is signed. For renter referrals, after the referred pro signs and pays. You set the exact rules, and we put them in writing.",
         "¿Cuándo se gana un premio por contrato?", "Después de firmar el contrato y de que se acredite el primer pago. En renovaciones, después de firmar la renovación. En referidos entre inquilinos, después de que la persona referida firme y pague. Tú defines las reglas exactas y nosotros las ponemos por escrito."),
        ("Do my renters have to use the loyalty program?", "No. It's a perk, not a requirement. Renters who use it get visit rewards, referral tracking and reminders for their own clients, under their own business name.",
         "¿Mis inquilinos tienen que usar el programa de lealtad?", "No. Es un beneficio, no una obligación. Quien lo usa recibe premios por visitas, seguimiento de referidos y recordatorios para sus propios clientes, con el nombre de su propio negocio."),
        ("What happens if a renter moves out?", "Their client list and history stay theirs. They can keep RetainOS on their own plan, or stop. Nothing about your building's program changes.",
         "¿Qué pasa si un inquilino se muda?", "Su lista de clientes y su historial siguen siendo suyos. Puede quedarse con RetainOS en su propio plan o dejarlo. El programa de tu edificio no cambia."),
        ("Do renters pay anything for a getaway?", "Yes, and we say so upfront. The stay is complimentary, but the guest pays taxes and fees for each night when activating, plus resort fees where they apply. Flights are not included. You can choose to cover the taxes and fees.",
         "¿El inquilino paga algo por una escapada?", "Sí, y lo decimos desde el principio. La estadía es de cortesía, pero el huésped paga impuestos y cargos por cada noche al activarla, más los cargos del resort cuando apliquen. No incluye vuelos. Puedes decidir cubrir los impuestos y cargos."),
        ("Can a franchise location use this?", "Often yes, but check your franchise agreement first. Some brands control which perks a location can advertise. Independent suite buildings can start right away.",
         "¿Lo puede usar una franquicia?", "Muchas veces sí, pero revisa primero tu contrato de franquicia. Algunas marcas controlan qué beneficios puede anunciar cada local. Los edificios independientes pueden empezar de inmediato."),
        ("How much does it cost?", "Pricing is per building and depends on how many suites you have. Per suite, it costs less than a renter would pay on their own. Book a 15-minute call and we'll send you a quote.",
         "¿Cuánto cuesta?", "El precio es por edificio y depende de cuántas suites tengas. Por suite, cuesta menos de lo que un inquilino pagaría por su cuenta. Agenda una llamada de 15 minutos y te enviamos una cotización."),
        ("Is there a contract?", "[Month-to-month / your terms]", "¿Hay contrato?", "[Mes a mes / tus términos]"),
    ]


def phone(b):
    T, e = b.T, b.e
    return f"""<div class="phone"><div class="screen">
<div class="notch"></div>
<div class="from"><span class="sample">{T("SAMPLE", "EJEMPLO")}</span><strong>{e(BIZ)}</strong>{T("Text message · Today 10:02 AM", "Mensaje de texto · Hoy 10:02 a. m.")}</div>
<div class="bubble">{T("Hi Valeria! Your suite lease at Palm Row renews May 1. Renew by April 15 and you get a complimentary $300 hotel savings card as our thank-you.", "¡Hola Valeria! Tu contrato de suite en Palm Row se renueva el 1 de mayo. Renueva antes del 15 de abril y recibes una tarjeta de descuentos en hoteles de $300, de cortesía, como agradecimiento.")}<span class="lnk">{T("Renew my lease →", "Renovar mi contrato →")}</span></div>
<div class="bubble me">{T("Renewing! 🙌", "¡Renuevo! 🙌")}</div>
<div class="prog"><strong>{T("Renewal reward", "Premio por renovar")}</strong><small>{T("$300 hotel savings card · after signing", "Tarjeta de hotel de $300 · al firmar")}</small></div>
<div class="stop">{T("Reply STOP to opt out", "Responde STOP para no recibir más mensajes")}</div>
</div></div>"""


def reward_visual(b, amt, lbl):
    T, e = b.T, b.e
    return (f'<div class="reward"><div class="hd">{T("🎉 Welcome to Palm Row!", "🎉 ¡Bienvenida a Palm Row!")}</div><div class="bd">'
            f'<div class="hcard"><div class="amt">{amt}</div>{T(*lbl, "div", "lbl")}<div class="comp">{T("Compliments of " + e(BIZ), "Cortesía de " + e(BIZ))}</div></div>'
            f'{T("Issued after the lease is signed and the first payment clears. Terms apply.", "Se entrega al firmar el contrato y acreditarse el primer pago. Aplican términos.", "div", "terms")}</div></div>')


def page(b):
    T, L, url = b.T, b.L, b.url
    alt = ("/" + SLUG, "/es/" + SLUG_ES)
    items = faq_items()
    title = ("Salon Suite Leasing & Renter Retention Program | RetainOS", "Programa de arrendamiento y retención para suites de salón | RetainOS")
    desc = ("Fill empty salon suites and keep renters longer. Reward new leases, renewals and renter referrals without free rent, plus a loyalty program for every suite. EN/ES.",
            "Llena tus suites de salón vacías y conserva a tus inquilinos. Premia contratos nuevos, renovaciones y referidos sin regalar renta, más un programa de lealtad para cada suite.")
    label = ("Leasing &amp; Renter Retention Program for Salon Suite Owners", "Programa de arrendamiento y retención para dueños de suites de salón")
    ld = [{"@context": "https://schema.org", "@type": "Service", "name": L(label[0].replace("&amp;", "&"), label[1]),
           "serviceType": L("Leasing incentive and tenant retention program", "Programa de incentivos de arrendamiento y retención de inquilinos"),
           "audience": {"@type": "BusinessAudience", "name": L("Salon suite and booth rental building owners", "Dueños de edificios de suites de salón y renta de cabinas")},
           "provider": {"@type": "Organization", "name": "RetainOS", "url": b.DOMAIN}, "areaServed": "US", "availableLanguage": ["en", "es"]},
          b.faq_jsonld(items)]
    cta = ("Get a building quote", "Pide una cotización")

    hero = f"""<div class="wrap hero">
<div>
<div class="eyebrow">{T(*label)}</div>
{T("Fill every suite. Keep every renter.", "Suites llenas. Inquilinos que se quedan.", "h1")}
{T("Reward new leases, renewals and renter referrals without giving away a month of rent. Then give every renter a loyalty program for their own clients. We set it up. It runs itself.", "Premia los contratos nuevos, las renovaciones y los referidos sin regalar un mes de renta. Y dale a cada inquilino un programa de lealtad para sus propios clientes. Nosotros lo configuramos. Funciona solo.", "p", "sub")}
<div class="ctas"><a class="btn" href="{b.start_href()}">{T(*cta)}</a><a class="btn alt" href="#how">{T("See how it works", "Mira cómo funciona")}</a></div>
{T("For salon suite buildings, booth-rental salons and beauty co-working spaces · English and Spanish", "Para edificios de suites de salón, salones que rentan cabinas y espacios compartidos de belleza · Español e inglés", "p", "fine")}
</div>
<div>{phone(b)}</div>
</div>"""

    summary = b.summary_block(
        "RetainOS for salon suite owners is a leasing and renter retention program. Renters earn complimentary rewards, like hotel savings cards and getaway certificates, for signing a lease, renewing it and referring another pro who signs. Every renter can also use RetainOS with their own clients, as an amenity of your building. Your rent stays the same. We set everything up for you, in English and Spanish.",
        "RetainOS para dueños de suites de salón es un programa de arrendamiento y retención de inquilinos. Los inquilinos ganan premios de cortesía, como tarjetas de descuentos en hoteles y certificados de escapada, por firmar un contrato, renovarlo y referir a otro profesional que firme. Además, cada inquilino puede usar RetainOS con sus propios clientes, como un beneficio de tu edificio. Tu renta no cambia. Nosotros lo configuramos todo, en español e inglés.")

    problem = f"""<section><div class="wrap">
{T("An empty suite costs you every week it sits.", "Una suite vacía te cuesta cada semana que pasa.", "h2")}
{T("Renters are independent pros. When their book slows down, they move, or go back to a commission salon. Then you're paying for listings, showings and weeks of empty rent to replace them.", "Tus inquilinos son profesionales independientes. Cuando su agenda baja, se mudan o regresan a un salón por comisión. Y te toca pagar anuncios, visitas y semanas de renta perdida para reemplazarlos.", "p", "lead")}
{T("The usual fix is a month of free rent. It fills one suite, costs a full month of income, and teaches the next renter to wait for a better deal.", "La solución de siempre es un mes sin pagar renta. Llena una suite, cuesta un mes completo de ingresos y le enseña al próximo inquilino a esperar una mejor oferta.", "p", "lead")}
{T("The buildings that stay full do two things: they give renters a reason to sign now, and they help renters stay busy enough to stay.", "Los edificios que se mantienen llenos hacen dos cosas: le dan al inquilino una razón para firmar ya, y le ayudan a mantenerse ocupado para que se quede.", "p", "lead")}
</div></section>"""

    referral_mini = (f'<div class="mini"><div class="from"><strong>{b.e(BIZ)}</strong></div><div class="bubble">'
                     + T("Know a stylist looking for a suite? If they sign a lease at Palm Row, you both get a complimentary $200 hotel savings card.", "¿Conoces a un estilista que busque suite? Si firma un contrato en Palm Row, los dos reciben una tarjeta de descuentos en hoteles de $200, de cortesía.")
                     + '</div></div>')
    renew_mini = (f'<div class="mini"><div class="from"><strong>{b.e(BIZ)}</strong></div><div class="bubble">'
                  + T("Hi Valeria! Your lease renews May 1. Renew by April 15 and your $300 hotel savings card is on us.", "¡Hola Valeria! Tu contrato se renueva el 1 de mayo. Renueva antes del 15 de abril y la tarjeta de hotel de $300 corre por nuestra cuenta.")
                  + '</div></div>')
    how = f"""<section id="how"><div class="wrap">
{T("How it works", "Cómo funciona", "div", "kicker")}
{T("Three moments that keep your building full.", "Tres momentos que mantienen tu edificio lleno.", "h2")}
<div class="steps">
{b.step(1, ("A reward for signing.", "Un premio por firmar."), ("New renters earn a complimentary getaway or a hotel savings card of up to $500 when they sign and pay. A reason to say yes this week, without touching your rent.", "Los inquilinos nuevos ganan una escapada o una tarjeta de descuentos en hoteles de hasta $500, de cortesía, al firmar y pagar. Una razón para decir que sí esta semana, sin tocar tu renta."), reward_visual(b, "$500", ("Hotel Savings Card", "Tarjeta de descuentos en hoteles")))}
{b.step(2, ("Renters refer renters.", "Los inquilinos refieren inquilinos."), ("Your best leads already work in your building. When a renter refers a pro who signs, both get a reward.", "Tus mejores prospectos ya trabajan en tu edificio. Cuando un inquilino refiere a un profesional que firma, los dos reciben un premio."), referral_mini)}
{b.step(3, ("A thank-you for renewing.", "Un agradecimiento por renovar."), ("About 60 days before a lease ends, renters get a friendly reminder and a reward for renewing, in English or Spanish.", "Unos 60 días antes de que termine el contrato, el inquilino recibe un recordatorio amable y un premio por renovar, en español o en inglés."), renew_mini)}
</div>
{b.video(L(SLUG, "es-" + SLUG_ES))}
</div></section>"""

    amenity = f"""<section class="tint" id="amenity"><div class="wrap">
{T("The amenity", "El beneficio", "div", "kicker")}
{T("Every suite comes with its own loyalty program.", "Cada suite viene con su propio programa de lealtad.", "h2")}
{T("Renters get RetainOS for their own clients: QR check-in, visit rewards, referral tracking and rebooking reminders, under their own business name. Busy renters stay. And it's one more reason to choose your building over the one down the street.", "Tus inquilinos reciben RetainOS para sus propios clientes: registro por QR, premios por visita, seguimiento de referidos y recordatorios para volver a reservar, con el nombre de su propio negocio. Un inquilino ocupado se queda. Y es una razón más para elegir tu edificio y no el de la otra cuadra.", "p", "lead")}
<div class="gets g4">
<div class="get">{T("A perk to advertise", "Un beneficio para anunciar", "div", "big")}{T("List it on your leasing page next to Wi-Fi and laundry.", "Ponlo en tu página de renta, junto al Wi-Fi y la lavandería.", "p")}</div>
<div class="get">{T("Busier renters", "Inquilinos más ocupados", "div", "big")}{T("Clients come back on time and send friends. Fuller books mean on-time rent.", "Sus clientes vuelven a tiempo y traen amistades. Agendas llenas, renta puntual.", "p")}</div>
<div class="get">{T("A reason to stay", "Una razón para quedarse", "div", "big")}{T("Their rebooking system lives in your building. Moving means starting over.", "Su sistema de citas vive en tu edificio. Mudarse es empezar de cero.", "p")}</div>
<div class="get">{T("Their clients stay theirs", "Sus clientes siguen siendo suyos", "div", "big")}{T("Renters own their client list. No commission, ever.", "Cada inquilino es dueño de su lista de clientes. Sin comisiones, nunca.", "p")}</div>
</div></div></section>"""

    rewards = f"""<section id="rewards"><div class="wrap">
{T("The rewards", "Los premios", "div", "kicker")}
{T("Feels bigger than a discount. Costs less than a month of rent.", "Se siente más grande que un descuento. Cuesta menos que un mes de renta.", "h2")}
{b.rewards_cards().replace(b.T("Every plan", "Todos los planes"), b.T("Lease rewards", "Premios por contrato")).replace(b.T("Add-on · Full Book &amp; Hands-Off", "Complemento · Agenda Llena y Sin Complicaciones"), b.T("Lease rewards", "Premios por contrato")).replace("<strong>Client pays:</strong>", "<strong>Renter pays:</strong>").replace("<strong>El cliente paga:</strong>", "<strong>El inquilino paga:</strong>")}
<p class="note">{T("Lease rewards are earned only after a signed lease and a cleared payment. Not cash, rent credit or gift cards. Getaways have conditions, like one per household every 12 months and living at least 100 miles from the resort. Terms apply.", "Los premios por contrato se ganan solo con un contrato firmado y un pago acreditado. No son efectivo, crédito de renta ni tarjetas de regalo. Las escapadas tienen condiciones, como una por hogar cada 12 meses y vivir a más de 100 millas del resort. Aplican términos.")} {T("See full reward details", "Ver todos los detalles de los premios", "a", "", b.href(url("/rewards", "/es/premios")))}</p>
</div></section>"""

    plans = f"""<section class="tint" id="plans"><div class="wrap">
{T("Building plans", "Planes por edificio", "div", "kicker")}
{T("One price for the building. No commission. Ever.", "Un precio por edificio. Sin comisiones. Nunca.", "h2")}
<div class="gets">
<div class="get">{T("Leasing rewards", "Premios de arrendamiento", "div", "big")}{T("Lease-signing, renewal and renter-referral rewards, with reminders sent for you.", "Premios por firmar, renovar y referir inquilinos, con los recordatorios enviados por nosotros.", "p")}</div>
<div class="get">{T("Renter loyalty", "Lealtad para inquilinos", "div", "big")}{T("RetainOS for every renter who wants it, for their own clients.", "RetainOS para cada inquilino que lo quiera, para sus propios clientes.", "p")}</div>
<div class="get">{T("Priced per building", "Precio por edificio", "div", "big")}{T("Depends on how many suites you have. Per suite, less than a renter pays alone.", "Depende de cuántas suites tengas. Por suite, menos de lo que paga un inquilino por su cuenta.", "p")}</div>
</div>
<div class="ctas" style="margin-top:22px"><a class="btn" href="{b.start_href()}">{T(*cta)}</a><a class="btn alt" href="{url('/contact', '/es/contacto')}">{T("Ask a question", "Haz una pregunta")}</a></div>
</div></section>"""

    return "".join([
        b.head(*title, *desc, alt=alt, jsonld=ld), b.topbar(alt), '<main id="top">',
        hero, summary, problem, how, amenity, rewards, plans, b.after(), b.faq_section(items),
        b.claim(("Empty suites cost you every week. Let's fill them.", "Cada semana con una suite vacía te cuesta. Vamos a llenarlas."),
                ("Pilot spots are open for salon suite buildings. Setup fee waived.", "Hay lugares abiertos en el piloto para edificios de suites de salón. Sin costo de instalación.")),
        "</main>", b.footer(), b.end()])
