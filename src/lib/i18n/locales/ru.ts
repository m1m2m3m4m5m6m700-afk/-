import type { Dictionary } from "./en";
import { en } from "./en";

export const ru: Dictionary = {
  ...en,

  "lang.name": "Русский",
  "lang.switch": "Сменить язык",

  "nav.tools": "Инструменты",
  "nav.categories": "Категории",
  "nav.popular": "Популярные",
  "nav.why": "Почему Flixo",
  "nav.faq": "Вопросы и ответы",
  "nav.openTranslator": "Открыть переводчик",
  "nav.toggleTheme": "Сменить тему",
  "nav.toggleMenu": "Открыть меню",

  "hero.badge": "Одно пространство, все ИИ-инструменты",
  "hero.title": "Одно пространство для каждого ИИ-инструмента",
  "hero.description":
    "Перевод, изображения, PDF, тексты и утилиты — пять центров инструментов в спокойном интерфейсе. Без аккаунтов и API-ключей; откройте инструмент и начинайте.",
  "hero.promo.badge": "Новое",
  "hero.promo.body":
    "Попробуйте ИИ-улучшитель изображений — повышайте резкость, увеличивайте и убирайте шум с фотографий мгновенно.",
  "hero.searchLabel": "Опишите, что хотите сделать",
  "hero.searchPlaceholder":
    "Попробуйте: «перевести на арабский», «сделать краткое содержание PDF», «сгенерировать изображение»…",
  "hero.browse": "Просмотреть инструменты",
  "hero.cta": "Попробовать переводчик",
  "hero.note": "Бесплатно · Без регистрации",

  "assistant.eyebrow": "ИИ-ассистент",
  "assistant.title": "Скажите, что нужно — найду подходящий инструмент",
  "assistant.placeholder": "Опишите задачу… напр. «перевести абзац на французский»",
  "assistant.button": "Найти инструмент",
  "assistant.thinking": "Думаю…",
  "assistant.reset": "Спросить другое",
  "assistant.result.category": "Категория",
  "assistant.result.matched": "Совпадение",
  "assistant.result.open": "Открыть инструмент",
  "assistant.result.soon": "Скоро",
  "assistant.suggestion.translation":
    "Похоже, вы хотите перевести текст. Переводчик готов для вас.",
  "assistant.suggestion.images":
    "Вы хотите работать с изображениями. Инструментов для изображений пока нет — оставьте запрос, и мы назначим им приоритет.",
  "assistant.suggestion.pdf":
    "Вы упомянули PDF. Инструментов PDF пока нет — оставьте запрос, и мы назначим им приоритет.",
  "assistant.suggestion.writing":
    "Вам нужна помощь с текстом. Инструментов для письма пока нет — оставьте запрос, и мы назначим им приоритет.",
  "assistant.suggestion.utilities":
    "Вам нужна утилита. Их пока нет — оставьте запрос, и мы назначим приоритет.",
  "assistant.suggestion.unknown":
    "Не уверен, какая категория подходит. Опишите подробнее или оставьте запрос на новый инструмент.",
  "assistant.empty.title": "Ваша подсказка появится здесь",
  "assistant.empty.body":
    "Введите задачу выше, и ассистент подберёт подходящий инструмент Flixo — или поможет запросить новый.",

  "request.trigger": "Запросить инструмент",
  "request.title": "Запросить новый инструмент",
  "request.description": "Скажите, что нужно, и мы назначим этому приоритет в следующем выпуске.",
  "request.label": "Что должен делать инструмент?",
  "request.placeholder":
    "напр. Инструмент, который конвертирует PDF в Word с сохранением форматирования…",
  "request.submit": "Отправить запрос",
  "request.cancel": "Отмена",
  "request.success":
    "Спасибо! Ваш запрос зафиксирован — мы назначим ему приоритет в следующем выпуске.",
  "request.ok": "Готово",

  "categories.eyebrow": "Центры инструментов",
  "categories.title": "Пять центров, одно пространство",
  "categories.description":
    "Каждый инструмент Flixo относится к одному из этих центров. Пока это заглушки — фундамент готов к росту.",
  "categories.status.coming": "Скоро",
  "categories.status.live": "{count} доступно",
  "categories.toolsLabel": "Запланированные инструменты",
  "status.live": "Доступно",
  "status.soon": "Скоро",

  "category.translation.name": "Центр перевода",
  "category.translation.blurb":
    "Переводите, локализуйте и создавайте субтитры более чем на 20 языках с автоматическим распознаванием.",
  "category.translation.tools": "Переводчик · Локализатор · Переводчик субтитров",
  "category.images.name": "Инструменты для изображений",
  "category.images.blurb": "Создавайте, увеличивайте и удаляйте фон с изображений.",
  "category.images.tools": "Генератор изображений · Улучшитель · Удалитель фона",
  "category.pdf.name": "PDF-инструменты",
  "category.pdf.blurb": "Объединяйте, разделяйте, сжимайте и конвертируйте PDF-документы.",
  "category.pdf.tools": "Объединить · Разделить · Сжать · PDF в Word",
  "category.writing.name": "Письмо с ИИ",
  "category.writing.blurb":
    "Делайте краткое содержание, переписывайте и создавайте контент в нужном тоне.",
  "category.writing.tools": "Саммари · Рерайтер · Генератор писем",
  "category.utilities.name": "Утилиты",
  "category.utilities.blurb":
    "Форматируйте, конвертируйте и генерируйте повседневные технические фрагменты.",
  "category.utilities.tools": "JSON-форматтер · QR-генератор · Base64-конвертер",
  "category.developer.name": "Инструменты разработчика",
  "category.developer.blurb": "Форматтеры, валидаторы и генераторы для повседневного кода.",
  "category.developer.tools": "JSON-форматтер · XML-валидатор · Cron-парсер",

  "tool.back": "Все инструменты",

  "why.eyebrow": "Почему Flixo",
  "why.title": "Создано, чтобы устранять трение, а не добавлять функции",
  "why.speed.title": "Мгновенно по умолчанию",
  "why.speed.body":
    "Инструменты открываются менее чем за секунду и работают в браузере — без очередей и холодных запусков.",
  "why.consistency.title": "Единый интерфейс",
  "why.consistency.body":
    "У каждого инструмента одинаковая компоновка, горячие клавиши и действия с результатами — не нужно переучиваться.",
  "why.privacy.title": "Приватность прежде всего",
  "why.privacy.body":
    "Между сессиями ничего не сохраняется. Ваш ввод остаётся во вкладке, где вы его ввели.",
  "why.access.title": "Без аккаунтов, без ключей",
  "why.access.body":
    "Без API-ключей, дашбордов и управления местом. Откройте инструмент и начинайте.",
  "stats.tasks": "Обработанных задач",
  "stats.languages": "Поддерживаемые языки",
  "stats.latency": "Медианное время ответа",
  "stats.uptime": "Доступность за последние 12 месяцев",

  "faq.eyebrow": "Частые вопросы",
  "faq.title": "Вопросы и ответы",
  "faq.description": "Всё, что стоит знать, прежде чем открыть свой первый инструмент.",
  "faq.q1": "Flixo бесплатный?",
  "faq.a1":
    "Да. Все инструменты, доступные сейчас в Flixo, бесплатны и не требуют аккаунта или карты.",
  "faq.q2": "Как работает переводчик?",
  "faq.a2":
    "Вы вставляете текст, выбираете исходный и целевой язык (или оставляете автоопределение), и Flixo возвращает перевод. Текущая версия использует локальный демонстрационный движок для исследования потока офлайн.",
  "faq.q3": "Вы сохраняете то, что я пишу?",
  "faq.a3":
    "Нет. Ввод и вывод существуют только во вкладке браузера и исчезают при закрытии или очистке инструмента.",
  "faq.q4": "Какие языки поддерживаются?",
  "faq.a4":
    "Двадцать языков латиницей, кириллицей, арабским, ивритом, индийским и CJK письмом, плюс автоматическое распознавание источника.",
  "faq.q5": "Когда появятся другие инструменты?",
  "faq.a5":
    "Пять центров — Перевод, Изображения, PDF, Письмо и Утилиты — это дорожная карта. Новые инструменты подключаются к тому же реестру и наследуют общую компоновку.",

  "footer.tagline":
    "Спокойное пространство для каждого ИИ-инструмента, к которому ваша команда обращается в течение дня.",
  "footer.product": "Продукт",
  "footer.featured": "Рекомендованные инструменты",
  "footer.popular": "Популярные инструменты",
  "footer.numbers": "Цифры",
  "footer.categories": "Категории",
  "footer.tools": "Инструменты",
  "footer.more": "Ещё скоро",
  "footer.rights": "© {year} Flixo. Все права защищены.",
  "footer.built": "Создано для команд, которые доставляют быстро.",

  "translator.pageDescription":
    "Автоматически распознаёт исходный язык и переводит за несколько секунд.",
  "translator.from": "С",
  "translator.to": "На",
  "translator.auto": "Автоопределение",
  "translator.swap": "Поменять языки",
  "translator.inputPlaceholder": "Введите или вставьте текст для перевода…",
  "translator.inputLabel": "Текст для перевода",
  "translator.detected": "определено {language}",
  "translator.copy": "Копировать",
  "translator.copied": "Скопировано",
  "translator.copyError": "Не удалось скопировать в буфер обмена.",
  "translator.genericError": "Что-то пошло не так. Попробуйте ещё раз.",
  "translator.clear": "Очистить",
  "translator.translate": "Перевести",
  "translator.translating": "Перевод…",
  "translator.emptyTitle": "Ваш перевод появится здесь",
  "translator.emptyBody":
    "Выберите целевой язык, введите текст и нажмите «Перевести». Автоопределение найдет источник.",

  // Tool names + taglines (76 ready tools) — нативные русские технические термины.
  "tool.translator.name": "Переводчик ИИ",
  "tool.translator.tagline":
    "Переводите между 20+ языками с автоматическим определением и мгновенным переключением.",
  "tool.image-enhancer.name": "Улучшитель изображений ИИ",
  "tool.image-enhancer.tagline":
    "Повышайте разрешение до 8x, восстанавливайте лица, удаляйте шум и повышайте резкость.",
  "tool.image-compressor.name": "Сжатие изображений",
  "tool.image-compressor.tagline": "Уменьшайте размер файлов изображений прямо в браузере.",
  "tool.background-remover.name": "Удаление фона",
  "tool.background-remover.tagline": "Вырезайте фон изображений и экспортируйте прозрачные PNG.",
  "tool.video-compressor.name": "Сжатие видео",
  "tool.video-compressor.tagline":
    "Уменьшайте размер видеофайла с настраиваемым качеством и параметрами вывода.",
  "tool.video-trimmer.name": "Обрезка видео",
  "tool.video-trimmer.tagline":
    "Обрезайте выбранную часть видео с элементами управления начала и конца.",
  "tool.video-to-gif.name": "Видео в GIF",
  "tool.video-to-gif.tagline": "Конвертируйте поддерживаемый фрагмент видео в анимированный GIF.",
  "tool.audio-compressor.name": "Сжатие аудио",
  "tool.audio-compressor.tagline": "Сжимайте аудиофайлы, контролируя качество и битрейт вывода.",
  "tool.audio-cutter.name": "Обрезка аудио",
  "tool.audio-cutter.tagline":
    "Вырезайте выбранную часть из аудиофайла с управлением начала и конца.",
  "tool.text-to-speech.name": "Текст в речь",
  "tool.text-to-speech.tagline":
    "Преобразуйте написанный текст в естественную речь с настраиваемыми голосами.",
  "tool.file-hash-generator.name": "Генератор хеша файлов",
  "tool.file-hash-generator.tagline":
    "Вычисляйте хеши MD5, SHA-1 и SHA-256 любого файла в браузере.",
  "tool.qr-generator.name": "Генератор QR-кодов",
  "tool.qr-generator.tagline":
    "Создавайте пользовательские QR-коды для ссылок, текста, Wi-Fi и контактов.",
  "tool.barcode-generator.name": "Генератор штрихкодов",
  "tool.barcode-generator.tagline":
    "Создавайте штрихкоды в нескольких форматах, готовые к скачиванию или печати.",
  "tool.password-generator.name": "Генератор паролей",
  "tool.password-generator.tagline":
    "Создавайте надёжные, безопасные пароли с индикатором энтропии.",
  "tool.password-checker.name": "Проверка паролей",
  "tool.password-checker.tagline":
    "Проверяйте надёжность, энтропию и примерное время взлома с практическими советами.",
  "tool.word-counter.name": "Счётчик слов",
  "tool.word-counter.tagline": "Считайте слова, символы, предложения и абзацы мгновенно при вводе.",
  "tool.case-converter.name": "Конвертер регистра",
  "tool.case-converter.tagline":
    "Мгновенно переключайтесь между верхним, нижним регистром, заголовком и другими форматами.",
  "tool.slug-generator.name": "Генератор slug-ов",
  "tool.slug-generator.tagline":
    "Преобразуйте заголовки в чистые, URL-совместимые slug-и с разделителями и длиной.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Создавайте текст-заполнитель Lorem Ipsum с выбранным числом абзацев или слов.",
  "tool.random-number.name": "Генератор случайных чисел",
  "tool.random-number.tagline":
    "Создавайте случайные числа в диапазоне с параметрами количества и без дубликатов.",
  "tool.random-name.name": "Выбор случайных имён",
  "tool.random-name.tagline":
    "Выбирайте одно или несколько случайных имён из списка с опцией без дубликатов.",
  "tool.json-formatter.name": "Форматировщик JSON",
  "tool.json-formatter.tagline":
    "Форматируйте, минифицируйте и валидируйте JSON с настраиваемыми отступами.",
  "tool.uuid-generator.name": "Генератор UUID",
  "tool.uuid-generator.tagline": "Создавайте уникальные идентификаторы UUID (v4) быстро и пакетно.",
  "tool.xml-formatter.name": "Форматировщик XML",
  "tool.xml-formatter.tagline":
    "Форматируйте, минифицируйте и валидируйте XML с настраиваемыми отступами.",
  "tool.csv-viewer.name": "Просмотрщик CSV",
  "tool.csv-viewer.tagline":
    "Предварительно просматривайте данные CSV как таблицу с выбором разделителя и определением заголовков.",
  "tool.text-compare.name": "Сравнение текстов",
  "tool.text-compare.tagline":
    "Сравнивайте два текста построчно и выделяйте добавления, удаления и совпадения.",
  "tool.qr-reader.name": "Считыватель QR",
  "tool.qr-reader.tagline":
    "Сканируйте и декодируйте QR-коды из изображений или камеры в текст или ссылки.",
  "tool.find-and-replace.name": "Найти и заменить",
  "tool.find-and-replace.tagline":
    "Находите и заменяйте текст в длинных документах с опциональным regex и учётом регистра.",
  "tool.remove-duplicate-lines.name": "Удалить повторяющиеся строки",
  "tool.remove-duplicate-lines.tagline":
    "Удаляйте повторяющиеся строки с нечувствительным к регистру и учитывающим пробелы сопоставлением.",
  "tool.remove-empty-lines.name": "Удалить пустые строки",
  "tool.remove-empty-lines.tagline":
    "Мгновенно удаляйте пустые строки или строки только с пробелами.",
  "tool.text-cleaner.name": "Очиститель текста",
  "tool.text-cleaner.tagline":
    "Очищайте текст, удаляя лишние пробелы, переносы строк и нежелательные символы.",
  "tool.sort-lines.name": "Сортировать строки",
  "tool.sort-lines.tagline":
    "Сортируйте строки по алфавиту, по длине или перемешивайте с опциями регистра и пустых строк.",
  "tool.reverse-text.name": "Реверс текста",
  "tool.reverse-text.tagline":
    "Изменяйте порядок текста по символам, словам или целым строкам мгновенно.",
  "tool.add-line-numbers.name": "Добавить номера строк",
  "tool.add-line-numbers.tagline":
    "Добавляйте последовательные номера строк с разделителями, заполнением и смещением начала.",
  "tool.word-frequency.name": "Анализатор частоты слов",
  "tool.word-frequency.tagline":
    "Анализируйте частоту слов с сортировкой, учётом регистра и фильтрами длины.",
  "tool.unit-converter.name": "Конвертер единиц",
  "tool.unit-converter.tagline":
    "Мгновенно конвертируйте между единицами длины, веса, объёма и другими.",
  "tool.temperature-converter.name": "Конвертер температуры",
  "tool.temperature-converter.tagline":
    "Быстро конвертируйте между Цельсием, Фаренгейтом и Кельвином.",
  "tool.base64-converter.name": "Конвертер Base64",
  "tool.base64-converter.tagline": "Кодируйте и декодируйте текст в Base64 и обратно мгновенно.",
  "tool.timestamp-converter.name": "Конвертер меток времени",
  "tool.timestamp-converter.tagline":
    "Конвертируйте метки времени Unix в читаемые даты и обратно, с поддержкой часовых поясов.",
  "tool.csv-to-json.name": "CSV в JSON",
  "tool.csv-to-json.tagline":
    "Конвертируйте данные CSV в структурированный JSON с автоматическим определением заголовков.",
  "tool.percentage-calculator.name": "Калькулятор процентов",
  "tool.percentage-calculator.tagline": "Быстро и точно вычисляйте проценты, увеличения и скидки.",
  "tool.bmi-calculator.name": "Калькулятор ИМТ",
  "tool.bmi-calculator.tagline": "Вычисляйте индекс массы тела по весу и росту.",
  "tool.age-calculator.name": "Калькулятор возраста",
  "tool.age-calculator.tagline": "Вычисляйте свой точный возраст в годах, месяцах и днях.",
  "tool.meta-tag-generator.name": "Генератор мета-тегов",
  "tool.meta-tag-generator.tagline":
    "Создавайте HTML мета-теги для SEO с заголовком, описанием и Open Graph.",
  "tool.url-encoder.name": "Кодировщик URL",
  "tool.url-encoder.tagline": "Мгновенно кодируйте и декодируйте URL-адреса и компоненты URL.",
  "tool.html-entity-encoder.name": "Кодировщик HTML-сущностей",
  "tool.html-entity-encoder.tagline":
    "Преобразуйте специальные символы в HTML-сущности и обратно в читаемый текст.",
  "tool.html-minifier.name": "Минификатор HTML",
  "tool.html-minifier.tagline": "Уменьшайте размер HTML, удаляя лишние пробелы и комментарии.",
  "tool.css-minifier.name": "Минификатор CSS",
  "tool.css-minifier.tagline": "Сжимайте CSS, удаляя пробелы, комментарии и избыточные правила.",
  "tool.js-minifier.name": "Минификатор JS",
  "tool.js-minifier.tagline":
    "Минифицируйте JavaScript, удаляя пробелы и комментарии для меньшего размера.",
  "tool.json-validator.name": "Валидатор JSON",
  "tool.json-validator.tagline": "Валидируйте синтаксис JSON и мгновенно находите ошибки.",
  "tool.regex-tester.name": "Тестер regex",
  "tool.regex-tester.tagline":
    "Тестируйте регулярные выражения и выделяйте совпадения в реальном времени.",
  "tool.jwt-decoder.name": "Декодер JWT",
  "tool.jwt-decoder.tagline":
    "Декодируйте токены JWT и просматривайте содержимое заголовка и полезной нагрузки.",
  "tool.sql-formatter.name": "Форматировщик SQL",
  "tool.sql-formatter.tagline":
    "Форматируйте и минифицируйте SQL-запросы с ключевыми словами в верхнем регистре и настраиваемыми отступами.",
  "tool.markdown-preview.name": "Предпросмотр Markdown",
  "tool.markdown-preview.tagline":
    "Пишите Markdown и мгновенно видьте отрисованный HTML-предпросмотр.",
  "tool.color-converter.name": "Конвертер цветов",
  "tool.color-converter.tagline": "Конвертируйте между HEX, RGB и HSL и просматривайте цвет.",
  "tool.cron-parser.name": "Анализатор Cron",
  "tool.cron-parser.tagline":
    "Переводите cron-выражения на понятный язык с разбивкой полей и предстоящими запусками.",
  "tool.xml-validator.name": "Валидатор XML",
  "tool.xml-validator.tagline":
    "Валидируйте корректность, баланс тегов и структуру XML с мгновенным отчётом об ошибках.",
  "tool.html-formatter.name": "Форматировщик HTML",
  "tool.html-formatter.tagline":
    "Форматируйте и минифицируйте HTML с правильной вложенностью и настраиваемыми отступами.",
  "tool.yaml-formatter.name": "Форматировщик YAML",
  "tool.yaml-formatter.tagline":
    "Форматируйте и нормализуйте YAML с настраиваемыми отступами и валидацией.",
  "tool.markdown-table-generator.name": "Генератор таблиц Markdown",
  "tool.markdown-table-generator.tagline":
    "Создавайте таблицы Markdown визуально и экспортируйте их готовыми к вставке.",
  "tool.css-gradient-generator.name": "Генератор градиентов CSS",
  "tool.css-gradient-generator.tagline":
    "Проектируйте линейные, радиальные и конические градиенты CSS с цветовыми остановками и управлением углом.",
  "tool.audio-converter.name": "Конвертер аудио",
  "tool.audio-converter.tagline":
    "Конвертируйте аудиофайлы (MP3, OGG, FLAC и другие) в WAV в браузере.",
  "tool.video-converter.name": "Конвертер видео",
  "tool.video-converter.tagline": "Конвертируйте видео в MP4 (H.264) или AVI (MPEG-4) в браузере.",
  "tool.gif-maker.name": "Создатель GIF",
  "tool.gif-maker.tagline":
    "Создавайте анимированный GIF из загруженных изображений или поддерживаемого видео.",
  "tool.gif-compressor.name": "Сжатие GIF",
  "tool.gif-compressor.tagline":
    "Уменьшайте размер GIF-файла, сохраняя приемлемое визуальное качество.",
  "tool.image-to-gif.name": "Изображение в GIF",
  "tool.image-to-gif.tagline":
    "Создавайте анимированный GIF из нескольких загруженных изображений.",
  "tool.pdf-to-excel.name": "PDF в Excel",
  "tool.pdf-to-excel.tagline":
    "Конвертируйте подходящие таблицы и содержимое PDF в файл, совместимый с Excel.",
  "tool.pdf-to-powerpoint.name": "PDF в PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Конвертируйте подходящие страницы и содержимое PDF в файл, совместимый с PowerPoint.",
  "tool.pdf-to-text.name": "PDF в текст",
  "tool.pdf-to-text.tagline": "Извлекайте выделяемый текст из документов PDF.",
  "tool.pdf-crop.name": "Обрезка PDF",
  "tool.pdf-crop.tagline": "Обрезайте страницы PDF с настраиваемыми границами обрезки.",
  "tool.pdf-page-numbers.name": "Номера страниц PDF",
  "tool.pdf-page-numbers.tagline": "Добавляйте настраиваемые номера страниц к страницам PDF.",
  "tool.pdf-header-footer.name": "Верхний и нижний колонтитулы PDF",
  "tool.pdf-header-footer.tagline":
    "Добавляйте настраиваемые верхние и нижние колонтитулы к страницам PDF.",
  "tool.text-to-pdf.name": "Текст в PDF",
  "tool.text-to-pdf.tagline": "Конвертируйте введённый или вставленный текст в PDF для скачивания.",
  "tool.text-to-word.name": "Текст в Word",
  "tool.text-to-word.tagline":
    "Конвертируйте введённый или вставленный текст в документ DOCX для скачивания.",
  "tool.markdown-to-pdf.name": "Markdown в PDF",
  "tool.markdown-to-pdf.tagline": "Конвертируйте содержимое Markdown в отформатированный PDF.",
  "tool.markdown-to-word.name": "Markdown в Word",
  "tool.markdown-to-word.tagline":
    "Конвертируйте содержимое Markdown в отформатированный документ DOCX.",
};
