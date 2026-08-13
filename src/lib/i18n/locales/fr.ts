import type { Dictionary } from "./en";
import { en } from "./en";

export const fr: Dictionary = {
  ...en,

  "lang.name": "Français",
  "lang.switch": "Changer de langue",

  "nav.tools": "Outils",
  "nav.categories": "Catégories",
  "nav.popular": "Populaires",
  "nav.why": "Pourquoi Flixo",
  "nav.faq": "FAQ",
  "nav.openTranslator": "Ouvrir le traducteur",
  "nav.toggleTheme": "Changer le thème",
  "nav.toggleMenu": "Ouvrir le menu",

  "hero.badge": "Un espace, tous les outils IA",
  "hero.title": "Un espace pour chaque outil IA",
  "hero.description":
    "Traduction, images, PDF, rédaction et utilitaires — cinq pôles d'outils dans une interface sobre. Sans compte ni clé d'API ; ouvrez un outil et commencez.",
  "hero.promo.badge": "Nouveau",
  "hero.promo.body":
    "Essayez l'améliorateur d'images par IA : nette, agrandissez et supprimez le bruit de vos photos instantanément.",
  "hero.searchLabel": "Décrivez ce que vous voulez faire",
  "hero.searchPlaceholder":
    "Essayez : « traduire en arabe », « résumer un PDF », « générer une image »…",
  "hero.browse": "Parcourir les outils",
  "hero.cta": "Essayer le traducteur",
  "hero.note": "Gratuit · Sans inscription",

  "assistant.eyebrow": "Assistant IA",
  "assistant.title": "Dites-moi ce qu'il vous faut — je trouverai le bon outil",
  "assistant.placeholder": "Décrivez votre tâche… p. ex. « traduire un paragraphe en français »",
  "assistant.button": "Trouver un outil",
  "assistant.thinking": "Réflexion…",
  "assistant.reset": "Poser une autre question",
  "assistant.result.category": "Catégorie",
  "assistant.result.matched": "Correspondance",
  "assistant.result.open": "Ouvrir l'outil",
  "assistant.result.soon": "Bientôt disponible",
  "assistant.suggestion.translation":
    "Il semble que vous souhaitiez traduire du texte. Le traducteur est prêt pour vous.",
  "assistant.suggestion.images":
    "Vous cherchez à travailler avec des images. Aucun outil d'image n'est encore disponible — demandez-en un et nous le prioriserons.",
  "assistant.suggestion.pdf":
    "Vous avez mentionné un PDF. Aucun outil PDF n'est encore disponible — demandez-en un et nous le prioriserons.",
  "assistant.suggestion.writing":
    "Vous avez besoin d'aide pour la rédaction. Aucun outil d'écriture n'est encore disponible — demandez-en un et nous le prioriserons.",
  "assistant.suggestion.utilities":
    "Vous avez besoin d'un utilitaire. Aucun n'est encore disponible — demandez-en un et nous le prioriserons.",
  "assistant.suggestion.unknown":
    "Je ne suis pas sûr de la catégorie qui convient. Décrivez davantage, ou demandez un nouvel outil et nous le créerons.",
  "assistant.empty.title": "Votre suggestion apparaît ici",
  "assistant.empty.body":
    "Saisissez une tâche ci-dessus et l'assistant vous orientera vers le bon outil Flixo — ou vous aidera à en demander un nouveau.",

  "request.trigger": "Demander un outil",
  "request.title": "Demander un nouvel outil",
  "request.description":
    "Dites-nous ce dont vous avez besoin et nous le prioriserons pour la prochaine version.",
  "request.label": "Que doit faire l'outil ?",
  "request.placeholder":
    "p. ex. Un outil qui convertit un PDF en Word en gardant la mise en forme…",
  "request.submit": "Envoyer la demande",
  "request.cancel": "Annuler",
  "request.success":
    "Merci ! Votre demande a été enregistrée — nous la prioriserons pour la prochaine version.",
  "request.ok": "Terminé",

  "categories.eyebrow": "Pôles d'outils",
  "categories.title": "Cinq pôles, un espace",
  "categories.description":
    "Chaque outil Flixo appartient à l'un de ces pôles. Pour l'instant, ce sont des espaces réservés — la base est prête à évoluer.",
  "categories.status.coming": "Bientôt disponible",
  "categories.status.live": "{count} disponibles",
  "categories.toolsLabel": "Outils planifiés",
  "status.live": "Disponible",
  "status.soon": "Bientôt",

  "category.translation.name": "Pôle traduction",
  "category.translation.blurb":
    "Traduisez, localisez et sous-titrez dans plus de 20 langues avec détection automatique.",
  "category.translation.tools": "Traducteur · Localisateur · Traducteur de sous-titres",
  "category.images.name": "Outils d'image",
  "category.images.blurb": "Générez, agrandissez et supprimez les fonds d'images.",
  "category.images.tools": "Générateur d'images · Agrandisseur · Suppresseur de fond",
  "category.pdf.name": "Outils PDF",
  "category.pdf.blurb": "Fusionnez, divisez, compressez et convertissez des documents PDF.",
  "category.pdf.tools": "Fusionner · Diviser · Compresser · PDF vers Word",
  "category.writing.name": "Rédaction IA",
  "category.writing.blurb": "Résumez, réécrivez et rédigez du contenu avec le bon ton.",
  "category.writing.tools": "Résumeur · Réécrivain · Rédacteur d'e-mails",
  "category.utilities.name": "Utilitaires",
  "category.utilities.blurb":
    "Formatez, convertissez et générez des fragments techniques courants.",
  "category.utilities.tools": "Formateur JSON · Générateur QR · Convertisseur Base64",
  "category.developer.name": "Outils développeur",
  "category.developer.blurb": "Formateurs, validateurs et générateurs pour le code au quotidien.",
  "category.developer.tools": "Formateur JSON · Validateur XML · Analyseur Cron",

  "tool.back": "Tous les outils",

  "why.eyebrow": "Pourquoi Flixo",
  "why.title": "Conçu pour supprimer la friction, pas pour ajouter des fonctions",
  "why.speed.title": "Instantané par défaut",
  "why.speed.body":
    "Les outils s'ouvrent en moins d'une seconde et fonctionnent dans le navigateur — sans file d'attente ni démarrage à froid.",
  "why.consistency.title": "Une interface cohérente",
  "why.consistency.body":
    "Chaque outil partage la même disposition, les mêmes raccourcis et actions de résultat, donc rien à réapprendre.",
  "why.privacy.title": "Confidentialité d'abord",
  "why.privacy.body":
    "Rien n'est conservé entre les sessions. Votre saisie reste dans l'onglet où vous l'avez tapée.",
  "why.access.title": "Sans compte, sans clé",
  "why.access.body":
    "Oubliez les clés d'API, tableaux de bord et gestion de sièges. Ouvrez un outil et commencez.",
  "stats.tasks": "Tâches traitées",
  "stats.languages": "Langues disponibles",
  "stats.latency": "Temps de réponse médian",
  "stats.uptime": "Disponibilité 12 derniers mois",

  "faq.eyebrow": "FAQ",
  "faq.title": "Questions, réponses",
  "faq.description": "Tout ce qu'il faut savoir avant d'ouvrir votre premier outil.",
  "faq.q1": "Flixo est-il gratuit ?",
  "faq.a1":
    "Oui. Tous les outils actuellement disponibles sur Flixo sont gratuits et ne nécessitent ni compte ni carte bancaire.",
  "faq.q2": "Comment fonctionne le traducteur ?",
  "faq.a2":
    "Vous collez du texte, choisissez la langue source et cible (ou laissez la détection automatique faire) et Flixo renvoie la traduction. La version actuelle utilise un moteur local de démonstration pour explorer le flux hors connexion.",
  "faq.q3": "Stockez-vous ce que je tape ?",
  "faq.a3":
    "Non. L'entrée et la sortie ne vivent que dans votre onglet de navigateur et disparaissent à la fermeture ou au nettoyage de l'outil.",
  "faq.q4": "Quelles langues sont prises en charge ?",
  "faq.a4":
    "Vingt langues en écritures latine, cyrillique, arabe, hébraïque, indique et CJK, plus la détection automatique de la source.",
  "faq.q5": "Quand les autres outils seront-ils lancés ?",
  "faq.a5":
    "Les cinq pôles — Traduction, Images, PDF, Rédaction et Utilitaires — constituent la feuille de route. Les nouveaux outils se branchent au même registre et héritent de l'interface partagée au fur et à mesure.",

  "footer.tagline": "Un espace calme pour chaque outil IA que votre équipe utilise au quotidien.",
  "footer.product": "Produit",
  "footer.featured": "Outils en vedette",
  "footer.popular": "Outils populaires",
  "footer.numbers": "Chiffres",
  "footer.categories": "Catégories",
  "footer.tools": "Outils",
  "footer.more": "Bientôt plus",
  "footer.rights": "© {year} Flixo. Tous droits réservés.",
  "footer.built": "Conçu pour les équipes qui livrent vite.",

  "translator.pageDescription":
    "Détectez automatiquement la langue source et traduisez en quelques secondes.",
  "translator.from": "De",
  "translator.to": "Vers",
  "translator.auto": "Détection automatique",
  "translator.swap": "Inverser les langues",
  "translator.inputPlaceholder": "Saisissez ou collez du texte à traduire…",
  "translator.inputLabel": "Texte à traduire",
  "translator.detected": "détecté {language}",
  "translator.copy": "Copier",
  "translator.copied": "Copié",
  "translator.copyError": "Impossible de copier dans le presse-papiers.",
  "translator.genericError": "Une erreur est survenue. Veuillez réessayer.",
  "translator.clear": "Effacer",
  "translator.translate": "Traduire",
  "translator.translating": "Traduction…",
  "translator.emptyTitle": "Votre traduction apparaît ici",
  "translator.emptyBody":
    "Choisissez une langue cible, saisissez du texte et cliquez sur Traduire. La détection automatique trouve la source pour vous.",

  // Local Coding Assistant (brain) UI — stays 100% client-side
  "brain.input.label": "Décrivez votre tâche",
  "brain.input.placeholder":
    "Décrivez ce dont vous avez besoin — Flixo choisit l'outil adapté à vos fichiers, texte, images, vidéos ou documents.",
  "brain.input.upload": "Téléverser un fichier",
  "brain.input.uploadHint": "Joindre PDF, image, vidéo, audio ou document",
  "brain.input.dragDrop": "Glisser-déposer",
  "brain.input.dragDropHint": "Déposez un fichier n'importe où sur la carte pour le joindre",
  "brain.input.pasteLink": "Coller un lien",
  "brain.input.linkTitle": "Coller une URL web / lien de ressource",
  "brain.input.linkAdd": "Ajouter",
  "brain.input.voice": "Voix",
  "brain.input.voiceHint": "Saisie vocale bientôt disponible",
  "brain.input.processing": "Traitement en cours",
  "brain.input.execute": "Exécuter la tâche",
  "brain.section.popularCategories": "Catégories populaires",
  "brain.section.popularHint": "Explorer par capacité",
  "brain.section.tools": "{count} outils",
  "brain.section.recentTasks": "Tâches récentes",
  "brain.section.clearHistory": "Effacer l'historique",
  "brain.section.trendingTasks": "Tâches populaires",
  "brain.section.trendingHint": "Flux de travail populaires de la communauté",

  // Image tool sample labels + byte units
  "imageEnhancer.sample.portrait": "Portrait",
  "imageEnhancer.sample.landscape": "Paysage",
  "imageEnhancer.sample.architecture": "Architecture",
  "imageEnhancer.bytesUnit": "Octets",
  "imageCompressor.bytesUnit": "Octets",

  // Image Enhancer UI
  "imageEnhancer.preset.auto": "IA Auto",
  "imageEnhancer.preset.autoDesc":
    "Agrandissement équilibré avec réduction intelligente du bruit et restauration des couleurs",
  "imageEnhancer.preset.portrait": "Portrait & Visage",
  "imageEnhancer.preset.portraitDesc":
    "Corriger les traits du visage, lisser les tons de peau et rehausser les yeux",
  "imageEnhancer.preset.restore": "Restauration d'ancienne photo",
  "imageEnhancer.preset.restoreDesc":
    "Restaurer les couleurs délavées, réparer les fissures et rehausser le contraste d'époque",
  "imageEnhancer.preset.deblur": "Réduction du flou & Netteté",
  "imageEnhancer.preset.deblurDesc": "Récupérer les détails flous et nettoyer les bords de l'image",
  "imageEnhancer.preset.ultra": "Super-Résolution 8x Ultra",
  "imageEnhancer.preset.ultraDesc":
    "Mise à l'échelle 8x maximale pour graphiques détaillés & impressions",
  "imageEnhancer.progressDetail": "Application des filtres de détail, netteté et bruit…",
  "imageEnhancer.clipboardError":
    "L'API Presse-papiers n'est pas prise en charge dans ce mode du navigateur.",
  "imageEnhancer.fullscreen": "Aperçu plein écran",
  "imageEnhancer.enhancing": "Amélioration de l'image…",
  "imageEnhancer.copy": "Copier l'image",
  "imageEnhancer.copied": "Copié !",
  "imageEnhancer.sharpness": "Netteté",
  "imageEnhancer.noise": "Réduction du bruit",
  "imageEnhancer.vibrance": "Vibrance des couleurs",
  "imageEnhancer.contrast": "Contraste",
  "imageEnhancer.face": "Amélioration du visage",
  "imageEnhancer.restore": "Restauration d'ancienne photo",
  "imageEnhancer.blur": "Réduction du flou",
  "imageEnhancer.face.hint": "Restaurer les détails du visage & les tons de peau",
  "imageEnhancer.restore.hint": "Corriger les couleurs délavées & les dommages",
  "imageEnhancer.blur.hint": "Correction des contours par masque de renforcement",
  "imageEnhancer.drop.title": "Glissez-déposez votre photo ici",
  "imageEnhancer.drop.hint": "Prise en charge PNG, JPG ou WebP. Ou appuyez sur",
  "imageEnhancer.drop.paste": "pour coller.",
  "imageEnhancer.browse": "Parcourir un fichier image",
  "imageEnhancer.sample": "Ou essayez une photo d'exemple :",
  "imageEnhancer.view.split": "Curseur divisé",
  "imageEnhancer.view.side": "Côte à côte",
  "imageEnhancer.view.enhanced": "Améliorée",
  "imageEnhancer.view.original": "Originale",
  "imageEnhancer.zoom": "Zoom :",
  "imageEnhancer.badge.original": "Originale",
  "imageEnhancer.badge.enhancedScaled": "{scale}x Améliorée",
  "imageEnhancer.badge.enhancedOnly": "Améliorée ({scale}x)",
  "imageEnhancer.badge.originalImage": "Image originale",
  "imageEnhancer.stats.originalSize": "Taille originale",
  "imageEnhancer.stats.enhancedSize": "Taille améliorée",
  "imageEnhancer.stats.upscaleFactor": "Facteur d'agrandissement",
  "imageEnhancer.stats.superRes": "{scale}x Super-Résolution",
  "imageEnhancer.stats.morePixels": "+{count} % de pixels",
  "imageEnhancer.stats.exportFormat": "Format d'exportation",
  "imageEnhancer.stats.highFidelity": "Haute fidélité",
  "imageEnhancer.format": "Format :",
  "imageEnhancer.download": "Télécharger l'image améliorée",
  "imageEnhancer.presets": "Préréglages IA",
  "imageEnhancer.scale": "Échelle de super-résolution IA",
  "imageEnhancer.scaleHD": "HD",
  "imageEnhancer.scale4K": "4K Ultra",
  "imageEnhancer.scale8K": "8K Max",
  "imageEnhancer.controls": "Réglages d'amélioration",
  "imageEnhancer.apply": "Appliquer l'amélioration IA",
  "imageEnhancer.fullscreen.title": "Comparaison IA plein écran",
  "imageEnhancer.fullscreen.close": "Fermer l'aperçu",
  "imageEnhancer.error.invalid": "Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).",
  "imageEnhancer.error.sample":
    "Échec du chargement de l'image d'exemple. Essayez de téléverser un fichier local.",
  "imageEnhancer.error.clipboard": "Échec de la copie de l'image dans le presse-papiers.",
  "imageEnhancer.error.enhance": "Une erreur s'est produite lors de l'amélioration de l'image.",
  "imageEnhancer.error.render": "Échec du rendu du fichier image.",
  "imageEnhancer.error.canvas": "Impossible d'initialiser le contexte de canvas 2D.",
  "imageEnhancer.step.loading": "Chargement de la source de l'image…",
  "imageEnhancer.step.restoring":
    "Restauration du contraste, des tons du visage & de la plage dynamique…",
  "imageEnhancer.step.unsharp": "Exécution du passage de convolution du masque de renforcement…",
  "imageEnhancer.step.exporting": "Génération de l'exportation de l'image améliorée…",

  // Image Compressor UI
  "imageCompressor.format": "Format de sortie",
  "imageCompressor.quality": "Qualité : {count} %",
  "imageCompressor.qualityHigh": "Haute qualité",
  "imageCompressor.qualityBalanced": "Équilibré",
  "imageCompressor.qualityMax": "Compression maximale",
  "imageCompressor.calculating": "Calcul…",
  "imageCompressor.drop.title": "Déposez votre image à compresser, ou",
  "imageCompressor.drop.browse": "parcourir",
  "imageCompressor.drop.hint":
    "JPG, PNG, WebP pris en charge. Compression 100 % privée dans le navigateur.",
  "imageCompressor.originalSize": "Taille originale",
  "imageCompressor.compressedSize": "Taille compressée",
  "imageCompressor.savedRatio": "Ratio économisé",
  "imageCompressor.compressAnother": "Compresser une autre",
  "imageCompressor.download": "Télécharger l'image compressée",
  "imageCompressor.compressedPreview": "Aperçu compressé",
  "imageCompressor.error.compress": "Échec de la compression de l'image.",
  "imageCompressor.error.render": "Échec du rendu de l'image originale.",
  "imageCompressor.error.invalid": "Veuillez sélectionner un fichier image valide.",

  // QR Generator UI
  "qr.mode.url": "URL de site web",
  "qr.mode.text": "Texte brut",
  "qr.mode.wifi": "Réseau Wi-Fi",
  "qr.mode.email": "E-mail",
  "qr.mode.phone": "Téléphone",
  "qr.switchMode": "Basculer le mode QR vers {mode}",
  "qr.url.label": "Adresse du site web (URL)",
  "qr.url.placeholder": "https://exemple.com",
  "qr.text.label": "Contenu / Message texte",
  "qr.text.placeholder": "Saisissez ou collez n'importe quel texte…",
  "qr.wifi.ssid": "Nom du réseau (SSID)",
  "qr.wifi.ssidPlaceholder": "MonWifiDomicile",
  "qr.wifi.password": "Mot de passe",
  "qr.wifi.passwordPlaceholder": "Mot de passe Wi-Fi",
  "qr.wifi.encryption": "Type de chiffrement",
  "qr.wifi.wpa": "WPA / WPA2 / WPA3",
  "qr.wifi.wep": "WEP",
  "qr.wifi.open": "Aucun (réseau ouvert)",
  "qr.email.to": "Adresse e-mail du destinataire",
  "qr.email.toPlaceholder": "nom@exemple.com",
  "qr.email.subject": "Objet (facultatif)",
  "qr.email.subjectPlaceholder": "Demande concernant un projet",
  "qr.phone.label": "Numéro de téléphone",
  "qr.phone.placeholder": "+33 (1) 00 00 00 00",
  "qr.customization": "Options de personnalisation",
  "qr.fgColor": "Couleur de premier plan",
  "qr.bgColor": "Couleur d'arrière-plan",
  "qr.clear": "Effacer les champs",
  "qr.copiedContent": "Contenu copié",
  "qr.copyPayload": "Copier la charge utile",
  "qr.preview": "Aperçu QR en direct",
  "qr.previewAlt": "Code QR généré",
  "qr.previewEmpty": "Saisissez du contenu pour prévisualiser le code QR",
  "qr.error.invalid": "Texte ou format QR non valide.",
  "qr.error.copy": "Échec de la copie du contenu.",

  // Password Generator UI
  "passwordGen.empty": "Sélectionnez au moins un jeu de caractères",
  "passwordGen.regenerate": "Régénérer le mot de passe",
  "passwordGen.copied": "Copié !",
  "passwordGen.copy": "Copier le mot de passe",
  "passwordGen.strength": "Robustesse de sécurité :",
  "passwordGen.strength.weak": "Faible",
  "passwordGen.strength.fair": "Correct",
  "passwordGen.strength.good": "Bon",
  "passwordGen.strength.strong": "Fort",
  "passwordGen.strength.veryStrong": "Très fort",
  "passwordGen.length": "Longueur du mot de passe",
  "passwordGen.lengthChars": "{count} caractères",
  "passwordGen.uppercase": "Lettres majuscules (A-Z)",
  "passwordGen.uppercaseHint": "ex. ABCDEF",
  "passwordGen.lowercase": "Lettres minuscules (a-z)",
  "passwordGen.lowercaseHint": "ex. abcdef",
  "passwordGen.numbers": "Chiffres (0-9)",
  "passwordGen.numbersHint": "ex. 123456",
  "passwordGen.symbols": "Symboles spéciaux (!@#$)",
  "passwordGen.symbolsHint": "ex. !@#$%^&*",
  "passwordGen.excludeAmbiguous": "Exclure les caractères ambigus",
  "passwordGen.excludeAmbiguousHint": "Éviter les caractères confus comme l, 1, I, O, 0",

  // Background Remover UI
  "bgRemover.view.cutout": "Afficher la vue du résultat détouré",
  "bgRemover.view.compare": "Afficher la vue de comparaison",
  "bgRemover.view.original": "Afficher la vue de l'image originale",
  "bgRemover.drop.title": "Déposez votre image ici, ou",
  "bgRemover.drop.browse": "parcourir",
  "bgRemover.drop.hint":
    "Prise en charge PNG, JPG ou WebP (jusqu'à 20 Mo). Traitement privé côté client.",
  "bgRemover.viewMode": "Mode d'affichage :",
  "bgRemover.cutout": "Détourage",
  "bgRemover.compare": "Comparer",
  "bgRemover.original": "Originale",
  "bgRemover.reset": "Réinitialiser",
  "bgRemover.download": "Télécharger PNG",
  "bgRemover.processing": "Suppression des pixels d'arrière-plan…",
  "bgRemover.resultLabel": "Résultat transparent",
  "bgRemover.processingFallback": "Traitement…",
  "bgRemover.refine": "Affiner la sensibilité de suppression",
  "bgRemover.colorTolerance": "Tolérance de couleur",
  "bgRemover.edgeSoftness": "Douceur des contours (dégradé)",
  "bgRemover.error.invalidImage": "Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).",
  "bgRemover.error.canvas": "Impossible d'initialiser le moteur de rendu canvas.",
  "bgRemover.error.export": "Échec de l'exportation du PNG traité.",
  "bgRemover.error.unexpected": "Une erreur inattendue s'est produite lors du traitement.",
  "bgRemover.error.load": "Échec du chargement de l'image pour le traitement.",

  // Tool names + taglines (76 ready tools) — termes techniques natifs en français.
  "tool.translator.name": "Traducteur IA",
  "tool.translator.tagline":
    "Traduisez entre plus de 20 langues avec détection automatique et inversion instantanée.",
  "tool.image-enhancer.name": "Améliorateur d'images IA",
  "tool.image-enhancer.tagline":
    "Augmentez la résolution jusqu'à 8x, restaurez les visages, supprimez le bruit et améliorez la netteté.",
  "tool.image-compressor.name": "Compresseur d'images",
  "tool.image-compressor.tagline":
    "Réduisez la taille des fichiers image directement dans votre navigateur.",
  "tool.background-remover.name": "Effaceur d'arrière-plan",
  "tool.background-remover.tagline":
    "Découpez l'arrière-plan des images et exportez des PNG transparents.",
  "tool.video-compressor.name": "Compresseur vidéo",
  "tool.video-compressor.tagline":
    "Réduisez la taille des fichiers vidéo avec qualité et paramètres de sortie configurables.",
  "tool.video-trimmer.name": "Découpeur vidéo",
  "tool.video-trimmer.tagline":
    "Découpez une partie sélectionnée d'une vidéo avec des commandes de début et de fin.",
  "tool.video-to-gif.name": "Vidéo en GIF",
  "tool.video-to-gif.tagline": "Convertit un segment vidéo pris en charge en GIF animé.",
  "tool.audio-compressor.name": "Compresseur audio",
  "tool.audio-compressor.tagline":
    "Compressez des fichiers audio en contrôlant la qualité et le débit de sortie.",
  "tool.audio-cutter.name": "Découpeur audio",
  "tool.audio-cutter.tagline":
    "Coupez une partie sélectionnée d'un fichier audio avec des commandes de début et de fin.",
  "tool.text-to-speech.name": "Synthèse vocale",
  "tool.text-to-speech.tagline":
    "Convertissez du texte écrit en voix naturelle avec des voix configurables.",
  "tool.file-hash-generator.name": "Générateur de hachage de fichiers",
  "tool.file-hash-generator.tagline":
    "Calculez les hachages MD5, SHA-1 et SHA-256 de tout fichier dans votre navigateur.",
  "tool.qr-generator.name": "Générateur de codes QR",
  "tool.qr-generator.tagline":
    "Créez des codes QR personnalisés pour liens, texte, Wi-Fi et contacts.",
  "tool.barcode-generator.name": "Générateur de codes-barres",
  "tool.barcode-generator.tagline":
    "Générez des codes-barres dans plusieurs formats prêts à télécharger ou imprimer.",
  "tool.password-generator.name": "Générateur de mots de passe",
  "tool.password-generator.tagline":
    "Générez des mots de passe forts et sécurisés avec indicateur d'entropie.",
  "tool.password-checker.name": "Vérificateur de mots de passe",
  "tool.password-checker.tagline":
    "Vérifiez la force, l'entropie et le temps de crack estimé avec des conseils pratiques.",
  "tool.word-counter.name": "Compteur de mots",
  "tool.word-counter.tagline": "Comptez mots, caractères, phrases et paragraphes instantanément.",
  "tool.case-converter.name": "Convertisseur de casse",
  "tool.case-converter.tagline":
    "Basculez entre majuscules, minuscules, titre et d'autres formats instantanément.",
  "tool.slug-generator.name": "Générateur de slugs",
  "tool.slug-generator.tagline":
    "Transformez les titres en slugs propres et compatibles URL avec séparateurs et longueur personnalisés.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Générez du texte de remplissage Lorem Ipsum avec le nombre de paragraphes ou mots choisi.",
  "tool.random-number.name": "Générateur de nombres aléatoires",
  "tool.random-number.tagline":
    "Générez des nombres aléatoires dans une plage avec options de quantité et sans doublons.",
  "tool.random-name.name": "Tirage de noms aléatoires",
  "tool.random-name.tagline":
    "Tirez un ou plusieurs noms au hasard dans une liste avec option sans doublons.",
  "tool.json-formatter.name": "Formateur JSON",
  "tool.json-formatter.tagline":
    "Embellissez, minifiez et validez du JSON avec indentation personnalisée.",
  "tool.uuid-generator.name": "Générateur d'UUID",
  "tool.uuid-generator.tagline": "Créez des identifiants UUID uniques (v4) rapidement et par lot.",
  "tool.xml-formatter.name": "Formateur XML",
  "tool.xml-formatter.tagline":
    "Embellissez, minifiez et validez du XML avec indentation personnalisée.",
  "tool.csv-viewer.name": "Visionneuse CSV",
  "tool.csv-viewer.tagline":
    "Prévisualisez des données CSV sous forme de tableau avec choix du délimiteur et détection d'en-têtes.",
  "tool.text-compare.name": "Comparateur de textes",
  "tool.text-compare.tagline":
    "Comparez deux textes ligne par ligne et mettez en évidence ajouts, suppressions et correspondances.",
  "tool.qr-reader.name": "Lecteur QR",
  "tool.qr-reader.tagline":
    "Scannez et décodez des codes QR depuis des images ou votre caméra en texte ou liens.",
  "tool.find-and-replace.name": "Rechercher et remplacer",
  "tool.find-and-replace.tagline":
    "Recherchez et remplacez du texte dans de longs documents avec regex optionnel et sensibilité à la casse.",
  "tool.remove-duplicate-lines.name": "Supprimer les doublons de lignes",
  "tool.remove-duplicate-lines.tagline":
    "Supprimez les lignes en double avec correspondance insensible à la casse et tenant compte des espaces.",
  "tool.remove-empty-lines.name": "Supprimer les lignes vides",
  "tool.remove-empty-lines.tagline":
    "Supprimez instantanément les lignes vides ou composées d'espaces.",
  "tool.text-cleaner.name": "Nettoyeur de texte",
  "tool.text-cleaner.tagline":
    "Nettoyez le texte en supprimant les espaces superflus, sauts de ligne et caractères indésirables.",
  "tool.sort-lines.name": "Trier les lignes",
  "tool.sort-lines.tagline":
    "Triez les lignes alphabétiquement, par longueur ou mélangez-les avec options de casse et lignes vides.",
  "tool.reverse-text.name": "Inverser le texte",
  "tool.reverse-text.tagline":
    "Inversez le texte par caractères, mots ou lignes entières instantanément.",
  "tool.add-line-numbers.name": "Numéroter les lignes",
  "tool.add-line-numbers.tagline":
    "Ajoutez des numéros de ligne séquentiels avec séparateurs, remplissage et décalage personnalisés.",
  "tool.word-frequency.name": "Analyseur de fréquence des mots",
  "tool.word-frequency.tagline":
    "Analysez la fréquence des mots avec tri, sensibilité à la casse et filtres de longueur.",
  "tool.unit-converter.name": "Convertisseur d'unités",
  "tool.unit-converter.tagline":
    "Convertissez entre unités de longueur, poids, volume et plus instantanément.",
  "tool.temperature-converter.name": "Convertisseur de température",
  "tool.temperature-converter.tagline":
    "Convertissez entre Celsius, Fahrenheit et Kelvin rapidement.",
  "tool.base64-converter.name": "Convertisseur Base64",
  "tool.base64-converter.tagline":
    "Encodez et décodez du texte en Base64 et inversement instantanément.",
  "tool.timestamp-converter.name": "Convertisseur d'horodatage",
  "tool.timestamp-converter.tagline":
    "Convertissez les horodatages Unix en dates lisibles et inversement, avec fuseau horaire.",
  "tool.csv-to-json.name": "CSV en JSON",
  "tool.csv-to-json.tagline":
    "Convertissez des données CSV en JSON structuré avec détection automatique des en-têtes.",
  "tool.percentage-calculator.name": "Calculateur de pourcentage",
  "tool.percentage-calculator.tagline":
    "Calculez pourcentages, augmentations et remises rapidement et précisément.",
  "tool.bmi-calculator.name": "Calculateur d'IMC",
  "tool.bmi-calculator.tagline":
    "Calculez votre indice de masse corporelle à partir du poids et de la taille.",
  "tool.age-calculator.name": "Calculateur d'âge",
  "tool.age-calculator.tagline": "Calculez votre âge exact en années, mois et jours.",
  "tool.meta-tag-generator.name": "Générateur de balises meta",
  "tool.meta-tag-generator.tagline":
    "Créez des balises meta HTML pour le SEO avec titre, description et Open Graph.",
  "tool.url-encoder.name": "Encodeur d'URL",
  "tool.url-encoder.tagline": "Encodez et décodez les URL et composants d'URL instantanément.",
  "tool.html-entity-encoder.name": "Encodeur d'entités HTML",
  "tool.html-entity-encoder.tagline":
    "Convertissez les caractères spéciaux en entités HTML et inversement en texte lisible.",
  "tool.html-minifier.name": "Minificateur HTML",
  "tool.html-minifier.tagline":
    "Réduisez la taille de votre HTML en supprimant espaces et commentaires inutiles.",
  "tool.css-minifier.name": "Minificateur CSS",
  "tool.css-minifier.tagline":
    "Compressez votre CSS en supprimant espaces, commentaires et règles redondantes.",
  "tool.js-minifier.name": "Minificateur JS",
  "tool.js-minifier.tagline":
    "Minifiez le JavaScript en supprimant espaces et commentaires pour un poids réduit.",
  "tool.json-validator.name": "Validateur JSON",
  "tool.json-validator.tagline":
    "Validez la syntaxe de votre JSON et localisez les erreurs instantanément.",
  "tool.regex-tester.name": "Testeur de regex",
  "tool.regex-tester.tagline":
    "Testez des expressions régulières et mettez en évidence les correspondances en temps réel.",
  "tool.jwt-decoder.name": "Décodeur JWT",
  "tool.jwt-decoder.tagline":
    "Décodez les tokens JWT et affichez le contenu du header et du payload.",
  "tool.sql-formatter.name": "Formateur SQL",
  "tool.sql-formatter.tagline":
    "Embellissez et minifiez des requêtes SQL avec mots-clés en majuscules et indentation configurable.",
  "tool.markdown-preview.name": "Aperçu Markdown",
  "tool.markdown-preview.tagline":
    "Écrivez en Markdown et voyez l'aperçu HTML rendu instantanément.",
  "tool.color-converter.name": "Convertisseur de couleurs",
  "tool.color-converter.tagline": "Convertissez entre HEX, RGB et HSL et prévisualisez la couleur.",
  "tool.cron-parser.name": "Analyseur Cron",
  "tool.cron-parser.tagline":
    "Traduisez les expressions cron en langage clair avec détail des champs et prochaines exécutions.",
  "tool.xml-validator.name": "Validateur XML",
  "tool.xml-validator.tagline":
    "Validez le format, l'équilibre des balises et la structure du XML avec erreurs instantanées.",
  "tool.html-formatter.name": "Formateur HTML",
  "tool.html-formatter.tagline":
    "Embellissez et minifiez le HTML avec imbrication correcte et indentation configurable.",
  "tool.yaml-formatter.name": "Formateur YAML",
  "tool.yaml-formatter.tagline":
    "Embellissez et normalisez le YAML avec indentation et validation configurables.",
  "tool.markdown-table-generator.name": "Générateur de tableaux Markdown",
  "tool.markdown-table-generator.tagline":
    "Créez des tableaux Markdown visuellement et exportez-les prêts à coller.",
  "tool.css-gradient-generator.name": "Générateur de dégradés CSS",
  "tool.css-gradient-generator.tagline":
    "Concevez des dégradés CSS linéaires, radiaux et coniques avec points de couleur et angle.",
  "tool.audio-converter.name": "Convertisseur audio",
  "tool.audio-converter.tagline":
    "Convertissez des fichiers audio (MP3, OGG, FLAC et plus) en WAV dans votre navigateur.",
  "tool.video-converter.name": "Convertisseur vidéo",
  "tool.video-converter.tagline":
    "Convertissez la vidéo en MP4 (H.264) ou AVI (MPEG-4) dans votre navigateur.",
  "tool.gif-maker.name": "Créateur de GIF",
  "tool.gif-maker.tagline":
    "Créez un GIF animé à partir d'images importées ou d'une vidéo prise en charge.",
  "tool.gif-compressor.name": "Compresseur GIF",
  "tool.gif-compressor.tagline":
    "Réduisez la taille du fichier GIF tout en conservant une qualité visuelle acceptable.",
  "tool.image-to-gif.name": "Image en GIF",
  "tool.image-to-gif.tagline": "Créez un GIF animé à partir de plusieurs images importées.",
  "tool.pdf-to-excel.name": "PDF en Excel",
  "tool.pdf-to-excel.tagline":
    "Convertissez les tableaux et contenus PDF appropriés en un fichier compatible Excel.",
  "tool.pdf-to-powerpoint.name": "PDF en PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Convertissez les pages et contenus PDF appropriés en un fichier compatible PowerPoint.",
  "tool.pdf-to-text.name": "PDF en texte",
  "tool.pdf-to-text.tagline": "Extrayez le texte sélectionnable des documents PDF.",
  "tool.pdf-crop.name": "Rogner le PDF",
  "tool.pdf-crop.tagline": "Rognez les pages PDF avec des limites de rognage configurables.",
  "tool.pdf-page-numbers.name": "Numéros de page PDF",
  "tool.pdf-page-numbers.tagline": "Ajoutez des numéros de page configurables aux pages d'un PDF.",
  "tool.pdf-header-footer.name": "En-tête et pied de page PDF",
  "tool.pdf-header-footer.tagline":
    "Ajoutez des en-têtes et pieds de page personnalisables aux pages d'un PDF.",
  "tool.text-to-pdf.name": "Texte en PDF",
  "tool.text-to-pdf.tagline": "Convertissez le texte saisi ou collé en un PDF téléchargeable.",
  "tool.text-to-word.name": "Texte en Word",
  "tool.text-to-word.tagline":
    "Convertissez le texte saisi ou collé en un document DOCX téléchargeable.",
  "tool.markdown-to-pdf.name": "Markdown en PDF",
  "tool.markdown-to-pdf.tagline": "Convertissez le contenu Markdown en un PDF mis en forme.",
  "tool.markdown-to-word.name": "Markdown en Word",
  "tool.markdown-to-word.tagline":
    "Convertissez le contenu Markdown en un document DOCX mis en forme.",
};
