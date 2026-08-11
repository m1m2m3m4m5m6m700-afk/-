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
};
