import type { Dictionary } from "./en";
import { en } from "./en";

export const nl: Dictionary = {
  ...en,

  "lang.name": "Nederlands",
  "lang.switch": "Taal wijzigen",

  "nav.tools": "Hulpmiddelen",
  "nav.categories": "Categorieën",
  "nav.popular": "Populair",
  "nav.why": "Waarom Flixo",
  "nav.faq": "FAQ",
  "nav.openTranslator": "Vertaler openen",
  "nav.toggleTheme": "Thema wijzigen",
  "nav.toggleMenu": "Menu openen",

  "hero.badge": "Eén werkruimte, alle AI-hulpmiddelen",
  "hero.title": "Eén werkruimte voor elk AI-hulpmiddel",
  "hero.description":
    "Vertaling, afbeeldingen, PDF, schrijven en hulpprogramma's — vijf hulpmiddelcentra in één rustige interface. Geen accounts, geen API-sleutels; open een hulpmiddel en begin.",
  "hero.promo.badge": "Nieuw",
  "hero.promo.body":
    "Probeer de AI-beeldverbeteraar: verscherp, vergroot en verwijder ruis uit je foto's direct.",
  "hero.searchLabel": "Beschrijf wat je wilt doen",
  "hero.searchPlaceholder":
    "Probeer: «vertaal naar het Arabisch», «vat een PDF samen», «genereer een afbeelding»…",
  "hero.browse": "Hulpmiddelen bekijken",
  "hero.cta": "Probeer de vertaler",
  "hero.note": "Gratis · Zonder registratie",

  "assistant.eyebrow": "AI-assistent",
  "assistant.title": "Zeg wat je nodig hebt — ik vind het juiste hulpmiddel",
  "assistant.placeholder": "Beschrijf je taak… bijv. «vertaal een alinea naar het Frans»",
  "assistant.button": "Hulpmiddel vinden",
  "assistant.thinking": "Aan het nadenken…",
  "assistant.reset": "Iets anders vragen",
  "assistant.result.category": "Categorie",
  "assistant.result.matched": "Overeenkomst",
  "assistant.result.open": "Hulpmiddel openen",
  "assistant.result.soon": "Binnenkort",
  "assistant.suggestion.translation":
    "Het lijkt erop dat je tekst wilt vertalen. De vertaler is klaar voor je.",
  "assistant.suggestion.images":
    "Je wilt met afbeeldingen werken. Er is nog geen afbeeldingshulpmiddel — vraag er een en we geven het prioriteit.",
  "assistant.suggestion.pdf":
    "Je noemde een PDF. Er is nog geen PDF-hulpmiddel — vraag er een en we geven het prioriteit.",
  "assistant.suggestion.writing":
    "Je hebt hulp nodig bij schrijven. Er is nog geen schrijfhulpmiddel — vraag er een en we geven het prioriteit.",
  "assistant.suggestion.utilities":
    "Je hebt een hulpprogramma nodig. Er is er nog geen — vraag er een en we geven het prioriteit.",
  "assistant.suggestion.unknown":
    "Ik weet nog niet zeker welke categorie past. Beschrijf het verder, of vraag een nieuw hulpmiddel aan.",
  "assistant.empty.title": "Je suggestie verschijnt hier",
  "assistant.empty.body":
    "Typ hierboven een taak en de assistent wijst het juiste Flixo-hulpmiddel — of helpt je een nieuw aan te vragen.",

  "request.trigger": "Hulpmiddel aanvragen",
  "request.title": "Nieuw hulpmiddel aanvragen",
  "request.description":
    "Zeg wat je nodig hebt en we geven het prioriteit voor de volgende versie.",
  "request.label": "Wat moet het hulpmiddel doen?",
  "request.placeholder": "bijv. Een hulpmiddel dat PDF naar Word omzet met behoud van opmaak…",
  "request.submit": "Aanvraag versturen",
  "request.cancel": "Annuleren",
  "request.success":
    "Bedankt! Je aanvraag is genoteerd — we geven deze prioriteit voor de volgende versie.",
  "request.ok": "Klaar",

  "categories.eyebrow": "Hulpmiddelcentra",
  "categories.title": "Vijf centra, één werkruimte",
  "categories.description":
    "Elk Flixo-hulpmiddel hoort bij een van deze centra. Voorlopig zijn het placeholders — de basis is klaar om te groeien.",
  "categories.status.coming": "Binnenkort",
  "categories.status.live": "{count} beschikbaar",
  "categories.toolsLabel": "Geplande hulpmiddelen",
  "status.live": "Beschikbaar",
  "status.soon": "Binnenkort",

  "category.translation.name": "Vertaalcentrum",
  "category.translation.blurb":
    "Vertaal, lokaliseer en ondertitel in 20+ talen met automatische detectie.",
  "category.translation.tools": "Vertaler · Lokaliseerder · Ondertitelvertaler",
  "category.images.name": "Afbeeldingshulpmiddelen",
  "category.images.blurb": "Genereer, vergroot en verwijder achtergronden van afbeeldingen.",
  "category.images.tools": "Afbeeldingsgenerator · Vergroter · Achtergrondverwijderaar",
  "category.pdf.name": "PDF-hulpmiddelen",
  "category.pdf.blurb": "Voeg samen, splits, comprimeer en converteer PDF-documenten.",
  "category.pdf.tools": "Samenvoegen · Splitsen · Comprimeren · PDF naar Word",
  "category.writing.name": "AI-schrijven",
  "category.writing.blurb": "Vat samen, herschrijf en stel inhoud op met de juiste toon.",
  "category.writing.tools": "Samenvatter · Herschrijver · E-mailopsteller",
  "category.utilities.name": "Hulpprogramma's",
  "category.utilities.blurb":
    "Formatteer, converteer en genereer alledaagse technische fragmenten.",
  "category.utilities.tools": "JSON-formatter · QR-generator · Base64-converter",
  "category.developer.name": "Ontwikkelaarshulpmiddelen",
  "category.developer.blurb": "Formatters, validators en generators voor dagelijks code.",
  "category.developer.tools": "JSON-formatter · XML-validator · Cron-parser",

  "tool.back": "Alle hulpmiddelen",

  "why.eyebrow": "Waarom Flixo",
  "why.title": "Gebouwd om wrijving weg te nemen, niet om functies toe te voegen",
  "why.speed.title": "Standaard direct",
  "why.speed.body":
    "Hulpmiddelen openen in minder dan een seconde en draaien in de browser — zonder wachtrijen of cold starts.",
  "why.consistency.title": "Eén consistente interface",
  "why.consistency.body":
    "Elk hulpmiddel deelt dezelfde lay-out, sneltoetsen en resultaatacties, niets opnieuw leren.",
  "why.privacy.title": "Privacy voorop",
  "why.privacy.body":
    "Tussen sessies wordt niets opgeslagen. Je invoer blijft in het tabblad waar je het typte.",
  "why.access.title": "Geen accounts, geen sleutels",
  "why.access.body": "Geen API-sleutels, dashboards of seat-beheer. Open een hulpmiddel en begin.",
  "stats.tasks": "Verwerkte taken",
  "stats.languages": "Ondersteunde talen",
  "stats.latency": "Mediane responstijd",
  "stats.uptime": "Beschikbaarheid laatste 12 maanden",

  "faq.eyebrow": "FAQ",
  "faq.title": "Vragen, beantwoord",
  "faq.description":
    "Alles wat de moeite waard is om te weten voordat je je eerste hulpmiddel opent.",
  "faq.q1": "Is Flixo gratis?",
  "faq.a1":
    "Ja. Alle momenteel beschikbare hulpmiddelen op Flixo zijn gratis en vereisen geen account of creditcard.",
  "faq.q2": "Hoe werkt de vertaler?",
  "faq.a2":
    "Je plakt tekst, kiest bron- en doeltaal (of laat automatische detectie het doen) en Flixo geeft de vertaling. De huidige versie gebruikt een lokale demo-engine om de flow offline te verkennen.",
  "faq.q3": "Bewaren jullie wat ik typ?",
  "faq.a3":
    "Nee. Invoer en uitvoer leven alleen in je browsertabblad en verdwijnen bij sluiten of wissen.",
  "faq.q4": "Welke talen worden ondersteund?",
  "faq.a4":
    "Twintig talen in Latijnse, Cyrillische, Arabische, Hebreeuwse, Indische en CJK-schriften, plus automatische brondetectie.",
  "faq.q5": "Wanneer komen de andere hulpmiddelen?",
  "faq.a5":
    "De vijf centra — Vertaling, Afbeeldingen, PDF, Schrijven en Hulpprogramma's — vormen de roadmap. Nieuwe hulpmiddelen koppelen aan hetzelfde register en erven de gedeelde lay-out.",

  "footer.tagline": "Eén rustige werkruimte voor elk AI-hulpmiddel dat je team overdag gebruikt.",
  "footer.product": "Product",
  "footer.featured": "Uitgelichte hulpmiddelen",
  "footer.popular": "Populaire hulpmiddelen",
  "footer.numbers": "Cijfers",
  "footer.categories": "Categorieën",
  "footer.tools": "Hulpmiddelen",
  "footer.more": "Meer binnenkort",
  "footer.rights": "© {year} Flixo. Alle rechten voorbehouden.",
  "footer.built": "Gebouwd voor teams die snel leveren.",

  "translator.pageDescription": "Detecteert automatisch de brontaal en vertaalt in seconden.",
  "translator.from": "Van",
  "translator.to": "Naar",
  "translator.auto": "Automatisch detecteren",
  "translator.swap": "Talen wisselen",
  "translator.inputPlaceholder": "Typ of plak tekst om te vertalen…",
  "translator.inputLabel": "Te vertalen tekst",
  "translator.detected": "gedetecteerd {language}",
  "translator.copy": "Kopiëren",
  "translator.copied": "Gekopieerd",
  "translator.copyError": "Kon niet naar het klembord kopiëren.",
  "translator.genericError": "Er ging iets mis. Probeer het opnieuw.",
  "translator.clear": "Wissen",
  "translator.translate": "Vertalen",
  "translator.translating": "Vertalen…",
  "translator.emptyTitle": "Je vertaling verschijnt hier",
  "translator.emptyBody":
    "Kies een doeltaal, typ tekst en druk op Vertalen. Automatische detectie vindt de bron.",
};
