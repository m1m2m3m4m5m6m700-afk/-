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

  // Tool names + taglines (76 ready tools) — native Nederlandse technische termen.
  "tool.translator.name": "IA-vertaler",
  "tool.translator.tagline":
    "Vertaal tussen 20+ talen met automatische detectie en direct wisselen.",
  "tool.image-enhancer.name": "IA-beeldverbeteraar",
  "tool.image-enhancer.tagline":
    "Schaal de resolutie tot 8x op, herstel gezichten, verwijder ruis en verscherp foto's.",
  "tool.image-compressor.name": "Afbeeldingscompressor",
  "tool.image-compressor.tagline":
    "Verklein de bestandsgrootte van afbeeldingen direct in je browser.",
  "tool.background-remover.name": "Achtergrondverwijderaar",
  "tool.background-remover.tagline":
    "Knip achtergronden uit afbeeldingen en exporteer transparante PNG's.",
  "tool.video-compressor.name": "Videocompressor",
  "tool.video-compressor.tagline":
    "Verklein de videobestandsgrootte met instelbare kwaliteit en uitvoeropties.",
  "tool.video-trimmer.name": "Videosnijder",
  "tool.video-trimmer.tagline":
    "Snijd een geselecteerd deel van een video met begin- en eindregelaars.",
  "tool.video-to-gif.name": "Video naar GIF",
  "tool.video-to-gif.tagline": "Converteer een ondersteund videosegment naar een animatie-GIF.",
  "tool.audio-compressor.name": "Audiocompressor",
  "tool.audio-compressor.tagline":
    "Comprimeer audiobestanden met controle over uitvoerkwaliteit en bitrate.",
  "tool.audio-cutter.name": "Audiosnijder",
  "tool.audio-cutter.tagline":
    "Snijd een geselecteerd deel uit een audiobestand met begin- en eindregelaars.",
  "tool.text-to-speech.name": "Tekst naar spraak",
  "tool.text-to-speech.tagline":
    "Zet geschreven tekst om in natuurlijke spraak met instelbare stemmen.",
  "tool.file-hash-generator.name": "Bestands-hashgenerator",
  "tool.file-hash-generator.tagline":
    "Bereken MD5-, SHA-1- en SHA-256-hashes van elk bestand in je browser.",
  "tool.qr-generator.name": "QR-codegenerator",
  "tool.qr-generator.tagline":
    "Maak aangepaste QR-codes voor links, tekst, wifi en contactgegevens.",
  "tool.barcode-generator.name": "Barcodegenerator",
  "tool.barcode-generator.tagline":
    "Genereer barcodes in meerdere formaten, klaar om te downloaden of printen.",
  "tool.password-generator.name": "Wachtwoordgenerator",
  "tool.password-generator.tagline": "Genereer sterke, veilige wachtwoorden met entropie-meter.",
  "tool.password-checker.name": "Wachtwoordcontrole",
  "tool.password-checker.tagline":
    "Controleer wachtwoordsterkte, entropie en geschatte kraaktijd met praktische tips.",
  "tool.word-counter.name": "Woordteller",
  "tool.word-counter.tagline": "Tel woorden, tekens, zinnen en alinea's direct tijdens het typen.",
  "tool.case-converter.name": "Hoofdletterconverter",
  "tool.case-converter.tagline":
    "Wissel direct tussen hoofdletters, kleine letters, titel en andere formaten.",
  "tool.slug-generator.name": "Slug-generator",
  "tool.slug-generator.tagline":
    "Zet titels om in schone, URL-vriendelijke slugs met scheidingstekens en lengte.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Genereer Lorem Ipsum-plaatstekst met gekozen aantal alinea's of woorden.",
  "tool.random-number.name": "Willekeurig getal",
  "tool.random-number.tagline":
    "Genereer willekeurige getallen in een bereik met aantalsopties en zonder duplicaten.",
  "tool.random-name.name": "Willekeurige naamkiezer",
  "tool.random-name.tagline":
    "Kies een of meer willekeurige namen uit een lijst met optie zonder duplicaten.",
  "tool.json-formatter.name": "JSON-formatter",
  "tool.json-formatter.tagline": "Verfraai, verklein en valideer JSON met aangepaste inspringing.",
  "tool.uuid-generator.name": "UUID-generator",
  "tool.uuid-generator.tagline": "Maak unieke UUID (v4)-identificaties snel en in batch.",
  "tool.xml-formatter.name": "XML-formatter",
  "tool.xml-formatter.tagline": "Verfraai, verklein en valideer XML met aangepaste inspringing.",
  "tool.csv-viewer.name": "CSV-viewer",
  "tool.csv-viewer.tagline":
    "Bekijk CSV-gegevens als tabel met keuze van scheidingsteken en koptekstdetectie.",
  "tool.text-compare.name": "Tekstvergelijker",
  "tool.text-compare.tagline":
    "Vergelijk twee teksten regel voor regel en markeer toevoegingen, verwijderingen en overeenkomsten.",
  "tool.qr-reader.name": "QR-reader",
  "tool.qr-reader.tagline":
    "Scan en decodeer QR-codes vanuit afbeeldingen of je camera naar tekst of links.",
  "tool.find-and-replace.name": "Zoeken en vervangen",
  "tool.find-and-replace.tagline":
    "Zoek en vervang tekst in lange documenten met optionele regex en hoofdlettergevoeligheid.",
  "tool.remove-duplicate-lines.name": "Dubbele regels verwijderen",
  "tool.remove-duplicate-lines.tagline":
    "Verwijder dubbele regels met niet-hoofdlettergevoelige en witruimte-bewuste matching.",
  "tool.remove-empty-lines.name": "Lege regels verwijderen",
  "tool.remove-empty-lines.tagline": "Verwijder direct lege of alleen-witruimte regels.",
  "tool.text-cleaner.name": "Tekstschoonmaker",
  "tool.text-cleaner.tagline":
    "Maak tekst schoon door extra spaties, regeleindes en ongewenste tekens te verwijderen.",
  "tool.sort-lines.name": "Regels sorteren",
  "tool.sort-lines.tagline":
    "Sorteer regels alfabetisch, op lengte of schud ze met hoofdletter- en lege-regelopties.",
  "tool.reverse-text.name": "Tekst omkeren",
  "tool.reverse-text.tagline": "Keer tekst om per teken, woord of hele regels direct.",
  "tool.add-line-numbers.name": "Regelnummers toevoegen",
  "tool.add-line-numbers.tagline":
    "Voeg opeenvolgende regelnummers toe met scheidingstekens, opvulling en startverschuiving.",
  "tool.word-frequency.name": "Woordfrequentie-analyse",
  "tool.word-frequency.tagline":
    "Analyseer woordfrequentie met sortering, hoofdlettergevoeligheid en lengtefilters.",
  "tool.unit-converter.name": "Eenhedenconverter",
  "tool.unit-converter.tagline":
    "Converteer direct tussen lengte-, gewichts-, volumeeenheden en meer.",
  "tool.temperature-converter.name": "Temperatuurconverter",
  "tool.temperature-converter.tagline": "Converteer snel tussen Celsius, Fahrenheit en Kelvin.",
  "tool.base64-converter.name": "Base64-converter",
  "tool.base64-converter.tagline": "Codeer en decodeer tekst naar Base64 en terug direct.",
  "tool.timestamp-converter.name": "Tijdstempelconverter",
  "tool.timestamp-converter.tagline":
    "Converteer Unix-tijdstempels naar leesbare data en terug, met tijdzoneondersteuning.",
  "tool.csv-to-json.name": "CSV naar JSON",
  "tool.csv-to-json.tagline":
    "Converteer CSV-gegevens naar gestructureerde JSON met automatische koptekstdetectie.",
  "tool.percentage-calculator.name": "Percentagecalculator",
  "tool.percentage-calculator.tagline":
    "Bereken percentages, stijgingen en kortingen snel en nauwkeurig.",
  "tool.bmi-calculator.name": "BMI-calculator",
  "tool.bmi-calculator.tagline": "Bereken je body mass index uit gewicht en lengte.",
  "tool.age-calculator.name": "Leeftijdscalculator",
  "tool.age-calculator.tagline": "Bereken je exacte leeftijd in jaren, maanden en dagen.",
  "tool.meta-tag-generator.name": "Meta-tag-generator",
  "tool.meta-tag-generator.tagline":
    "Maak HTML-meta-tags voor SEO met titel, beschrijving en Open Graph.",
  "tool.url-encoder.name": "URL-encoder",
  "tool.url-encoder.tagline": "Codeer en decodeer URL's en URL-componenten direct.",
  "tool.html-entity-encoder.name": "HTML-entiteit-encoder",
  "tool.html-entity-encoder.tagline":
    "Zet speciale tekens om in HTML-entiteiten en terug naar leesbare tekst.",
  "tool.html-minifier.name": "HTML-minifier",
  "tool.html-minifier.tagline":
    "Verklein je HTML door onnodige spaties en commentaar te verwijderen.",
  "tool.css-minifier.name": "CSS-minifier",
  "tool.css-minifier.tagline":
    "Comprimeer je CSS door spaties, commentaar en redundante regels te verwijderen.",
  "tool.js-minifier.name": "JS-minifier",
  "tool.js-minifier.tagline":
    "Minificeer JavaScript door spaties en commentaar te verwijderen voor kleinere bestanden.",
  "tool.json-validator.name": "JSON-validator",
  "tool.json-validator.tagline": "Valideer de syntaxis van je JSON en vind direct fouten.",
  "tool.regex-tester.name": "Regex-tester",
  "tool.regex-tester.tagline": "Test reguliere expressies en markeer overeenkomsten in real time.",
  "tool.jwt-decoder.name": "JWT-decoder",
  "tool.jwt-decoder.tagline": "Decodeer JWT-tokens en bekijk de inhoud van header en payload.",
  "tool.sql-formatter.name": "SQL-formatter",
  "tool.sql-formatter.tagline":
    "Verfraai en verklein SQL-query's met trefwoorden in hoofdletters en instelbare inspringing.",
  "tool.markdown-preview.name": "Markdown-voorbeeld",
  "tool.markdown-preview.tagline":
    "Schrijf Markdown en zie direct de gerenderde HTML-voorbeeldweergave.",
  "tool.color-converter.name": "Kleurconverter",
  "tool.color-converter.tagline": "Converteer tussen HEX, RGB en HSL en bekijk een kleurvoorbeeld.",
  "tool.cron-parser.name": "Cron-parser",
  "tool.cron-parser.tagline":
    "Vertaal cron-expressies naar duidelijke taal met velduitleg en komende uitvoeringen.",
  "tool.xml-validator.name": "XML-validator",
  "tool.xml-validator.tagline":
    "Valideer vorm, tagbalans en structuur van XML met directe foutrapportage.",
  "tool.html-formatter.name": "HTML-formatter",
  "tool.html-formatter.tagline":
    "Verfraai en verklein HTML met juiste nesting en instelbare inspringing.",
  "tool.yaml-formatter.name": "YAML-formatter",
  "tool.yaml-formatter.tagline":
    "Verfraai en normaliseer YAML met instelbare inspringing en validatie.",
  "tool.markdown-table-generator.name": "Markdown-tabelgenerator",
  "tool.markdown-table-generator.tagline":
    "Maak visueel Markdown-tabellen en exporteer ze klaar om te plakken.",
  "tool.css-gradient-generator.name": "CSS-verloopgenerator",
  "tool.css-gradient-generator.tagline":
    "Ontwerp lineaire, radiale en conische CSS-verlopen met kleurstops en hoekregelaars.",
  "tool.audio-converter.name": "Audioconverter",
  "tool.audio-converter.tagline":
    "Converteer audiobestanden (MP3, OGG, FLAC en meer) naar WAV in je browser.",
  "tool.video-converter.name": "Videoconverter",
  "tool.video-converter.tagline":
    "Converteer video naar MP4 (H.264) of AVI (MPEG-4) in je browser.",
  "tool.gif-maker.name": "GIF-maker",
  "tool.gif-maker.tagline":
    "Maak een animatie-GIF van geüploade afbeeldingen of ondersteunde video.",
  "tool.gif-compressor.name": "GIF-compressor",
  "tool.gif-compressor.tagline":
    "Verklein de GIF-bestandsgrootte met behoud van acceptabele visuele kwaliteit.",
  "tool.image-to-gif.name": "Afbeelding naar GIF",
  "tool.image-to-gif.tagline": "Maak een animatie-GIF van meerdere geüploade afbeeldingen.",
  "tool.pdf-to-excel.name": "PDF naar Excel",
  "tool.pdf-to-excel.tagline":
    "Converteer geschikte PDF-tabellen en -inhoud naar een Excel-compatibel bestand.",
  "tool.pdf-to-powerpoint.name": "PDF naar PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Converteer geschikte PDF-pagina's en -inhoud naar een PowerPoint-compatibel bestand.",
  "tool.pdf-to-text.name": "PDF naar tekst",
  "tool.pdf-to-text.tagline": "Extraheer selecteerbare tekst uit PDF-documenten.",
  "tool.pdf-crop.name": "PDF bijsnijden",
  "tool.pdf-crop.tagline": "Snijd PDF-pagina's bij met instelbare bijsnijdgrenzen.",
  "tool.pdf-page-numbers.name": "PDF-paginanummers",
  "tool.pdf-page-numbers.tagline": "Voeg instelbare paginanummers toe aan PDF-pagina's.",
  "tool.pdf-header-footer.name": "PDF-koptekst en -voettekst",
  "tool.pdf-header-footer.tagline":
    "Voeg aanpasbare kopteksten en voetteksten toe aan PDF-pagina's.",
  "tool.text-to-pdf.name": "Tekst naar PDF",
  "tool.text-to-pdf.tagline": "Converteer getypte of geplakte tekst naar een downloadbare PDF.",
  "tool.text-to-word.name": "Tekst naar Word",
  "tool.text-to-word.tagline":
    "Converteer getypte of geplakte tekst naar een downloadbaar DOCX-document.",
  "tool.markdown-to-pdf.name": "Markdown naar PDF",
  "tool.markdown-to-pdf.tagline": "Converteer Markdown-inhoud naar een opgemaakte PDF.",
  "tool.markdown-to-word.name": "Markdown naar Word",
  "tool.markdown-to-word.tagline": "Converteer Markdown-inhoud naar een opgemaakt DOCX-document.",
};
