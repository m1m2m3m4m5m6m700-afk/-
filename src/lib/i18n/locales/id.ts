import type { Dictionary } from "./en";
import { en } from "./en";

export const id: Dictionary = {
  ...en,

  "lang.name": "Bahasa Indonesia",
  "lang.switch": "Ganti bahasa",

  "nav.tools": "Alat",
  "nav.categories": "Kategori",
  "nav.popular": "Populer",
  "nav.why": "Mengapa Flixo",
  "nav.faq": "Tanya jawab",
  "nav.openTranslator": "Buka penerjemah",
  "nav.toggleTheme": "Ganti tema",
  "nav.toggleMenu": "Buka menu",

  "hero.badge": "Satu ruang kerja, semua alat AI",
  "hero.title": "Satu ruang kerja untuk setiap alat AI",
  "hero.description":
    "Terjemahan, gambar, PDF, menulis, dan utilitas — lima pusat alat dalam satu antarmuka yang tenang. Tanpa akun atau kunci API; buka alat dan mulai.",
  "hero.promo.badge": "Baru",
  "hero.promo.body":
    "Coba pemercik gambar AI hari ini — pertajam, perbesar, dan hilangkan noise dari foto Anda seketika.",
  "hero.searchLabel": "Deskripsikan apa yang ingin Anda lakukan",
  "hero.searchPlaceholder": "Coba: «terjemahkan ke Arab», «rangkum PDF», «buat gambar»…",
  "hero.browse": "Jelajahi alat",
  "hero.cta": "Coba penerjemah",
  "hero.note": "Gratis · Tanpa daftar",

  "assistant.eyebrow": "Asisten AI",
  "assistant.title": "Sebutkan kebutuhan Anda — saya cari alat yang tepat",
  "assistant.placeholder": "Deskripsikan tugas Anda… mis. «terjemahkan paragraf ke Prancis»",
  "assistant.button": "Cari alat",
  "assistant.thinking": "Berpikir…",
  "assistant.reset": "Tanya hal lain",
  "assistant.result.category": "Kategori",
  "assistant.result.matched": "Cocok",
  "assistant.result.open": "Buka alat",
  "assistant.result.soon": "Segera",
  "assistant.suggestion.translation":
    "Sepertinya Anda ingin menerjemahkan teks. Penerjemah siap untuk Anda.",
  "assistant.suggestion.images":
    "Anda ingin bekerja dengan gambar. Belum ada alat gambar — mintalah dan kami prioritaskan.",
  "assistant.suggestion.pdf":
    "Anda menyebut PDF. Belum ada alat PDF — mintalah dan kami prioritaskan.",
  "assistant.suggestion.writing":
    "Anda butuh bantuan menulis. Belum ada alat menulis — mintalah dan kami prioritaskan.",
  "assistant.suggestion.utilities":
    "Anda butuh utilitas. Belum ada — mintalah dan kami prioritaskan.",
  "assistant.suggestion.unknown":
    "Saya belum yakin kategori mana yang cocok. Jelaskan lebih, atau minta alat baru.",
  "assistant.empty.title": "Saran Anda muncul di sini",
  "assistant.empty.body":
    "Ketik tugas di atas dan asisten mengarahkan Anda ke alat Flixo yang tepat — atau membantu meminta yang baru.",

  "request.trigger": "Minta alat",
  "request.title": "Minta alat baru",
  "request.description": "Sebutkan kebutuhan Anda dan kami prioritaskan untuk versi berikutnya.",
  "request.label": "Apa yang harus dilakukan alat?",
  "request.placeholder": "mis. Alat yang mengubah PDF ke Word dengan menjaga format…",
  "request.submit": "Kirim permintaan",
  "request.cancel": "Batal",
  "request.success":
    "Terima kasih! Permintaan Anda dicatat — kami prioritaskan untuk versi berikutnya.",
  "request.ok": "Selesai",

  "categories.eyebrow": "Pusat alat",
  "categories.title": "Lima pusat, satu ruang kerja",
  "categories.description":
    "Setiap alat Flixo berada di salah satu pusat ini. Saat ini masih penampung — fondasinya siap tumbuh.",
  "categories.status.coming": "Segera",
  "categories.status.live": "{count} tersedia",
  "categories.toolsLabel": "Alat terencana",
  "status.live": "Tersedia",
  "status.soon": "Segera",

  "category.translation.name": "Pusat terjemahan",
  "category.translation.blurb":
    "Terjemahkan, lokalkan dan beri takarir 20+ bahasa dengan deteksi otomatis.",
  "category.translation.tools": "Penerjemah · Lokal · Penerjemah takarir",
  "category.images.name": "Alat gambar",
  "category.images.blurb": "Hasilkan, perbesar dan hapus latar dari gambar.",
  "category.images.tools": "Generator gambar · Pembesar · Penghapus latar",
  "category.pdf.name": "Alat PDF",
  "category.pdf.blurb": "Gabung, pisah, kompres dan konversi dokumen PDF.",
  "category.pdf.tools": "Gabung · Pisah · Kompres · PDF ke Word",
  "category.writing.name": "Penulisan AI",
  "category.writing.blurb": "Rangkum, tulis ulang dan susun konten dengan nada yang tepat.",
  "category.writing.tools": "Peringkas · Penulis ulang · Penyusun email",
  "category.utilities.name": "Utilitas",
  "category.utilities.blurb": "Format, konversi dan hasilkan cuplikan teknis harian.",
  "category.utilities.tools": "Formatter JSON · Generator QR · Konverter Base64",
  "category.developer.name": "Alat pengembang",
  "category.developer.blurb": "Formatter, validator dan generator untuk kode harian.",
  "category.developer.tools": "Formatter JSON · Validator XML · Parser Cron",

  "tool.back": "Semua alat",

  "why.eyebrow": "Mengapa Flixo",
  "why.title": "Dibuat untuk menghapus gesekan, bukan menambah fitur",
  "why.speed.title": "Instan secara bawaan",
  "why.speed.body":
    "Alat terbuka dalam kurang dari sedetik dan berjalan di browser — tanpa antrean atau start dingin.",
  "why.consistency.title": "Antarmuka konsisten",
  "why.consistency.body":
    "Setiap alat berbagi tata letak, pintasan dan aksi hasil yang sama, tak ada yang dipelajari ulang.",
  "why.privacy.title": "Privasi utama",
  "why.privacy.body":
    "Antar sesi tak ada yang disimpan. Masukan Anda tetap di tab tempat Anda mengetik.",
  "why.access.title": "Tanpa akun, tanpa kunci",
  "why.access.body": "Tanpa kunci API, dasbor atau manajemen lisensi. Buka alat dan mulai.",
  "stats.tasks": "Tugas diproses",
  "stats.languages": "Bahasa didukung",
  "stats.latency": "Median waktu respons",
  "stats.uptime": "Waktu aktif 12 bulan terakhir",

  "faq.eyebrow": "Tanya jawab",
  "faq.title": "Pertanyaan, terjawab",
  "faq.description": "Semua yang perlu diketahui sebelum membuka alat pertama Anda.",
  "faq.q1": "Apakah Flixo gratis?",
  "faq.a1":
    "Ya. Semua alat yang saat ini tersedia di Flixo gratis dan tidak memerlukan akun atau kartu.",
  "faq.q2": "Bagaimana penerjemah bekerja?",
  "faq.a2":
    "Anda menempel teks, memilih bahasa sumber dan target (atau membiarkan deteksi otomatis) dan Flixo mengembalikan terjemahan. Build saat ini memakai mesin demo lokal untuk menjelajahi alur secara luring.",
  "faq.q3": "Apakah Anda menyimpan yang saya ketik?",
  "faq.a3":
    "Tidak. Masukan dan keluaran hanya ada di tab browser Anda dan hilang saat alat ditutup atau dibersihkan.",
  "faq.q4": "Bahasa apa yang didukung?",
  "faq.a4":
    "Dua puluh bahasa dalam aksara Latin, Sirilik, Arab, Ibrani, Indik dan CJK, plus deteksi sumber otomatis.",
  "faq.q5": "Kapan alat lainnya diluncurkan?",
  "faq.a5":
    "Lima pusat — Terjemahan, Gambar, PDF, Menulis dan Utilitas — adalah peta jalan. Alat baru tersambung ke registri yang sama dan mewarisi tata letak bersama.",

  "footer.tagline":
    "Satu ruang kerja tenang untuk setiap alat AI yang tim Anda pakai sepanjang hari.",
  "footer.product": "Produk",
  "footer.featured": "Alat unggulan",
  "footer.popular": "Alat populer",
  "footer.numbers": "Angka",
  "footer.categories": "Kategori",
  "footer.tools": "Alat",
  "footer.more": "Segera lebih banyak",
  "footer.rights": "© {year} Flixo. Hak cipta dilindungi.",
  "footer.built": "Dibuat untuk tim yang rilis cepat.",

  "translator.pageDescription":
    "Mendeteksi bahasa sumber otomatis dan menerjemahkan dalam hitungan detik.",
  "translator.from": "Dari",
  "translator.to": "Ke",
  "translator.auto": "Deteksi otomatis",
  "translator.swap": "Tukar bahasa",
  "translator.inputPlaceholder": "Ketik atau tempel teks untuk diterjemahkan…",
  "translator.inputLabel": "Teks untuk diterjemahkan",
  "translator.detected": "terdeteksi {language}",
  "translator.copy": "Salin",
  "translator.copied": "Tersalin",
  "translator.copyError": "Tidak bisa menyalin ke papan klip.",
  "translator.genericError": "Terjadi kesalahan. Silakan coba lagi.",
  "translator.clear": "Bersihkan",
  "translator.translate": "Terjemahkan",
  "translator.translating": "Menerjemahkan…",
  "translator.emptyTitle": "Terjemahan Anda muncul di sini",
  "translator.emptyBody":
    "Pilih bahasa target, masukkan teks dan tekan Terjemahkan. Deteksi otomatis mencari sumber.",
};
