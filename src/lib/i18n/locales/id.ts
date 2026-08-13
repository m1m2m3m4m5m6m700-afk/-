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

  // Tool names + taglines (76 ready tools) — istilah teknis bahasa Indonesia asli.
  "tool.translator.name": "Penerjemah AI",
  "tool.translator.tagline":
    "Terjemahkan antara 20+ bahasa dengan deteksi otomatis dan beralih instan.",
  "tool.image-enhancer.name": "Peningkat Gambar AI",
  "tool.image-enhancer.tagline":
    "Tingkatkan resolusi hingga 8x, pulihkan wajah, hapus derau, dan tingkatkan ketajaman.",
  "tool.image-compressor.name": "Kompresor Gambar",
  "tool.image-compressor.tagline": "Kurangi ukuran file gambar langsung di peramban Anda.",
  "tool.background-remover.name": "Penghapus Latar",
  "tool.background-remover.tagline": "Potong latar gambar dan ekspor PNG transparan.",
  "tool.video-compressor.name": "Kompresor Video",
  "tool.video-compressor.tagline":
    "Kurangi ukuran file video dengan kualitas dan pengaturan keluaran yang dapat dikonfigurasi.",
  "tool.video-trimmer.name": "Pemangkas Video",
  "tool.video-trimmer.tagline": "Potong bagian video yang dipilih dengan kontrol awal dan akhir.",
  "tool.video-to-gif.name": "Video ke GIF",
  "tool.video-to-gif.tagline": "Konversi segmen video yang didukung menjadi GIF animasi.",
  "tool.audio-compressor.name": "Kompresor Audio",
  "tool.audio-compressor.tagline":
    "Kompres file audio dengan mengontrol kualitas dan bit per detik keluaran.",
  "tool.audio-cutter.name": "Pemangkas Audio",
  "tool.audio-cutter.tagline":
    "Potong bagian yang dipilih dari file audio dengan kontrol awal dan akhir.",
  "tool.text-to-speech.name": "Teks ke Suara",
  "tool.text-to-speech.tagline":
    "Ubah teks tertulis menjadi suara alami dengan suara yang dapat dikonfigurasi.",
  "tool.file-hash-generator.name": "Generator Hash File",
  "tool.file-hash-generator.tagline":
    "Hitung hash MD5, SHA-1, dan SHA-256 dari file apa pun di peramban.",
  "tool.qr-generator.name": "Generator Kode QR",
  "tool.qr-generator.tagline": "Buat kode QR khusus untuk tautan, teks, Wi-Fi, dan kontak.",
  "tool.barcode-generator.name": "Generator Barkode",
  "tool.barcode-generator.tagline":
    "Buat barkode dalam beberapa format, siap diunduh atau dicetak.",
  "tool.password-generator.name": "Generator Kata Sandi",
  "tool.password-generator.tagline": "Buat kata sandi yang kuat dan aman dengan indikator entropi.",
  "tool.password-checker.name": "Pemeriksa Kata Sandi",
  "tool.password-checker.tagline":
    "Periksa kekuatan, entropi, dan perkiraan waktu bobol dengan saran praktis.",
  "tool.word-counter.name": "Penghitung Kata",
  "tool.word-counter.tagline":
    "Hitung kata, karakter, kalimat, dan paragraf secara instan saat mengetik.",
  "tool.case-converter.name": "Pengonversi Huruf",
  "tool.case-converter.tagline":
    "Beralih secara instan antara huruf besar, kecil, judul, dan format lain.",
  "tool.slug-generator.name": "Generator Slug",
  "tool.slug-generator.tagline":
    "Ubah judul menjadi slug yang bersih dan ramah URL dengan pemisah dan panjang.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "Buat teks isian Lorem Ipsum dengan jumlah paragraf atau kata yang dipilih.",
  "tool.random-number.name": "Generator Angka Acak",
  "tool.random-number.tagline":
    "Buat angka acak dalam rentang dengan opsi jumlah dan tanpa duplikat.",
  "tool.random-name.name": "Pemilih Nama Acak",
  "tool.random-name.tagline":
    "Pilih satu atau lebih nama acak dari daftar dengan opsi tanpa duplikat.",
  "tool.json-formatter.name": "Pemformat JSON",
  "tool.json-formatter.tagline":
    "Perindah, perkecil, dan validasi JSON dengan opsi indentasi khusus.",
  "tool.uuid-generator.name": "Generator UUID",
  "tool.uuid-generator.tagline": "Buat pengidentifikasi UUID (v4) unik dengan cepat dan massal.",
  "tool.xml-formatter.name": "Pemformat XML",
  "tool.xml-formatter.tagline":
    "Perindah, perkecil, dan validasi XML dengan opsi indentasi khusus.",
  "tool.csv-viewer.name": "Penampil CSV",
  "tool.csv-viewer.tagline":
    "Pratinjau data CSV sebagai tabel dengan pemilihan pemisah dan deteksi tajuk.",
  "tool.text-compare.name": "Pembanding Teks",
  "tool.text-compare.tagline":
    "Bandingkan dua teks per baris dan soroti penambahan, penghapusan, dan kecocokan.",
  "tool.qr-reader.name": "Pembaca QR",
  "tool.qr-reader.tagline":
    "Pindai dan dekode kode QR dari gambar atau kamera menjadi teks atau tautan.",
  "tool.find-and-replace.name": "Cari dan Ganti",
  "tool.find-and-replace.tagline":
    "Cari dan ganti teks dalam dokumen panjang dengan regex opsional dan peka huruf besar/kecil.",
  "tool.remove-duplicate-lines.name": "Hapus Baris Duplikat",
  "tool.remove-duplicate-lines.tagline":
    "Hapus baris duplikat dengan pencocokan tidak peka huruf besar/kecil dan sadar spasi.",
  "tool.remove-empty-lines.name": "Hapus Baris Kosong",
  "tool.remove-empty-lines.tagline": "Hapus secara instan baris kosong atau hanya berisi spasi.",
  "tool.text-cleaner.name": "Pembersih Teks",
  "tool.text-cleaner.tagline":
    "Bersihkan teks dengan menghapus spasi berlebih, jeda baris, dan karakter yang tidak diinginkan.",
  "tool.sort-lines.name": "Urutkan Baris",
  "tool.sort-lines.tagline":
    "Urutkan baris menurut abjad, panjang, atau acak dengan opsi huruf besar dan baris kosong.",
  "tool.reverse-text.name": "Balik Teks",
  "tool.reverse-text.tagline":
    "Balik teks berdasarkan karakter, kata, atau seluruh baris secara instan.",
  "tool.add-line-numbers.name": "Tambah Nomor Baris",
  "tool.add-line-numbers.tagline":
    "Tambah nomor baris berurutan dengan pemisah, padding, dan pergeseran awal.",
  "tool.word-frequency.name": "Analisis Frekuensi Kata",
  "tool.word-frequency.tagline":
    "Analisis frekuensi kata dengan pengurutan, peka huruf besar/kecil, dan filter panjang.",
  "tool.unit-converter.name": "Pengonversi Satuan",
  "tool.unit-converter.tagline":
    "Konversi secara instan antara satuan panjang, berat, volume, dan lainnya.",
  "tool.temperature-converter.name": "Pengonversi Suhu",
  "tool.temperature-converter.tagline": "Konversi cepat antara Celsius, Fahrenheit, dan Kelvin.",
  "tool.base64-converter.name": "Pengonversi Base64",
  "tool.base64-converter.tagline": "Enkode dan dekode teks ke Base64 dan sebaliknya secara instan.",
  "tool.timestamp-converter.name": "Pengonversi Penanda Waktu",
  "tool.timestamp-converter.tagline":
    "Konversi penanda waktu Unix menjadi tanggal terbaca dan sebaliknya, dengan dukungan zona waktu.",
  "tool.csv-to-json.name": "CSV ke JSON",
  "tool.csv-to-json.tagline":
    "Konversi data CSV menjadi JSON terstruktur dengan deteksi tajuk otomatis.",
  "tool.percentage-calculator.name": "Kalkulator Persen",
  "tool.percentage-calculator.tagline":
    "Hitung persentase, kenaikan, dan diskon dengan cepat dan akurat.",
  "tool.bmi-calculator.name": "Kalkulator BMI",
  "tool.bmi-calculator.tagline": "Hitung indeks massa tubuh dari berat dan tinggi badan.",
  "tool.age-calculator.name": "Kalkulator Usia",
  "tool.age-calculator.tagline": "Hitung usia pasti Anda dalam tahun, bulan, dan hari.",
  "tool.meta-tag-generator.name": "Generator Meta Tag",
  "tool.meta-tag-generator.tagline":
    "Buat meta tag HTML untuk SEO dengan judul, deskripsi, dan Open Graph.",
  "tool.url-encoder.name": "Pengode URL",
  "tool.url-encoder.tagline": "Enkode dan dekode URL serta komponen URL secara instan.",
  "tool.html-entity-encoder.name": "Pengode Entitas HTML",
  "tool.html-entity-encoder.tagline":
    "Ubah karakter khusus menjadi entitas HTML dan sebaliknya menjadi teks terbaca.",
  "tool.html-minifier.name": "Peminim HTML",
  "tool.html-minifier.tagline":
    "Kurangi ukuran HTML dengan menghapus spasi dan komentar yang tidak perlu.",
  "tool.css-minifier.name": "Peminim CSS",
  "tool.css-minifier.tagline": "Kompres CSS dengan menghapus spasi, komentar, dan aturan berlebih.",
  "tool.js-minifier.name": "Peminim JS",
  "tool.js-minifier.tagline":
    "Minimalkan JavaScript dengan menghapus spasi dan komentar untuk ukuran lebih kecil.",
  "tool.json-validator.name": "Validator JSON",
  "tool.json-validator.tagline": "Validasi sintaks JSON dan temukan kesalahan secara instan.",
  "tool.regex-tester.name": "Penguji Regex",
  "tool.regex-tester.tagline": "Uji ekspresi reguler dan sorot kecocokan secara real-time.",
  "tool.jwt-decoder.name": "Pendekode JWT",
  "tool.jwt-decoder.tagline": "Dekode token JWT dan periksa konten tajuk dan muatan.",
  "tool.sql-formatter.name": "Pemformat SQL",
  "tool.sql-formatter.tagline":
    "Perindah dan perkecil kueri SQL dengan kata kunci huruf besar dan indentasi yang dapat dikonfigurasi.",
  "tool.markdown-preview.name": "Pratinjau Markdown",
  "tool.markdown-preview.tagline":
    "Tulis Markdown dan lihat pratinjau HTML yang dirender secara instan.",
  "tool.color-converter.name": "Pengonversi Warna",
  "tool.color-converter.tagline": "Konversi antara HEX, RGB, dan HSL serta pratinjau warna.",
  "tool.cron-parser.name": "Pengurai Cron",
  "tool.cron-parser.tagline":
    "Terjemahkan ekspresi cron ke bahasa biasa dengan rincian bidang dan eksekusi berikutnya.",
  "tool.xml-validator.name": "Validator XML",
  "tool.xml-validator.tagline":
    "Validasi format, keseimbangan tag, dan struktur XML dengan laporan kesalahan instan.",
  "tool.html-formatter.name": "Pemformat HTML",
  "tool.html-formatter.tagline":
    "Perindah dan perkecil HTML dengan bersarang benar dan indentasi yang dapat dikonfigurasi.",
  "tool.yaml-formatter.name": "Pemformat YAML",
  "tool.yaml-formatter.tagline":
    "Perindah dan normalkan YAML dengan indentasi dan validasi yang dapat dikonfigurasi.",
  "tool.markdown-table-generator.name": "Generator Tabel Markdown",
  "tool.markdown-table-generator.tagline":
    "Buat tabel Markdown secara visual dan ekspor siap tempel.",
  "tool.css-gradient-generator.name": "Generator Gradien CSS",
  "tool.css-gradient-generator.tagline":
    "Rancang gradien CSS linier, radial, dan kerucut dengan tithentian warna dan kontrol sudut.",
  "tool.audio-converter.name": "Pengonversi Audio",
  "tool.audio-converter.tagline": "Konversi file audio (MP3, OGG, FLAC, dll.) ke WAV di peramban.",
  "tool.video-converter.name": "Pengonversi Video",
  "tool.video-converter.tagline": "Konversi video ke MP4 (H.264) atau AVI (MPEG-4) di peramban.",
  "tool.gif-maker.name": "Pembuat GIF",
  "tool.gif-maker.tagline": "Buat GIF animasi dari gambar yang diunggah atau video yang didukung.",
  "tool.gif-compressor.name": "Kompresor GIF",
  "tool.gif-compressor.tagline":
    "Kurangi ukuran file GIF sambil menjaga kualitas visual yang dapat diterima.",
  "tool.image-to-gif.name": "Gambar ke GIF",
  "tool.image-to-gif.tagline": "Buat GIF animasi dari beberapa gambar yang diunggah.",
  "tool.pdf-to-excel.name": "PDF ke Excel",
  "tool.pdf-to-excel.tagline":
    "Konversi tabel dan konten PDF yang sesuai menjadi file yang kompatibel dengan Excel.",
  "tool.pdf-to-powerpoint.name": "PDF ke PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "Konversi halaman dan konten PDF yang sesuai menjadi file yang kompatibel dengan PowerPoint.",
  "tool.pdf-to-text.name": "PDF ke Teks",
  "tool.pdf-to-text.tagline": "Ekstrak teks yang dapat dipilih dari dokumen PDF.",
  "tool.pdf-crop.name": "Pangkas PDF",
  "tool.pdf-crop.tagline": "Pangkas halaman PDF dengan batas pemangkasan yang dapat dikonfigurasi.",
  "tool.pdf-page-numbers.name": "Nomor Halaman PDF",
  "tool.pdf-page-numbers.tagline": "Tambah nomor halaman yang dapat dikonfigurasi ke halaman PDF.",
  "tool.pdf-header-footer.name": "Tajuk dan Kaki Halaman PDF",
  "tool.pdf-header-footer.tagline":
    "Tambah tajuk dan kaki halaman yang dapat disesuaikan ke halaman PDF.",
  "tool.text-to-pdf.name": "Teks ke PDF",
  "tool.text-to-pdf.tagline":
    "Konversi teks yang dimasukkan atau ditempel menjadi PDF yang dapat diunduh.",
  "tool.text-to-word.name": "Teks ke Word",
  "tool.text-to-word.tagline":
    "Konversi teks yang dimasukkan atau ditempel menjadi dokumen DOCX yang dapat diunduh.",
  "tool.markdown-to-pdf.name": "Markdown ke PDF",
  "tool.markdown-to-pdf.tagline": "Konversi konten Markdown menjadi PDF yang diformat.",
  "tool.markdown-to-word.name": "Markdown ke Word",
  "tool.markdown-to-word.tagline": "Konversi konten Markdown menjadi dokumen DOCX yang diformat.",
};
