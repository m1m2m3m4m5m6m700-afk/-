import type { Dictionary } from "./en";
import { en } from "./en";

export const de: Dictionary = {
  ...en,

  "lang.name": "Deutsch",
  "lang.switch": "Sprache ändern",

  "nav.tools": "Werkzeuge",
  "nav.categories": "Kategorien",
  "nav.popular": "Beliebt",
  "nav.why": "Warum Flixo",
  "nav.faq": "FAQ",
  "nav.openTranslator": "Übersetzer öffnen",
  "nav.toggleTheme": "Farbschema umschalten",
  "nav.toggleMenu": "Menü ein-/ausblenden",

  "hero.badge": "Ein Workspace, alle KI-Werkzeuge",
  "hero.title": "Ein Workspace für jedes KI-Werkzeug",
  "hero.description":
    "Übersetzung, Bilder, PDF, Schreiben und Hilfsmittel — fünf Werkzeugzentren in einer ruhigen Oberfläche. Keine Konten, keine API-Schlüssel; öffne ein Werkzeug und leg los.",
  "hero.promo.badge": "Neu",
  "hero.promo.body":
    "Probiere den KI-Bildverbesserer: Schärfe, vergrößere und entferne Rauschen aus deinen Fotos sofort.",
  "hero.searchLabel": "Beschreibe, was du tun möchtest",
  "hero.searchPlaceholder":
    "Versuch: „übersetze ins Arabische“, „fasse ein PDF zusammen“, „erstelle ein Bild“…",
  "hero.browse": "Werkzeuge durchsuchen",
  "hero.cta": "Übersetzer testen",
  "hero.note": "Kostenlos · Ohne Anmeldung",

  "assistant.eyebrow": "KI-Assistent",
  "assistant.title": "Sag mir, was du brauchst — ich finde das passende Werkzeug",
  "assistant.placeholder":
    "Beschreibe deine Aufgabe… z. B. „übersetze einen Absatz ins Französische“",
  "assistant.button": "Werkzeug finden",
  "assistant.thinking": "Denke nach…",
  "assistant.reset": "Etwas anderes fragen",
  "assistant.result.category": "Kategorie",
  "assistant.result.matched": "Treffer",
  "assistant.result.open": "Werkzeug öffnen",
  "assistant.result.soon": "Demnächst",
  "assistant.suggestion.translation":
    "Es sieht aus, als möchtest du Text übersetzen. Der Übersetzer ist bereit.",
  "assistant.suggestion.images":
    "Du möchtest mit Bildern arbeiten. Noch ist kein Bildwerkzeug verfügbar — fordere eines an und wir priorisieren es.",
  "assistant.suggestion.pdf":
    "Du hast ein PDF erwähnt. Noch ist kein PDF-Werkzeug verfügbar — fordere eines an und wir priorisieren es.",
  "assistant.suggestion.writing":
    "Du brauchst Hilfe beim Schreiben. Noch ist kein Schreibwerkzeug verfügbar — fordere eines an und wir priorisieren es.",
  "assistant.suggestion.utilities":
    "Du brauchst ein Hilfsmittel. Noch ist keins verfügbar — fordere eines an und wir priorisieren es.",
  "assistant.suggestion.unknown":
    "Ich bin noch nicht sicher, welche Kategorie passt. Beschreibe es genauer oder fordere ein neues Werkzeug an.",
  "assistant.empty.title": "Dein Vorschlag erscheint hier",
  "assistant.empty.body":
    "Gib oben eine Aufgabe ein und der Assistent leitet dich zum passenden Flixo-Werkzeug — oder hilft dir, ein neues anzufordern.",

  "request.trigger": "Werkzeug anfragen",
  "request.title": "Neues Werkzeug anfragen",
  "request.description":
    "Sag uns, was du brauchst, und wir priorisieren es für die nächste Version.",
  "request.label": "Was soll das Werkzeug tun?",
  "request.placeholder":
    "z. B. Ein Werkzeug, das PDF in Word umwandelt und die Formatierung behält…",
  "request.submit": "Anfrage senden",
  "request.cancel": "Abbrechen",
  "request.success":
    "Danke! Deine Anfrage wurde notiert — wir priorisieren sie für die nächste Version.",
  "request.ok": "Fertig",

  "categories.eyebrow": "Werkzeugzentren",
  "categories.title": "Fünf Zentren, ein Workspace",
  "categories.description":
    "Jedes Flixo-Werkzeug gehört zu einem dieser Zentren. Vorerst sind es Platzhalter — die Basis ist bereit zum Wachsen.",
  "categories.status.coming": "Demnächst",
  "categories.status.live": "{count} verfügbar",
  "categories.toolsLabel": "Geplante Werkzeuge",
  "status.live": "Verfügbar",
  "status.soon": "Bald",

  "category.translation.name": "Übersetzungszentrum",
  "category.translation.blurb":
    "Übersetze, lokalisiere und untertitle in über 20 Sprachen mit automatischer Erkennung.",
  "category.translation.tools": "Übersetzer · Lokalisierer · Untertel-Übersetzer",
  "category.images.name": "Bildwerkzeuge",
  "category.images.blurb": "Erstelle, vergrößere und entferne Hintergründe aus Bildern.",
  "category.images.tools": "Bildgenerator · Vergrößerer · Hintergrundentferner",
  "category.pdf.name": "PDF-Werkzeuge",
  "category.pdf.blurb": "Führe zusammen, teile, komprimiere und wandle PDF-Dokumente um.",
  "category.pdf.tools": "Zusammenführen · Teilen · Komprimieren · PDF zu Word",
  "category.writing.name": "KI-Schreiben",
  "category.writing.blurb": "Fasse zusammen, schreibe um und verfasse Inhalte im passenden Ton.",
  "category.writing.tools": "Zusammenfasser · Umschreiber · E-Mail-Schreiber",
  "category.utilities.name": "Hilfsmittel",
  "category.utilities.blurb": "Formatiere, wandle um und erzeuge alltägliche technische Snippets.",
  "category.utilities.tools": "JSON-Formatierer · QR-Generator · Base64-Konverter",
  "category.developer.name": "Entwicklerwerkzeuge",
  "category.developer.blurb": "Formatierer, Validatoren und Generatoren für den Code-Alltag.",
  "category.developer.tools": "JSON-Formatierer · XML-Validator · Cron-Parser",

  "tool.back": "Alle Werkzeuge",

  "why.eyebrow": "Warum Flixo",
  "why.title": "Gebaut, um Reibung zu entfernen, nicht Funktionen hinzuzufügen",
  "why.speed.title": "Standardmäßig sofort",
  "why.speed.body":
    "Werkzeuge öffnen in unter einer Sekunde und laufen im Browser — ohne Warteschlangen, ohne Kaltstarts.",
  "why.consistency.title": "Eine konsistente Oberfläche",
  "why.consistency.body":
    "Jedes Werkzeug teilt Layout, Tastenkürzel und Ergebnisaktionen, nichts muss neu gelernt werden.",
  "why.privacy.title": "Datenschutz zuerst",
  "why.privacy.body":
    "Zwischen Sitzungen wird nichts gespeichert. Deine Eingabe bleibt im Tab, in dem du sie getippt hast.",
  "why.access.title": "Keine Konten, keine Schlüssel",
  "why.access.body":
    "Keine API-Schlüssel, Dashboards oder Sitzverwaltung. Öffne ein Werkzeug und leg los.",
  "stats.tasks": "Verarbeitete Aufgaben",
  "stats.languages": "Unterstützte Sprachen",
  "stats.latency": "Mediane Antwortzeit",
  "stats.uptime": "Verfügbarkeit letzte 12 Monate",

  "faq.eyebrow": "FAQ",
  "faq.title": "Fragen, beantwortet",
  "faq.description": "Alles Wissenswerte, bevor du dein erstes Werkzeug öffnest.",
  "faq.q1": "Ist Flixo kostenlos?",
  "faq.a1":
    "Ja. Alle aktuell auf Flixo verfügbaren Werkzeuge sind kostenlos und erfordern kein Konto und keine Kreditkarte.",
  "faq.q2": "Wie funktioniert der Übersetzer?",
  "faq.a2":
    "Du fügst Text ein, wählst Quell- und Zielsprache (oder überlässt es der automatischen Erkennung) und Flixo liefert die Übersetzung. Die aktuelle Version nutzt eine lokale Demo-Engine, um den Ablauf offline zu erkunden.",
  "faq.q3": "Speichert ihr, was ich tippe?",
  "faq.a3":
    "Nein. Ein- und Ausgabe leben nur in deinem Browser-Tab und verschwinden beim Schließen oder Leeren des Werkzeugs.",
  "faq.q4": "Welche Sprachen werden unterstützt?",
  "faq.a4":
    "Zwanzig Sprachen in lateinischer, kyrillischer, arabischer, hebräischer, indischer und CJK-Schrift, plus automatische Quellerkennung.",
  "faq.q5": "Wann kommen die anderen Werkzeuge?",
  "faq.a5":
    "Die fünf Zentren — Übersetzung, Bilder, PDF, Schreiben und Hilfsmittel — sind die Roadmap. Neue Werkzeuge docken an dieselbe Registry an und erben das gemeinsame Layout.",

  "footer.tagline": "Ein ruhiger Workspace für jedes KI-Werkzeug, das dein Team tagsüber braucht.",
  "footer.product": "Produkt",
  "footer.featured": "Empfohlene Werkzeuge",
  "footer.popular": "Beliebte Werkzeuge",
  "footer.numbers": "Zahlen",
  "footer.categories": "Kategorien",
  "footer.tools": "Werkzeuge",
  "footer.more": "Bald mehr",
  "footer.rights": "© {year} Flixo. Alle Rechte vorbehalten.",
  "footer.built": "Für Teams gebaut, die schnell ausliefern.",

  "translator.pageDescription": "Erkennt die Quellsprache automatisch und übersetzt in Sekunden.",
  "translator.from": "Von",
  "translator.to": "Nach",
  "translator.auto": "Automatisch erkennen",
  "translator.swap": "Sprachen tauschen",
  "translator.inputPlaceholder": "Text zum Übersetzen eingeben oder einfügen…",
  "translator.inputLabel": "Zu übersetzender Text",
  "translator.detected": "erkannt {language}",
  "translator.copy": "Kopieren",
  "translator.copied": "Kopiert",
  "translator.copyError": "Konnte nicht in die Zwischenablage kopieren.",
  "translator.genericError": "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
  "translator.clear": "Leeren",
  "translator.translate": "Übersetzen",
  "translator.translating": "Übersetze…",
  "translator.emptyTitle": "Deine Übersetzung erscheint hier",
  "translator.emptyBody":
    "Wähle eine Zielsprache, gib Text ein und klicke Übersetzen. Auto-Erkennung findet die Quelle.",

  // Local Coding Assistant (brain) UI — stays 100% client-side
  "brain.input.label": "Beschreibe deine Aufgabe",
  "brain.input.placeholder":
    "Beschreibe, was du brauchst — Flixo wählt das passende Werkzeug für deine Dateien, Texte, Bilder, Videos oder Dokumente.",
  "brain.input.upload": "Datei hochladen",
  "brain.input.uploadHint": "PDF, Bild, Video, Audio oder Dokument anhängen",
  "brain.input.dragDrop": "Drag & Drop",
  "brain.input.dragDropHint": "Datei irgendwo auf der Karte ablegen, um sie anzuhängen",
  "brain.input.pasteLink": "Link einfügen",
  "brain.input.linkTitle": "Web-URL / Ressourcen-Link einfügen",
  "brain.input.linkAdd": "Hinzufügen",
  "brain.input.voice": "Sprache",
  "brain.input.voiceHint": "Spracheingabe bald verfügbar",
  "brain.input.processing": "Wird verarbeitet",
  "brain.input.execute": "Aufgabe ausführen",
  "brain.section.popularCategories": "Beliebte Kategorien",
  "brain.section.popularHint": "Nach Funktion erkunden",
  "brain.section.tools": "{count} Werkzeuge",
  "brain.section.recentTasks": "Letzte Aufgaben",
  "brain.section.clearHistory": "Verlauf löschen",
  "brain.section.trendingTasks": "Beliebte Aufgaben",
  "brain.section.trendingHint": "Beliebte Community-Workflows",

  // Image tool sample labels + byte units
  "imageEnhancer.sample.portrait": "Porträt",
  "imageEnhancer.sample.landscape": "Landschaft",
  "imageEnhancer.sample.architecture": "Architektur",
  "imageEnhancer.bytesUnit": "Bytes",
  "imageCompressor.bytesUnit": "Bytes",

  // Image Enhancer UI
  "imageEnhancer.preset.auto": "Auto-KI",
  "imageEnhancer.preset.autoDesc":
    "Ausgewogene Hochskalierung mit intelligenter Rauschreduzierung und Farbwiederherstellung",
  "imageEnhancer.preset.portrait": "Porträt & Gesicht",
  "imageEnhancer.preset.portraitDesc":
    "Gesichtszüge korrigieren, Hauttöne glätten und Augen verbessern",
  "imageEnhancer.preset.restore": "Altes Foto restaurieren",
  "imageEnhancer.preset.restoreDesc":
    "Verblasste Farben restaurieren, Risse reparieren und antiken Kontrast verstärken",
  "imageEnhancer.preset.deblur": "Unschärfe reduzieren & schärfen",
  "imageEnhancer.preset.deblurDesc":
    "Unscharfe Details wiederherstellen und Bildkanten nachschärfen",
  "imageEnhancer.preset.ultra": "Ultra 8x Super-Auflösung",
  "imageEnhancer.preset.ultraDesc": "Maximale 8x-Skalierung für detailreiche Grafiken & Drucke",
  "imageEnhancer.progressDetail": "KI-Filter für Details, Schärfe & Rauschen werden angewendet…",
  "imageEnhancer.clipboardError":
    "Die Clipboard-API wird in diesem Browsermodus nicht unterstützt.",
  "imageEnhancer.fullscreen": "Vollbild-Vorschau",
  "imageEnhancer.enhancing": "Bild wird verbessert…",
  "imageEnhancer.copy": "Bild kopieren",
  "imageEnhancer.copied": "Kopiert!",
  "imageEnhancer.sharpness": "Schärfe",
  "imageEnhancer.noise": "Rauschreduzierung",
  "imageEnhancer.vibrance": "Farbsättigung",
  "imageEnhancer.contrast": "Kontrast",
  "imageEnhancer.face": "Gesichtsverbesserung",
  "imageEnhancer.restore": "Altes Foto restaurieren",
  "imageEnhancer.blur": "Unschärfereduzierung",
  "imageEnhancer.face.hint": "Gesichtsdetails & Hauttöne wiederherstellen",
  "imageEnhancer.restore.hint": "Verblasste Farben & Beschädigungen korrigieren",
  "imageEnhancer.blur.hint": "Kantenkorrektur durch Unsharp-Maskierung",
  "imageEnhancer.drop.title": "Foto hierher ziehen und ablegen",
  "imageEnhancer.drop.hint": "Unterstützt PNG, JPG oder WebP. Oder drücke",
  "imageEnhancer.drop.paste": "zum Einfügen.",
  "imageEnhancer.browse": "Bilddatei durchsuchen",
  "imageEnhancer.sample": "Oder probiere ein Beispielfoto:",
  "imageEnhancer.view.split": "Schieberegler",
  "imageEnhancer.view.side": "Seite an Seite",
  "imageEnhancer.view.enhanced": "Verbessert",
  "imageEnhancer.view.original": "Original",
  "imageEnhancer.zoom": "Zoom:",
  "imageEnhancer.badge.original": "Original",
  "imageEnhancer.badge.enhancedScaled": "{scale}x Verbessert",
  "imageEnhancer.badge.enhancedOnly": "Verbessert ({scale}x)",
  "imageEnhancer.badge.originalImage": "Originalbild",
  "imageEnhancer.stats.originalSize": "Originalgröße",
  "imageEnhancer.stats.enhancedSize": "Verbesserte Größe",
  "imageEnhancer.stats.upscaleFactor": "Hochskalierungsfaktor",
  "imageEnhancer.stats.superRes": "{scale}x Super-Auflösung",
  "imageEnhancer.stats.morePixels": "+{count} % Pixel",
  "imageEnhancer.stats.exportFormat": "Exportformat",
  "imageEnhancer.stats.highFidelity": "Hohe Detailtreue",
  "imageEnhancer.format": "Format:",
  "imageEnhancer.download": "Verbessertes Bild herunterladen",
  "imageEnhancer.presets": "KI-Voreinstellungen",
  "imageEnhancer.scale": "KI-Super-Resolution-Skala",
  "imageEnhancer.scaleHD": "HD",
  "imageEnhancer.scale4K": "4K Ultra",
  "imageEnhancer.scale8K": "8K Max",
  "imageEnhancer.controls": "Verbesserungsregler",
  "imageEnhancer.apply": "KI-Verbesserung anwenden",
  "imageEnhancer.fullscreen.title": "KI-Vollbildvergleich",
  "imageEnhancer.fullscreen.close": "Vorschau schließen",
  "imageEnhancer.error.invalid": "Bitte eine gültige Bilddatei auswählen (PNG, JPG, WebP).",
  "imageEnhancer.error.sample":
    "Beispielfoto konnte nicht geladen werden. Bitte eine lokale Datei hochladen.",
  "imageEnhancer.error.clipboard": "Bild konnte nicht in die Zwischenablage kopiert werden.",
  "imageEnhancer.error.enhance": "Beim Verbessern des Bildes ist ein Fehler aufgetreten.",
  "imageEnhancer.error.render": "Bilddatei konnte nicht gerendert werden.",
  "imageEnhancer.error.canvas": "2D-Canvas-Kontext konnte nicht initialisiert werden.",
  "imageEnhancer.step.loading": "Bildquelle wird geladen…",
  "imageEnhancer.step.restoring": "Kontrast, Gesichtstöne & Dynamikumfang werden restauriert…",
  "imageEnhancer.step.unsharp": "Unsharp-Mask-Faltungsdurchlauf wird ausgeführt…",
  "imageEnhancer.step.exporting": "Verbessertes Bild wird exportiert…",

  // Image Compressor UI
  "imageCompressor.format": "Ausgabeformat",
  "imageCompressor.quality": "Qualität: {count} %",
  "imageCompressor.qualityHigh": "Hohe Qualität",
  "imageCompressor.qualityBalanced": "Ausgewogen",
  "imageCompressor.qualityMax": "Maximale Kompression",
  "imageCompressor.calculating": "Berechnen…",
  "imageCompressor.drop.title": "Bild zum Komprimieren hier ablegen, oder",
  "imageCompressor.drop.browse": "durchsuchen",
  "imageCompressor.drop.hint": "JPG, PNG, WebP unterstützt. 100 % private Kompression im Browser.",
  "imageCompressor.originalSize": "Originalgröße",
  "imageCompressor.compressedSize": "Komprimierte Größe",
  "imageCompressor.savedRatio": "Einsparung",
  "imageCompressor.compressAnother": "Weiteres komprimieren",
  "imageCompressor.download": "Komprimiertes Bild herunterladen",
  "imageCompressor.compressedPreview": "Komprimierte Vorschau",
  "imageCompressor.error.compress": "Bild konnte nicht komprimiert werden.",
  "imageCompressor.error.render": "Originalbild konnte nicht gerendert werden.",
  "imageCompressor.error.invalid": "Bitte eine gültige Bilddatei auswählen.",

  // QR Generator UI
  "qr.mode.url": "Website-URL",
  "qr.mode.text": "Klartext",
  "qr.mode.wifi": "WLAN-Netzwerk",
  "qr.mode.email": "E-Mail",
  "qr.mode.phone": "Telefon",
  "qr.switchMode": "QR-Modus auf {mode} umschalten",
  "qr.url.label": "Website-Adresse (URL)",
  "qr.url.placeholder": "https://beispiel.de",
  "qr.text.label": "Inhalt / Textnachricht",
  "qr.text.placeholder": "Text eingeben oder einfügen…",
  "qr.wifi.ssid": "Netzwerkname (SSID)",
  "qr.wifi.ssidPlaceholder": "MeinWLANzuhause",
  "qr.wifi.password": "Passwort",
  "qr.wifi.passwordPlaceholder": "WLAN-Passwort",
  "qr.wifi.encryption": "Verschlüsselungsart",
  "qr.wifi.wpa": "WPA / WPA2 / WPA3",
  "qr.wifi.wep": "WEP",
  "qr.wifi.open": "Keine (Offenes Netzwerk)",
  "qr.email.to": "E-Mail-Adresse des Empfängers",
  "qr.email.toPlaceholder": "name@beispiel.de",
  "qr.email.subject": "Betreffzeile (optional)",
  "qr.email.subjectPlaceholder": "Anfrage zu einem Projekt",
  "qr.phone.label": "Telefonnummer",
  "qr.phone.placeholder": "+49 (30) 00000000",
  "qr.customization": "Anpassungsoptionen",
  "qr.fgColor": "Vordergrundfarbe",
  "qr.bgColor": "Hintergrundfarbe",
  "qr.clear": "Felder leeren",
  "qr.copiedContent": "Inhalt kopiert",
  "qr.copyPayload": "Nutzdaten kopieren",
  "qr.preview": "Live-QR-Vorschau",
  "qr.previewAlt": "Generierter QR-Code",
  "qr.previewEmpty": "Inhalt eingeben, um QR-Code voranzusehen",
  "qr.error.invalid": "Ungültiger QR-Eingabetext oder -format.",
  "qr.error.copy": "Inhalt konnte nicht kopiert werden.",

  // Password Generator UI
  "passwordGen.empty": "Mindestens einen Zeichensatz auswählen",
  "passwordGen.regenerate": "Passwort neu generieren",
  "passwordGen.copied": "Kopiert!",
  "passwordGen.copy": "Passwort kopieren",
  "passwordGen.strength": "Sicherheitsstärke:",
  "passwordGen.strength.weak": "Schwach",
  "passwordGen.strength.fair": "Mittel",
  "passwordGen.strength.good": "Gut",
  "passwordGen.strength.strong": "Stark",
  "passwordGen.strength.veryStrong": "Sehr stark",
  "passwordGen.length": "Passwortlänge",
  "passwordGen.lengthChars": "{count} Zeichen",
  "passwordGen.uppercase": "Großbuchstaben (A-Z)",
  "passwordGen.uppercaseHint": "z. B. ABCDEF",
  "passwordGen.lowercase": "Kleinbuchstaben (a-z)",
  "passwordGen.lowercaseHint": "z. B. abcdef",
  "passwordGen.numbers": "Zahlen (0-9)",
  "passwordGen.numbersHint": "z. B. 123456",
  "passwordGen.symbols": "Sonderzeichen (!@#$)",
  "passwordGen.symbolsHint": "z. B. !@#$%^&*",
  "passwordGen.excludeAmbiguous": "Mehrdeutige Zeichen ausschließen",
  "passwordGen.excludeAmbiguousHint": "Verwirrende Zeichen wie l, 1, I, O, 0 vermeiden",

  // Background Remover UI
  "bgRemover.view.cutout": "Freistellungsansicht anzeigen",
  "bgRemover.view.compare": "Vergleichsansicht anzeigen",
  "bgRemover.view.original": "Originalbild-Ansicht anzeigen",
  "bgRemover.drop.title": "Bild hier ablegen, oder",
  "bgRemover.drop.browse": "durchsuchen",
  "bgRemover.drop.hint":
    "Unterstützt PNG, JPG oder WebP (bis 20 MB). Private clientseitige Verarbeitung.",
  "bgRemover.viewMode": "Ansichtsmodus:",
  "bgRemover.cutout": "Freistellung",
  "bgRemover.compare": "Vergleichen",
  "bgRemover.original": "Original",
  "bgRemover.reset": "Zurücksetzen",
  "bgRemover.download": "PNG herunterladen",
  "bgRemover.processing": "Hintergrundpixel werden entfernt…",
  "bgRemover.resultLabel": "Transparentes Ergebnis",
  "bgRemover.processingFallback": "Verarbeitung…",
  "bgRemover.refine": "Empfindlichkeit der Entfernung anpassen",
  "bgRemover.colorTolerance": "Farbtoleranz",
  "bgRemover.edgeSoftness": "Kantenweichheit (Feder)",
  "bgRemover.error.invalidImage": "Bitte eine gültige Bilddatei auswählen (PNG, JPG, WebP).",
  "bgRemover.error.canvas": "Canvas-Renderer konnte nicht initialisiert werden.",
  "bgRemover.error.export": "Verarbeitete PNG konnte nicht exportiert werden.",
  "bgRemover.error.unexpected": "Bei der Verarbeitung ist ein unerwarteter Fehler aufgetreten.",
  "bgRemover.error.load": "Bild für die Verarbeitung konnte nicht geladen werden.",

  // Tool names + taglines (76 ready tools) — native deutsche Fachbegriffe.
  "tool.translator.name": "KI-Übersetzer",
  "tool.translator.tagline":
    "Übersetze zwischen 20+ Sprachen mit automatischer Erkennung und sofortigem Wechsel.",
  "tool.image-enhancer.name": "KI-Bildverbesserer",
  "tool.image-enhancer.tagline":
    "Skaliere die Auflösung bis zu 8x hoch, stelle Gesichter wieder her, entferne Rauschen und schärfe Fotos.",
  "tool.image-compressor.name": "Bildkompressor",
  "tool.image-compressor.tagline": "Verkleinere die Bilddateigröße direkt in deinem Browser.",
  "tool.background-remover.name": "Hintergrundentferner",
  "tool.background-remover.tagline":
    "Schneide Bildhintergründe aus und exportiere transparente PNGs.",
  "tool.video-compressor.name": "Videokompressor",
  "tool.video-compressor.tagline":
    "Verkleinere die Videodateigröße mit konfigurierbarer Qualität und Ausgabeeinstellungen.",
  "tool.video-trimmer.name": "Videoschneider",
  "tool.video-trimmer.tagline":
    "Schneide einen ausgewählten Teil eines Videos mit Start- und Endreglern.",
  "tool.video-to-gif.name": "Video zu GIF",
  "tool.video-to-gif.tagline": "Konvertiere ein unterstütztes Videosegment in ein animiertes GIF.",
  "tool.audio-compressor.name": "Audiokompressor",
  "tool.audio-compressor.tagline":
    "Komprimiere Audiodateien mit Kontrolle über Ausgabequalität und Bitrate.",
  "tool.audio-cutter.name": "Audioschneider",
  "tool.audio-cutter.tagline":
    "Schneide einen ausgewählten Teil einer Audiodatei mit Start- und Endreglern.",
  "tool.text-to-speech.name": "Text zu Sprache",
  "tool.text-to-speech.tagline":
    "Wandle geschriebenen Text in natürliche Sprache mit konfigurierbaren Stimmen um.",
  "tool.file-hash-generator.name": "Datei-Hash-Generator",
  "tool.file-hash-generator.tagline":
    "Berechne MD5-, SHA-1- und SHA-256-Hashes jeder Datei in deinem Browser.",
  "tool.qr-generator.name": "QR-Code-Generator",
  "tool.qr-generator.tagline":
    "Erstelle benutzerdefinierte QR-Codes für Links, Text, WLAN und Kontaktdaten.",
  "tool.barcode-generator.name": "Barcode-Generator",
  "tool.barcode-generator.tagline":
    "Generiere Barcodes in verschiedenen Formaten zum Download oder Drucken.",
  "tool.password-generator.name": "Passwort-Generator",
  "tool.password-generator.tagline": "Generiere starke, sichere Passwörter mit Entropie-Anzeige.",
  "tool.password-checker.name": "Passwort-Prüfer",
  "tool.password-checker.tagline":
    "Prüfe Passwortstärke, Entropie und geschätzte Knackzeit mit praktischen Tipps.",
  "tool.word-counter.name": "Wortzähler",
  "tool.word-counter.tagline": "Zähle Wörter, Zeichen, Sätze und Absätze sofort beim Tippen.",
  "tool.case-converter.name": "Groß-/Kleinschreibung-Konverter",
  "tool.case-converter.tagline":
    "Wechsle sofort zwischen Großbuchstaben, Kleinbuchstaben, Titelschreibung und anderen Formaten.",
  "tool.slug-generator.name": "Slug-Generator",
  "tool.slug-generator.tagline":
    "Wandle Titel in saubere, URL-freundliche Slugs mit Trennzeichen und Länge um.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Generiere Lorem-Platzhaltertext mit gewählter Anzahl an Absätzen oder Wörtern.",
  "tool.random-number.name": "Zufallszahlengenerator",
  "tool.random-number.tagline":
    "Generiere Zufallszahlen in einem Bereich mit Mengenoption und ohne Duplikate.",
  "tool.random-name.name": "Zufallsnamen-Auswahl",
  "tool.random-name.tagline":
    "Wähle einen oder mehrere zufällige Namen aus einer Liste mit Option ohne Duplikate.",
  "tool.json-formatter.name": "JSON-Formatierer",
  "tool.json-formatter.tagline":
    "Verschönere, minimiere und validiere JSON mit benutzerdefinierter Einrückung.",
  "tool.uuid-generator.name": "UUID-Generator",
  "tool.uuid-generator.tagline":
    "Erstelle eindeutige UUID-Bezeichner (v4) schnell und stapelweise.",
  "tool.xml-formatter.name": "XML-Formatierer",
  "tool.xml-formatter.tagline":
    "Verschönere, minimiere und validiere XML mit benutzerdefinierter Einrückung.",
  "tool.csv-viewer.name": "CSV-Viewer",
  "tool.csv-viewer.tagline":
    "Zeige CSV-Daten als Tabelle mit Trennzeichenauswahl und Kopfzeilenerkennung.",
  "tool.text-compare.name": "Textvergleich",
  "tool.text-compare.tagline":
    "Vergleiche zwei Texte zeilenweise und hebe Hinzufügungen, Entfernungen und Treffer hervor.",
  "tool.qr-reader.name": "QR-Reader",
  "tool.qr-reader.tagline":
    "Scanne und dekodiere QR-Codes aus Bildern oder deiner Kamera in Text oder Links.",
  "tool.find-and-replace.name": "Suchen und Ersetzen",
  "tool.find-and-replace.tagline":
    "Suche und ersetze Text in langen Dokumenten mit optionalem Regex und Groß-/Kleinschreibung.",
  "tool.remove-duplicate-lines.name": "Doppelte Zeilen entfernen",
  "tool.remove-duplicate-lines.tagline":
    "Entferne doppelte Zeilen mit Groß-/Kleinschreibung-insensitiver und leerzeichenbewusster Erkennung.",
  "tool.remove-empty-lines.name": "Leere Zeilen entfernen",
  "tool.remove-empty-lines.tagline":
    "Entferne sofort leere oder nur aus Leerzeichen bestehende Zeilen.",
  "tool.text-cleaner.name": "Textbereiniger",
  "tool.text-cleaner.tagline":
    "Bereinige Text durch Entfernen überflüssiger Leerzeichen, Umbrüche und unerwünschter Zeichen.",
  "tool.sort-lines.name": "Zeilen sortieren",
  "tool.sort-lines.tagline":
    "Sortiere Zeilen alphabetisch, nach Länge oder mische sie mit Optionen für Großschreibung und Leerzeilen.",
  "tool.reverse-text.name": "Text umkehren",
  "tool.reverse-text.tagline": "Kehre Text nach Zeichen, Wörtern oder ganzen Zeilen sofort um.",
  "tool.add-line-numbers.name": "Zeilennummern hinzufügen",
  "tool.add-line-numbers.tagline":
    "Füge fortlaufende Zeilennummern mit Trennzeichen, Auffüllung und Startversatz hinzu.",
  "tool.word-frequency.name": "Worthäufigkeits-Analyse",
  "tool.word-frequency.tagline":
    "Analysiere die Worthäufigkeit mit Sortierung, Groß-/Kleinschreibung und Längenfiltern.",
  "tool.unit-converter.name": "Einheiten-Umrechner",
  "tool.unit-converter.tagline":
    "Rechne sofort zwischen Längen-, Gewichts-, Volumeneinheiten und mehr um.",
  "tool.temperature-converter.name": "Temperatur-Umrechner",
  "tool.temperature-converter.tagline":
    "Rechne schnell zwischen Celsius, Fahrenheit und Kelvin um.",
  "tool.base64-converter.name": "Base64-Konverter",
  "tool.base64-converter.tagline": "Kodiere und dekodiere Text in Base64 und zurück sofort.",
  "tool.timestamp-converter.name": "Zeitstempel-Konverter",
  "tool.timestamp-converter.tagline":
    "Wandle Unix-Zeitstempel in lesbare Daten um und zurück, mit Zeitzonenunterstützung.",
  "tool.csv-to-json.name": "CSV zu JSON",
  "tool.csv-to-json.tagline":
    "Wandle CSV-Daten mit automatischer Kopfzeilenerkennung in strukturiertes JSON um.",
  "tool.percentage-calculator.name": "Prozentrechner",
  "tool.percentage-calculator.tagline":
    "Berechne Prozentsätze, Steigerungen und Rabatte schnell und genau.",
  "tool.bmi-calculator.name": "BMI-Rechner",
  "tool.bmi-calculator.tagline": "Berechne deinen Body-Mass-Index aus Gewicht und Größe.",
  "tool.age-calculator.name": "Altersrechner",
  "tool.age-calculator.tagline": "Berechne dein genaues Alter in Jahren, Monaten und Tagen.",
  "tool.meta-tag-generator.name": "Meta-Tag-Generator",
  "tool.meta-tag-generator.tagline":
    "Erstelle HTML-Meta-Tags für SEO mit Titel, Beschreibung und Open Graph.",
  "tool.url-encoder.name": "URL-Encoder",
  "tool.url-encoder.tagline": "Kodiere und dekodiere URLs und URL-Komponenten sofort.",
  "tool.html-entity-encoder.name": "HTML-Entity-Encoder",
  "tool.html-entity-encoder.tagline":
    "Wandle Sonderzeichen in HTML-Entities um und zurück in lesbaren Text.",
  "tool.html-minifier.name": "HTML-Minifier",
  "tool.html-minifier.tagline":
    "Reduziere die Größe deines HTML durch Entfernen unnötiger Leerzeichen und Kommentare.",
  "tool.css-minifier.name": "CSS-Minifier",
  "tool.css-minifier.tagline":
    "Komprimiere dein CSS durch Entfernen von Leerzeichen, Kommentaren und redundanten Regeln.",
  "tool.js-minifier.name": "JS-Minifier",
  "tool.js-minifier.tagline":
    "Minifiziere JavaScript durch Entfernen von Leerzeichen und Kommentaren für geringere Größe.",
  "tool.json-validator.name": "JSON-Validator",
  "tool.json-validator.tagline": "Validiere die Syntax deines JSON und finde Fehler sofort.",
  "tool.regex-tester.name": "Regex-Tester",
  "tool.regex-tester.tagline": "Teste reguläre Ausdrücke und hebe Treffer in Echtzeit hervor.",
  "tool.jwt-decoder.name": "JWT-Decoder",
  "tool.jwt-decoder.tagline": "Dekodiere JWT-Tokens und zeige den Inhalt von Header und Payload.",
  "tool.sql-formatter.name": "SQL-Formatierer",
  "tool.sql-formatter.tagline":
    "Verschönere und minimiere SQL-Abfragen mit Großschreibung von Schlüsselwörtern und konfigurierbarer Einrückung.",
  "tool.markdown-preview.name": "Markdown-Vorschau",
  "tool.markdown-preview.tagline":
    "Schreibe Markdown und sieh sofort die gerenderte HTML-Vorschau.",
  "tool.color-converter.name": "Farbkonverter",
  "tool.color-converter.tagline": "Wandle zwischen HEX, RGB und HSL um und sieh die Farbvorschau.",
  "tool.cron-parser.name": "Cron-Parser",
  "tool.cron-parser.tagline":
    "Übersetze Cron-Ausdrücke in Klartext mit Feldaufschlüsselung und kommenden Ausführungen.",
  "tool.xml-validator.name": "XML-Validator",
  "tool.xml-validator.tagline":
    "Validiere Wohlgeformtheit, Tag-Gleichgewicht und Struktur des XML mit sofortiger Fehlermeldung.",
  "tool.html-formatter.name": "HTML-Formatierer",
  "tool.html-formatter.tagline":
    "Verschönere und minimiere HTML mit korrekter Schachtelung und konfigurierbarer Einrückung.",
  "tool.yaml-formatter.name": "YAML-Formatierer",
  "tool.yaml-formatter.tagline":
    "Verschönere und normalisiere YAML mit konfigurierbarer Einrückung und Validierung.",
  "tool.markdown-table-generator.name": "Markdown-Tabellen-Generator",
  "tool.markdown-table-generator.tagline":
    "Erstelle Markdown-Tabellen visuell und exportiere sie zum direkten Einfügen.",
  "tool.css-gradient-generator.name": "CSS-Gradient-Generator",
  "tool.css-gradient-generator.tagline":
    "Entwirf lineare, radiale und konische CSS-Verläufe mit Farbstopps und Winkelsteuerung.",
  "tool.audio-converter.name": "Audio-Konverter",
  "tool.audio-converter.tagline":
    "Wandle Audiodateien (MP3, OGG, FLAC und mehr) in WAV in deinem Browser um.",
  "tool.video-converter.name": "Video-Konverter",
  "tool.video-converter.tagline":
    "Wandle Video in MP4 (H.264) oder AVI (MPEG-4) in deinem Browser um.",
  "tool.gif-maker.name": "GIF-Ersteller",
  "tool.gif-maker.tagline":
    "Erstelle ein animiertes GIF aus hochgeladenen Bildern oder einem unterstützten Video.",
  "tool.gif-compressor.name": "GIF-Kompressor",
  "tool.gif-compressor.tagline":
    "Verkleinere die GIF-Dateigröße bei akzeptabler visueller Qualität.",
  "tool.image-to-gif.name": "Bild zu GIF",
  "tool.image-to-gif.tagline": "Erstelle ein animiertes GIF aus mehreren hochgeladenen Bildern.",
  "tool.pdf-to-excel.name": "PDF zu Excel",
  "tool.pdf-to-excel.tagline":
    "Wandle geeignete PDF-Tabellen und -Inhalte in eine Excel-kompatible Datei um.",
  "tool.pdf-to-powerpoint.name": "PDF zu PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Wandle geeignete PDF-Seiten und -Inhalte in eine PowerPoint-kompatible Datei um.",
  "tool.pdf-to-text.name": "PDF zu Text",
  "tool.pdf-to-text.tagline": "Extrahiere auswählbaren Text aus PDF-Dokumenten.",
  "tool.pdf-crop.name": "PDF zuschneiden",
  "tool.pdf-crop.tagline": "Schneide PDF-Seiten mit konfigurierbaren Zuschneidegrenzen zu.",
  "tool.pdf-page-numbers.name": "PDF-Seitenzahlen",
  "tool.pdf-page-numbers.tagline": "Füge konfigurierbare Seitenzahlen zu PDF-Seiten hinzu.",
  "tool.pdf-header-footer.name": "PDF-Kopf- und -Fußzeile",
  "tool.pdf-header-footer.tagline": "Füge anpassbare Kopf- und Fußzeilen zu PDF-Seiten hinzu.",
  "tool.text-to-pdf.name": "Text zu PDF",
  "tool.text-to-pdf.tagline":
    "Wandle eingegebenen oder eingefügten Text in ein herunterladbares PDF um.",
  "tool.text-to-word.name": "Text zu Word",
  "tool.text-to-word.tagline":
    "Wandle eingegebenen oder eingefügten Text in ein herunterladbares DOCX-Dokument um.",
  "tool.markdown-to-pdf.name": "Markdown zu PDF",
  "tool.markdown-to-pdf.tagline": "Wandle Markdown-Inhalte in ein formatiertes PDF um.",
  "tool.markdown-to-word.name": "Markdown zu Word",
  "tool.markdown-to-word.tagline": "Wandle Markdown-Inhalte in ein formatiertes DOCX-Dokument um.",
};
