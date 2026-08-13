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

  // Tool names + taglines (76 ready tools) — nativa svenska tekniska termer.
  "tool.translator.name": "AI-översättare",
  "tool.translator.tagline":
    "Översätt mellan 20+ språk med automatisk identifiering och omedelbart byte.",
  "tool.image-enhancer.name": "AI-bildförbättrare",
  "tool.image-enhancer.tagline":
    "Skala upp upplösningen upp till 8x, återställ ansikten, ta bort brus och öka skärpan.",
  "tool.image-compressor.name": "Bildkompressor",
  "tool.image-compressor.tagline": "Minska bildfilens storlek direkt i din webbläsare.",
  "tool.background-remover.name": "Bakgrundsborttagning",
  "tool.background-remover.tagline":
    "Klipp ut bildbakgrunder och exportera transparenta PNG-filer.",
  "tool.video-compressor.name": "Videokompressor",
  "tool.video-compressor.tagline":
    "Minska videofilens storlek med inställbar kvalitet och utdataalternativ.",
  "tool.video-trimmer.name": "Videoskärare",
  "tool.video-trimmer.tagline": "Klipp en vald del av en video med start- och slutreglage.",
  "tool.video-to-gif.name": "Video till GIF",
  "tool.video-to-gif.tagline": "Konvertera ett videosegment till en animerad GIF.",
  "tool.audio-compressor.name": "Ljudkompressor",
  "tool.audio-compressor.tagline":
    "Komprimera ljudfiler med kontroll över utdatakvalitet och bithastighet.",
  "tool.audio-cutter.name": "Ljudskärare",
  "tool.audio-cutter.tagline": "Klipp en vald del från en ljudfil med start- och slutreglage.",
  "tool.text-to-speech.name": "Text till tal",
  "tool.text-to-speech.tagline": "Omvandla skriven text till naturligt tal med valbara röster.",
  "tool.file-hash-generator.name": "Fil-hashgenerator",
  "tool.file-hash-generator.tagline":
    "Beräkna MD5-, SHA-1- och SHA-256-hashar för valfri fil i din webbläsare.",
  "tool.qr-generator.name": "QR-kodgenerator",
  "tool.qr-generator.tagline":
    "Skapa anpassade QR-koder för länkar, text, wifi och kontaktuppgifter.",
  "tool.barcode-generator.name": "Streckkodsgenerator",
  "tool.barcode-generator.tagline":
    "Generera streckkoder i flera format, klara att ladda ner eller skriva ut.",
  "tool.password-generator.name": "Lösenordsgenerator",
  "tool.password-generator.tagline": "Generera starka, säkra lösenord med entropimätare.",
  "tool.password-checker.name": "Lösenordskontroll",
  "tool.password-checker.tagline":
    "Kontrollera lösenordsstyrka, entropi och uppskattad knäcktid med praktiska tips.",
  "tool.word-counter.name": "Ordräknare",
  "tool.word-counter.tagline": "Räkna ord, tecken, meningar och stycken direkt medan du skriver.",
  "tool.case-converter.name": "Skiftlägeskonverterare",
  "tool.case-converter.tagline": "Växla direkt mellan versaler, gemener, titel och andra format.",
  "tool.slug-generator.name": "Slug-generator",
  "tool.slug-generator.tagline":
    "Omvandla titlar till rena, URL-vänliga slugs med avgränsare och längd.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Generera Lorem Ipsum-platshållartext med valt antal stycken eller ord.",
  "tool.random-number.name": "Slumptalsgenerator",
  "tool.random-number.tagline":
    "Generera slumptal i ett intervall med antalsalternativ och utan dubbletter.",
  "tool.random-name.name": "Slumpmässig namnväljare",
  "tool.random-name.tagline":
    "Välj ett eller flera slumpmässiga namn från en lista med alternativ utan dubbletter.",
  "tool.json-formatter.name": "JSON-formaterare",
  "tool.json-formatter.tagline": "Försköna, minifiera och validera JSON med anpassad indragning.",
  "tool.uuid-generator.name": "UUID-generator",
  "tool.uuid-generator.tagline": "Skapa unika UUID (v4)-identifierare snabbt och i batch.",
  "tool.xml-formatter.name": "XML-formaterare",
  "tool.xml-formatter.tagline": "Försköna, minifiera och validera XML med anpassad indragning.",
  "tool.csv-viewer.name": "CSV-visare",
  "tool.csv-viewer.tagline":
    "Förhandsgranska CSV-data som en tabell med val av avgränsare och rubrikidentifiering.",
  "tool.text-compare.name": "Textjämförare",
  "tool.text-compare.tagline":
    "Jämför två textar rad för rad och markera tillägg, borttagningar och träffar.",
  "tool.qr-reader.name": "QR-läsare",
  "tool.qr-reader.tagline":
    "Skanna och avkoda QR-koder från bilder eller din kamera till text eller länkar.",
  "tool.find-and-replace.name": "Sök och ersätt",
  "tool.find-and-replace.tagline":
    "Sök och ersätt text i långa dokument med valfritt regex och skiftlägeskänslighet.",
  "tool.remove-duplicate-lines.name": "Ta bort dubbletter av rader",
  "tool.remove-duplicate-lines.tagline":
    "Ta bort dubblerade rader med skiftlägesokänslig och blankstegsmedveten matchning.",
  "tool.remove-empty-lines.name": "Ta bort tomma rader",
  "tool.remove-empty-lines.tagline": "Ta bort omedelbart tomma eller endast blankstegsrader.",
  "tool.text-cleaner.name": "Textrensare",
  "tool.text-cleaner.tagline":
    "Rensa text genom att ta bort extra blanksteg, radbrytningar och oönskade tecken.",
  "tool.sort-lines.name": "Sortera rader",
  "tool.sort-lines.tagline":
    "Sortera rader alfabetiskt, efter längd eller blanda dem med skiftläges- och tomradsalternativ.",
  "tool.reverse-text.name": "Vänd text",
  "tool.reverse-text.tagline": "Vänd text per tecken, ord eller hela rader direkt.",
  "tool.add-line-numbers.name": "Lägg till radnummer",
  "tool.add-line-numbers.tagline":
    "Lägg till sekventiella radnummer med avgränsare, utfyllnad och startförskjutning.",
  "tool.word-frequency.name": "Ordfrekvensanalys",
  "tool.word-frequency.tagline":
    "Analysera ordfrekvens med sortering, skiftlägeskänslighet och längdfilter.",
  "tool.unit-converter.name": "Enhetsomvandlare",
  "tool.unit-converter.tagline": "Konvertera direkt mellan längd-, vikt-, volymenheter och mer.",
  "tool.temperature-converter.name": "Temperaturomvandlare",
  "tool.temperature-converter.tagline": "Konvertera snabbt mellan Celsius, Fahrenheit och Kelvin.",
  "tool.base64-converter.name": "Base64-konverterare",
  "tool.base64-converter.tagline": "Koda och avkoda text till Base64 och tillbaka direkt.",
  "tool.timestamp-converter.name": "Tidsstämpelkonverterare",
  "tool.timestamp-converter.tagline":
    "Konvertera Unix-tidsstämplar till läsbara datum och tillbaka, med tidszonsstöd.",
  "tool.csv-to-json.name": "CSV till JSON",
  "tool.csv-to-json.tagline":
    "Konvertera CSV-data till strukturerad JSON med automatisk rubrikidentifiering.",
  "tool.percentage-calculator.name": "Procentberäknare",
  "tool.percentage-calculator.tagline": "Beräkna procent, ökningar och rabatter snabbt och exakt.",
  "tool.bmi-calculator.name": "BMI-kalkylator",
  "tool.bmi-calculator.tagline": "Beräkna ditt kroppsmasseindex från vikt och längd.",
  "tool.age-calculator.name": "Ålderskalkylator",
  "tool.age-calculator.tagline": "Beräkna din exakta ålder i år, månader och dagar.",
  "tool.meta-tag-generator.name": "Meta-tagggenerator",
  "tool.meta-tag-generator.tagline":
    "Skapa HTML-meta-taggar för SEO med titel, beskrivning och Open Graph.",
  "tool.url-encoder.name": "URL-kodare",
  "tool.url-encoder.tagline": "Koda och avkoda URL:er och URL-komponenter direkt.",
  "tool.html-entity-encoder.name": "HTML-entitetskodare",
  "tool.html-entity-encoder.tagline":
    "Omvandla specialtecken till HTML-entiteter och tillbaka till läsbar text.",
  "tool.html-minifier.name": "HTML-minifierare",
  "tool.html-minifier.tagline":
    "Minska storleken på din HTML genom att ta bort onödiga blanksteg och kommentarer.",
  "tool.css-minifier.name": "CSS-minifierare",
  "tool.css-minifier.tagline":
    "Komprimera din CSS genom att ta bort blanksteg, kommentarer och redundanta regler.",
  "tool.js-minifier.name": "JS-minifierare",
  "tool.js-minifier.tagline":
    "Minifiera JavaScript genom att ta bort blanksteg och kommentarer för mindre storlek.",
  "tool.json-validator.name": "JSON-validerare",
  "tool.json-validator.tagline": "Validera syntaxen i din JSON och hitta fel direkt.",
  "tool.regex-tester.name": "Regex-testare",
  "tool.regex-tester.tagline": "Testa reguljära uttryck och markera träffar i realtid.",
  "tool.jwt-decoder.name": "JWT-avkodare",
  "tool.jwt-decoder.tagline": "Avkoda JWT-tokens och inspektera innehållet i header och payload.",
  "tool.sql-formatter.name": "SQL-formaterare",
  "tool.sql-formatter.tagline":
    "Försköna och minifiera SQL-frågor med nyckelord i versaler och inställbar indragning.",
  "tool.markdown-preview.name": "Markdown-förhandsvisning",
  "tool.markdown-preview.tagline":
    "Skriv Markdown och se den renderade HTML-förhandsvisningen direkt.",
  "tool.color-converter.name": "Färgkonverterare",
  "tool.color-converter.tagline": "Konvertera mellan HEX, RGB och HSL och förhandsgranska färgen.",
  "tool.cron-parser.name": "Cron-parser",
  "tool.cron-parser.tagline":
    "Översätt cron-uttryck till klarspråk med fältuppdelning och kommande körningar.",
  "tool.xml-validator.name": "XML-validerare",
  "tool.xml-validator.tagline":
    "Validera format, taggbalans och struktur i XML med omedelbar felrapportering.",
  "tool.html-formatter.name": "HTML-formaterare",
  "tool.html-formatter.tagline":
    "Försköna och minifiera HTML med korrekt nästling och inställbar indragning.",
  "tool.yaml-formatter.name": "YAML-formaterare",
  "tool.yaml-formatter.tagline":
    "Försköna och normalisera YAML med inställbar indragning och validering.",
  "tool.markdown-table-generator.name": "Markdown-tabellgenerator",
  "tool.markdown-table-generator.tagline":
    "Skapa Markdown-tabeller visuellt och exportera dem klara att klistra in.",
  "tool.css-gradient-generator.name": "CSS-gradientgenerator",
  "tool.css-gradient-generator.tagline":
    "Designa linjära, radiella och koniska CSS-gradienter med färgstopppunkter och vinkelkontroll.",
  "tool.audio-converter.name": "Ljudkonverterare",
  "tool.audio-converter.tagline":
    "Konvertera ljudfiler (MP3, OGG, FLAC och fler) till WAV i din webbläsare.",
  "tool.video-converter.name": "Videokonverterare",
  "tool.video-converter.tagline":
    "Konvertera video till MP4 (H.264) eller AVI (MPEG-4) i din webbläsare.",
  "tool.gif-maker.name": "GIF-skapare",
  "tool.gif-maker.tagline": "Skapa en animerad GIF från uppladdade bilder eller video som stöds.",
  "tool.gif-compressor.name": "GIF-kompressor",
  "tool.gif-compressor.tagline":
    "Minska GIF-filens storlek med bibehållen acceptabel visuell kvalitet.",
  "tool.image-to-gif.name": "Bild till GIF",
  "tool.image-to-gif.tagline": "Skapa en animerad GIF från flera uppladdade bilder.",
  "tool.pdf-to-excel.name": "PDF till Excel",
  "tool.pdf-to-excel.tagline":
    "Konvertera lämpliga PDF-tabeller och -innehåll till en Excel-kompatibel fil.",
  "tool.pdf-to-powerpoint.name": "PDF till PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Konvertera lämpliga PDF-sidor och -innehåll till en PowerPoint-kompatibel fil.",
  "tool.pdf-to-text.name": "PDF till text",
  "tool.pdf-to-text.tagline": "Extrahera markerbar text från PDF-dokument.",
  "tool.pdf-crop.name": "Beskär PDF",
  "tool.pdf-crop.tagline": "Beskär PDF-sidor med inställbara beskärningsgränser.",
  "tool.pdf-page-numbers.name": "PDF-sidnummer",
  "tool.pdf-page-numbers.tagline": "Lägg till inställbara sidnummer på PDF-sidor.",
  "tool.pdf-header-footer.name": "PDF-sidhuvud och -sidfot",
  "tool.pdf-header-footer.tagline":
    "Lägg till anpassningsbara sidhuvuden och sidfötter på PDF-sidor.",
  "tool.text-to-pdf.name": "Text till PDF",
  "tool.text-to-pdf.tagline":
    "Konvertera inmatad eller inklistrad text till en nedladdningsbar PDF.",
  "tool.text-to-word.name": "Text till Word",
  "tool.text-to-word.tagline":
    "Konvertera inmatad eller inklistrad text till ett nedladdningsbart DOCX-dokument.",
  "tool.markdown-to-pdf.name": "Markdown till PDF",
  "tool.markdown-to-pdf.tagline": "Konvertera Markdown-innehåll till en formaterad PDF.",
  "tool.markdown-to-word.name": "Markdown till Word",
  "tool.markdown-to-word.tagline":
    "Konvertera Markdown-innehåll till ett formaterat DOCX-dokument.",
};
