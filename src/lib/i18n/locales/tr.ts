import type { Dictionary } from "./en";
import { en } from "./en";

export const tr: Dictionary = {
  ...en,

  "lang.name": "Türkçe",
  "lang.switch": "Dili değiştir",

  "nav.tools": "Araçlar",
  "nav.categories": "Kategoriler",
  "nav.popular": "Popüler",
  "nav.why": "Neden Flixo",
  "nav.faq": "SSS",
  "nav.openTranslator": "Çeviriciyi aç",
  "nav.toggleTheme": "Temayı değiştir",
  "nav.toggleMenu": "Menüyü aç",

  "hero.badge": "Tek çalışma alanı, tüm yapay zekâ araçları",
  "hero.title": "Her yapay zekâ aracı için tek çalışma alanı",
  "hero.description":
    "Çeviri, görseller, PDF, yazma ve yardımcılar — beş araç merkezi tek bir sakin arayüzde. Hesap yok, API anahtarı yok; bir araç aç ve başla.",
  "hero.promo.badge": "Yeni",
  "hero.promo.body":
    "Yapay zekâ görsel iyileştiriciyi bugün dene — fotoğraflarını keskinleştir, büyüt ve gürültüyü anında gider.",
  "hero.searchLabel": "Ne yapmak istediğini anlat",
  "hero.searchPlaceholder": "Dene: «bunu Arapçaya çevir», «bir PDF özetle», «görsel üret»…",
  "hero.browse": "Araçlara göz at",
  "hero.cta": "Çeviriciyi dene",
  "hero.note": "Ücretsiz · Kayıt gerektirmez",

  "assistant.eyebrow": "Yapay zekâ asistanı",
  "assistant.title": "İhtiyacını söyle — doğru aracı bulayım",
  "assistant.placeholder": "Görevini anlat… örn. «bir paragrafı Fransızcaya çevir»",
  "assistant.button": "Araç bul",
  "assistant.thinking": "Düşünüyor…",
  "assistant.reset": "Başka bir şey sor",
  "assistant.result.category": "Kategori",
  "assistant.result.matched": "Eşleşme",
  "assistant.result.open": "Aracı aç",
  "assistant.result.soon": "Yakında",
  "assistant.suggestion.translation":
    "Metin çevirmek istiyorsun gibi görünüyor. Çevirici senin için hazır.",
  "assistant.suggestion.images":
    "Görsellerle çalışmak istiyorsun. Henüz görsel aracı yok — bir tane iste, önceliklendirelim.",
  "assistant.suggestion.pdf":
    "Bir PDF'den bahsettin. Henüz PDF aracı yok — bir tane iste, önceliklendirelim.",
  "assistant.suggestion.writing":
    "Yazma konusunda yardıma ihtiyacın var. Henüz yazım aracı yok — bir tane iste, önceliklendirelim.",
  "assistant.suggestion.utilities":
    "Bir yardımcı araca ihtiyacın var. Henüz yok — bir tane iste, önceliklendirelim.",
  "assistant.suggestion.unknown":
    "Hangi kategori uyduğu emin değilim. Daha fazla anlat ya da yeni araç iste.",
  "assistant.empty.title": "Önerin burada görünür",
  "assistant.empty.body":
    "Yukarıya bir görev yaz, asistan seni doğru Flixo aracına yönlendirir — ya da yeni istemene yardım eder.",

  "request.trigger": "Araç iste",
  "request.title": "Yeni araç iste",
  "request.description": "İhtiyacını söyle, bir sonraki sürüm için önceliklendirelim.",
  "request.label": "Aracın ne yapması gerekiyor?",
  "request.placeholder": "örn. PDF'yi biçimlendirmeyi koruyarak Word'e çeviren bir araç…",
  "request.submit": "İsteği gönder",
  "request.cancel": "İptal",
  "request.success":
    "Teşekkürler! İsteğin not edildi — bir sonraki sürüm için önceliklendireceğiz.",
  "request.ok": "Tamam",

  "categories.eyebrow": "Araç merkezleri",
  "categories.title": "Beş merkez, tek çalışma alanı",
  "categories.description":
    "Her Flixo aracı bu merkezlerden birinde yer alır. Şimdilik yer tutucular — temel büyümeye hazır.",
  "categories.status.coming": "Yakında",
  "categories.status.live": "{count} kullanılabilir",
  "categories.toolsLabel": "Planlanan araçlar",
  "status.live": "Kullanılabilir",
  "status.soon": "Yakında",

  "category.translation.name": "Çeviri merkezi",
  "category.translation.blurb": "Otomatik algılama ile 20+ dile çevir, yerelleştir ve altyazıla.",
  "category.translation.tools": "Çevirici · Yerelleştirici · Altyazı çevirici",
  "category.images.name": "Görsel araçları",
  "category.images.blurb": "Görselleri üret, büyüt ve arka planlarını kaldır.",
  "category.images.tools": "Görsel üretici · Büyütücü · Arka plan kaldırıcı",
  "category.pdf.name": "PDF araçları",
  "category.pdf.blurb": "PDF belgelerini birleştir, böl, sıkıştır ve dönüştür.",
  "category.pdf.tools": "Birleştir · Böl · Sıkıştır · PDF'den Word'e",
  "category.writing.name": "Yapay zekâ yazma",
  "category.writing.blurb": "Doğru tonla özetle, yeniden yaz ve içerik oluştur.",
  "category.writing.tools": "Özetleyici · Yeniden yazıcı · E-posta hazırlayıcı",
  "category.utilities.name": "Yardımcılar",
  "category.utilities.blurb": "Günlük teknik parçaları biçimlendir, dönüştür ve üret.",
  "category.utilities.tools": "JSON biçimlendirici · QR üretici · Base64 dönüştürücü",
  "category.developer.name": "Geliştirici araçları",
  "category.developer.blurb": "Günlük kod için biçimlendiriciler, doğrulayıcılar ve üreticiler.",
  "category.developer.tools": "JSON biçimlendirici · XML doğrulayıcı · Cron ayrıştırıcı",

  "tool.back": "Tüm araçlar",

  "why.eyebrow": "Neden Flixo",
  "why.title": "Sürtünmeyi kaldırmak için yapıldı, özellik eklemek için değil",
  "why.speed.title": "Varsayılan olarak anında",
  "why.speed.body":
    "Araçlar bir saniyeden kısa sürede açılır ve tarayıcıda çalışır — kuyruk veya soğuk başlangıç yok.",
  "why.consistency.title": "Tutarlı bir arayüz",
  "why.consistency.body":
    "Her araç aynı düzeni, kısayolları ve sonuç eylemlerini paylaşır, yeniden öğrenilecek bir şey yok.",
  "why.privacy.title": "Önce gizlilik",
  "why.privacy.body": "Oturumlar arasında hiçbir şey saklanmaz. Girdin, yazdığın sekmede kalır.",
  "why.access.title": "Hesap yok, anahtar yok",
  "why.access.body": "API anahtarı, panel veya koltuk yönetimi yok. Bir araç aç ve başla.",
  "stats.tasks": "İşlenen görevler",
  "stats.languages": "Desteklenen diller",
  "stats.latency": "Ortanca yanıt süresi",
  "stats.uptime": "Son 12 ay çalışma süresi",

  "faq.eyebrow": "SSS",
  "faq.title": "Sorular, yanıtlandı",
  "faq.description": "İlk aracını açmadan önce bilinmesi gereken her şey.",
  "faq.q1": "Flixo ücretsiz mi?",
  "faq.a1": "Evet. Şu anda Flixo'daki tüm araçlar ücretsizdir ve hesap veya karta gerek yoktur.",
  "faq.q2": "Çevirici nasıl çalışır?",
  "faq.a2":
    "Metin yapıştırırsın, kaynak ve hedef dili seçersin (veya otomatik algılamaya bırakırsın) ve Flixo çeviriyi döner. Mevcut sürüm, akışı çevrimdışı keşfetmek için yerel bir demo motoru kullanır.",
  "faq.q3": "Yazdıklarımı saklıyor musunuz?",
  "faq.a3":
    "Hayır. Girdi ve çıktı yalnızca tarayıcı sekmen içinde var olur ve aracı kapatıp temizlediğinde kaybolur.",
  "faq.q4": "Hangi diller destekleniyor?",
  "faq.a4":
    "Latin, Kiril, Arap, İbrani, Hint ve CJK alfabelerinde yirmi dil, artık otomatik kaynak algılama.",
  "faq.q5": "Diğer araçlar ne zaman çıkacak?",
  "faq.a5":
    "Beş merkez — Çeviri, Görseller, PDF, Yazma ve Yardımcılar — yol haritasıdır. Yeni araçlar aynı kayda bağlanır ve paylaşılan düzeni devralır.",

  "footer.tagline":
    "Takımının gün boyu başvurduğu her yapay zekâ aracı için sakin bir çalışma alanı.",
  "footer.product": "Ürün",
  "footer.featured": "Öne çıkan araçlar",
  "footer.popular": "Popüler araçlar",
  "footer.numbers": "Sayılar",
  "footer.categories": "Kategoriler",
  "footer.tools": "Araçlar",
  "footer.more": "Daha fazlası yakında",
  "footer.rights": "© {year} Flixo. Tüm hakları saklıdır.",
  "footer.built": "Hızlı teslim eden takımlar için yapıldı.",

  "translator.pageDescription": "Kaynak dili otomatik algılar ve saniyeler içinde çevirir.",
  "translator.from": "Kaynak",
  "translator.to": "Hedef",
  "translator.auto": "Otomatik algıla",
  "translator.swap": "Dilleri değiştir",
  "translator.inputPlaceholder": "Çevrilecek metni yaz veya yapıştır…",
  "translator.inputLabel": "Çevrilecek metin",
  "translator.detected": "algılandı {language}",
  "translator.copy": "Kopyala",
  "translator.copied": "Kopyalandı",
  "translator.copyError": "Panoya kopyalanamadı.",
  "translator.genericError": "Bir şeyler ters gitti. Tekrar deneyin.",
  "translator.clear": "Temizle",
  "translator.translate": "Çevir",
  "translator.translating": "Çevriliyor…",
  "translator.emptyTitle": "Çevirin burada görünür",
  "translator.emptyBody":
    "Bir hedef dil seç, metin gir ve Çevir'e bas. Otomatik algılama kaynağı bulur.",

  // Tool names + taglines (76 ready tools) — yerel Türkçe teknik terimler.
  "tool.translator.name": "Yapay Zeka Çevirmen",
  "tool.translator.tagline": "20+ dil arasında otomatik algılama ve anlık değiştirme ile çevirin.",
  "tool.image-enhancer.name": "Yapay Zeka Görsel Geliştirici",
  "tool.image-enhancer.tagline":
    "Çözünürlüğü 8x'e kadar yükseltin, yüzleri onarın, gürültüyü giderin ve fotoğrafları keskinleştirin.",
  "tool.image-compressor.name": "Görsel Sıkıştırıcı",
  "tool.image-compressor.tagline": "Görsel dosya boyutunu doğrudan tarayıcınızda küçültün.",
  "tool.background-remover.name": "Arka Plan Kaldırıcı",
  "tool.background-remover.tagline": "Görsel arka planlarını kesin ve şeffaf PNG dışa aktarın.",
  "tool.video-compressor.name": "Video Sıkıştırıcı",
  "tool.video-compressor.tagline":
    "Yapılandırılabilir kalite ve çıktı ayarlarıyla video dosya boyutunu küçültün.",
  "tool.video-trimmer.name": "Video Kırpıcı",
  "tool.video-trimmer.tagline":
    "Başlangıç ve bitiş kontrolleriyle videonun seçili bir bölümünü kırpın.",
  "tool.video-to-gif.name": "Video'dan GIF",
  "tool.video-to-gif.tagline": "Desteklenen bir video bölümünü animasyonlu GIF'e dönüştürün.",
  "tool.audio-compressor.name": "Ses Sıkıştırıcı",
  "tool.audio-compressor.tagline":
    "Çıktı kalitesini ve bit hızını kontrol ederek ses dosyalarını sıkıştırın.",
  "tool.audio-cutter.name": "Ses Kırpıcı",
  "tool.audio-cutter.tagline":
    "Başlangıç ve bitiş kontrolleriyle bir ses dosyasının seçili bölümünü kırpın.",
  "tool.text-to-speech.name": "Metin Okuma",
  "tool.text-to-speech.tagline": "Yazılı metni yapılandırılabilir seslerle doğal sese dönüştürün.",
  "tool.file-hash-generator.name": "Dosya Özet (Hash) Üretici",
  "tool.file-hash-generator.tagline":
    "Tarayıcınızda herhangi bir dosyanın MD5, SHA-1 ve SHA-256 özetlerini hesaplayın.",
  "tool.qr-generator.name": "QR Kod Üretici",
  "tool.qr-generator.tagline":
    "Bağlantılar, metin, Wi-Fi ve kişi bilgileri için özel QR kodları oluşturun.",
  "tool.barcode-generator.name": "Barkod Üretici",
  "tool.barcode-generator.tagline":
    "İndirilmeye veya yazdırılmaya hazır birden fazla biçimde barkod oluşturun.",
  "tool.password-generator.name": "Şifre Üretici",
  "tool.password-generator.tagline": "Entropi ölçeri ile güçlü, güvenli şifreler üretin.",
  "tool.password-checker.name": "Şifre Kontrolcü",
  "tool.password-checker.tagline":
    "Şifre gücünü, entropisini ve tahmini kırılma süresini pratik ipuçlarıyla kontrol edin.",
  "tool.word-counter.name": "Kelime Sayıcı",
  "tool.word-counter.tagline": "Yazarken kelime, karakter, cümle ve paragrafları anında sayın.",
  "tool.case-converter.name": "Harf Dönüştürücü",
  "tool.case-converter.tagline":
    "Büyük, küçük harf, başlık ve diğer biçimler arasında anında geçiş yapın.",
  "tool.slug-generator.name": "Slug Üretici",
  "tool.slug-generator.tagline":
    "Başlıkları ayraçlar ve uzunlukla temiz, URL uyumlu slug'lara dönüştürün.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Seçtiğiniz sayıda paragraf veya kelime ile Lorem Ipsum yer tutucu metin üretin.",
  "tool.random-number.name": "Rastgele Sayı Üretici",
  "tool.random-number.tagline":
    "Bir aralıkta, adet seçeneği ve tekrarsız olarak rastgele sayılar üretin.",
  "tool.random-name.name": "Rastgele İsim Seçici",
  "tool.random-name.tagline":
    "Bir listeden tekrarsız seçenekle bir veya birden fazla rastgele isim seçin.",
  "tool.json-formatter.name": "JSON Biçimlendirici",
  "tool.json-formatter.tagline":
    "Özel girinti seçenekleriyle JSON'u güzelleştirin, küçültün ve doğrulayın.",
  "tool.uuid-generator.name": "UUID Üretici",
  "tool.uuid-generator.tagline": "Benzersiz UUID (v4) tanımlayıcılarını hızlı ve toplu oluşturun.",
  "tool.xml-formatter.name": "XML Biçimlendirici",
  "tool.xml-formatter.tagline":
    "Özel girinti seçenekleriyle XML'i güzelleştirin, küçültün ve doğrulayın.",
  "tool.csv-viewer.name": "CSV Görüntüleyici",
  "tool.csv-viewer.tagline":
    "CSV verilerini sınırlayıcı seçimi ve başlık algılama ile tablo olarak önizleyin.",
  "tool.text-compare.name": "Metin Karşılaştırıcı",
  "tool.text-compare.tagline":
    "İki metni satır satır karşılaştırın ve eklemeleri, silmeleri ve eşleşmeleri vurgulayın.",
  "tool.qr-reader.name": "QR Okuyucu",
  "tool.qr-reader.tagline":
    "Görüntülerden veya kameranızdan QR kodlarını metin veya bağlantıya tarayın ve çözün.",
  "tool.find-and-replace.name": "Bul ve Değiştir",
  "tool.find-and-replace.tagline":
    "Uzun belgelerde metni isteğe bağlı regex ve büyük/küçük harf duyarlılığıyla bulun ve değiştirin.",
  "tool.remove-duplicate-lines.name": "Yinelenen Satırları Kaldır",
  "tool.remove-duplicate-lines.tagline":
    "Büyük/küçük harf duyarsız ve boşluk farkında eşleştirmeyle yinelenen satırları kaldırın.",
  "tool.remove-empty-lines.name": "Boş Satırları Kaldır",
  "tool.remove-empty-lines.tagline": "Boş veya yalnızca boşluk içeren satırları anında kaldırın.",
  "tool.text-cleaner.name": "Metin Temizleyici",
  "tool.text-cleaner.tagline":
    "Fazladan boşlukları, satır sonlarını ve istenmeyen karakterleri kaldırarak metni temizleyin.",
  "tool.sort-lines.name": "Satırları Sırala",
  "tool.sort-lines.tagline":
    "Satırları alfabetik, uzunluğa göre sıralayın veya büyük harf ve boş satır seçenekleriyle karıştırın.",
  "tool.reverse-text.name": "Metni Ters Çevir",
  "tool.reverse-text.tagline":
    "Metni karakter, kelime veya tam satırlar halinde anında ters çevirin.",
  "tool.add-line-numbers.name": "Satır Numarası Ekle",
  "tool.add-line-numbers.tagline":
    "Ayraçlar, dolgu ve başlangıç kaymasıyla ardışık satır numaraları ekleyin.",
  "tool.word-frequency.name": "Kelime Sıklık Analizcisi",
  "tool.word-frequency.tagline":
    "Sıralama, büyük/küçük harf duyarlılığı ve uzunluk filtreleriyle kelime sıklığını analiz edin.",
  "tool.unit-converter.name": "Birim Dönüştürücü",
  "tool.unit-converter.tagline":
    "Uzunluk, ağırlık, hacim ve daha fazla birim arasında anında dönüştürün.",
  "tool.temperature-converter.name": "Sıcaklık Dönüştürücü",
  "tool.temperature-converter.tagline":
    "Santigrat, Fahrenheit ve Kelvin arasında hızla dönüştürün.",
  "tool.base64-converter.name": "Base64 Dönüştürücü",
  "tool.base64-converter.tagline": "Metni Base64'e kodlayın ve geri çözün, anında.",
  "tool.timestamp-converter.name": "Zaman Damgası Dönüştürücü",
  "tool.timestamp-converter.tagline":
    "Unix zaman damgalarını okunabilir tarihlere ve geriye, saat dilimi desteğiyle dönüştürün.",
  "tool.csv-to-json.name": "CSV'den JSON",
  "tool.csv-to-json.tagline":
    "Otomatik başlık algılamasıyla CSV verilerini yapılandırılmış JSON'a dönüştürün.",
  "tool.percentage-calculator.name": "Yüzde Hesaplayıcı",
  "tool.percentage-calculator.tagline":
    "Yüzdeleri, artışları ve indirimleri hızlı ve doğru hesaplayın.",
  "tool.bmi-calculator.name": "VKİ Hesaplayıcı",
  "tool.bmi-calculator.tagline": "Kilo ve boydan vücut kitle indeksinizi hesaplayın.",
  "tool.age-calculator.name": "Yaş Hesaplayıcı",
  "tool.age-calculator.tagline": "Tam yaşınızı yıl, ay ve gün olarak hesaplayın.",
  "tool.meta-tag-generator.name": "Meta Etiket Üretici",
  "tool.meta-tag-generator.tagline":
    "Başlık, açıklama ve Open Graph ile SEO için HTML meta etiketleri oluşturun.",
  "tool.url-encoder.name": "URL Kodlayıcı",
  "tool.url-encoder.tagline": "URL'leri ve URL bileşenlerini anında kodlayın ve çözün.",
  "tool.html-entity-encoder.name": "HTML Varlık Kodlayıcı",
  "tool.html-entity-encoder.tagline":
    "Özel karakterleri HTML varlıklarına ve geriye okunabilir metne dönüştürün.",
  "tool.html-minifier.name": "HTML Küçültücü",
  "tool.html-minifier.tagline":
    "Gereksiz boşlukları ve yorumları kaldırarak HTML boyutunuzu küçültün.",
  "tool.css-minifier.name": "CSS Küçültücü",
  "tool.css-minifier.tagline":
    "Boşlukları, yorumları ve gereksiz kuralları kaldırarak CSS'inizi sıkıştırın.",
  "tool.js-minifier.name": "JS Küçültücü",
  "tool.js-minifier.tagline":
    "Daha küçük boyut için boşlukları ve yorumları kaldırarak JavaScript'i küçültün.",
  "tool.json-validator.name": "JSON Doğrulayıcı",
  "tool.json-validator.tagline": "JSON söz diziminizi doğrulayın ve hataları anında bulun.",
  "tool.regex-tester.name": "Regex Test Aracı",
  "tool.regex-tester.tagline":
    "Düzenli ifadeleri test edin ve eşleşmeleri gerçek zamanlı vurgulayın.",
  "tool.jwt-decoder.name": "JWT Çözücü",
  "tool.jwt-decoder.tagline": "JWT tokenlerini çözün ve başlık ile payload içeriğini inceleyin.",
  "tool.sql-formatter.name": "SQL Biçimlendirici",
  "tool.sql-formatter.tagline":
    "Anahtar kelimeleri büyük harfle ve yapılandırılabilir girintiyle SQL sorgularını güzelleştirin ve küçültün.",
  "tool.markdown-preview.name": "Markdown Önizleme",
  "tool.markdown-preview.tagline": "Markdown yazın ve işlenen HTML önizlemesini anında görün.",
  "tool.color-converter.name": "Renk Dönüştürücü",
  "tool.color-converter.tagline": "HEX, RGB ve HSL arasında dönüştürün ve rengi önizleyin.",
  "tool.cron-parser.name": "Cron Çözümleyici",
  "tool.cron-parser.tagline":
    "Cron ifadelerini alan dökümü ve sonraki çalıştırmalarla düz dile çevirin.",
  "tool.xml-validator.name": "XML Doğrulayıcı",
  "tool.xml-validator.tagline":
    "XML'in biçimini, etiket dengesini ve yapısını anında hata raporuyla doğrulayın.",
  "tool.html-formatter.name": "HTML Biçimlendirici",
  "tool.html-formatter.tagline":
    "Doğru iç içe geçme ve yapılandırılabilir girintiyle HTML'i güzelleştirin ve küçültün.",
  "tool.yaml-formatter.name": "YAML Biçimlendirici",
  "tool.yaml-formatter.tagline":
    "Yapılandırılabilir girinti ve doğrulamayla YAML'i güzelleştirin ve normalleştirin.",
  "tool.markdown-table-generator.name": "Markdown Tablo Üretici",
  "tool.markdown-table-generator.tagline":
    "Markdown tablolarını görsel olarak oluşturun ve yapıştırmaya hazır dışa aktarın.",
  "tool.css-gradient-generator.name": "CSS Gradyan Üretici",
  "tool.css-gradient-generator.tagline":
    "Renk durakları ve açı kontrolü ile doğrusal, radyal ve konik CSS gradyanları tasarlayın.",
  "tool.audio-converter.name": "Ses Dönüştürücü",
  "tool.audio-converter.tagline":
    "Ses dosyalarını (MP3, OGG, FLAC ve daha fazlası) tarayıcınızda WAV'a dönüştürün.",
  "tool.video-converter.name": "Video Dönüştürücü",
  "tool.video-converter.tagline":
    "Videoyu tarayıcınızda MP4 (H.264) veya AVI (MPEG-4) biçimine dönüştürün.",
  "tool.gif-maker.name": "GIF Oluşturucu",
  "tool.gif-maker.tagline":
    "Yüklenen görsellerden veya desteklenen videodan animasyonlu GIF oluşturun.",
  "tool.gif-compressor.name": "GIF Sıkıştırıcı",
  "tool.gif-compressor.tagline":
    "Kabul edilebilir görsel kaliteyi koruyarak GIF dosya boyutunu küçültün.",
  "tool.image-to-gif.name": "Görselden GIF",
  "tool.image-to-gif.tagline": "Birden fazla yüklenen görselden animasyonlu GIF oluşturun.",
  "tool.pdf-to-excel.name": "PDF'den Excel",
  "tool.pdf-to-excel.tagline":
    "Uygun PDF tablolarını ve içeriğini Excel uyumlu bir dosyaya dönüştürün.",
  "tool.pdf-to-powerpoint.name": "PDF'den PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Uygun PDF sayfalarını ve içeriğini PowerPoint uyumlu bir dosyaya dönüştürün.",
  "tool.pdf-to-text.name": "PDF'den Metin",
  "tool.pdf-to-text.tagline": "PDF belgelerinden seçilebilir metin çıkarın.",
  "tool.pdf-crop.name": "PDF Kırp",
  "tool.pdf-crop.tagline": "Yapılandırılabilir kırpma sınırlarıyla PDF sayfalarını kırpın.",
  "tool.pdf-page-numbers.name": "PDF Sayfa Numaraları",
  "tool.pdf-page-numbers.tagline": "PDF sayfalarına yapılandırılabilir sayfa numaraları ekleyin.",
  "tool.pdf-header-footer.name": "PDF Üstbilgi ve Altbilgi",
  "tool.pdf-header-footer.tagline":
    "PDF sayfalarına özelleştirilebilir üstbilgi ve altbilgi ekleyin.",
  "tool.text-to-pdf.name": "Metinden PDF",
  "tool.text-to-pdf.tagline": "Girilen veya yapıştırılan metni indirilebilir bir PDF'e dönüştürün.",
  "tool.text-to-word.name": "Metinden Word",
  "tool.text-to-word.tagline":
    "Girilen veya yapıştırılan metni indirilebilir bir DOCX belgesine dönüştürün.",
  "tool.markdown-to-pdf.name": "Markdown'dan PDF",
  "tool.markdown-to-pdf.tagline": "Markdown içeriğini biçimlendirilmiş bir PDF'e dönüştürün.",
  "tool.markdown-to-word.name": "Markdown'dan Word",
  "tool.markdown-to-word.tagline":
    "Markdown içeriğini biçimlendirilmiş bir DOCX belgesine dönüştürün.",
};
