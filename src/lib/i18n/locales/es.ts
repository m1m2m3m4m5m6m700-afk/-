import type { Dictionary } from "./en";
import { en } from "./en";

export const es: Dictionary = {
  ...en,

  "lang.name": "Español",
  "lang.switch": "Cambiar idioma",

  "nav.tools": "Herramientas",
  "nav.categories": "Categorías",
  "nav.popular": "Populares",
  "nav.why": "Por qué Flixo",
  "nav.faq": "Preguntas frecuentes",
  "nav.openTranslator": "Abrir traductor",
  "nav.toggleTheme": "Cambiar tema de color",
  "nav.toggleMenu": "Abrir/cerrar menú",

  "hero.badge": "Un espacio, todas las herramientas IA",
  "hero.title": "Un espacio para cada herramienta de IA",
  "hero.description":
    "Traducción, imágenes, PDF, escritura y utilidades — cinco centros de herramientas en una interfaz tranquila. Sin cuentas ni claves de API; abre una herramienta y empieza a trabajar.",
  "hero.promo.badge": "Nuevo",
  "hero.promo.body":
    "Prueba hoy el mejorador de imágenes con IA: afila, amplía y elimina el ruido de tus fotos al instante.",
  "hero.searchLabel": "Describe lo que quieres hacer",
  "hero.searchPlaceholder":
    "Prueba: «traducir esto al árabe», «resumir un PDF», «generar una imagen»…",
  "hero.browse": "Explorar herramientas",
  "hero.cta": "Probar el traductor",
  "hero.note": "Gratis · Sin registro",

  "assistant.eyebrow": "Asistente IA",
  "assistant.title": "Dime qué necesitas — encontraré la herramienta adecuada",
  "assistant.placeholder": "Describe tu tarea… p. ej. «traducir un párrafo al francés»",
  "assistant.button": "Buscar herramienta",
  "assistant.thinking": "Pensando…",
  "assistant.reset": "Preguntar otra cosa",
  "assistant.result.category": "Categoría",
  "assistant.result.matched": "Coincidencia",
  "assistant.result.open": "Abrir herramienta",
  "assistant.result.soon": "Próximamente",
  "assistant.suggestion.translation":
    "Parece que quieres traducir texto. El traductor está listo para ti.",
  "assistant.suggestion.images":
    "Buscas trabajar con imágenes. Aún no hay ninguna herramienta de imágenes disponible — pídenos una y la priorizaremos.",
  "assistant.suggestion.pdf":
    "Mencionaste un PDF. Aún no hay ninguna herramienta de PDF disponible — pídenos una y la priorizaremos.",
  "assistant.suggestion.writing":
    "Necesitas ayuda con la escritura. Aún no hay ninguna herramienta de escritura disponible — pídenos una y la priorizaremos.",
  "assistant.suggestion.utilities":
    "Necesitas una utilidad. Aún no hay ninguna disponible — pídenos una y la priorizaremos.",
  "assistant.suggestion.unknown":
    "No estoy seguro de qué categoría encaja aún. Describe un poco más, o pide una nueva herramienta y la crearemos.",
  "assistant.empty.title": "Tu sugerencia aparece aquí",
  "assistant.empty.body":
    "Escribe una tarea arriba y el asistente te llevará a la herramienta adecuada de Flixo — o te ayudará a pedir una nueva.",

  "request.trigger": "Pedir una herramienta",
  "request.title": "Pedir una herramienta nueva",
  "request.description": "Cuéntanos qué necesitas y lo priorizaremos para la próxima versión.",
  "request.label": "¿Qué necesitas que haga la herramienta?",
  "request.placeholder": "p. ej. Una herramienta que convierta PDF a Word manteniendo el formato…",
  "request.submit": "Enviar solicitud",
  "request.cancel": "Cancelar",
  "request.success":
    "¡Gracias! Hemos tomado nota de tu solicitud — la priorizaremos para la próxima versión.",
  "request.ok": "Hecho",

  "categories.eyebrow": "Centros de herramientas",
  "categories.title": "Cinco centros, un espacio",
  "categories.description":
    "Cada herramienta de Flixo vive en uno de estos centros. Por ahora son marcadores de posición — la base está lista para crecer.",
  "categories.status.coming": "Próximamente",
  "categories.status.live": "{count} disponibles",
  "categories.toolsLabel": "Herramientas planificadas",
  "status.live": "Disponible",
  "status.soon": "Pronto",

  "category.translation.name": "Centro de traducción",
  "category.translation.blurb":
    "Traduce, localiza y subtitula en más de 20 idiomas con detección automática.",
  "category.translation.tools": "Traductor · Localizador · Traductor de subtítulos",
  "category.images.name": "Herramientas de imagen",
  "category.images.blurb": "Genera, amplía y elimina fondos de imágenes.",
  "category.images.tools": "Generador de imágenes · Ampliador · Eliminador de fondos",
  "category.pdf.name": "Herramientas PDF",
  "category.pdf.blurb": "Fusiona, divide, comprime y convierte documentos PDF.",
  "category.pdf.tools": "Fusionar · Dividir · Comprimir · PDF a Word",
  "category.writing.name": "Escritura con IA",
  "category.writing.blurb": "Resume, reescribe y redacta contenido con el tono adecuado.",
  "category.writing.tools": "Resumidor · Reescritor · Redactor de correos",
  "category.utilities.name": "Utilidades",
  "category.utilities.blurb": "Formatea, convierte y genera fragmentos técnicos cotidianos.",
  "category.utilities.tools": "Formateador JSON · Generador QR · Convertidor Base64",
  "category.developer.name": "Herramientas para desarrolladores",
  "category.developer.blurb":
    "Formateadores, validadores y generadores para el día a día del código.",
  "category.developer.tools": "Formateador JSON · Validador XML · Analizador de Cron",

  "tool.back": "Todas las herramientas",

  "why.eyebrow": "Por qué Flixo",
  "why.title": "Diseñado para quitar fricción, no para añadir funciones",
  "why.speed.title": "Instantáneo por defecto",
  "why.speed.body":
    "Las herramientas se abren en menos de un segundo y funcionan en el navegador — sin colas ni arranques en frío.",
  "why.consistency.title": "Una interfaz consistente",
  "why.consistency.body":
    "Cada herramienta comparte el mismo diseño, atajos y acciones de resultados, así que nada hay que reaprender.",
  "why.privacy.title": "Privacidad primero",
  "why.privacy.body":
    "No se guarda nada entre sesiones. Tu entrada se queda en la pestaña donde la escribiste.",
  "why.access.title": "Sin cuentas, sin claves",
  "why.access.body":
    "Olvídate de claves de API, paneles y gestión de usuarios. Abre una herramienta y empieza a trabajar.",
  "stats.tasks": "Tareas procesadas",
  "stats.languages": "Idiomas disponibles",
  "stats.latency": "Tiempo de respuesta medio",
  "stats.uptime": "Disponibilidad últimos 12 meses",

  "faq.eyebrow": "Preguntas frecuentes",
  "faq.title": "Preguntas, respondidas",
  "faq.description": "Todo lo que conviene saber antes de abrir tu primera herramienta.",
  "faq.q1": "¿Flixo es gratis?",
  "faq.a1":
    "Sí. Todas las herramientas disponibles actualmente en Flixo son gratuitas y no requieren cuenta ni tarjeta de crédito.",
  "faq.q2": "¿Cómo funciona el traductor?",
  "faq.a2":
    "Pegas texto, eliges el idioma de origen y destino (o dejas que la detección automática lo haga) y Flixo devuelve la traducción. La versión actual usa un motor local de demostración para que puedas explorar el flujo completo sin conexión.",
  "faq.q3": "¿Guardáis lo que escribo?",
  "faq.a3":
    "No. La entrada y la salida viven solo en tu pestaña del navegador y desaparecen al cerrar o limpiar la herramienta.",
  "faq.q4": "¿Qué idiomas están soportados?",
  "faq.a4":
    "Veinte idiomas en escrituras latina, cirílica, árabe, hebrea, índica y CJK, además de detección automática del origen.",
  "faq.q5": "¿Cuándo se lanzarán las demás herramientas?",
  "faq.a5":
    "Los cinco centros — Traducción, Imágenes, PDF, Escritura y Utilidades — son la hoja de ruta. Las nuevas herramientas se conectan al mismo registro y heredan el diseño compartido conforme se construyen.",

  "footer.tagline":
    "Un espacio tranquilo para cada herramienta de IA que tu equipo usa durante el día.",
  "footer.product": "Producto",
  "footer.featured": "Herramientas destacadas",
  "footer.popular": "Herramientas populares",
  "footer.numbers": "Cifras",
  "footer.categories": "Categorías",
  "footer.tools": "Herramientas",
  "footer.more": "Más próximamente",
  "footer.rights": "© {year} Flixo. Todos los derechos reservados.",
  "footer.built": "Hecho para equipos que lanzan rápido.",

  "translator.pageDescription":
    "Detecta automáticamente el idioma de origen y traduce en segundos.",
  "translator.from": "De",
  "translator.to": "A",
  "translator.auto": "Detección automática",
  "translator.swap": "Intercambiar idiomas",
  "translator.inputPlaceholder": "Escribe o pega texto para traducir…",
  "translator.inputLabel": "Texto a traducir",
  "translator.detected": "detectado {language}",
  "translator.copy": "Copiar",
  "translator.copied": "Copiado",
  "translator.copyError": "No se pudo copiar al portapapeles.",
  "translator.genericError": "Algo salió mal. Inténtalo de nuevo.",
  "translator.clear": "Limpiar",
  "translator.translate": "Traducir",
  "translator.translating": "Traduciendo…",
  "translator.emptyTitle": "Tu traducción aparece aquí",
  "translator.emptyBody":
    "Elige un idioma de destino, escribe algo de texto y pulsa Traducir. La detección automática averigua el origen por ti.",

  // Tool page not-found states
  "toolPage.notFound.title": "Herramienta no disponible",
  "toolPage.notFound.description":
    "Esta herramienta no está disponible actualmente. Puede estar en desarrollo o haberse retirado.",
  "toolPage.notFound.missingTitle": "Herramienta no encontrada",
  "toolPage.notFound.missingDescription": "No se pudo encontrar la herramienta solicitada.",
  "toolPage.notFound.backHome": "Volver al inicio",

  // Local Coding Assistant (brain) UI — stays 100% client-side
  "brain.input.label": "Describe tu tarea",
  "brain.input.placeholder":
    "Describe lo que necesitas — Flixo elige la herramienta adecuada para tus archivos, texto, imágenes, vídeos o documentos.",
  "brain.input.upload": "Subir archivo",
  "brain.input.uploadHint": "Adjunta PDF, imagen, vídeo, audio o documento",
  "brain.input.dragDrop": "Arrastrar y soltar",
  "brain.input.dragDropHint": "Suelta un archivo en cualquier parte de la tarjeta para adjuntarlo",
  "brain.input.pasteLink": "Pegar enlace",
  "brain.input.linkTitle": "Pega URL web / Enlace de recurso",
  "brain.input.linkAdd": "Añadir",
  "brain.input.voice": "Voz",
  "brain.input.voiceHint": "Entrada de voz próximamente",
  "brain.input.processing": "Procesando",
  "brain.input.execute": "Ejecutar tarea",
  "brain.section.popularCategories": "Categorías populares",
  "brain.section.popularHint": "Explora por capacidad",
  "brain.section.tools": "{count} herramientas",
  "brain.section.recentTasks": "Tareas recientes",
  "brain.section.clearHistory": "Borrar historial",
  "brain.section.trendingTasks": "Tareas populares",
  "brain.section.trendingHint": "Flujos de trabajo populares de la comunidad",

  // QR Generator errors
  "qr.error.invalid": "Texto o formato de QR no válido.",
  "qr.error.copy": "No se pudo copiar el contenido.",

  // Background Remover UI
  "bgRemover.view.cutout": "Mostrar vista de resultado recortado",
  "bgRemover.view.compare": "Mostrar vista de comparación",
  "bgRemover.view.original": "Mostrar vista de imagen original",
  "bgRemover.drop.title": "Suelta tu imagen aquí, o",
  "bgRemover.drop.browse": "examina",
  "bgRemover.drop.hint":
    "Admite PNG, JPG o WebP (hasta 20 MB). Procesamiento privado en el navegador.",
  "bgRemover.viewMode": "Modo de vista:",
  "bgRemover.cutout": "Recorte",
  "bgRemover.compare": "Comparar",
  "bgRemover.original": "Original",
  "bgRemover.reset": "Restablecer",
  "bgRemover.download": "Descargar PNG",
  "bgRemover.processing": "Eliminando píxeles del fondo…",
  "bgRemover.resultLabel": "Resultado transparente",
  "bgRemover.processingFallback": "Procesando…",
  "bgRemover.refine": "Ajustar sensibilidad de eliminación",
  "bgRemover.colorTolerance": "Tolerancia de color",
  "bgRemover.edgeSoftness": "Suavidad de bordes (difuminado)",
  "bgRemover.error.invalidImage": "Selecciona un archivo de imagen válido (PNG, JPG, WebP).",
  "bgRemover.error.canvas": "No se pudo inicializar el renderizador de canvas.",
  "bgRemover.error.export": "No se pudo exportar el PNG procesado.",
  "bgRemover.error.unexpected": "Ocurrió un error inesperado durante el procesamiento.",
  "bgRemover.error.load": "No se pudo cargar la imagen para procesarla.",

  // Image Compressor UI
  "imageCompressor.drop.title": "Suelta tu imagen para comprimir, o",
  "imageCompressor.drop.browse": "examina",
  "imageCompressor.drop.hint":
    "JPG, PNG y WebP admitidos. Compresión 100 % privada en el navegador.",
  "imageCompressor.format": "Formato de salida",
  "imageCompressor.quality": "Calidad: {count}%",
  "imageCompressor.qualityHigh": "Alta calidad",
  "imageCompressor.qualityBalanced": "Equilibrado",
  "imageCompressor.qualityMax": "Compresión máxima",
  "imageCompressor.calculating": "Calculando…",
  "imageCompressor.bytesUnit": "Bytes",
  "imageCompressor.originalSize": "Tamaño original",
  "imageCompressor.compressedSize": "Tamaño comprimido",
  "imageCompressor.savedRatio": "Proporción ahorrada",
  "imageCompressor.compressAnother": "Comprimir otra",
  "imageCompressor.download": "Descargar imagen comprimida",
  "imageCompressor.compressedPreview": "Vista previa comprimida",
  "imageCompressor.error.compress": "No se pudo comprimir la imagen.",
  "imageCompressor.error.render": "No se pudo renderizar la imagen original.",
  "imageCompressor.error.invalid": "Selecciona un archivo de imagen válido.",

  // Image Enhancer UI
  "imageEnhancer.face.hint": "Restaurar detalles faciales y tonos de piel",
  "imageEnhancer.restore.hint": "Reparar colores antiguos descoloridos y daños",
  "imageEnhancer.blur.hint": "Corrección de bordes con máscara de enfoque",
  "imageEnhancer.drop.title": "Arrastra y suelta tu foto aquí",
  "imageEnhancer.drop.hint": "Admite PNG, JPG o WebP. O pulsa",
  "imageEnhancer.drop.paste": "para pegar.",
  "imageEnhancer.browse": "Examinar archivo",
  "imageEnhancer.sample": "O prueba una foto de ejemplo:",
  "imageEnhancer.sample.portrait": "Retrato",
  "imageEnhancer.sample.landscape": "Paisaje",
  "imageEnhancer.sample.architecture": "Arquitectura",
  "imageEnhancer.bytesUnit": "Bytes",
  "imageEnhancer.view.split": "Control deslizante",
  "imageEnhancer.view.side": "Lado a lado",
  "imageEnhancer.view.enhanced": "Mejorada",
  "imageEnhancer.view.original": "Original",
  "imageEnhancer.zoom": "Zoom:",
  "imageEnhancer.badge.original": "Original",
  "imageEnhancer.badge.enhancedScaled": "{scale}x Mejorada",
  "imageEnhancer.badge.enhancedOnly": "Mejorada ({scale}x)",
  "imageEnhancer.badge.originalImage": "Imagen original",
  "imageEnhancer.stats.originalSize": "Tamaño original",
  "imageEnhancer.stats.enhancedSize": "Tamaño mejorado",
  "imageEnhancer.stats.upscaleFactor": "Factor de escalado",
  "imageEnhancer.stats.superRes": "{scale}x Súper-resolución",
  "imageEnhancer.stats.morePixels": "+{count} % píxeles",
  "imageEnhancer.stats.exportFormat": "Formato de exportación",
  "imageEnhancer.stats.highFidelity": "Alta fidelidad",
  "imageEnhancer.format": "Formato:",
  "imageEnhancer.download": "Descargar mejorada",
  "imageEnhancer.presets": "Preajustes",
  "imageEnhancer.scale": "Escala de súper-resolución",
  "imageEnhancer.scaleHD": "HD",
  "imageEnhancer.scale4K": "4K Ultra",
  "imageEnhancer.scale8K": "8K Máx",
  "imageEnhancer.controls": "Controles de mejora",
  "imageEnhancer.apply": "Aplicar mejora",
  "imageEnhancer.fullscreen.title": "Comparación a pantalla completa",
  "imageEnhancer.fullscreen.close": "Cerrar vista previa",
  "imageEnhancer.error.invalid": "Selecciona un archivo de imagen válido (PNG, JPG, WebP).",
  "imageEnhancer.error.sample":
    "No se pudo cargar la imagen de ejemplo. Prueba a subir un archivo local.",
  "imageEnhancer.error.clipboard": "No se pudo copiar la imagen al portapapeles.",
  "imageEnhancer.error.enhance": "Ocurrió un error al mejorar la imagen.",
  "imageEnhancer.error.render": "No se pudo renderizar el archivo de imagen.",
  "imageEnhancer.error.canvas": "No se pudo inicializar el contexto de canvas 2D.",
  "imageEnhancer.step.loading": "Cargando fuente de la imagen…",
  "imageEnhancer.step.restoring": "Restaurando contraste, tonos faciales y rango dinámico…",
  "imageEnhancer.step.unsharp": "Ejecutando paso de máscara de enfoque…",
  "imageEnhancer.step.exporting": "Generando exportación de imagen mejorada…",

  // Image Enhancer — presets & controls (es)
  "imageEnhancer.preset.auto": "IA Automática",
  "imageEnhancer.preset.autoDesc":
    "Escalado equilibrado con reducción inteligente de ruido y restauración de color",
  "imageEnhancer.preset.portrait": "Retrato y Rostro",
  "imageEnhancer.preset.portraitDesc":
    "Corregir rasgos faciales, suavizar tonos de piel y realzar los ojos",
  "imageEnhancer.preset.restore": "Restaurar Foto Antigua",
  "imageEnhancer.preset.restoreDesc":
    "Restaurar colores desvaídos, reparar grietas y mejorar el contraste antiguo",
  "imageEnhancer.preset.deblur": "Desenfoque y Nitidez",
  "imageEnhancer.preset.deblurDesc":
    "Recuperar detalles desenfocados y definir los bordes de la imagen",
  "imageEnhancer.preset.ultra": "Ultra 8x Súper-Res",
  "imageEnhancer.preset.ultraDesc": "Escalado máximo de 8x para gráficos detallados e impresiones",
  "imageEnhancer.progressDetail": "Aplicando filtros de detalle, nitidez y ruido de IA…",
  "imageEnhancer.clipboardError":
    "La API del portapapeles no es compatible en este modo del navegador.",
  "imageEnhancer.fullscreen": "Vista previa a pantalla completa",
  "imageEnhancer.enhancing": "Mejorando imagen…",
  "imageEnhancer.copy": "Copiar imagen",
  "imageEnhancer.copied": "¡Copiado!",
  "imageEnhancer.sharpness": "Nitidez",
  "imageEnhancer.noise": "Reducción de ruido",
  "imageEnhancer.vibrance": "Viveza de color",
  "imageEnhancer.contrast": "Contraste",
  "imageEnhancer.face": "Mejora facial",
  "imageEnhancer.restore": "Restaurar foto antigua",
  "imageEnhancer.blur": "Reducción de desenfoque",

  // QR Generator UI (es)
  "qr.mode.url": "URL de sitio web",
  "qr.mode.text": "Texto sin formato",
  "qr.mode.wifi": "Red Wi-Fi",
  "qr.mode.email": "Correo electrónico",
  "qr.mode.phone": "Teléfono",
  "qr.switchMode": "Cambiar modo QR a {mode}",
  "qr.url.label": "Dirección del sitio (URL)",
  "qr.url.placeholder": "https://ejemplo.com",
  "qr.text.label": "Contenido / Mensaje de texto",
  "qr.text.placeholder": "Escribe o pega cualquier texto…",
  "qr.wifi.ssid": "Nombre de red (SSID)",
  "qr.wifi.ssidPlaceholder": "MiWiFiCasa",
  "qr.wifi.password": "Contraseña",
  "qr.wifi.passwordPlaceholder": "Contraseña Wi-Fi",
  "qr.wifi.encryption": "Tipo de cifrado",
  "qr.wifi.wpa": "WPA / WPA2 / WPA3",
  "qr.wifi.wep": "WEP",
  "qr.wifi.open": "Ninguno (Red abierta)",
  "qr.email.to": "Correo del destinatario",
  "qr.email.toPlaceholder": "nombre@ejemplo.com",
  "qr.email.subject": "Asunto (opcional)",
  "qr.email.subjectPlaceholder": "Consulta sobre un proyecto",
  "qr.phone.label": "Número de teléfono",
  "qr.phone.placeholder": "+34 600 000 000",
  "qr.customization": "Opciones de personalización",
  "qr.fgColor": "Color de primer plano",
  "qr.bgColor": "Color de fondo",
  "qr.clear": "Borrar campos",
  "qr.copiedContent": "Contenido copiado",
  "qr.copyPayload": "Copiar contenido",
  "qr.preview": "Vista previa QR en vivo",
  "qr.previewAlt": "Código QR generado",
  "qr.previewEmpty": "Introduce contenido para previsualizar el código QR",

  // Password Generator UI (es)
  "passwordGen.empty": "Selecciona al menos un conjunto de caracteres",
  "passwordGen.regenerate": "Regenerar contraseña",
  "passwordGen.copied": "¡Copiado!",
  "passwordGen.copy": "Copiar contraseña",
  "passwordGen.strength": "Seguridad de la contraseña:",
  "passwordGen.strength.weak": "Débil",
  "passwordGen.strength.fair": "Aceptable",
  "passwordGen.strength.good": "Buena",
  "passwordGen.strength.strong": "Fuerte",
  "passwordGen.strength.veryStrong": "Muy fuerte",
  "passwordGen.length": "Longitud de la contraseña",
  "passwordGen.lengthChars": "{count} caracteres",
  "passwordGen.uppercase": "Mayúsculas (A-Z)",
  "passwordGen.uppercaseHint": "p. ej. ABCDEF",
  "passwordGen.lowercase": "Minúsculas (a-z)",
  "passwordGen.lowercaseHint": "p. ej. abcdef",
  "passwordGen.numbers": "Números (0-9)",
  "passwordGen.numbersHint": "p. ej. 123456",
  "passwordGen.symbols": "Símbolos especiales (!@#$)",
  "passwordGen.symbolsHint": "p. ej. !@#$%^&*",
  "passwordGen.excludeAmbiguous": "Excluir caracteres ambiguos",
  "passwordGen.excludeAmbiguousHint": "Evitar caracteres confusos como l, 1, I, O, 0",

  // Tool names + taglines (76 ready tools) — native Spanish technical terms.
  "tool.translator.name": "Traductor IA",
  "tool.translator.tagline":
    "Traduce entre más de 20 idiomas con detección automática e intercambio instantáneo.",
  "tool.image-enhancer.name": "Mejorador de imágenes IA",
  "tool.image-enhancer.tagline":
    "Aumenta la resolución hasta 8x, restaura rostros, elimina el ruido y mejora la nitidez de las fotos.",
  "tool.image-compressor.name": "Compresor de imágenes",
  "tool.image-compressor.tagline":
    "Reduce el tamaño de los archivos de imagen directamente en tu navegador.",
  "tool.background-remover.name": "Eliminador de fondos",
  "tool.background-remover.tagline":
    "Recorta los fondos de las imágenes y exporta PNG transparentes.",
  "tool.video-compressor.name": "Compresor de vídeo",
  "tool.video-compressor.tagline":
    "Reduce el tamaño del archivo de vídeo con calidad y ajustes de salida configurables.",
  "tool.video-trimmer.name": "Recortador de vídeo",
  "tool.video-trimmer.tagline":
    "Recorta una parte seleccionada de un vídeo con controles de inicio y fin.",
  "tool.video-to-gif.name": "Vídeo a GIF",
  "tool.video-to-gif.tagline": "Convierte un segmento de vídeo compatible en un GIF animado.",
  "tool.audio-compressor.name": "Compresor de audio",
  "tool.audio-compressor.tagline":
    "Comprime archivos de audio controlando la calidad y el bitrate de salida.",
  "tool.audio-cutter.name": "Cortador de audio",
  "tool.audio-cutter.tagline":
    "Corta una parte seleccionada de un archivo de audio con controles de inicio y fin.",
  "tool.text-to-speech.name": "Texto a voz",
  "tool.text-to-speech.tagline": "Convierte texto escrito en voz natural con voces configurables.",
  "tool.file-hash-generator.name": "Generador de hash de archivos",
  "tool.file-hash-generator.tagline":
    "Calcula hashes MD5, SHA-1 y SHA-256 de cualquier archivo en tu navegador.",
  "tool.qr-generator.name": "Generador de códigos QR",
  "tool.qr-generator.tagline":
    "Crea códigos QR personalizados para enlaces, texto, Wi-Fi y datos de contacto.",
  "tool.barcode-generator.name": "Generador de códigos de barras",
  "tool.barcode-generator.tagline":
    "Genera códigos de barras en varios formatos listos para descargar o imprimir.",
  "tool.password-generator.name": "Generador de contraseñas",
  "tool.password-generator.tagline":
    "Genera contraseñas fuertes y seguras con medidor de entropía.",
  "tool.password-checker.name": "Comprobador de contraseñas",
  "tool.password-checker.tagline":
    "Comprueba la fortaleza, entropía y tiempo estimado de descifrado con consejos prácticos.",
  "tool.word-counter.name": "Contador de palabras",
  "tool.word-counter.tagline":
    "Cuenta palabras, caracteres, frases y párrafos al instante mientras escribes.",
  "tool.case-converter.name": "Conversor de mayúsculas y minúsculas",
  "tool.case-converter.tagline":
    "Cambia entre mayúsculas, minúsculas, tipo título y otros formatos al instante.",
  "tool.slug-generator.name": "Generador de slugs",
  "tool.slug-generator.tagline":
    "Convierte títulos en slugs limpios y compatibles con URL con separadores y longitud personalizados.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Genera texto de relleno Lorem Ipsum con el número de párrafos o palabras que elijas.",
  "tool.random-number.name": "Generador de números aleatorios",
  "tool.random-number.tagline":
    "Genera números aleatorios dentro de un rango con opciones de cantidad y sin duplicados.",
  "tool.random-name.name": "Selector de nombres aleatorios",
  "tool.random-name.tagline":
    "Elige uno o más nombres al azar de una lista con opción de selección sin duplicados.",
  "tool.json-formatter.name": "Formateador JSON",
  "tool.json-formatter.tagline":
    "Embellece, minimiza y valida JSON con opciones de indentación personalizadas.",
  "tool.uuid-generator.name": "Generador de UUID",
  "tool.uuid-generator.tagline": "Crea identificadores UUID únicos (v4) de forma rápida y en lote.",
  "tool.xml-formatter.name": "Formateador XML",
  "tool.xml-formatter.tagline":
    "Embellece, minimiza y valida XML con opciones de indentación personalizadas.",
  "tool.csv-viewer.name": "Visor de CSV",
  "tool.csv-viewer.tagline":
    "Previsualiza datos CSV como una tabla con selección de delimitador y detección de cabeceras.",
  "tool.text-compare.name": "Comparador de textos",
  "tool.text-compare.tagline":
    "Compara dos textos línea por línea y resalta adiciones, eliminaciones y coincidencias.",
  "tool.qr-reader.name": "Lector de QR",
  "tool.qr-reader.tagline":
    "Escanea y decodifica códigos QR desde imágenes o tu cámara en texto o enlaces.",
  "tool.find-and-replace.name": "Buscar y reemplazar",
  "tool.find-and-replace.tagline":
    "Busca y reemplaza texto en documentos largos con regex opcional y sensibilidad a mayúsculas.",
  "tool.remove-duplicate-lines.name": "Eliminar líneas duplicadas",
  "tool.remove-duplicate-lines.tagline":
    "Elimina líneas duplicadas de cualquier texto con coincidencia insensible a mayúsculas y consciente de espacios.",
  "tool.remove-empty-lines.name": "Eliminar líneas vacías",
  "tool.remove-empty-lines.tagline":
    "Elimina al instante líneas en blanco o con solo espacios de cualquier texto.",
  "tool.text-cleaner.name": "Limpiador de texto",
  "tool.text-cleaner.tagline":
    "Limpia texto eliminando espacios extra, saltos de línea y caracteres no deseados.",
  "tool.sort-lines.name": "Ordenar líneas",
  "tool.sort-lines.tagline":
    "Ordena líneas alfabéticamente, por longitud o barájalas con opciones de mayúsculas y líneas en blanco.",
  "tool.reverse-text.name": "Invertir texto",
  "tool.reverse-text.tagline":
    "Invierte el texto por caracteres, palabras o líneas completas al instante.",
  "tool.add-line-numbers.name": "Añadir números de línea",
  "tool.add-line-numbers.tagline":
    "Añade números de línea secuenciales con separadores, relleno y desplazamiento inicial personalizados.",
  "tool.word-frequency.name": "Analizador de frecuencia de palabras",
  "tool.word-frequency.tagline":
    "Analiza la frecuencia de palabras con orden, sensibilidad a mayúsculas y filtros de longitud.",
  "tool.unit-converter.name": "Conversor de unidades",
  "tool.unit-converter.tagline":
    "Convierte entre unidades de longitud, peso, volumen y más al instante.",
  "tool.temperature-converter.name": "Conversor de temperatura",
  "tool.temperature-converter.tagline": "Convierte entre Celsius, Fahrenheit y Kelvin rápidamente.",
  "tool.base64-converter.name": "Conversor Base64",
  "tool.base64-converter.tagline": "Codifica y decodifica texto a Base64 y viceversa al instante.",
  "tool.timestamp-converter.name": "Conversor de marcas de tiempo",
  "tool.timestamp-converter.tagline":
    "Convierte marcas de tiempo Unix a fechas legibles y viceversa, con soporte de zona horaria.",
  "tool.csv-to-json.name": "CSV a JSON",
  "tool.csv-to-json.tagline":
    "Convierte datos CSV a JSON estructurado con detección automática de cabeceras.",
  "tool.percentage-calculator.name": "Calculadora de porcentajes",
  "tool.percentage-calculator.tagline":
    "Calcula porcentajes, aumentos y descuentos de forma rápida y precisa.",
  "tool.bmi-calculator.name": "Calculadora de IMC",
  "tool.bmi-calculator.tagline":
    "Calcula tu índice de masa corporal a partir del peso y la altura.",
  "tool.age-calculator.name": "Calculadora de edad",
  "tool.age-calculator.tagline": "Calcula tu edad exacta en años, meses y días.",
  "tool.meta-tag-generator.name": "Generador de metaetiquetas",
  "tool.meta-tag-generator.tagline":
    "Crea metaetiquetas HTML para SEO con título, descripción y Open Graph.",
  "tool.url-encoder.name": "Codificador de URL",
  "tool.url-encoder.tagline": "Codifica y decodifica URL y componentes de URL al instante.",
  "tool.html-entity-encoder.name": "Codificador de entidades HTML",
  "tool.html-entity-encoder.tagline":
    "Convierte caracteres especiales en entidades HTML y viceversa a texto legible.",
  "tool.html-minifier.name": "Minificador de HTML",
  "tool.html-minifier.tagline":
    "Reduce el tamaño de tu HTML eliminando espacios y comentarios innecesarios.",
  "tool.css-minifier.name": "Minificador de CSS",
  "tool.css-minifier.tagline":
    "Comprime tu CSS eliminando espacios, comentarios y reglas redundantes.",
  "tool.js-minifier.name": "Minificador de JS",
  "tool.js-minifier.tagline":
    "Minifica JavaScript eliminando espacios y comentarios para un tamaño menor.",
  "tool.json-validator.name": "Validador de JSON",
  "tool.json-validator.tagline": "Valida la sintaxis de tu JSON y localiza errores al instante.",
  "tool.regex-tester.name": "Probador de regex",
  "tool.regex-tester.tagline":
    "Prueba expresiones regulares y resalta coincidencias en tiempo real.",
  "tool.jwt-decoder.name": "Decodificador de JWT",
  "tool.jwt-decoder.tagline":
    "Decodifica tokens JWT y muestra el contenido del header y del payload.",
  "tool.sql-formatter.name": "Formateador SQL",
  "tool.sql-formatter.tagline":
    "Embellece y minimiza consultas SQL con mayúsculas en palabras clave e indentación configurable.",
  "tool.markdown-preview.name": "Vista previa de Markdown",
  "tool.markdown-preview.tagline":
    "Escribe Markdown y ve la vista previa HTML renderizada al instante.",
  "tool.color-converter.name": "Conversor de colores",
  "tool.color-converter.tagline":
    "Convierte entre HEX, RGB y HSL y obtén una vista previa del color.",
  "tool.cron-parser.name": "Analizador de Cron",
  "tool.cron-parser.tagline":
    "Traduce expresiones cron a lenguaje claro con desglose de campos y próximas ejecuciones.",
  "tool.xml-validator.name": "Validador de XML",
  "tool.xml-validator.tagline":
    "Valida el formato, el equilibrio de etiquetas y la estructura del XML con errores instantáneos.",
  "tool.html-formatter.name": "Formateador HTML",
  "tool.html-formatter.tagline":
    "Embellece y minimiza HTML con anidamiento correcto e indentación configurable.",
  "tool.yaml-formatter.name": "Formateador YAML",
  "tool.yaml-formatter.tagline":
    "Embellece y normaliza YAML con indentación y validación configurables.",
  "tool.markdown-table-generator.name": "Generador de tablas Markdown",
  "tool.markdown-table-generator.tagline":
    "Crea tablas Markdown visualmente y expórtalas listas para pegar.",
  "tool.css-gradient-generator.name": "Generador de degradados CSS",
  "tool.css-gradient-generator.tagline":
    "Diseña degradados CSS lineales, radiales y cónicos con puntos de color y control de ángulo.",
  "tool.audio-converter.name": "Conversor de audio",
  "tool.audio-converter.tagline":
    "Convierte archivos de audio (MP3, OGG, FLAC y más) a WAV en tu navegador.",
  "tool.video-converter.name": "Conversor de vídeo",
  "tool.video-converter.tagline": "Convierte vídeo a MP4 (H.264) o AVI (MPEG-4) en tu navegador.",
  "tool.gif-maker.name": "Creador de GIF",
  "tool.gif-maker.tagline": "Crea un GIF animado a partir de imágenes subidas o vídeo compatible.",
  "tool.gif-compressor.name": "Compresor de GIF",
  "tool.gif-compressor.tagline":
    "Reduce el tamaño del archivo GIF manteniendo una calidad visual aceptable.",
  "tool.image-to-gif.name": "Imagen a GIF",
  "tool.image-to-gif.tagline": "Crea un GIF animado a partir de varias imágenes subidas.",
  "tool.pdf-to-excel.name": "PDF a Excel",
  "tool.pdf-to-excel.tagline":
    "Convierte tablas y contenido de PDF en un archivo compatible con Excel.",
  "tool.pdf-to-powerpoint.name": "PDF a PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Convierte páginas y contenido de PDF en un archivo compatible con PowerPoint.",
  "tool.pdf-to-text.name": "PDF a texto",
  "tool.pdf-to-text.tagline": "Extrae texto seleccionable de documentos PDF.",
  "tool.pdf-crop.name": "Recortar PDF",
  "tool.pdf-crop.tagline": "Recorta páginas de PDF con límites de recorte configurables.",
  "tool.pdf-page-numbers.name": "Números de página PDF",
  "tool.pdf-page-numbers.tagline": "Añade números de página configurables a las páginas de un PDF.",
  "tool.pdf-header-footer.name": "Encabezado y pie de página PDF",
  "tool.pdf-header-footer.tagline":
    "Añade encabezados y pies de página personalizables a las páginas de un PDF.",
  "tool.text-to-pdf.name": "Texto a PDF",
  "tool.text-to-pdf.tagline": "Convierte texto introducido o pegado en un PDF descargable.",
  "tool.text-to-word.name": "Texto a Word",
  "tool.text-to-word.tagline":
    "Convierte texto introducido o pegado en un documento DOCX descargable.",
  "tool.markdown-to-pdf.name": "Markdown a PDF",
  "tool.markdown-to-pdf.tagline": "Convierte contenido Markdown en un PDF con formato.",
  "tool.markdown-to-word.name": "Markdown a Word",
  "tool.markdown-to-word.tagline": "Convierte contenido Markdown en un documento DOCX con formato.",
};
