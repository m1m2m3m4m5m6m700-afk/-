import type { Dictionary } from "./en";
import { en } from "./en";

export const pl: Dictionary = {
  ...en,

  "lang.name": "Polski",
  "lang.switch": "Zmień język",

  "nav.tools": "Narzędzia",
  "nav.categories": "Kategorie",
  "nav.popular": "Popularne",
  "nav.why": "Dlaczego Flixo",
  "nav.faq": "FAQ",
  "nav.openTranslator": "Otwórz tłumacza",
  "nav.toggleTheme": "Przełącz motyw",
  "nav.toggleMenu": "Otwórz menu",

  "hero.badge": "Jeden obszar roboczy, wszystkie narzędzia AI",
  "hero.title": "Jeden obszar roboczy dla każdego narzędzia AI",
  "hero.description":
    "Tłumaczenia, obrazy, PDF, pisanie i narzędzia — pięć centrów narzędzi w spokojnym interfejsie. Bez kont i kluczy API; otwórz narzędzie i zacznij pracę.",
  "hero.promo.badge": "Nowość",
  "hero.promo.body":
    "Wypróbuj poprawiacz obrazów AI — wyostrz, powiększ i usuń szum ze swoich zdjęć natychmiast.",
  "hero.searchLabel": "Opisz, co chcesz zrobić",
  "hero.searchPlaceholder": "Spróbuj: «przetłumacz na arabski», «podsumuj PDF», «wygeneruj obraz»…",
  "hero.browse": "Przeglądaj narzędzia",
  "hero.cta": "Wypróbuj tłumacza",
  "hero.note": "Za darmo · Bez rejestracji",

  "assistant.eyebrow": "Asystent AI",
  "assistant.title": "Powiedz, czego potrzebujesz — znajdę odpowiednie narzędzie",
  "assistant.placeholder": "Opisz swoje zadanie… np. «przetłumacz akapit na francuski»",
  "assistant.button": "Znajdź narzędzie",
  "assistant.thinking": "Myślę…",
  "assistant.reset": "Zapytaj o coś innego",
  "assistant.result.category": "Kategoria",
  "assistant.result.matched": "Dopasowanie",
  "assistant.result.open": "Otwórz narzędzie",
  "assistant.result.soon": "Wkrótce",
  "assistant.suggestion.translation":
    "Wygląda na to, że chcesz przetłumaczyć tekst. Tłumacz jest gotowy dla Ciebie.",
  "assistant.suggestion.images":
    "Chcesz pracować z obrazami. Nie ma jeszcze żadnego narzędzia — poproś o nie, a nadamy mu priorytet.",
  "assistant.suggestion.pdf":
    "Wspomniałeś o PDF-ie. Nie ma jeszcze żadnego narzędzia PDF — poproś o nie, a nadamy mu priorytet.",
  "assistant.suggestion.writing":
    "Potrzebujesz pomocy w pisaniu. Nie ma jeszcze narzędzia do pisania — poproś o nie, a nadamy mu priorytet.",
  "assistant.suggestion.utilities":
    "Potrzebujesz narzędzia pomocniczego. Nie ma jeszcze żadnego — poproś o nie, a nadamy mu priorytet.",
  "assistant.suggestion.unknown":
    "Nie jestem pewien, która kategoria pasuje. Opisz więcej albo poproś o nowe narzędzie.",
  "assistant.empty.title": "Twoja sugestia pojawi się tutaj",
  "assistant.empty.body":
    "Wpisz zadanie powyżej, a asystent skieruje Cię do odpowiedniego narzędzia Flixo — albo pomoże poprosić o nowe.",

  "request.trigger": "Poproś o narzędzie",
  "request.title": "Poproś o nowe narzędzie",
  "request.description": "Powiedz, czego potrzebujesz, a nadamy temu priorytet w następnej wersji.",
  "request.label": "Co ma robić narzędzie?",
  "request.placeholder": "np. Narzędzie, które konwertuje PDF na Word zachowując formatowanie…",
  "request.submit": "Wyślij prośbę",
  "request.cancel": "Anuluj",
  "request.success":
    "Dzięki! Twoja prośba została zapisana — nadamy jej priorytet w następnej wersji.",
  "request.ok": "Gotowe",

  "categories.eyebrow": "Centra narzędzi",
  "categories.title": "Pięć centrów, jeden obszar roboczy",
  "categories.description":
    "Każde narzędzie Flixo należy do jednego z tych centrów. Na razie to symbole zastępcze — fundament jest gotowy do rozwoju.",
  "categories.status.coming": "Wkrótce",
  "categories.status.live": "{count} dostępne",
  "categories.toolsLabel": "Planowane narzędzia",
  "status.live": "Dostępne",
  "status.soon": "Wkrótce",

  "category.translation.name": "Centrum tłumaczeń",
  "category.translation.blurb":
    "Tłumacz, lokalizuj i napisz napisy w ponad 20 językach z automatycznym wykrywaniem.",
  "category.translation.tools": "Tłumacz · Lokalizator · Tłumacz napisów",
  "category.images.name": "Narzędzia obrazów",
  "category.images.blurb": "Generuj, powiększaj i usuwaj tła z obrazów.",
  "category.images.tools": "Generator obrazów · Powiększacz · Usuwanie tła",
  "category.pdf.name": "Narzędzia PDF",
  "category.pdf.blurb": "Łącz, dziel, kompresuj i konwertuj dokumenty PDF.",
  "category.pdf.tools": "Łącz · Dziel · Kompresuj · PDF na Word",
  "category.writing.name": "Pisanie AI",
  "category.writing.blurb": "Podsumowuj, przepisuj i twórz treści we właściwym tonie.",
  "category.writing.tools": "Podsumowacz · Przepisywacz · Twórca e-maili",
  "category.utilities.name": "Narzędzia pomocnicze",
  "category.utilities.blurb": "Formatuj, konwertuj i generuj codzienne fragmenty techniczne.",
  "category.utilities.tools": "Formater JSON · Generator QR · Konwerter Base64",
  "category.developer.name": "Narzędzia programisty",
  "category.developer.blurb": "Formatery, walidatory i generatory do codziennego kodu.",
  "category.developer.tools": "Formater JSON · Walidator XML · Parser Cron",

  "tool.back": "Wszystkie narzędzia",

  "why.eyebrow": "Dlaczego Flixo",
  "why.title": "Zbudowany, by usuwać tarcie, a nie dodawać funkcje",
  "why.speed.title": "Natychmiastowo domyślnie",
  "why.speed.body":
    "Narzędzia otwierają się w mniej niż sekundę i działają w przeglądarce — bez kolejek i zimnych startów.",
  "why.consistency.title": "Spójny interfejs",
  "why.consistency.body":
    "Każde narzędzie dzieli ten sam układ, skróty i akcje wyników, nic nie trzeba uczyć na nowo.",
  "why.privacy.title": "Prywatność przede wszystkim",
  "why.privacy.body":
    "Między sesjami nic nie jest zapisywane. Twój tekst zostaje w karcie, w której go napisałeś.",
  "why.access.title": "Bez kont, bez kluczy",
  "why.access.body": "Bez kluczy API, paneli i zarządzania miejscami. Otwórz narzędzie i zacznij.",
  "stats.tasks": "Przetworzone zadania",
  "stats.languages": "Obsługiwane języki",
  "stats.latency": "Mediana czasu odpowiedzi",
  "stats.uptime": "Dostępność ostatnie 12 miesięcy",

  "faq.eyebrow": "FAQ",
  "faq.title": "Pytania, na które odpowiedziano",
  "faq.description": "Warto wiedzieć, zanim otworzysz swoje pierwsze narzędzie.",
  "faq.q1": "Czy Flixo jest darmowe?",
  "faq.a1":
    "Tak. Wszystkie obecnie dostępne narzędzia na Flixo są darmowe i nie wymagają konta ani karty.",
  "faq.q2": "Jak działa tłumacz?",
  "faq.a2":
    "Wklejasz tekst, wybierasz język źródłowy i docelowy (lub zostawiasz automatycznemu wykrywaniu), a Flixo zwraca tłumaczenie. Obecna wersja używa lokalnego silnika demo, aby eksplorować przepływ offline.",
  "faq.q3": "Czy przechowujecie to, co piszę?",
  "faq.a3":
    "Nie. Wejście i wyjście istnieją tylko w Twojej karcie i znikają po zamknięciu lub wyczyszczeniu narzędzia.",
  "faq.q4": "Jakie języki są obsługiwane?",
  "faq.a4":
    "Dwadzieścia języków w pismach łacińskim, cyrylicy, arabskim, hebrajskim, indyjskim i CJK, plus automatyczne wykrywanie źródła.",
  "faq.q5": "Kiedy pojawią się pozostałe narzędzia?",
  "faq.a5":
    "Pięć centrów — Tłumaczenia, Obrazy, PDF, Pisanie i Narzędzia — to roadmap. Nowe narzędzia podłączają się do tego samego rejestru i dziedziczą wspólny układ.",

  "footer.tagline":
    "Spokojny obszar roboczy dla każdego narzędzia AI, po które Twój zespół sięga w ciągu dnia.",
  "footer.product": "Produkt",
  "footer.featured": "Polecane narzędzia",
  "footer.popular": "Popularne narzędzia",
  "footer.numbers": "Liczby",
  "footer.categories": "Kategorie",
  "footer.tools": "Narzędzia",
  "footer.more": "Wkrótce więcej",
  "footer.rights": "© {year} Flixo. Wszelkie prawa zastrzeżone.",
  "footer.built": "Stworzone dla zespołów, które dostarczają szybko.",

  "translator.pageDescription": "Automatycznie wykrywa język źródłowy i tłumaczy w kilka sekund.",
  "translator.from": "Z",
  "translator.to": "Na",
  "translator.auto": "Wykryj automatycznie",
  "translator.swap": "Zamień języki",
  "translator.inputPlaceholder": "Wpisz lub wklej tekst do przetłumaczenia…",
  "translator.inputLabel": "Tekst do przetłumaczenia",
  "translator.detected": "wykryto {language}",
  "translator.copy": "Kopiuj",
  "translator.copied": "Skopiowano",
  "translator.copyError": "Nie udało się skopiować do schowka.",
  "translator.genericError": "Coś poszło nie tak. Spróbuj ponownie.",
  "translator.clear": "Wyczyść",
  "translator.translate": "Przetłumacz",
  "translator.translating": "Tłumaczenie…",
  "translator.emptyTitle": "Twoje tłumaczenie pojawi się tutaj",
  "translator.emptyBody":
    "Wybierz język docelowy, wpisz tekst i naciśnij Przetłumacz. Automatyczne wykrywanie znajdzie źródło.",
};
