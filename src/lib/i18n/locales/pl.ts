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

  // Tool names + taglines (76 ready tools) — natywne polskie terminy techniczne.
  "tool.translator.name": "Tłumacz AI",
  "tool.translator.tagline":
    "Tłumacz między 20+ językami z automatycznym wykrywaniem i natychmiastową zamianą.",
  "tool.image-enhancer.name": "Poprawiacz obrazów AI",
  "tool.image-enhancer.tagline":
    "Zwiększ rozdzielczość do 8x, przywróć twarze, usuń szum i wyostrz zdjęcia.",
  "tool.image-compressor.name": "Kompresor obrazów",
  "tool.image-compressor.tagline": "Zmniejsz rozmiar plików obrazów bezpośrednio w przeglądarce.",
  "tool.background-remover.name": "Usuwanie tła",
  "tool.background-remover.tagline": "Wytnij tła obrazów i eksportuj przezroczyste pliki PNG.",
  "tool.video-compressor.name": "Kompresor wideo",
  "tool.video-compressor.tagline":
    "Zmniejsz rozmiar pliku wideo z konfigurowalną jakością i ustawieniami wyjścia.",
  "tool.video-trimmer.name": "Przycinacz wideo",
  "tool.video-trimmer.tagline":
    "Przytnij wybrany fragment wideo za pomocą kontrolek początku i końca.",
  "tool.video-to-gif.name": "Wideo na GIF",
  "tool.video-to-gif.tagline": "Konwertuj obsługiwany fragment wideo na animowany GIF.",
  "tool.audio-compressor.name": "Kompresor audio",
  "tool.audio-compressor.tagline": "Kompresuj pliki audio, kontrolując jakość i bitrate wyjścia.",
  "tool.audio-cutter.name": "Przycinacz audio",
  "tool.audio-cutter.tagline":
    "Wytnij wybrany fragment z pliku audio za pomocą kontrolek początku i końca.",
  "tool.text-to-speech.name": "Tekst na mowę",
  "tool.text-to-speech.tagline":
    "Zamień wpisany tekst na naturalną mowę z konfigurowalnymi głosami.",
  "tool.file-hash-generator.name": "Generator skrótu pliku",
  "tool.file-hash-generator.tagline":
    "Oblicz skróty MD5, SHA-1 i SHA-256 dowolnego pliku w przeglądarce.",
  "tool.qr-generator.name": "Generator kodów QR",
  "tool.qr-generator.tagline":
    "Twórz niestandardowe kody QR dla linków, tekstu, Wi-Fi i kontaktów.",
  "tool.barcode-generator.name": "Generator kodów kreskowych",
  "tool.barcode-generator.tagline":
    "Generuj kody kreskowe w wielu formatach gotowe do pobrania lub druku.",
  "tool.password-generator.name": "Generator haseł",
  "tool.password-generator.tagline": "Generuj silne, bezpieczne hasła z miernikiem entropii.",
  "tool.password-checker.name": "Sprawdzarka haseł",
  "tool.password-checker.tagline":
    "Sprawdź siłę, entropię i szacowany czas złamania hasła z praktycznymi wskazówkami.",
  "tool.word-counter.name": "Licznik słów",
  "tool.word-counter.tagline": "Licz słowa, znaki, zdania i akapity natychmiast podczas pisania.",
  "tool.case-converter.name": "Konwerter wielkości liter",
  "tool.case-converter.tagline":
    "Przełączaj między wielkimi, małymi literami, tytułem i innymi formatami natychmiast.",
  "tool.slug-generator.name": "Generator slugów",
  "tool.slug-generator.tagline":
    "Zamień tytuły na czyste, przyjazne URL slugi z separatorami i długością.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Generuj tekst wypełniający Lorem Ipsum z wybraną liczbą akapitów lub słów.",
  "tool.random-number.name": "Generator liczb losowych",
  "tool.random-number.tagline":
    "Generuj liczby losowe w zakresie z opcjami ilości i bez duplikatów.",
  "tool.random-name.name": "Losowanie imion",
  "tool.random-name.tagline":
    "Wybierz jedno lub więcej losowych imion z listy z opcją bez duplikatów.",
  "tool.json-formatter.name": "Formater JSON",
  "tool.json-formatter.tagline":
    "Formatuj, minifikuj i waliduj JSON z niestandardowymi opcjami wcięć.",
  "tool.uuid-generator.name": "Generator UUID",
  "tool.uuid-generator.tagline": "Twórz unikalne identyfikatory UUID (v4) szybko i zbiorczo.",
  "tool.xml-formatter.name": "Formater XML",
  "tool.xml-formatter.tagline":
    "Formatuj, minifikuj i waliduj XML z niestandardowymi opcjami wcięć.",
  "tool.csv-viewer.name": "Przeglądarka CSV",
  "tool.csv-viewer.tagline":
    "Podgląd danych CSV jako tabeli z wyborem separatora i wykrywaniem nagłówków.",
  "tool.text-compare.name": "Porównywarka tekstów",
  "tool.text-compare.tagline":
    "Porównaj dwa teksty linia po linii i podświetl dodatki, usunięcia i dopasowania.",
  "tool.qr-reader.name": "Czytnik QR",
  "tool.qr-reader.tagline": "Skanuj i dekoduj kody QR z obrazów lub kamery na tekst lub linki.",
  "tool.find-and-replace.name": "Znajdź i zamień",
  "tool.find-and-replace.tagline":
    "Znajdź i zamień tekst w długich dokumentach z opcjonalnym regex i uwzględnieniem wielkości liter.",
  "tool.remove-duplicate-lines.name": "Usuń zduplikowane linie",
  "tool.remove-duplicate-lines.tagline":
    "Usuń zduplikowane linie z ignorowaniem wielkości liter i uwzględnieniem spacji.",
  "tool.remove-empty-lines.name": "Usuń puste linie",
  "tool.remove-empty-lines.tagline": "Natychmiast usuń puste linie lub zawierające tylko spacje.",
  "tool.text-cleaner.name": "Czyścik tekstu",
  "tool.text-cleaner.tagline":
    "Wyczyść tekst, usuwając nadmiarowe spacje, podziały wierszy i niechciane znaki.",
  "tool.sort-lines.name": "Sortuj linie",
  "tool.sort-lines.tagline":
    "Sortuj linie alfabetycznie, po długości lub tasuj z opcjami wielkości liter i pustych linii.",
  "tool.reverse-text.name": "Odwróć tekst",
  "tool.reverse-text.tagline": "Odwróć tekst po znakach, słowach lub całych liniach natychmiast.",
  "tool.add-line-numbers.name": "Dodaj numery wierszy",
  "tool.add-line-numbers.tagline":
    "Dodaj sekwencyjne numery wierszy z separatorami, wypełnieniem i przesunięciem początkowym.",
  "tool.word-frequency.name": "Analizator częstotliwości słów",
  "tool.word-frequency.tagline":
    "Analizuj częstotliwość słów z sortowaniem, uwzględnieniem wielkości liter i filtrami długości.",
  "tool.unit-converter.name": "Konwerter jednostek",
  "tool.unit-converter.tagline":
    "Konwertuj natychmiast między jednostkami długości, wagi, objętości i więcej.",
  "tool.temperature-converter.name": "Konwerter temperatury",
  "tool.temperature-converter.tagline":
    "Szybko konwertuj między Celsjuszem, Fahrenheitem i Kelvinem.",
  "tool.base64-converter.name": "Konwerter Base64",
  "tool.base64-converter.tagline": "Koduj i dekoduj tekst do Base64 i z powrotem natychmiast.",
  "tool.timestamp-converter.name": "Konwerter znaczników czasu",
  "tool.timestamp-converter.tagline":
    "Konwertuj znaczniki czasu Unix na czytelne daty i z powrotem, z obsługą stref czasowych.",
  "tool.csv-to-json.name": "CSV na JSON",
  "tool.csv-to-json.tagline":
    "Konwertuj dane CSV na ustrukturyzowany JSON z automatycznym wykrywaniem nagłówków.",
  "tool.percentage-calculator.name": "Kalkulator procentowy",
  "tool.percentage-calculator.tagline": "Szybko i dokładnie obliczaj procenty, wzrosty i rabaty.",
  "tool.bmi-calculator.name": "Kalkulator BMI",
  "tool.bmi-calculator.tagline": "Oblicz swój wskaźnik masy ciała z wagi i wzrostu.",
  "tool.age-calculator.name": "Kalkulator wieku",
  "tool.age-calculator.tagline": "Oblicz swój dokładny wiek w latach, miesiącach i dniach.",
  "tool.meta-tag-generator.name": "Generator meta tagów",
  "tool.meta-tag-generator.tagline": "Twórz meta tagi HTML dla SEO z tytułem, opisem i Open Graph.",
  "tool.url-encoder.name": "Koder URL",
  "tool.url-encoder.tagline": "Koduj i dekoduj URL-e i komponenty URL natychmiast.",
  "tool.html-entity-encoder.name": "Koder encji HTML",
  "tool.html-entity-encoder.tagline":
    "Zamień znaki specjalne na encje HTML i z powrotem na czytelny tekst.",
  "tool.html-minifier.name": "Minifikator HTML",
  "tool.html-minifier.tagline": "Zmniejsz rozmiar HTML, usuwając zbędne spacje i komentarze.",
  "tool.css-minifier.name": "Minifikator CSS",
  "tool.css-minifier.tagline": "Kompresuj CSS, usuwając spacje, komentarze i nadmiarowe reguły.",
  "tool.js-minifier.name": "Minifikator JS",
  "tool.js-minifier.tagline":
    "Minifikuj JavaScript, usuwając spacje i komentarze dla mniejszego rozmiaru.",
  "tool.json-validator.name": "Walidator JSON",
  "tool.json-validator.tagline": "Waliduj składnię JSON i natychmiast znajdź błędy.",
  "tool.regex-tester.name": "Tester regex",
  "tool.regex-tester.tagline":
    "Testuj wyrażenia regularne i podświetlaj dopasowania w czasie rzeczywistym.",
  "tool.jwt-decoder.name": "Dekoder JWT",
  "tool.jwt-decoder.tagline": "Dekoduj tokeny JWT i sprawdzaj zawartość nagłówka i ładunku.",
  "tool.sql-formatter.name": "Formater SQL",
  "tool.sql-formatter.tagline":
    "Formatuj i minifikuj zapytania SQL z wielkimi literami słów kluczowych i konfigurowalnym wcięciem.",
  "tool.markdown-preview.name": "Podgląd Markdown",
  "tool.markdown-preview.tagline": "Pisz w Markdown i natychmiast widz renderowany podgląd HTML.",
  "tool.color-converter.name": "Konwerter kolorów",
  "tool.color-converter.tagline": "Konwertuj między HEX, RGB i HSL i zobacz podgląd koloru.",
  "tool.cron-parser.name": "Parser Cron",
  "tool.cron-parser.tagline":
    "Przetłumacz wyrażenia cron na zwykły język z podziałem pól i nadchodzącymi uruchomieniami.",
  "tool.xml-validator.name": "Walidator XML",
  "tool.xml-validator.tagline":
    "Waliduj poprawność, balans tagów i strukturę XML z natychmiastowym raportowaniem błędów.",
  "tool.html-formatter.name": "Formater HTML",
  "tool.html-formatter.tagline":
    "Formatuj i minifikuj HTML z poprawnym zagnieżdżeniem i konfigurowalnym wcięciem.",
  "tool.yaml-formatter.name": "Formater YAML",
  "tool.yaml-formatter.tagline":
    "Formatuj i normalizuj YAML z konfigurowalnym wcięciem i walidacją.",
  "tool.markdown-table-generator.name": "Generator tabel Markdown",
  "tool.markdown-table-generator.tagline":
    "Twórz tabele Markdown wizualnie i eksportuj gotowe do wklejenia.",
  "tool.css-gradient-generator.name": "Generator gradientów CSS",
  "tool.css-gradient-generator.tagline":
    "Projektuj liniowe, radialne i stożkowe gradienty CSS z punktami kolorów i kontrolą kąta.",
  "tool.audio-converter.name": "Konwerter audio",
  "tool.audio-converter.tagline":
    "Konwertuj pliki audio (MP3, OGG, FLAC i więcej) na WAV w przeglądarce.",
  "tool.video-converter.name": "Konwerter wideo",
  "tool.video-converter.tagline": "Konwertuj wideo na MP4 (H.264) lub AVI (MPEG-4) w przeglądarce.",
  "tool.gif-maker.name": "Kreator GIF",
  "tool.gif-maker.tagline": "Utwórz animowany GIF z przesłanych obrazów lub obsługiwanego wideo.",
  "tool.gif-compressor.name": "Kompresor GIF",
  "tool.gif-compressor.tagline":
    "Zmniejsz rozmiar pliku GIF, zachowując akceptowalną jakość wizualną.",
  "tool.image-to-gif.name": "Obraz na GIF",
  "tool.image-to-gif.tagline": "Utwórz animowany GIF z wielu przesłanych obrazów.",
  "tool.pdf-to-excel.name": "PDF na Excel",
  "tool.pdf-to-excel.tagline":
    "Konwertuj odpowiednie tabele i treści PDF na plik zgodny z Excelem.",
  "tool.pdf-to-powerpoint.name": "PDF na PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Konwertuj odpowiednie strony i treści PDF na plik zgodny z PowerPoint.",
  "tool.pdf-to-text.name": "PDF na tekst",
  "tool.pdf-to-text.tagline": "Wyodrębnij zaznaczalny tekst z dokumentów PDF.",
  "tool.pdf-crop.name": "Przytnij PDF",
  "tool.pdf-crop.tagline": "Przytnij strony PDF z konfigurowalnymi granicami przycinania.",
  "tool.pdf-page-numbers.name": "Numery stron PDF",
  "tool.pdf-page-numbers.tagline": "Dodaj konfigurowalne numery stron do stron PDF.",
  "tool.pdf-header-footer.name": "Nagłówek i stopka PDF",
  "tool.pdf-header-footer.tagline": "Dodaj dostosowywane nagłówki i stopki do stron PDF.",
  "tool.text-to-pdf.name": "Tekst na PDF",
  "tool.text-to-pdf.tagline": "Konwertuj wpisany lub wklejony tekst na pobierany plik PDF.",
  "tool.text-to-word.name": "Tekst na Word",
  "tool.text-to-word.tagline": "Konwertuj wpisany lub wklejony tekst na pobierany dokument DOCX.",
  "tool.markdown-to-pdf.name": "Markdown na PDF",
  "tool.markdown-to-pdf.tagline": "Konwertuj treść Markdown na sformatowany plik PDF.",
  "tool.markdown-to-word.name": "Markdown na Word",
  "tool.markdown-to-word.tagline": "Konwertuj treść Markdown na sformatowany dokument DOCX.",
};
