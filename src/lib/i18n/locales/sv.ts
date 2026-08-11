import type { Dictionary } from "./en";
import { en } from "./en";

export const sv: Dictionary = {
  ...en,

  "lang.name": "Svenska",
  "lang.switch": "Byt språk",

  "nav.tools": "Verktyg",
  "nav.categories": "Kategorier",
  "nav.popular": "Populärt",
  "nav.why": "Varför Flixo",
  "nav.faq": "Vanliga frågor",
  "nav.openTranslator": "Öppna översättaren",
  "nav.toggleTheme": "Byt färgtema",
  "nav.toggleMenu": "Visa meny",

  "hero.badge": "En arbetsyta, alla AI-verktyg",
  "hero.title": "En arbetsyta för varje AI-verktyg",
  "hero.description":
    "Översättning, bilder, PDF, skrivande och verktyg — fem verktygscentra i ett lugnt gränssnitt. Inga konton, inga API-nycklar; öppna ett verktyg och börja.",
  "hero.promo.badge": "Nytt",
  "hero.promo.body":
    "Prova AI-bildförbättraren: skärpa, förstora och ta bort brus från dina bilder direkt.",
  "hero.searchLabel": "Beskriv vad du vill göra",
  "hero.searchPlaceholder":
    "Testa: «översätt till arabiska», «sammanfatta en PDF», «skapa en bild»…",
  "hero.browse": "Bläddra bland verktyg",
  "hero.cta": "Prova översättaren",
  "hero.note": "Gratis · Utan registrering",

  "assistant.eyebrow": "AI-assistent",
  "assistant.title": "Säg vad du behöver — jag hittar rätt verktyg",
  "assistant.placeholder": "Beskriv din uppgift… t.ex. «översätt ett stycke till franska»",
  "assistant.button": "Hitta verktyg",
  "assistant.thinking": "Funderar…",
  "assistant.reset": "Fråga något annat",
  "assistant.result.category": "Kategori",
  "assistant.result.matched": "Träff",
  "assistant.result.open": "Öppna verktyg",
  "assistant.result.soon": "Snart",
  "assistant.suggestion.translation":
    "Det verkar som att du vill översätta text. Översättaren är redo för dig.",
  "assistant.suggestion.images":
    "Du vill arbeta med bilder. Inget bildverktyg finns ännu — begär ett så prioriterar vi det.",
  "assistant.suggestion.pdf":
    "Du nämnde en PDF. Inget PDF-verktyg finns ännu — begär ett så prioriterar vi det.",
  "assistant.suggestion.writing":
    "Du behöver hjälp med skrivande. Inget skrivverktyg finns ännu — begär ett så prioriterar vi det.",
  "assistant.suggestion.utilities":
    "Du behöver ett verktyg. Inget finns ännu — begär ett så prioriterar vi det.",
  "assistant.suggestion.unknown":
    "Jag är inte säker på vilken kategori som passar. Beskriv mer, eller begär ett nytt verktyg.",
  "assistant.empty.title": "Ditt förslag visas här",
  "assistant.empty.body":
    "Skriv en uppgift ovan så pekar assistenten dig till rätt Flixo-verktyg — eller hjälper dig att begära ett nytt.",

  "request.trigger": "Begär verktyg",
  "request.title": "Begär ett nytt verktyg",
  "request.description": "Berätta vad du behöver så prioriterar vi det till nästa version.",
  "request.label": "Vad ska verktyget göra?",
  "request.placeholder":
    "t.ex. Ett verktyg som konverterar PDF till Word med bibehållen formatering…",
  "request.submit": "Skicka begäran",
  "request.cancel": "Avbryt",
  "request.success": "Tack! Din begäran är antecknad — vi prioriterar den till nästa version.",
  "request.ok": "Klart",

  "categories.eyebrow": "Verktygscentra",
  "categories.title": "Fem centra, en arbetsyta",
  "categories.description":
    "Varje Flixo-verktyg hör till ett av dessa centra. För nu är de platshållare — grunden är redo att växa.",
  "categories.status.coming": "Snart",
  "categories.status.live": "{count} tillgängliga",
  "categories.toolsLabel": "Planerade verktyg",
  "status.live": "Tillgänglig",
  "status.soon": "Snart",

  "category.translation.name": "Översättningscentrum",
  "category.translation.blurb":
    "Översätt, lokalisera och texta i 20+ språk med automatisk detektering.",
  "category.translation.tools": "Översättare · Lokaliserare · Undertextöversättare",
  "category.images.name": "Bildverktyg",
  "category.images.blurb": "Generera, förstora och ta bort bakgrunder från bilder.",
  "category.images.tools": "Bildgenerator · Förstorare · Bakgrundsborttagning",
  "category.pdf.name": "PDF-verktyg",
  "category.pdf.blurb": "Slå ihop, dela, komprimera och konvertera PDF-dokument.",
  "category.pdf.tools": "Slå ihop · Dela · Komprimera · PDF till Word",
  "category.writing.name": "AI-skrivande",
  "category.writing.blurb": "Sammanfatta, skriv om och utforma innehåll med rätt ton.",
  "category.writing.tools": "Sammanfattare · Omskrivare · E-postutformare",
  "category.utilities.name": "Verktyg",
  "category.utilities.blurb": "Formatera, konvertera och skapa vardagliga tekniska snuttar.",
  "category.utilities.tools": "JSON-formaterare · QR-generator · Base64-konverterare",
  "category.developer.name": "Utvecklarverktyg",
  "category.developer.blurb": "Formaterare, validerare och generatorer för daglig kod.",
  "category.developer.tools": "JSON-formaterare · XML-validerare · Cron-parser",

  "tool.back": "Alla verktyg",

  "why.eyebrow": "Varför Flixo",
  "why.title": "Byggt för att ta bort friktion, inte för att lägga till funktioner",
  "why.speed.title": "Omedelbart som standard",
  "why.speed.body":
    "Verktyg öppnas på under en sekund och körs i webbläsaren — utan köer eller kalla starter.",
  "why.consistency.title": "Ett konsekvent gränssnitt",
  "why.consistency.body":
    "Varje verktyg delar layout, genvägar och resultatåtgärder, inget att lära om.",
  "why.privacy.title": "Integritet först",
  "why.privacy.body":
    "Inget sparas mellan sessioner. Din indata stannar i fliken där du skrev den.",
  "why.access.title": "Inga konton, inga nycklar",
  "why.access.body":
    "Inga API-nycklar, instrumentpaneler eller plats-hantering. Öppna ett verktyg och börja.",
  "stats.tasks": "Bearbetade uppgifter",
  "stats.languages": "Språk som stöds",
  "stats.latency": "Median svarstid",
  "stats.uptime": "Driftsäkerhet senaste 12 månader",

  "faq.eyebrow": "Vanliga frågor",
  "faq.title": "Frågor, besvarade",
  "faq.description": "Allt värt att veta innan du öppnar ditt första verktyg.",
  "faq.q1": "Är Flixo gratis?",
  "faq.a1":
    "Ja. Alla verktyg som för närvarande finns på Flixo är gratis och kräver inget konto eller kort.",
  "faq.q2": "Hur fungerar översättaren?",
  "faq.a2":
    "Du klistrar in text, väljer käll- och målspråk (eller låter automatisk detektering göra det) så returnerar Flixo översättningen. Den nuvarande versionen använder en lokal demo-motor för att utforska flödet offline.",
  "faq.q3": "Sparar ni vad jag skriver?",
  "faq.a3":
    "Nej. Indata och utdata finns bara i din webbläsarflik och försvinner när du stänger eller rensar verktyget.",
  "faq.q4": "Vilka språk stöds?",
  "faq.a4":
    "Tjugo språk med latinska, kyrilliska, arabiska, hebreiska, indiska och CJK-skrifter, plus automatisk källdetektering.",
  "faq.q5": "När kommer de andra verktygen?",
  "faq.a5":
    "De fem centren — Översättning, Bilder, PDF, Skrivande och Verktyg — är roadmap. Nya verktyg kopplas till samma register och ärver den delade layouten.",

  "footer.tagline": "En lugn arbetsyta för varje AI-verktyg ditt team når under dagen.",
  "footer.product": "Produkt",
  "footer.featured": "Utvalda verktyg",
  "footer.popular": "Populära verktyg",
  "footer.numbers": "Siffror",
  "footer.categories": "Kategorier",
  "footer.tools": "Verktyg",
  "footer.more": "Mer snart",
  "footer.rights": "© {year} Flixo. Alla rättigheter förbehållna.",
  "footer.built": "Byggt för team som levererar snabbt.",

  "translator.pageDescription": "Detekterar automatiskt källspråket och översätter på sekunder.",
  "translator.from": "Från",
  "translator.to": "Till",
  "translator.auto": "Detektera automatiskt",
  "translator.swap": "Byt språk",
  "translator.inputPlaceholder": "Skriv eller klistra in text att översätta…",
  "translator.inputLabel": "Text att översätta",
  "translator.detected": "upptäckt {language}",
  "translator.copy": "Kopiera",
  "translator.copied": "Kopierad",
  "translator.copyError": "Kunde inte kopiera till urklipp.",
  "translator.genericError": "Något gick fel. Försök igen.",
  "translator.clear": "Rensa",
  "translator.translate": "Översätt",
  "translator.translating": "Översätter…",
  "translator.emptyTitle": "Din översättning visas här",
  "translator.emptyBody":
    "Välj ett målspråk, skriv in text och tryck på Översätt. Automatisk detektering hittar källan.",
};
