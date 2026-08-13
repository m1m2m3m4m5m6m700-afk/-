import type { Dictionary } from "./en";
import { en } from "./en";

export const cs: Dictionary = {
  ...en,

  "lang.name": "Čeština",
  "lang.switch": "Změnit jazyk",

  "nav.tools": "Nástroje",
  "nav.categories": "Kategorie",
  "nav.popular": "Populární",
  "nav.why": "Proč Flixo",
  "nav.faq": "Časté dotazy",
  "nav.openTranslator": "Otevřít překladač",
  "nav.toggleTheme": "Přepnout motiv",
  "nav.toggleMenu": "Otevřít menu",

  "hero.badge": "Jeden prostor, všechny AI nástroje",
  "hero.title": "Jeden prostor pro každý AI nástroj",
  "hero.description":
    "Překlad, obrázky, PDF, psaní a nástroje — pět center nástrojů v jednom klidném rozhraní. Bez účtů a API klíčů; otevřete nástroj a začněte.",
  "hero.promo.badge": "Nové",
  "hero.promo.body":
    "Vyzkoušejte AI vylepšovač obrázků — doostře, zvětšete a odstraňte šum z fotek okamžitě.",
  "hero.searchLabel": "Popište, co chcete udělat",
  "hero.searchPlaceholder": "Zkuste: «přeložit do arabštiny», «shrnout PDF», «vytvořit obrázek»…",
  "hero.browse": "Procházet nástroje",
  "hero.cta": "Vyzkoušet překladač",
  "hero.note": "Zdarma · Bez registrace",

  "assistant.eyebrow": "AI asistent",
  "assistant.title": "Řekněte, co potřebujete — najdu správný nástroj",
  "assistant.placeholder": "Popište svůj úkol… např. «přeložit odstavec do francouzštiny»",
  "assistant.button": "Najít nástroj",
  "assistant.thinking": "Přemýšlím…",
  "assistant.reset": "Zeptat se na něco jiného",
  "assistant.result.category": "Kategorie",
  "assistant.result.matched": "Shoda",
  "assistant.result.open": "Otevřít nástroj",
  "assistant.result.soon": "Brzy",
  "assistant.suggestion.translation":
    "Zdá se, že chcete přeložit text. Překladač je pro vás připraven.",
  "assistant.suggestion.images":
    "Chcete pracovat s obrázky. Zatím není k dispozici žádný nástroj — požádejte o něj a dáme mu prioritu.",
  "assistant.suggestion.pdf":
    "Zmínil jste PDF. Zatím není k dispozici žádný PDF nástroj — požádejte o něj a dáme mu prioritu.",
  "assistant.suggestion.writing":
    "Potřebujete pomoc s psaním. Zatím není k dispozici žádný nástroj — požádejte o něj a dáme mu prioritu.",
  "assistant.suggestion.utilities":
    "Potřebujete utilitu. Zatím není k dispozici žádná — požádejte o ni a dáme jí prioritu.",
  "assistant.suggestion.unknown":
    "Nejsem si jistý, která kategorie se hodí. Popište to více, nebo požádejte o nový nástroj.",
  "assistant.empty.title": "Váš návrh se zobrazí zde",
  "assistant.empty.body":
    "Zadejte výše úkol a asistent vás nasměruje ke správnému nástroji Flixo — nebo pomůže požádat o nový.",

  "request.trigger": "Požádat o nástroj",
  "request.title": "Požádat o nový nástroj",
  "request.description": "Řekněte, co potřebujete, a dáme tomu prioritu pro další verzi.",
  "request.label": "Co má nástroj dělat?",
  "request.placeholder": "např. Nástroj, který převede PDF na Word se zachováním formátování…",
  "request.submit": "Odeslat žádost",
  "request.cancel": "Zrušit",
  "request.success": "Díky! Vaše žádost byla zaznamenána — dáme jí prioritu pro další verzi.",
  "request.ok": "Hotovo",

  "categories.eyebrow": "Centra nástrojů",
  "categories.title": "Pět center, jeden prostor",
  "categories.description":
    "Každý nástroj Flixo patří do jednoho z těchto center. Zatím to jsou zástupné symboly — základ je připraven růst.",
  "categories.status.coming": "Brzy",
  "categories.status.live": "{count} k dispozici",
  "categories.toolsLabel": "Plánované nástroje",
  "status.live": "K dispozici",
  "status.soon": "Brzy",

  "category.translation.name": "Překladové centrum",
  "category.translation.blurb":
    "Překládejte, lokalizujte a titulkujte ve více než 20 jazycích s automatickým rozpoznáním.",
  "category.translation.tools": "Překladač · Lokalizátor · Překladač titulků",
  "category.images.name": "Nástroje pro obrázky",
  "category.images.blurb": "Vytvářejte, zvětšujte a odstraňujte pozadí z obrázků.",
  "category.images.tools": "Generátor obrázků · Zvětšovač · Odstraňovač pozadí",
  "category.pdf.name": "PDF nástroje",
  "category.pdf.blurb": "Slučujte, rozdělte, komprimujte a převádějte PDF dokumenty.",
  "category.pdf.tools": "Sloučit · Rozdělit · Komprimovat · PDF do Wordu",
  "category.writing.name": "Psaní s AI",
  "category.writing.blurb": "Shrnujte, přepisujte a tvořte obsah ve správném tónu.",
  "category.writing.tools": "Shrnovač · Přepisovač · Tvůrce e-mailů",
  "category.utilities.name": "Utility",
  "category.utilities.blurb": "Formátujte, převádějte a tvořte každodenní technické úryvky.",
  "category.utilities.tools": "Formátovač JSON · Generátor QR · Převodník Base64",
  "category.developer.name": "Nástroje pro vývojáře",
  "category.developer.blurb": "Formátovače, validátory a generátory pro každodenní kód.",
  "category.developer.tools": "Formátovač JSON · Validátor XML · Parser Cron",

  "tool.back": "Všechny nástroje",

  "why.eyebrow": "Proč Flixo",
  "why.title": "Postaveno, aby odstraňovalo překážky, nepřidávalo funkce",
  "why.speed.title": "Ve výchozím stavu okamžité",
  "why.speed.body":
    "Nástroje se otevřou za méně než sekundu a běží v prohlížeči — bez front a pomalých startů.",
  "why.consistency.title": "Jednotné rozhraní",
  "why.consistency.body":
    "Každý nástroj sdílí stejné rozložení, zkratky a akce s výsledky, není co se učit znovu.",
  "why.privacy.title": "Soukromí na prvním místě",
  "why.privacy.body":
    "Mezi relacemi se nic neukládá. Váš vstup zůstává v panelu, kde jste ho napsali.",
  "why.access.title": "Bez účtů, bez klíčů",
  "why.access.body": "Žádné API klíče, dashboardy nebo správa licencí. Otevřete nástroj a začněte.",
  "stats.tasks": "Zpracované úkoly",
  "stats.languages": "Podporované jazyky",
  "stats.latency": "Medián doby odpovědi",
  "stats.uptime": "Dostupnost posledních 12 měsíců",

  "faq.eyebrow": "Časté dotazy",
  "faq.title": "Otázky, zodpovězené",
  "faq.description": "Vše, co stojí za to vědět, než otevřete svůj první nástroj.",
  "faq.q1": "Je Flixo zdarma?",
  "faq.a1":
    "Ano. Všechny aktuálně dostupné nástroje na Flixo jsou zdarma a nevyžadují účet ani kartu.",
  "faq.q2": "Jak překladač funguje?",
  "faq.a2":
    "Vložíte text, vyberete zdrojový a cílový jazyk (nebo necháte automatické rozpoznání) a Flixo vrátí překlad. Aktuální verze používá lokální demo engine pro zkoumání toku offline.",
  "faq.q3": "Ukládáte, co napíšu?",
  "faq.a3":
    "Ne. Vstup a výstup existují jen v panelu prohlížeče a zmizí při zavření nebo vyčištění nástroje.",
  "faq.q4": "Které jazyky jsou podporovány?",
  "faq.a4":
    "Dvacet jazyků v latinském, cyrilici, arabském, hebrejském, indickém a CJK písmu, plus automatické rozpoznání zdroje.",
  "faq.q5": "Kdy budou spuštěny ostatní nástroje?",
  "faq.a5":
    "Pět center — Překlad, Obrázky, PDF, Psaní a Utility — je plán. Nové nástroje se připojují ke stejnému registru a dědí společné rozložení.",

  "footer.tagline": "Klidný prostor pro každý AI nástroj, po který váš tým během dne sáhne.",
  "footer.product": "Produkt",
  "footer.featured": "Doporučené nástroje",
  "footer.popular": "Populární nástroje",
  "footer.numbers": "Čísla",
  "footer.categories": "Kategorie",
  "footer.tools": "Nástroje",
  "footer.more": "Více brzy",
  "footer.rights": "© {year} Flixo. Všechna práva vyhrazena.",
  "footer.built": "Postaveno pro týmy, které dodávají rychle.",

  "translator.pageDescription": "Automaticky rozpozná zdrojový jazyk a přeloží za pár sekund.",
  "translator.from": "Z",
  "translator.to": "Do",
  "translator.auto": "Automaticky rozpoznat",
  "translator.swap": "Prohodit jazyky",
  "translator.inputPlaceholder": "Napište nebo vložte text k překladu…",
  "translator.inputLabel": "Text k překladu",
  "translator.detected": "rozpoznáno {language}",
  "translator.copy": "Kopírovat",
  "translator.copied": "Zkopírováno",
  "translator.copyError": "Nepodařilo se zkopírovat do schránky.",
  "translator.genericError": "Něco se pokazilo. Zkuste to znovu.",
  "translator.clear": "Vymazat",
  "translator.translate": "Přeložit",
  "translator.translating": "Překládání…",
  "translator.emptyTitle": "Váš překlad se zobrazí zde",
  "translator.emptyBody":
    "Vyberte cílový jazyk, napište text a klikněte na Přeložit. Automatické rozpoznání najde zdroj.",

  // Tool names + taglines (76 ready tools) — nativní české technické termíny.
  "tool.translator.name": "Překladač AI",
  "tool.translator.tagline":
    "Překládejte mezi 20+ jazyky s automatickým rozpoznáváním a okamžitým přepínáním.",
  "tool.image-enhancer.name": "Vylepšovač obrázků AI",
  "tool.image-enhancer.tagline":
    "Zvyšte rozlišení až 8x, obnovte tváře, odstraňte šum a zvyšte ostrost.",
  "tool.image-compressor.name": "Kompresor obrázků",
  "tool.image-compressor.tagline":
    "Zmenšete velikost obrázkových souborů přímo ve vašem prohlížeči.",
  "tool.background-remover.name": "Odstranění pozadí",
  "tool.background-remover.tagline": "Vystřihněte pozadí obrázků a exportujte průhledné PNG.",
  "tool.video-compressor.name": "Kompresor videa",
  "tool.video-compressor.tagline":
    "Zmenšete velikost video souboru s konfigurovatelnou kvalitou a nastavením výstupu.",
  "tool.video-trimmer.name": "Střih videa",
  "tool.video-trimmer.tagline": "Vystřihněte vybranou část videa s ovládáním začátku a konce.",
  "tool.video-to-gif.name": "Video do GIF",
  "tool.video-to-gif.tagline": "Převeďte podporovaný segment videa do animovaného GIF.",
  "tool.audio-compressor.name": "Kompresor audia",
  "tool.audio-compressor.tagline":
    "Komprimujte zvukové soubory řízením kvality a přenosové rychlosti výstupu.",
  "tool.audio-cutter.name": "Střih audia",
  "tool.audio-cutter.tagline":
    "Vystřihněte vybranou část ze zvukového souboru s ovládáním začátku a konce.",
  "tool.text-to-speech.name": "Text na řeč",
  "tool.text-to-speech.tagline":
    "Převeďte psaný text na přirozený hlas s konfigurovatelnými hlasy.",
  "tool.file-hash-generator.name": "Generátor hash souborů",
  "tool.file-hash-generator.tagline":
    "Vypočítejte hash MD5, SHA-1 a SHA-256 jakéhokoliv souboru v prohlížeči.",
  "tool.qr-generator.name": "Generátor QR kódů",
  "tool.qr-generator.tagline": "Vytvořte vlastní QR kódy pro odkazy, text, Wi-Fi a kontakty.",
  "tool.barcode-generator.name": "Generátor čárových kódů",
  "tool.barcode-generator.tagline":
    "Generujte čárové kódy ve více formátech, připravené ke stažení nebo tisku.",
  "tool.password-generator.name": "Generátor hesel",
  "tool.password-generator.tagline": "Vytvořte silná, bezpečná hesla s indikátorem entropie.",
  "tool.password-checker.name": "Kontrola hesel",
  "tool.password-checker.tagline":
    "Zkontrolujte sílu, entropii a odhadovaný čas prolomení s praktickými tipy.",
  "tool.word-counter.name": "Počítadlo slov",
  "tool.word-counter.tagline": "Počítejte slova, znaky, věty a odstavce okamžitě při psaní.",
  "tool.case-converter.name": "Převodník velikosti písmen",
  "tool.case-converter.tagline":
    "Okamžitě přepínejte mezi velkými, malými, titulními a dalšími formáty.",
  "tool.slug-generator.name": "Generátor slugů",
  "tool.slug-generator.tagline":
    "Převeďte nadpisy na čisté, URL-friendly slugy s oddělovači a délkou.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Generujte zástupný text Lorem Ipsum se zvoleným počtem odstavců nebo slov.",
  "tool.random-number.name": "Generátor náhodných čísel",
  "tool.random-number.tagline":
    "Generujte náhodná čísla v rozsahu s možnostmi množství a bez duplicit.",
  "tool.random-name.name": "Náhodný výběr jmen",
  "tool.random-name.tagline":
    "Vyberte jedno nebo více náhodných jmen ze seznamu s možností bez duplicit.",
  "tool.json-formatter.name": "Formátovač JSON",
  "tool.json-formatter.tagline":
    "Zformátujte, minimalizujte a validujte JSON s vlastními možnostmi odsazení.",
  "tool.uuid-generator.name": "Generátor UUID",
  "tool.uuid-generator.tagline": "Vytvořte jedinečné identifikátory UUID (v4) rychle a hromadně.",
  "tool.xml-formatter.name": "Formátovač XML",
  "tool.xml-formatter.tagline":
    "Zformátujte, minimalizujte a validujte XML s vlastními možnostmi odsazení.",
  "tool.csv-viewer.name": "Prohlížeč CSV",
  "tool.csv-viewer.tagline":
    "Zobrazte data CSV jako tabulku s výběrem oddělovače a detekcí záhlaví.",
  "tool.text-compare.name": "Porovnávač textu",
  "tool.text-compare.tagline":
    "Porovnejte dva texty řádek po řádku a zvýrazněte přidání, mazání a shody.",
  "tool.qr-reader.name": "Čtečka QR",
  "tool.qr-reader.tagline":
    "Skenujte a dekódujte QR kódy z obrázků nebo kamery do textu nebo odkazů.",
  "tool.find-and-replace.name": "Najít a nahradit",
  "tool.find-and-replace.tagline":
    "Najděte a nahraďte text v dlouhých dokumentech s volitelným regex a rozlišením velikosti písmen.",
  "tool.remove-duplicate-lines.name": "Odstranit duplicitní řádky",
  "tool.remove-duplicate-lines.tagline":
    "Odstraňte duplicitní řádky s nerozlišujícím velikost písmen a citlivým na mezery porovnáváním.",
  "tool.remove-empty-lines.name": "Odstranit prázdné řádky",
  "tool.remove-empty-lines.tagline":
    "Okamžitě odstraňte prázdné řádky nebo řádky pouze s mezerami.",
  "tool.text-cleaner.name": "Čistič textu",
  "tool.text-cleaner.tagline":
    "Vyčistěte text odstraněním přebytečných mezer, zalomení řádků a nežádoucích znaků.",
  "tool.sort-lines.name": "Seřadit řádky",
  "tool.sort-lines.tagline":
    "Seřaďte řádky abecedně, podle délky nebo promíchejte s možnostmi velikosti písmen a prázdných řádků.",
  "tool.reverse-text.name": "Obrácení textu",
  "tool.reverse-text.tagline": "Otočte text podle znaků, slov nebo celých řádků okamžitě.",
  "tool.add-line-numbers.name": "Přidat čísla řádků",
  "tool.add-line-numbers.tagline":
    "Přidejte sekvenční čísla řádků s oddělovači, doplněním a počátečním posunem.",
  "tool.word-frequency.name": "Analyzátor frekvence slov",
  "tool.word-frequency.tagline":
    "Analyzujte frekvenci slov s řazením, rozlišením velikosti písmen a filtry délky.",
  "tool.unit-converter.name": "Převodník jednotek",
  "tool.unit-converter.tagline":
    "Okamžitě převádějte mezi jednotkami délky, hmotnosti, objemu a dalšími.",
  "tool.temperature-converter.name": "Převodník teploty",
  "tool.temperature-converter.tagline": "Rychle převádějte mezi Celsiem, Fahrenheitem a Kelvinem.",
  "tool.base64-converter.name": "Převodník Base64",
  "tool.base64-converter.tagline": "Kódujte a dekódujte text do Base64 a zpět okamžitě.",
  "tool.timestamp-converter.name": "Převodník časových razítek",
  "tool.timestamp-converter.tagline":
    "Převádějte Unixová časová razítka na čitelná data a zpět, s podporou časových pásem.",
  "tool.csv-to-json.name": "CSV do JSON",
  "tool.csv-to-json.tagline":
    "Převeďte data CSV na strukturovaný JSON s automatickou detekcí záhlaví.",
  "tool.percentage-calculator.name": "Kalkulačka procent",
  "tool.percentage-calculator.tagline": "Rychle a přesně vypočítejte procenta, nárůsty a slevy.",
  "tool.bmi-calculator.name": "Kalkulačka BMI",
  "tool.bmi-calculator.tagline": "Vypočítejte index tělesné hmotnosti z hmotnosti a výšky.",
  "tool.age-calculator.name": "Kalkulačka věku",
  "tool.age-calculator.tagline": "Vypočítejte svůj přesný věk v letech, měsících a dnech.",
  "tool.meta-tag-generator.name": "Generátor meta tagů",
  "tool.meta-tag-generator.tagline":
    "Vytvořte HTML meta tagy pro SEO s titulkem, popisem a Open Graph.",
  "tool.url-encoder.name": "Kodér URL",
  "tool.url-encoder.tagline": "Okamžitě kódujte a dekódujte URL a komponenty URL.",
  "tool.html-entity-encoder.name": "Kodér HTML entit",
  "tool.html-entity-encoder.tagline":
    "Převeďte speciální znaky na HTML entity a zpět na čitelný text.",
  "tool.html-minifier.name": "Minifikátor HTML",
  "tool.html-minifier.tagline":
    "Zmenšete velikost HTML odstraněním přebytečných mezer a komentářů.",
  "tool.css-minifier.name": "Minifikátor CSS",
  "tool.css-minifier.tagline":
    "Komprimujte CSS odstraněním mezer, komentářů a nadbytečných pravidel.",
  "tool.js-minifier.name": "Minifikátor JS",
  "tool.js-minifier.tagline":
    "Minimalizujte JavaScript odstraněním mezer a komentářů pro menší velikost.",
  "tool.json-validator.name": "Validátor JSON",
  "tool.json-validator.tagline": "Validujte syntaxi JSON a okamžitě najděte chyby.",
  "tool.regex-tester.name": "Tester regex",
  "tool.regex-tester.tagline": "Testujte regulární výrazy a zvýrazněte shody v reálném čase.",
  "tool.jwt-decoder.name": "Dekodér JWT",
  "tool.jwt-decoder.tagline": "Dekódujte tokeny JWT a prozkoumejte obsah záhlaví a payloadu.",
  "tool.sql-formatter.name": "Formátovač SQL",
  "tool.sql-formatter.tagline":
    "Zformátujte a minimalizujte SQL dotazy s klíčovými slovy velkými písmeny a konfigurovatelným odsazením.",
  "tool.markdown-preview.name": "Náhled Markdown",
  "tool.markdown-preview.tagline": "Pište Markdown a okamžitě viděte vykreslený HTML náhled.",
  "tool.color-converter.name": "Převodník barev",
  "tool.color-converter.tagline": "Převádějte mezi HEX, RGB a HSL a prohlížejte barvu.",
  "tool.cron-parser.name": "Analyzátor Cron",
  "tool.cron-parser.tagline":
    "Přeložte cron výrazy do srozumitelného jazyka s rozpisem polí a dalšími spuštěními.",
  "tool.xml-validator.name": "Validátor XML",
  "tool.xml-validator.tagline":
    "Validujte formát, rovnováhu tagů a strukturu XML s okamžitým hlášením chyb.",
  "tool.html-formatter.name": "Formátovač HTML",
  "tool.html-formatter.tagline":
    "Zformátujte a minimalizujte HTML se správným vnořením a konfigurovatelným odsazením.",
  "tool.yaml-formatter.name": "Formátovač YAML",
  "tool.yaml-formatter.tagline":
    "Zformátujte a normalizujte YAML s konfigurovatelným odsazením a validací.",
  "tool.markdown-table-generator.name": "Generátor tabulek Markdown",
  "tool.markdown-table-generator.tagline":
    "Vytvářejte tabulky Markdown vizuálně a exportujte je připravené k vložení.",
  "tool.css-gradient-generator.name": "Generátor CSS gradientů",
  "tool.css-gradient-generator.tagline":
    "Navrhujte lineární, radiální a konické CSS gradienty se zastávkami barev a ovládáním úhlu.",
  "tool.audio-converter.name": "Převodník audia",
  "tool.audio-converter.tagline":
    "Převeďte zvukové soubory (MP3, OGG, FLAC a další) na WAV v prohlížeči.",
  "tool.video-converter.name": "Převodník videa",
  "tool.video-converter.tagline": "Převeďte video na MP4 (H.264) nebo AVI (MPEG-4) v prohlížeči.",
  "tool.gif-maker.name": "Tvůrce GIF",
  "tool.gif-maker.tagline": "Vytvořte animovaný GIF z nahraných obrázků nebo podporovaného videa.",
  "tool.gif-compressor.name": "Kompresor GIF",
  "tool.gif-compressor.tagline":
    "Zmenšete velikost souboru GIF při zachování přijatelné vizuální kvality.",
  "tool.image-to-gif.name": "Obrázek do GIF",
  "tool.image-to-gif.tagline": "Vytvořte animovaný GIF z více nahraných obrázků.",
  "tool.pdf-to-excel.name": "PDF do Excel",
  "tool.pdf-to-excel.tagline":
    "Převeďte vhodné tabulky a obsah PDF na soubor kompatibilní s Excelem.",
  "tool.pdf-to-powerpoint.name": "PDF do PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Převeďte vhodné stránky a obsah PDF na soubor kompatibilní s PowerPointem.",
  "tool.pdf-to-text.name": "PDF do textu",
  "tool.pdf-to-text.tagline": "Extrahujte vybíratelný text z dokumentů PDF.",
  "tool.pdf-crop.name": "Oříznutí PDF",
  "tool.pdf-crop.tagline": "Ořízněte stránky PDF s konfigurovatelnými hranicemi oříznutí.",
  "tool.pdf-page-numbers.name": "Čísla stránek PDF",
  "tool.pdf-page-numbers.tagline": "Přidejte konfigurovatelná čísla stránek do stránek PDF.",
  "tool.pdf-header-footer.name": "Záhlaví a zápatí PDF",
  "tool.pdf-header-footer.tagline": "Přidejte přizpůsobitelná záhlaví a zápatí do stránek PDF.",
  "tool.text-to-pdf.name": "Text do PDF",
  "tool.text-to-pdf.tagline": "Převeďte zadaný nebo vložený text na stáhnutelné PDF.",
  "tool.text-to-word.name": "Text do Word",
  "tool.text-to-word.tagline": "Převeďte zadaný nebo vložený text na stáhnutelný dokument DOCX.",
  "tool.markdown-to-pdf.name": "Markdown do PDF",
  "tool.markdown-to-pdf.tagline": "Převeďte obsah Markdown na formátované PDF.",
  "tool.markdown-to-word.name": "Markdown do Word",
  "tool.markdown-to-word.tagline": "Převeďte obsah Markdown na formátovaný dokument DOCX.",
};
