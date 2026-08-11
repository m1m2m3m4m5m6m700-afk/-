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
};
