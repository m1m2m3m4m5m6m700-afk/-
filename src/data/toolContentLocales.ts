/**
 * Locale-specific tool content overrides.
 *
 * The English content in `toolContent.ts` (and the `toolSeo.ts` base it pulls
 * features/faqs from) is the single source of truth. This registry holds
 * high-quality, human-curated translations for individual content sections of
 * specific tools in specific locales.
 *
 * Resolution contract (enforced by `getToolContent(slug, locale)`):
 *   requested locale
 *     → translated section IF a non-empty override exists
 *     → English section otherwise
 *
 * Deep-merge semantics: a locale may override only some sections (e.g.
 * translated `overview` + `faqs` while `howItWorks` stays English). Missing or
 * empty (`[]`) override arrays are ignored and the English value is used — we
 * never generate placeholder or fake content.
 *
 * Do NOT add mechanical/machine translations here. If a quality translation is
 * not available for a section, leave it out so English fallback applies.
 */
import type { ToolFaqItem } from "./toolSeo";

/** A partial, per-section override of `ToolContentData`. */
export interface ToolContentOverride {
  overview?: string;
  howItWorks?: string[];
  features?: string[];
  useCases?: string[];
  examples?: string[];
  faqs?: ToolFaqItem[];
  eeat?: {
    author?: string;
    lastUpdated?: string;
    version?: string;
    supportedPlatforms?: string[];
    privacyStatement?: string;
    processingType?: "Local" | "Cloud" | "Hybrid";
  };
}

/**
 * `Record<locale, Record<slug, override>>`. Only locales + slugs with curated
 * translations appear here. Everything else resolves to English.
 */
export const toolContentLocales: Partial<Record<string, Record<string, ToolContentOverride>>> = {
  ar: {
    "password-generator": {
      overview:
        "يولّد مولّد كلمات المرور من فليكسو كلمات مرور عشوائية قوية تشفيريًا باستخدام واجهات Web Crypto القياسية. اضبط الطول من 6 إلى 64 حرفًا، وبدّل مجموعات الأحرف، واستبعد الأحرف الملتبسة، وراقب إنتروبيا كلمة المرور عبر مؤشر أمان تفاعلي.",
      faqs: [
        {
          question: "هل تُخزَّن كلمات المرور المُولّدة أو تُرسل عبر الإنترنت؟",
          answer:
            "أبدًا. تُولّد كلمات المرور على جهازك فقط باستخدام Web Crypto API، ولا تُرسل إلى أي خادم ولا تُسجَّل.",
        },
        {
          question: "ما الذي يجعل كلمة المرور قوية؟",
          answer:
            "تجمع كلمة المرور القوية بين طول كبير (16 حرفًا فأكثر) ومزيج من الأحرف الكبيرة والصغيرة والأرقام والرموز.",
        },
        {
          question: "ما هي الأحرف الملتبسة؟",
          answer:
            "هي أحرف وأرقام متشابهة بصريًا (مثل I الكبيرة وl الصغيرة ورقم 1، وحرف O ورقم 0). استبعادها يجعل كلمات المرور أسهل في القراءة عند الكتابة اليدوية.",
        },
      ],
    },
    "qr-generator": {
      overview:
        "يتيح لك مولّد رمز QR من فليكسو إنشاء رموز QR عالية الكثافة لروابط الويب وبيانات شبكة Wi-Fi والرسائل النصية ومسودات البريد الإلكتروني وأرقام الهواتف. خصّص لوني المقدمة والخلفية وصدّر صور بصيغة SVG متجهة أو PNG دقيقة جاهزة للطباعة والاستخدام الرقمي.",
      faqs: [
        {
          question: "هل تنتهي صلاحية رموز QR من فليكسو؟",
          answer:
            "لا. يرمّز فليكسو بياناتك مباشرة داخل نمط الرمز نفسه، ولا تمر عبر روابط إعادة توجيه، لذا تعمل بشكل دائم.",
        },
        {
          question: "ما الصيغ التي يمكنني تنزيلها؟",
          answer: "يمكنك تنزيل رموز QR بصيغة PNG نقطية أو SVG متجهة مستقلة الدقة.",
        },
        {
          question: "كيف أصنع رمز QR لشبكة Wi-Fi؟",
          answer:
            "اختر نمط Wi-Fi، وأدخل اسم الشبكة (SSID) وكلمة المرور ونوع الأمان، ليتمكن المسحون من الانضمام إلى شبكتك تلقائيًا.",
        },
      ],
    },
    "image-enhancer": {
      overview:
        "يحسّن محسّن الصور بالذكاء الاصطناعي من فليكسو وضوح الصور، ويرفع الدقة، ويقلّل التشويش، ويستعيد التفاصيل عبر مساحة عمل تفاعلية تعمل داخل المتصفح.",
      faqs: [
        {
          question: "كيف يرفع محسّن الصور دقة الصور؟",
          answer:
            "يستخدم فليكسو استيفاءً مكعبيًا ثنائي الأبعاد من جهة العميل مع مصفوفات التفاف قناع الحدة وتحسين النطاق الديناميكي لزيادة الدقة حتى 8 أضعاف مع إبراز التفاصيل الدقيقة.",
        },
        {
          question: "هل يمكنني استعادة الصور الضبابية أو المشوّشة؟",
          answer:
            "نعم. فعّل خيارات تقليل الضباب أو التشويش، أو استخدم الإعداد المسبق «إزالة الضباب والحدة» لاستعادة التفاصيل الناعمة وتقليل التشويش الرقمي.",
        },
        {
          question: "هل تُرفع صوري الخاصة إلى خادم سحابي؟",
          answer:
            "لا، تتم كل المعالجة محليًا في متصفحك باستخدام تقنية HTML5 Canvas، ولا تغادر ملفاتك جهازك أبدًا.",
        },
      ],
    },
    "background-remover": {
      overview:
        "يفصل مزيل الخلفيات من فليكسو العنصر الأساسي عن خلفية الصورة ويصدّر نتائج شفافة لأعمال المنتجات والصور الشخصية والتصميم.",
      faqs: [
        {
          question: "هل تُرفع صوري إلى خوادم خارجية؟",
          answer:
            "لا. يعالج فليكسو الصور بالكامل من جهة العميل باستخدام واجهات Canvas، وتبقى ملفاتك على جهازك المحلي طوال الوقت.",
        },
        {
          question: "ما صيغ الصور المدعومة؟",
          answer: "يدعم فليكسو ملفات الصور بصيغ JPG وPNG وWebP.",
        },
        {
          question: "هل يضيف فليكسو علامات مائية إلى الصور المُقتطعة المُصدّرة؟",
          answer: "أبدًا. جميع ملفات PNG الشفافة المُصدّرة نظيفة وخالية من العلامات المائية.",
        },
      ],
    },
    "image-compressor": {
      overview:
        "يقلّل ضاغط الصور من فليكسو حجم الملف لصيغ الصور الشائعة مع الحفاظ على الجودة البصرية والسماح بتحويل الصيغة بسرعة داخل المتصفح.",
      faqs: [
        {
          question: "كم يمكنني تقليل حجم صورتي؟",
          answer:
            "بحسب الصيغة الأصلية ومستوى الجودة المختار، تكون تخفيضات حجم الملف بين 40٪ و90٪ شائعة.",
        },
        {
          question: "هل يمكنني تحويل الصيغة أثناء الضغط؟",
          answer: "نعم. يمكنك اختيار صيغ الإخراج JPEG وWebP وPNG أثناء الضغط.",
        },
        {
          question: "هل هناك حد لعدد الصور التي يمكنني ضغطها؟",
          answer: "لا، ضاغط الصور من فليكسو مجاني باستخدام غير محدود.",
        },
      ],
    },
  },
  es: {
    "password-generator": {
      overview:
        "El generador de contraseñas de Flixo produce contraseñas aleatorias criptográficamente fuertes usando la API Web Crypto estándar. Ajusta la longitud de 6 a 64 caracteres, activa o desactiva conjuntos de caracteres, excluye caracteres ambiguos y supervisa la entropía con un medidor de seguridad interactivo.",
      faqs: [
        {
          question: "¿Las contraseñas generadas se guardan o envían por Internet?",
          answer:
            "Nunca. Las contraseñas se generan estrictamente en tu dispositivo con la API Web Crypto. No se envían a ningún servidor ni se registran.",
        },
        {
          question: "¿Qué hace que una contraseña sea fuerte?",
          answer:
            "Una contraseña fuerte combina una longitud considerable (16+ caracteres) con una mezcla de mayúsculas, minúsculas, números y símbolos.",
        },
        {
          question: "¿Qué son los caracteres ambiguos?",
          answer:
            "Son letras y números visualmente similares (p. ej. la 'I' mayúscula, la 'l' minúscula, el número '1', la letra 'O' y el cero '0'). Excluirlos hace que las contraseñas sean más fáciles de leer al escribirlas a mano.",
        },
      ],
    },
    "qr-generator": {
      overview:
        "El generador de códigos QR de Flixo te permite crear códigos QR de alta densidad para enlaces web, credenciales Wi-Fi, mensajes de texto, borradores de correo electrónico y números de teléfono. Personaliza los colores de primer plano y fondo y exporta imágenes SVG vectoriales o PNG nítidas listas para impresión y uso digital.",
      faqs: [
        {
          question: "¿Los códigos QR de Flixo caducan alguna vez?",
          answer:
            "No. Flixo codifica tus datos directamente en el propio patrón del código QR. Nunca pasan por enlaces de redirección y funcionan de forma permanente.",
        },
        {
          question: "¿Qué formatos puedo descargar?",
          answer:
            "Puedes descargar tus códigos QR en formato PNG de mapa de bits o SVG vectorial independiente de la resolución.",
        },
        {
          question: "¿Cómo creo un código QR para Wi-Fi?",
          answer:
            "Selecciona el modo Wi-Fi, escribe el nombre de tu red (SSID), la contraseña y el tipo de seguridad. Quien lo escanee podrá unirse a tu red automáticamente.",
        },
      ],
    },
    "image-enhancer": {
      overview:
        "El mejorador de imágenes de Flixo mejora la claridad de las fotos, aumenta la resolución, reduce el ruido y restaura detalles en un espacio de trabajo interactivo basado en el navegador.",
      faqs: [
        {
          question: "¿Cómo aumenta la resolución de las fotos el mejorador de imágenes?",
          answer:
            "Flixo utiliza interpolación bicúbica del lado del cliente combinada con matrices de convolución de máscara de enfoque y optimización del rango dinámico para aumentar la resolución hasta 8x y afilar detalles finos.",
        },
        {
          question: "¿Puedo restaurar fotos borrosas o con ruido?",
          answer:
            "Sí. Activa las opciones de reducción de desenfoque o de ruido, o usa el preset 'Desenfoque y enfoque' para recuperar detalles suaves y reducir el ruido digital.",
        },
        {
          question: "¿Se suben mis fotos privadas a un servidor en la nube?",
          answer:
            "No, todo el procesamiento se realiza localmente en tu navegador con tecnología HTML5 Canvas. Tus archivos nunca salen de tu dispositivo.",
        },
      ],
    },
    "background-remover": {
      overview:
        "El eliminador de fondos de Flixo separa el sujeto principal del fondo de la imagen y exporta resultados transparentes para flujos de trabajo de producto, perfil y diseño.",
      faqs: [
        {
          question: "¿Se suben mis imágenes a servidores externos?",
          answer:
            "No. Flixo procesa las imágenes completamente en el lado del cliente usando las API de renderizado Canvas. Tus archivos permanecen en tu dispositivo local en todo momento.",
        },
        {
          question: "¿Qué formatos de imagen son compatibles?",
          answer: "Flixo admite archivos de imagen JPG, PNG y WebP.",
        },
        {
          question: "¿Flixo añade marcas de agua a los recortes exportados?",
          answer:
            "Nunca. Todos los PNG transparentes exportados son limpios y no tienen marcas de agua.",
        },
      ],
    },
    "image-compressor": {
      overview:
        "El compresor de imágenes de Flixo reduce el tamaño de archivo de los formatos de imagen más comunes conservando la calidad visual y permitiendo una conversión rápida de formato en el navegador.",
      faqs: [
        {
          question: "¿Cuánto puedo reducir el tamaño de mi imagen?",
          answer:
            "Según el formato original y el nivel de calidad seleccionado, son habituales las reducciones de tamaño entre el 40 % y el 90 %.",
        },
        {
          question: "¿Puedo cambiar de formato mientras comprimo?",
          answer:
            "Sí. Puedes elegir entre los formatos de salida JPEG, WebP y PNG durante la compresión.",
        },
        {
          question: "¿Hay un límite de imágenes que puedo comprimir?",
          answer: "No, el compresor de imágenes de Flixo es gratuito con usos ilimitados.",
        },
      ],
    },
  },
  fr: {
    "password-generator": {
      overview:
        "Le générateur de mots de passe de Flixo crée des mots de passe aléatoires cryptographiquement forts avec des règles configurables et un indicateur de robustesse en temps réel grâce aux API cryptographiques du navigateur.",
      faqs: [
        {
          question: "Les mots de passe générés sont-ils stockés ou envoyés sur Internet ?",
          answer:
            "Jamais. Les mots de passe sont générés strictement sur votre appareil via l'API Web Crypto. Ils ne sont jamais envoyés à un serveur ni enregistrés.",
        },
        {
          question: "Qu'est-ce qui rend un mot de passe fort ?",
          answer:
            "Un mot de passe fort associe une longueur importante (16 caractères et plus) à un mélange de majuscules, minuscules, chiffres et symboles.",
        },
        {
          question: "Que sont les caractères ambigus ?",
          answer:
            "Ce sont des lettres et chiffres visuellement similaires (par ex. le 'I' majuscule, le 'l' minuscule, le chiffre '1', la lettre 'O' et le zéro '0'). Les exclure rend les mots de passe plus faciles à lire lors de la saisie manuelle.",
        },
      ],
    },
    "qr-generator": {
      overview:
        "Le générateur de codes QR de Flixo crée des codes QR pour les liens, les identifiants Wi-Fi, le texte, les e-mails et les numéros de téléphone, avec aperçu instantané et options d'exportation.",
      faqs: [
        {
          question: "Les codes QR de Flixo expirent-ils un jour ?",
          answer:
            "Non. Flixo encode vos données directement dans le motif du code QR lui-même. Ils ne passent jamais par des liens de redirection et fonctionnent de façon permanente.",
        },
        {
          question: "Quels formats puis-je télécharger ?",
          answer:
            "Vous pouvez télécharger vos codes QR au format matriciel PNG ou au format vectoriel SVG indépendant de la résolution.",
        },
        {
          question: "Comment créer un code QR pour le Wi-Fi ?",
          answer:
            "Sélectionnez le mode Wi-Fi, saisissez le nom de votre réseau (SSID), le mot de passe et le type de sécurité. Les utilisateurs pourront alors rejoindre votre réseau automatiquement.",
        },
      ],
    },
    "image-enhancer": {
      overview:
        "L'améliorateur d'images de Flixo améliore la netteté des photos, augmente la résolution, réduit le bruit et restaure les détails dans un espace de travail interactif basé sur le navigateur.",
      faqs: [
        {
          question: "Comment l'améliorateur d'images augmente-t-il la résolution des photos ?",
          answer:
            "Flixo utilise une interpolation bicubique côté client combinée à des matrices de convolution de masque de renforcement et à l'optimisation de la plage dynamique pour augmenter la résolution jusqu'à 8x tout en renforçant les détails fins.",
        },
        {
          question: "Puis-je restaurer des photos floues ou bruitées ?",
          answer:
            "Oui. Activez les options de réduction du flou ou du bruit, ou utilisez le préréglage « Réduction du flou et netteté » pour récupérer les détails atténués et réduire le bruit numérique.",
        },
        {
          question: "Mes photos privées sont-elles envoyées vers un serveur cloud ?",
          answer:
            "Non, tout le traitement est effectué localement dans votre navigateur grâce à la technologie HTML5 Canvas. Vos fichiers ne quittent jamais votre appareil.",
        },
      ],
    },
    "background-remover": {
      overview:
        "L'effaceur d'arrière-plan de Flixo sépare le sujet principal de l'arrière-plan de l'image et exporte des résultats transparents pour les flux de travail produit, profil et design.",
      faqs: [
        {
          question: "Mes images sont-elles envoyées vers des serveurs externes ?",
          answer:
            "Non. Flixo traite les images entièrement côté client via les API de rendu Canvas. Vos fichiers restent sur votre appareil local à tout moment.",
        },
        {
          question: "Quels formats d'image sont pris en charge ?",
          answer: "Flixo prend en charge les fichiers image JPG, PNG et WebP.",
        },
        {
          question: "Flixo ajoute-t-il des filigranes aux découpages exportés ?",
          answer: "Jamais. Tous les PNG transparents exportés sont propres et sans filigrane.",
        },
      ],
    },
    "image-compressor": {
      overview:
        "Le compresseur d'images de Flixo réduit la taille des fichiers pour les formats d'image courants tout en préservant la qualité visuelle et en permettant une conversion rapide du format dans le navigateur.",
      faqs: [
        {
          question: "De combien puis-je réduire la taille de mon image ?",
          answer:
            "Selon le format d'origine et le niveau de qualité sélectionné, des réductions de taille de fichier entre 40 % et 90 % sont courantes.",
        },
        {
          question: "Puis-je convertir le format lors de la compression ?",
          answer:
            "Oui. Vous pouvez choisir entre les formats de sortie JPEG, WebP et PNG lors de la compression.",
        },
        {
          question: "Y a-t-il une limite au nombre d'images que je peux compresser ?",
          answer: "Non, le compresseur d'images de Flixo est gratuit avec un usage illimité.",
        },
      ],
    },
  },
  de: {
    "password-generator": {
      overview:
        "Der Passwort-Generator von Flixo erstellt starke Zufallspasswörter mit konfigurierbaren Regeln und Live-Stärke-Feedback mithilfe der kryptografischen APIs des Browsers.",
      faqs: [
        {
          question: "Werden generierte Passwörter gespeichert oder über das Internet gesendet?",
          answer:
            "Niemals. Passwörter werden ausschließlich auf Ihrem Gerät mit der Web Crypto API erzeugt. Sie werden nie an einen Server gesendet oder protokolliert.",
        },
        {
          question: "Was macht ein Passwort stark?",
          answer:
            "Ein starkes Passwort verbindet eine ausreichende Länge (16+ Zeichen) mit einer Mischung aus Großbuchstaben, Kleinbuchstaben, Zahlen und Symbolen.",
        },
        {
          question: "Was sind mehrdeutige Zeichen?",
          answer:
            "Es handelt sich um Buchstaben und Zahlen, die sich optisch ähneln (z. B. großes 'I', kleines 'l', die Zahl '1', der Buchstabe 'O' und die Null '0'). Sie auszuschließen erleichtert das manuelle Abtippen der Passwörter.",
        },
      ],
    },
    "qr-generator": {
      overview:
        "Der QR-Code-Generator von Flixo erstellt QR-Codes für Links, WLAN-Zugangsdaten, Text, E-Mail und Telefoninhalte mit sofortiger Vorschau und Exportoptionen.",
      faqs: [
        {
          question: "Laufen Flixo-QR-Codes jemals ab?",
          answer:
            "Nein. Flixo codiert Ihre Daten direkt in das QR-Muster selbst. Sie werden nie über Weiterleitungslinks geleitet und funktionieren dauerhaft.",
        },
        {
          question: "Welche Formate kann ich herunterladen?",
          answer:
            "Sie können Ihre QR-Codes im Rasterformat PNG oder im auflösungsunabhängigen Vektorformat SVG herunterladen.",
        },
        {
          question: "Wie erstelle ich einen WLAN-QR-Code?",
          answer:
            "Wählen Sie den WLAN-Modus, geben Sie den Netzwerknamen (SSID), das Passwort und die Sicherheitsart ein. Scannende Nutzer können dann automatisch Ihrem Netzwerk beitreten.",
        },
      ],
    },
    "image-enhancer": {
      overview:
        "Der Bildverbesserer von Flixo verbessert die Bildschärfe, skaliert die Auflösung hoch, reduziert Rauschen und stellt Details in einem interaktiven browserbasierten Arbeitsbereich wieder her.",
      faqs: [
        {
          question: "Wie skaliert der Bildverbesserer Fotos hoch?",
          answer:
            "Flixo nutzt clientseitige bikubische Interpolation kombiniert mit Unsharp-Mask-Faltungsmatrizen und Dynamikumfang-Optimierung, um die Auflösung bis zu 8x zu erhöhen und feine Details zu schärfen.",
        },
        {
          question: "Kann ich verschwommene oder verrauschte Fotos wiederherstellen?",
          answer:
            "Ja. Aktivieren Sie die Optionen zur Unschärfe- oder Rauschreduzierung oder verwenden Sie die Voreinstellung 'Unschärfe reduzieren & schärfen', um weiche Details wiederherzustellen und digitales Rauschen zu verringern.",
        },
        {
          question: "Werden meine privaten Fotos auf einen Cloud-Server hochgeladen?",
          answer:
            "Nein, die gesamte Verarbeitung erfolgt lokal in Ihrem Browser mit HTML5-Canvas-Technologie. Ihre Dateien verlassen nie Ihr Gerät.",
        },
      ],
    },
    "background-remover": {
      overview:
        "Der Hintergrundentferner von Flixo trennt das Hauptmotiv vom Bildhintergrund und exportiert transparente Ergebnisse für Produkt-, Profil- und Design-Workflows.",
      faqs: [
        {
          question: "Werden meine Bilder an externe Server gesendet?",
          answer:
            "Nein. Flixo verarbeitet Bilder vollständig clientseitig über die Canvas-Rendering-APIs. Ihre Dateien bleiben durchgehend auf Ihrem lokalen Gerät.",
        },
        {
          question: "Welche Bildformate werden unterstützt?",
          answer: "Flixo unterstützt JPG-, PNG- und WebP-Bilddateien.",
        },
        {
          question: "Fügt Flixo den exportierten Ausschnitten Wasserzeichen hinzu?",
          answer:
            "Niemals. Alle exportierten transparenten PNGs sind sauber und frei von Wasserzeichen.",
        },
      ],
    },
    "image-compressor": {
      overview:
        "Der Bildkompressor von Flixo reduziert die Dateigröße gängiger Bildformate, erhält die visuelle Qualität und ermöglicht eine schnelle Formatkonvertierung im Browser.",
      faqs: [
        {
          question: "Wie stark kann ich meine Bildgröße reduzieren?",
          answer:
            "Abhängig vom Originalformat und der gewählten Qualitätsstufe sind Dateigrößenreduzierungen zwischen 40 % und 90 % üblich.",
        },
        {
          question: "Kann ich beim Komprimieren das Format konvertieren?",
          answer:
            "Ja. Sie können während der Komprimierung zwischen den Ausgabeformaten JPEG, WebP und PNG wählen.",
        },
        {
          question: "Gibt es ein Limit, wie viele Bilder ich komprimieren kann?",
          answer: "Nein, der Bildkompressor von Flixo ist kostenlos mit unbegrenzter Nutzung.",
        },
      ],
    },
  },
  pt: {
    "password-generator": {
      overview:
        "O gerador de senhas da Flixo cria senhas aleatórias fortes com regras configuráveis e orientação de força em tempo real usando as APIs criptográficas nativas do navegador.",
      faqs: [
        {
          question: "As senhas geradas são armazenadas ou enviadas pela internet?",
          answer:
            "Nunca. As senhas são geradas estritamente no seu dispositivo usando a API Web Crypto. Elas nunca são enviadas a nenhum servidor nem registradas.",
        },
        {
          question: "O que torna uma senha forte?",
          answer:
            "Uma senha forte combina um bom comprimento (16+ caracteres) com uma mistura de letras maiúsculas, minúsculas, números e símbolos.",
        },
        {
          question: "O que são caracteres ambíguos?",
          answer:
            "São letras e números visualmente semelhantes (por exemplo, o 'I' maiúsculo, o 'l' minúsculo, o número '1', a letra 'O' e o zero '0'). Excluí-los torna as senhas mais fáceis de ler ao digitá-las manualmente.",
        },
      ],
    },
    "qr-generator": {
      overview:
        "O gerador de QR Code da Flixo cria códigos QR para links, credenciais de Wi-Fi, texto, e-mail e conteúdo de telefone com visualização instantânea e opções de exportação.",
      faqs: [
        {
          question: "Os QR Codes da Flixo expiram algum dia?",
          answer:
            "Não. A Flixo codifica seus dados diretamente no padrão do próprio QR Code. Eles nunca passam por links de redirecionamento e funcionam de forma permanente.",
        },
        {
          question: "Quais formatos posso baixar?",
          answer:
            "Você pode baixar seus QR Codes no formato raster PNG ou no formato vetorial SVG independente de resolução.",
        },
        {
          question: "Como criar um QR Code de Wi-Fi?",
          answer:
            "Selecione o modo Wi-Fi, insira o nome da sua rede (SSID), a senha e o tipo de segurança. Quem escanear poderá então entrar na sua rede automaticamente.",
        },
      ],
    },
    "image-enhancer": {
      overview:
        "O melhorador de imagens da Flixo melhora a nitidez das fotos, aumenta a resolução, reduz o ruído e restaura detalhes em um espaço de trabalho interativo baseado no navegador.",
      faqs: [
        {
          question: "Como o melhorador de imagens aumenta a resolução das fotos?",
          answer:
            "A Flixo utiliza interpolação bicúbica do lado do cliente combinada com matrizes de convolução de máscara de nitidez e otimização de faixa dinâmica para aumentar a resolução até 8x e realçar detalhes finos.",
        },
        {
          question: "Posso restaurar fotos desfocadas ou com ruído?",
          answer:
            "Sim. Ative as opções de redução de desfoque ou de ruído, ou use a predefinição 'Reduzir desfoque e nitidez' para recuperar detalhes suaves e reduzir o ruído digital.",
        },
        {
          question: "Minhas fotos privadas são enviadas a um servidor na nuvem?",
          answer:
            "Não, todo o processamento é feito localmente no seu navegador usando a tecnologia HTML5 Canvas. Seus arquivos nunca saem do seu dispositivo.",
        },
      ],
    },
    "background-remover": {
      overview:
        "O removedor de fundo da Flixo separa o assunto principal do fundo da imagem e exporta resultados transparentes para fluxos de trabalho de produto, perfil e design.",
      faqs: [
        {
          question: "Minhas imagens são enviadas para servidores externos?",
          answer:
            "Não. A Flixo processa as imagens totalmente no lado do cliente usando as APIs de renderização Canvas. Seus arquivos permanecem no seu dispositivo local o tempo todo.",
        },
        {
          question: "Quais formatos de imagem são suportados?",
          answer: "A Flixo suporta arquivos de imagem JPG, PNG e WebP.",
        },
        {
          question: "A Flixo adiciona marcas d'água aos recortes exportados?",
          answer: "Nunca. Todos os PNGs transparentes exportados são limpos e sem marca d'água.",
        },
      ],
    },
    "image-compressor": {
      overview:
        "O compressor de imagens da Flixo reduz o tamanho do arquivo para formatos de imagem comuns, preservando a qualidade visual e permitindo conversão rápida de formato no navegador.",
      faqs: [
        {
          question: "Quanto posso reduzir o tamanho da minha imagem?",
          answer:
            "Dependendo do formato original e do nível de qualidade selecionado, reduções de tamanho de arquivo entre 40 % e 90 % são comuns.",
        },
        {
          question: "Posso converter o formato enquanto comprimo?",
          answer:
            "Sim. Você pode escolher entre os formatos de saída JPEG, WebP e PNG durante a compressão.",
        },
        {
          question: "Há um limite de imagens que posso comprimir?",
          answer: "Não, o compressor de imagens da Flixo é gratuito com usos ilimitados.",
        },
      ],
    },
  },
  ja: {
    "password-generator": {
      overview:
        "Flixoのパスワードジェネレーターは、ブラウザネイティブの暗号APIを使用し、設定可能なルールとリアルタイムの強度ガイド付きで強力なランダムパスワードを作成します。",
      faqs: [
        {
          question: "生成されたパスワードは保存されたりインターネット経由で送信されたりしますか？",
          answer:
            "決してありません。パスワードはWeb Crypto APIを使用してお使いの端末上でのみ生成されます。サーバーに送信されたり記録されたりすることはありません。",
        },
        {
          question: "パスワードが強力になる条件は何ですか？",
          answer:
            "強力なパスワードは、十分な長さ（16文字以上）と、大文字・小文字・数字・記号の組み合わせで構成されます。",
        },
        {
          question: "紛らわしい文字とは何ですか？",
          answer:
            "視覚的に似ている文字と数字のことです（例：大文字の「I」、小文字の「l」、数字の「1」、文字の「O」、ゼロの「0」）。これらを除外すると、手動入力時に読みやすくなります。",
        },
      ],
    },
    "qr-generator": {
      overview:
        "FlixoのQRコードジェネレーターは、リンク、Wi-Fi認証情報、テキスト、メール、電話番号向けのQRコードを、即時プレビューとエクスポートオプション付きで作成します。",
      faqs: [
        {
          question: "FlixoのQRコードに有効期限はありますか？",
          answer:
            "いいえ。Flixoはデータを直接QRパターン自体にエンコードします。リダイレクトリンクを経由することはなく、永久に機能します。",
        },
        {
          question: "どの形式でダウンロードできますか？",
          answer:
            "ラスターPNG形式または解像度に依存しないベクターSVG形式でQRコードをダウンロードできます。",
        },
        {
          question: "Wi-FiのQRコードはどうやって作成しますか？",
          answer:
            "Wi-Fiモードを選択し、ネットワーク名（SSID）、パスワード、セキュリティの種類を入力します。スキャンするユーザーが自動的にネットワークに参加できます。",
        },
      ],
    },
    "image-enhancer": {
      overview:
        "Flixoの画像補正ツールは、ブラウザベースのインタラクティブなワークスペースで写真の鮮明さを向上させ、解像度を拡大し、ノイズを低減し、ディテールを復元します。",
      faqs: [
        {
          question: "画像補正ツールはどのように写真の解像度を拡大しますか？",
          answer:
            "Flixoはクライアント側のバイキュービック補間をアンシャープマスク畳み込み行列およびダイナミックレンジ最適化と組み合わせて使用し、解像度を最大8倍まで高めながら細部をシャープにします。",
        },
        {
          question: "ぼやけた写真やノイズの多い写真を復元できますか？",
          answer:
            "はい。ぼかし軽減またはノイズ軽減の設定をオンにするか、「ぼかし軽減とシャープ化」プリセットを使用して、ソフトなディテールを復元しデジタルノイズを減らします。",
        },
        {
          question: "プライベートな写真はクラウドサーバーにアップロードされますか？",
          answer:
            "いいえ。すべての処理はHTML5 Canvas技術を使用してお使いのブラウザ内でローカルに行われます。ファイルが端末から外に出ることはありません。",
        },
      ],
    },
    "background-remover": {
      overview:
        "Flixoの背景除去ツールは、画像の背景から主要な被写体を分離し、商品・プロフィール・デザインのワークフロー向けに透明な結果をエクスポートします。",
      faqs: [
        {
          question: "画像は外部サーバーにアップロードされますか？",
          answer:
            "いいえ。FlixoはCanvasレンダリングAPIを使用して画像を完全にクライアント側で処理します。ファイルは常にローカル端末に残ります。",
        },
        {
          question: "対応している画像形式は何ですか？",
          answer: "FlixoはJPG、PNG、WebPの画像ファイルに対応しています。",
        },
        {
          question: "Flixoはエクスポートされた切り抜きに透かしを入れますか？",
          answer:
            "決して入れません。エクスポートされたすべての透明PNGはクリーンで透かしがありません。",
        },
      ],
    },
    "image-compressor": {
      overview:
        "Flixoの画像圧縮ツールは、視覚品質を保ちながら一般的な画像形式のファイルサイズを削減し、ブラウザ内で迅速な形式変換を可能にします。",
      faqs: [
        {
          question: "画像サイズはどれくらい削減できますか？",
          answer:
            "元の形式と選択した品質レベルに応じて、40%〜90%のファイルサイズ削減が一般的です。",
        },
        {
          question: "圧縮しながら形式を変換できますか？",
          answer: "はい。圧縮中に出力形式をJPEG、WebP、PNGから選択できます。",
        },
        {
          question: "圧縮できる画像数に制限はありますか？",
          answer: "いいえ、Flixoの画像圧縮ツールは無料で無制限に利用できます。",
        },
      ],
    },
  },
  "zh-CN": {
    "password-generator": {
      overview:
        "Flixo 密码生成器使用浏览器原生加密 API，通过可配置的规则和实时强度指引创建强随机密码。",
      faqs: [
        {
          question: "生成的密码会被存储或通过互联网发送吗？",
          answer:
            "绝不会。密码严格使用 Web Crypto API 在您的设备上生成，从不发送到任何服务器，也不会被记录。",
        },
        {
          question: "什么使密码变得强大？",
          answer:
            "强密码将足够的长度（16 个字符以上）与大写字母、小写字母、数字和符号的组合相结合。",
        },
        {
          question: "什么是易混淆字符？",
          answer:
            "指视觉上相似的字母和数字（例如大写「I」、小写「l」、数字「1」、字母「O」和零「0」）。排除它们能让手动输入时更易辨认。",
        },
      ],
    },
    "qr-generator": {
      overview:
        "Flixo 二维码生成器可为链接、Wi-Fi 凭据、文本、电子邮件和电话内容创建二维码，并提供即时预览和导出选项。",
      faqs: [
        {
          question: "Flixo 的二维码会过期吗？",
          answer:
            "不会。Flixo 将您的数据直接编码到二维码图案本身中，从不经过重定向链接，可永久使用。",
        },
        {
          question: "我可以下载哪些格式？",
          answer: "您可以下载光栅 PNG 格式或与分辨率无关的矢量 SVG 格式的二维码。",
        },
        {
          question: "如何制作 Wi-Fi 二维码？",
          answer:
            "选择 Wi-Fi 模式，输入您的网络名称（SSID）、密码和安全类型。扫描者即可自动加入您的网络。",
        },
      ],
    },
    "image-enhancer": {
      overview:
        "Flixo 图片增强器在基于浏览器的交互式工作区中提升照片清晰度、放大分辨率、降低噪点并恢复细节。",
      faqs: [
        {
          question: "图片增强器如何放大照片分辨率？",
          answer:
            "Flixo 使用客户端双三次插值，结合反锐化掩模卷积矩阵和动态范围优化，将分辨率提高至 8 倍，同时锐化精细细节。",
        },
        {
          question: "我能恢复模糊或有噪点的照片吗？",
          answer:
            "可以。开启模糊降低或降噪设置，或使用「去模糊与锐化」预设来恢复柔和的细节并减少数字噪点。",
        },
        {
          question: "我的私人照片会上传到云服务器吗？",
          answer:
            "不会，所有处理均使用 HTML5 Canvas 技术在浏览器本地完成，文件永远不会离开您的设备。",
        },
      ],
    },
    "background-remover": {
      overview:
        "Flixo 背景去除器将主体从图像背景中分离，并导出透明结果，适用于产品、个人形象和设计工作流。",
      faqs: [
        {
          question: "我的图片会上传到外部服务器吗？",
          answer:
            "不会。Flixo 完全在客户端使用 Canvas 渲染 API 处理图片，您的文件始终保留在本地设备上。",
        },
        {
          question: "支持哪些图片格式？",
          answer: "Flixo 支持 JPG、PNG 和 WebP 图片文件。",
        },
        {
          question: "Flixo 会在导出的抠图中添加水印吗？",
          answer: "绝不会。所有导出的透明 PNG 都是干净的，没有水印。",
        },
      ],
    },
    "image-compressor": {
      overview:
        "Flixo 图片压缩器可在保持视觉质量的同时减小常见图片格式的文件大小，并支持在浏览器内快速转换格式。",
      faqs: [
        {
          question: "我能将图片大小减小多少？",
          answer: "根据原始格式和所选质量级别，文件大小减少 40% 到 90% 是常见的。",
        },
        {
          question: "压缩时可以转换格式吗？",
          answer: "可以。您可以在压缩时选择 JPEG、WebP 和 PNG 输出格式。",
        },
        {
          question: "我能压缩的图片数量有限制吗？",
          answer: "没有，Flixo 图片压缩器免费且不限使用次数。",
        },
      ],
    },
  },
};
