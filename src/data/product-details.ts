import products from './products.json';

export interface ProductUpdateHighlight {
  name: string;
  tier: string;
  detail: string;
}

export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface ProductFlashSaleInfo {
  duration: string;
  originalPrice: number;
  promoPrice: number;
  stockLeft: number;
  stockTotal: number;
}

export interface ProductDetail {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  logo: string;
  orderHref: string;
  waOrderHref: string;
  price: number | null;
  duration: string | null;
  badge: string | null;
  flashSale: ProductFlashSaleInfo | null;
  heroImage: string;
  galleryImage: string;
  heroImageAlt: string;
  galleryImageAlt: string;
  updateTag: string;
  tagline: string;
  overview: [string, string];
  metadataServices: string[];
  highlights2026: ProductUpdateHighlight[];
  specs: ProductSpecItem[];
  useCases: string[];
  activationNotes: string[];
  nextSlug: string;
  prevSlug: string;
}

interface RawDetailOverride {
  name?: string;
  shortName?: string;
  heroImage: string;
  galleryImage: string;
  heroImageAlt: string;
  galleryImageAlt: string;
  updateTag: string;
  tagline: string;
  overview: [string, string];
  metadataServices: string[];
  highlights2026: ProductUpdateHighlight[];
  specs: ProductSpecItem[];
  useCases: string[];
  activationNotes: string[];
}

const PREMIUM_ACTIVATION_NOTES = [
  'Kirim pesanan lewat Web Shop order.amc.web.id atau Bot WA 24 jam dengan pembayaran QRIS.',
  'Akun Private atau invite email resmi aktif dalam hitungan menit; untuk tipe Sharing ikuti panduan login tanpa mengubah kata sandi.',
  'Seluruh masa aktif dilindungi garansi penuh AMC dengan bantuan CS 24 jam di +62 851-1712-0101.',
];

const BUZZER_ACTIVATION_NOTES = [
  'Tidak pernah meminta kata sandi akun sosial media, cukup kirim username atau tautan publik.',
  'Pastikan akun tujuan tidak dikunci (publik) dan username tidak diganti selama proses pengerjaan.',
  'Pantau status pengerjaan atau konsultasi target kampanye kapan saja bersama Admin 24 jam AMC.',
];

const GAME_ACTIVATION_NOTES = [
  'Proses pengisian instan sekitar 1 sampai 3 menit setelah pembayaran QRIS terkonfirmasi.',
  'Pastikan User ID, Zone ID, atau Riot ID sudah diperiksa sebelum menyelesaikan pembayaran.',
  'Invoice transaksi tersimpan otomatis sebagai bukti bila membutuhkan bantuan CS 24 jam AMC.',
];

const DETAIL_OVERRIDES: Record<string, RawDetailOverride> = {
  chatgpt: {
    name: 'ChatGPT Plus Private',
    shortName: 'ChatGPT Plus',
    heroImage: '/showcase/chatgpt.webp',
    galleryImage: '/showcase/ai-productivity-gallery.webp',
    heroImageAlt: 'Visual 3D cincin orbital dan inti kristal biru langit untuk ChatGPT Plus GPT-6.2',
    galleryImageAlt: 'Visual 3D ruang kerja digital modular AI & Produktivitas AMC',
    updateTag: 'UPDATE NOVEMBER 2026 • GPT-6.2 ASTRA & SOL',
    tagline: 'Akses penuh generasi GPT-6.2 Astra & GPT-6.2 Sol di akun pribadi milikmu sendiri.',
    overview: [
      'Pembaruan OpenAI per 17 November 2026 menghadirkan keluarga model GPT-6.2 Astra untuk tugas tersulit dan GPT-6.2 Sol untuk coding serta penulisan harian dengan mode Instant, Medium, High, hingga Extra High. Kamu juga mendapatkan dukungan GPT-6.1 Terra untuk analisis visual mendalam dan integrasi Codex.',
      'Melalui paket ChatGPT Plus Private di Al Muthi Creative, kamu memakai akun sendiri tanpa berbagi riwayat obrolan dengan orang lain. Semua instruksi khusus, dokumen riset, dan ruang kerja pribadi tetap terpisah serta terlindungi garansi penuh masa aktif.',
    ],
    metadataServices: [
      'GPT-6.2 Astra (Penalaran Berat)',
      'GPT-6.2 Sol (Coding & Harian)',
      'GPT-6.1 Terra & Luna',
      'Codex & Analisis Dokumen',
      'Akun Private Penuh',
    ],
    highlights2026: [
      {
        name: 'GPT-6.2 Astra',
        tier: 'Flagship • 17 Nov 2026',
        detail: 'Mesin utama untuk pemecahan masalah rumit, arsitektur perangkat lunak, dan sintesis dokumen panjang.',
      },
      {
        name: 'GPT-6.2 Sol',
        tier: 'Harian & Coding • 17 Nov 2026',
        detail: 'Menggerakkan mode Instant, Medium, High, dan Extra High dengan kecepatan tinggi untuk pekerjaan rutin dan coding.',
      },
      {
        name: 'GPT-6.1 Terra & Visual Reasoning',
        tier: 'Multimodal 2026',
        detail: 'Membaca diagram, tangkapan layar antarmuka, dan tabel data secara akurat langsung di ruang kerja ChatGPT.',
      },
      {
        name: 'Privasi Akun Private',
        tier: 'Standar AMC',
        detail: 'Riwayat chat, Custom GPT, dan berkas unggahan sepenuhnya milik pribadi, bukan akun sharing.',
      },
    ],
    specs: [
      { label: 'Mesin Utama', value: 'GPT-6.2 Astra & Sol' },
      { label: 'Tipe Akun', value: 'Private Penuh' },
      { label: 'Aktivasi', value: 'Cepat via Web Shop / WA' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menyusun kode aplikasi, debugging repositori, dan merancang arsitektur sistem dengan GPT-6.2 Astra serta Sol.',
      'Menganalisis file PDF, laporan keuangan, dan bahan presentasi tanpa khawatir riwayat dibaca pengguna lain.',
      'Menyiapkan naskah konten, terjemahan bernuansa lokal, dan ide kampanye harian secara konsisten.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  claude: {
    name: 'Claude Pro Sharing',
    shortName: 'Claude Pro',
    heroImage: '/showcase/claude.webp',
    galleryImage: '/showcase/ai-productivity-gallery.webp',
    heroImageAlt: 'Visual 3D monolit kaca dan keramik bertingkat untuk Claude Opus 5.5, Sonnet 5.5, dan Fable 5.2',
    galleryImageAlt: 'Visual 3D ruang kerja digital modular AI & Produktivitas AMC',
    updateTag: 'UPDATE NOVEMBER 2026 • OPUS 5.5, SONNET 5.5 & FABLE 5.2',
    tagline: 'Tiga mesin Anthropic terbaru dengan konteks 1 juta token dan kualitas tulisan serta coding paling rapi.',
    overview: [
      'Per November 2026, lini Anthropic dipimpin oleh Claude Opus 5.5 untuk agentic coding jangka panjang, Claude Sonnet 5.5 yang lincah dengan konteks 1 juta token serta output 128K token, hingga rilis terbaru 9 November 2026 yaitu Claude Fable 5.2 dan Mythos 5.2 lengkap dengan mode Advisor.',
      'Di Al Muthi Creative, paket Claude Pro menjadi layanan paling laris bagi developer, penulis panjang, dan analis data yang ingin merasakan standar penalaran Anthropic dengan biaya jauh lebih hemat dan jaminan garansi penuh selama masa langganan.',
    ],
    metadataServices: [
      'Claude Opus 5.5 (Agentic Coding)',
      'Claude Sonnet 5.5 (1M Konteks)',
      'Claude Fable 5.2 & Mythos 5.2',
      'Claude Haiku 5.5 (Respon Kilat)',
      'Full Garansi AMC',
    ],
    highlights2026: [
      {
        name: 'Claude Opus 5.5',
        tier: 'Coding & Analisis • 2026',
        detail: 'Dirancang untuk pekerjaan rekayasa kode panjang, refactoring besar, dan riset terstruktur secara konsisten.',
      },
      {
        name: 'Claude Sonnet 5.5',
        tier: 'Cepat • 1M Konteks / 128K Output',
        detail: 'Menangani dokumen panjang dan iterasi cepat harian dengan gaya bahasa yang natural serta terukur.',
      },
      {
        name: 'Claude Fable 5.2 & Mode Advisor',
        tier: 'Rilis 9 Nov 2026',
        detail: 'Pembaruan penalaran tingkat lanjut yang mendukung pembacaan blok pemikiran lintas model dan peran Advisor.',
      },
      {
        name: 'Claude Haiku 5.5',
        tier: 'Ringan & Instan',
        detail: 'Cocok untuk pemeriksaan ringkas, merapikan catatan rapat, dan penyuntingan cepat tanpa menunggu lama.',
      },
    ],
    specs: [
      { label: 'Lini Model', value: 'Opus 5.5, Sonnet 5.5, Fable 5.2' },
      { label: 'Kapasitas Konteks', value: 'Hingga 1 Juta Token' },
      { label: 'Status Katalog', value: 'Paling Laris di AMC' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menulis dan meninjau kode produksi lintas banyak berkas dengan struktur yang rapi menggunakan Opus 5.5.',
      'Merangkum dokumen hukum, skripsi, atau laporan riset ratusan halaman dalam satu sesi 1M konteks.',
      'Menyusun copywriting editorial, skrip video, dan dokumentasi teknis tanpa nada kaku.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  gemini: {
    name: 'Gemini AI Pro',
    shortName: 'Gemini AI Pro',
    heroImage: '/showcase/gemini.webp',
    galleryImage: '/showcase/ai-productivity-gallery.webp',
    heroImageAlt: 'Visual 3D tiga pahatan elemen Hydrogen, Neon, dan Carbon untuk Gemini AI Pro November 2026',
    galleryImageAlt: 'Visual 3D ruang kerja digital modular AI & Produktivitas AMC',
    updateTag: 'UPDATE NOVEMBER 2026 • GEMINI 4 HYDROGEN, NEON & CARBON',
    tagline: 'Ekspansi penuh keluarga Gemini 4 terbaru plus invite resmi ke akun Google pribadimu.',
    overview: [
      'Google DeepMind merilis jajaran penuh Gemini 4 sepanjang November 2026: Gemini 4 Carbon (10 Nov) untuk penalaran mendalam jangka panjang, Gemini 4 Hydrogen (12 Nov) untuk eksekusi agentic super cepat, dan Gemini 4 Neon (18 Nov) yang menyeimbangkan kedalaman analisis dengan efisiensi harian.',
      'Paket Gemini AI Pro dari Al Muthi Creative diaktifkan lewat jalur invite resmi ke email Google milikmu sendiri sehingga terhubung langsung dengan ekosistem Workspace serta penyimpanan cloud Google One AI Pro, lengkap dengan garansi penuh.',
    ],
    metadataServices: [
      'Gemini 4 Carbon (Frontier)',
      'Gemini 4 Neon (Seimbang)',
      'Gemini 4 Hydrogen (Agentic Cepat)',
      'Gemini 4 Argon & Multimodal',
      'Invite Resmi + Cloud Storage',
    ],
    highlights2026: [
      {
        name: 'Gemini 4 Carbon',
        tier: 'Frontier • 10 Nov 2026',
        detail: 'Model puncak Google DeepMind untuk coding berat, riset ilmiah, dan analisis konteks besar hingga 1 juta token.',
      },
      {
        name: 'Gemini 4 Neon',
        tier: 'Seimbang • 18 Nov 2026',
        detail: 'Pilihan utama untuk kerja harian yang membutuhkan ketajaman logika tanpa mengorbankan kecepatan respons.',
      },
      {
        name: 'Gemini 4 Hydrogen',
        tier: 'Eksekusi Cepat • 12 Nov 2026',
        detail: 'Dirancang khusus untuk alur kerja agentic cepat, iterasi prototipe, dan otomasi tugas berulang.',
      },
      {
        name: 'Integrasi Google One AI Pro',
        tier: 'Invite Resmi AMC',
        detail: 'Aktif di email Google pribadimu dengan dukungan ruang penyimpanan cloud lega dan sinkronisasi Docs serta Gmail.',
      },
    ],
    specs: [
      { label: 'Lini Mesin 2026', value: 'Hydrogen, Neon, Carbon' },
      { label: 'Metode Aktivasi', value: 'Invite Resmi ke Email Pribadi' },
      { label: 'Opsi Durasi', value: '3 Bulan / Promo 1 Tahun' },
      { label: 'Garansi', value: 'Full Garansi AMC' },
    ],
    useCases: [
      'Mengolah dokumen panjang, video, audio, dan kode sekaligus berkat pemrosesan multimodal native Gemini 4.',
      'Mengaktifkan Gemini langsung di Google Docs, Sheets, Slides, dan Gmail menggunakan email pribadimu.',
      'Memilih Hydrogen untuk draf cepat, Neon untuk tugas rutin, atau Carbon untuk analisis proyek paling kompleks.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  supergrok: {
    name: 'Grok AI (SpaceXSI)',
    shortName: 'Grok AI',
    heroImage: '/showcase/supergrok.webp',
    galleryImage: '/showcase/ai-productivity-gallery.webp',
    heroImageAlt: 'Visual 3D cincin singularitas kaca biru langit untuk Grok 4.7 dan Imagine Video 1.5',
    galleryImageAlt: 'Visual 3D ruang kerja digital modular AI & Produktivitas AMC',
    updateTag: 'UPDATE NOVEMBER 2026 • GROK 4.7 & IMAGINE VIDEO 1.5',
    tagline: 'Akses Grok 4.7 untuk riset real-time, coding agentic, serta kreasi visual Imagine Video 1.5.',
    overview: [
      'Menyusul pembaruan SpaceXSI (dulu xAI) pada Oktober hingga November 2026, layanan Grok kini ditenagai model unggulan Grok 4.7 dan Grok 4.6 dengan kemampuan pemanggilan alat agentic, analisis berita waktu nyata, serta pratinjau model Grok Imagine Video 1.5 (11 Nov 2026).',
      'Cocok untuk peneliti tren, kreator media sosial, maupun pengembang yang membutuhkan akses cepat ke pembaruan informasi terkini dan generasi visual dalam satu ekosistem.',
    ],
    metadataServices: [
      'Grok 4.7 Flagship',
      'Grok 4.6 Reasoning',
      'Grok Imagine Video 1.5',
      'Pencarian Real-Time X',
      'Garansi Penuh AMC',
    ],
    highlights2026: [
      {
        name: 'Grok 4.7 Flagship',
        tier: 'Coding & Agentic • 2026',
        detail: 'Model utama untuk penalaran terstruktur, penulisan kode, dan eksekusi tugas multi-alat.',
      },
      {
        name: 'Grok Imagine Video 1.5',
        tier: 'Preview • 11 Nov 2026',
        detail: 'Generasi gambar ke video langsung dari prompt untuk kebutuhan konten cepat dan eksplorasi konsep.',
      },
      {
        name: 'Pembaruan The X Subscription',
        tier: 'Okt–Nov 2026',
        detail: 'Menyatukan akses chat lebih cepat, riset real-time, dan fitur kreasi visual dalam satu langganan.',
      },
    ],
    specs: [
      { label: 'Model Aktif', value: 'Grok 4.7 & 4.6' },
      { label: 'Fitur Media', value: 'Imagine Image & Video 1.5' },
      { label: 'Cek Paket Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Memantau sentimen topik hangat, riset pasar, dan rangkuman berita global secara real-time.',
      'Menghasilkan gambar serta klip video pendek untuk ide kampanye media sosial.',
      'Membantu debugging kode dan penulisan skrip otomasi dengan respons cepat.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  adobe: {
    name: 'Adobe Creative Cloud',
    shortName: 'Adobe CC',
    heroImage: '/showcase/adobe.webp',
    galleryImage: '/showcase/creative-studio-gallery.webp',
    heroImageAlt: 'Visual 3D papan seni kaca dan prisma lensa sinema untuk Adobe Creative Cloud MAX 2026',
    galleryImageAlt: 'Visual 3D studio kreatif triptych kaca buram dan kurva krom AMC',
    updateTag: 'UPDATE NOVEMBER 2026 • ADOBE MAX 2026 & CREATIVE AGENT',
    tagline: 'Photoshop, Illustrator, Premiere, After Effects, dan Firefly AI Creative Studio edisi MAX 2026.',
    overview: [
      'Rilis Adobe MAX 2026 pada 10 November 2026 memperluas Creative Agent ke seluruh aplikasi inti Creative Cloud serta menjadikan Adobe Firefly sebagai AI Creative Studio penuh dengan Quick Actions, Firefly Graph, dan workspace Color Mode terbaru di Premiere.',
      'Langganan Adobe Creative Cloud lewat Al Muthi Creative membuka akses aplikasi desktop dan cloud resmi untuk desainer grafis, editor video, fotografer, dan motion designer dengan harga jauh lebih ramah kantong.',
    ],
    metadataServices: [
      'Photoshop & Generative Fill',
      'Premiere Pro (Color Mode 2026)',
      'Illustrator & After Effects',
      'Adobe Firefly & Creative Agent',
      'Lightroom & Cloud Sync',
    ],
    highlights2026: [
      {
        name: 'Adobe MAX 2026 Creative Agent',
        tier: '10 Nov 2026',
        detail: 'Asisten kreatif terintegrasi di Photoshop, Premiere, dan Firefly untuk mempercepat seleksi, retouch, dan iterasi layout.',
      },
      {
        name: 'Adobe Firefly AI Creative Studio',
        tier: 'Quick Actions & Firefly Graph',
        detail: 'Menghubungkan pembuatan gambar, video, dan variasi desain komersial dalam satu alur kerja visual.',
      },
      {
        name: 'Premiere Color Mode & After Effects',
        tier: 'Produksi Video 2026',
        detail: 'Ruang kerja pewarnaan baru di Premiere yang mempercepat grading video komersial dan konten pendek.',
      },
      {
        name: 'Suite Lengkap Aplikasi Desktop',
        tier: 'All Apps',
        detail: 'Mendukung sinkronisasi font, pustaka aset, dan file kerja antar perangkat desktop maupun tablet.',
      },
    ],
    specs: [
      { label: 'Rilis Platform', value: 'Adobe MAX Nov 2026' },
      { label: 'Aplikasi Inti', value: 'Ps, Ai, Pr, Ae, Lr, Firefly' },
      { label: 'Promo Aktif', value: 'Tersedia di Flash Sale 11.11' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mengedit foto produk, manipulasi visual komersial, dan Generative Fill presisi di Photoshop.',
      'Menyunting video YouTube, iklan, dan animasi motion graphic di Premiere serta After Effects.',
      'Membangun identitas merek vektor, kemasan, dan materi cetak profesional di Illustrator.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  'adobe-express': {
    name: 'Adobe Express',
    shortName: 'Adobe Express',
    heroImage: '/showcase/adobe-express.webp',
    galleryImage: '/showcase/creative-studio-gallery.webp',
    heroImageAlt: 'Visual 3D kartu tata letak keramik dan pita akrilik mengilap untuk Adobe Express',
    galleryImageAlt: 'Visual 3D studio kreatif triptych kaca buram dan kurva krom AMC',
    updateTag: 'UPDATE NOVEMBER 2026 • FIREFLY QUICK ACTIONS',
    tagline: 'Desain konten media sosial, video pendek, dan aset brand cepat aktif 1 tahun penuh.',
    overview: [
      'Diperbarui bersama gelombang rilis Adobe MAX November 2026, Adobe Express membawa integrasi Adobe Firefly Quick Actions, dukungan prompt gambar dan video lebih panjang, serta perpustakaan template siap pakai yang terhubung langsung ke aset Photoshop dan Illustrator.',
      'Paket 1 Tahun di AMC sangat hemat bagi UMKM, admin media sosial, dan mahasiswa yang butuh produksi poster, Reels, presentasi, serta hapus latar belakang secara cepat tanpa aplikasi berat.',
    ],
    metadataServices: [
      'Firefly Quick Actions',
      'Prompt Gambar & Video Panjang',
      'Brand Kit & Adobe Fonts',
      'Penjadwalan Konten Sosmed',
      'Durasi 1 Tahun Penuh',
    ],
    highlights2026: [
      {
        name: 'Firefly Quick Actions 2026',
        tier: 'MAX Nov 2026',
        detail: 'Hapus latar foto, ubah ukuran konten multi-rasio, dan buat variasi visual sekali klik.',
      },
      {
        name: 'Prompt Generasi Lebih Detail',
        tier: 'Update Firefly 2026',
        detail: 'Mendukung deskripsi prompt gambar dan video yang lebih panjang agar hasil visual sesuai arahan brand.',
      },
      {
        name: 'Durasi 1 Tahun Super Hemat',
        tier: 'Paket Unggulan AMC',
        detail: 'Sekali bayar Rp60.000 untuk satu tahun penuh dengan dukungan penuh CS AMC.',
      },
    ],
    specs: [
      { label: 'Integrasi AI', value: 'Adobe Firefly 2026' },
      { label: 'Durasi Paket', value: '1 Tahun Penuh' },
      { label: 'Platform', value: 'Web, iOS, Android' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Memproduksi feed Instagram, banner promo toko online, dan thumbnail YouTube dalam hitungan menit.',
      'Menjaga konsistensi warna, logo, dan font bisnis menggunakan fitur Brand Kit.',
      'Mengubah ukuran satu desain ke format Story, TikTok, dan LinkedIn secara otomatis.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  canva: {
    name: 'Canva Pro',
    shortName: 'Canva Pro',
    heroImage: '/showcase/canva.webp',
    galleryImage: '/showcase/creative-studio-gallery.webp',
    heroImageAlt: 'Visual 3D pita kaca cair biru langit dan bingkai studio desain untuk Canva Pro',
    galleryImageAlt: 'Visual 3D studio kreatif triptych kaca buram dan kurva krom AMC',
    updateTag: 'UPDATE 2026 • CANVA AI STUDIO & AFFINITY STUDIO',
    tagline: 'Template Pro, Brand Kit, Canva AI Studio, plus integrasi mulus ke Affinity Studio.',
    overview: [
      'Ekosistem Canva sepanjang 2026 berkembang pesat lewat integrasi penuh Affinity by Canva (Pixel Studio, Vector Studio, Layout Studio) yang membuka Canva AI Studio, lengkap dengan pembaruan Blend Tool, Scripting, serta Generative Expand untuk pemilik langganan Pro.',
      'Baik untuk kebutuhan presentasi kuliah, pitch deck klien, katalog UMKM, hingga konten harian, Canva Pro di AMC memberi akses aset premium tanpa watermark dengan aktivasi cepat.',
    ],
    metadataServices: [
      'Canva AI Studio & Magic Studio',
      'Integrasi Affinity Studio 2026',
      'Brand Kit & Magic Resize',
      'Hapus Latar & Ekspor HD',
      'Tersedia Promo Flash Sale',
    ],
    highlights2026: [
      {
        name: 'Canva AI Studio & Affinity',
        tier: 'Integrasi 2026',
        detail: 'Langganan Canva Pro membuka fitur Canva AI Studio termasuk Generative Expand langsung di ruang kerja Affinity.',
      },
      {
        name: 'Update Scripting & Blend Tool',
        tier: 'September 2026',
        detail: 'Alur kerja desain lebih presisi dari tata letak cepat di Canva sampai penyempurnaan vektor dan piksel.',
      },
      {
        name: 'Brand Kit & Kolaborasi Tim',
        tier: 'Aset Pro Penuh',
        detail: 'Akses jutaan foto stok, font premium, elemen grafis bebas watermark, dan ekspor transparan resolusi tinggi.',
      },
    ],
    specs: [
      { label: 'Ekosistem 2026', value: 'Canva AI + Affinity Studio' },
      { label: 'Tipe Layanan', value: 'Pro / Edu Resmi' },
      { label: 'Promo Aktif', value: 'Tersedia di Flash Sale 11.11' },
      { label: 'Garansi', value: 'Full Garansi AMC' },
    ],
    useCases: [
      'Membuat slide presentasi modern, proposal bisnis, dan CV rapi tanpa mulai dari kanvas kosong.',
      'Memproduksi katalog produk, poster promosi, dan konten carousel untuk toko online maupun agensi.',
      'Menggabungkan kecepatan template Canva dengan penyuntingan presisi di ekosistem Affinity.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  capcut: {
    name: 'CapCut Pro Team',
    shortName: 'CapCut Pro',
    heroImage: '/showcase/capcut.webp',
    galleryImage: '/showcase/creative-studio-gallery.webp',
    heroImageAlt: 'Visual 3D bilah timeline 4K kaca berlapis dan playhead biru langit untuk CapCut Pro',
    galleryImageAlt: 'Visual 3D studio kreatif triptych kaca buram dan kurva krom AMC',
    updateTag: 'UPDATE NOVEMBER 2026 • CAPCUT WORLD 2026',
    tagline: 'Edit video 4K multitrack tanpa watermark dengan AI Captions dan ruang kerja tim.',
    overview: [
      'Memasuki CapCut World akhir 2026, CapCut Pro menghadirkan AI Creator Home, auto-caption presisi multi-bahasa, kontrol warna lanjutan, keyframe halus, hingga ekspor 4K 60fps bebas watermark di desktop maupun ponsel.',
      'Paket CapCut Pro Team di Al Muthi Creative memudahkan kreator Reels, TikTok, dan YouTube Shorts mengakses seluruh efek Pro, transisi, font premium, serta penyimpanan cloud tanpa biaya langganan tinggi.',
    ],
    metadataServices: [
      'Ekspor 4K Tanpa Watermark',
      'AI Captions & Auto Cut',
      'Efek & Transisi Pro Lengkap',
      'Color Controls & Multitrack',
      'Cloud Storage Team',
    ],
    highlights2026: [
      {
        name: 'CapCut World 2026 AI Tools',
        tier: 'Okt–Nov 2026',
        detail: 'Mempercepat pembuatan subtitle otomatis, penghapusan jeda suara, dan penyesuaian rasio vertikal 9:16.',
      },
      {
        name: 'Kontrol Warna & Multitrack 4K',
        tier: 'Desktop & Mobile',
        detail: 'Mendukung LUT, kurva warna, pelacakan kamera, serta ekspor tajam hingga 4K 60fps tanpa tanda air.',
      },
      {
        name: 'Ruang Kerja Team & Promo 11.11',
        tier: 'Hemat di AMC',
        detail: 'Tersedia harga reguler maupun harga spesial Flash Sale 11.11 selama kuota stok masih tersedia.',
      },
    ],
    specs: [
      { label: 'Kualitas Ekspor', value: 'Hingga 4K 60fps Bebas Watermark' },
      { label: 'Perangkat', value: 'PC, Mac, iOS, Android' },
      { label: 'Durasi', value: '30 Hari' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Memproduksi konten Instagram Reels, TikTok, dan YouTube Shorts berkecepatan tinggi setiap hari.',
      'Menambahkan subtitle dinamis, efek suara, dan transisi tren terbaru tanpa terkunci paywall Pro.',
      'Menyimpan draf video lintas HP dan laptop melalui ruang penyimpanan cloud tim.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  netflix: {
    name: 'Netflix Premium',
    shortName: 'Netflix 4K',
    heroImage: '/showcase/netflix.webp',
    galleryImage: '/showcase/streaming-cinema-gallery.webp',
    heroImageAlt: 'Visual 3D layar lengkung sinema 4K HDR dan cincin audio spasial untuk Netflix Premium',
    galleryImageAlt: 'Visual 3D lensa optik sinema dan lapisan audio spasial AMC',
    updateTag: 'STANDAR 2026 • 4K ULTRA HD, HDR & SPATIAL AUDIO',
    tagline: 'Streaming film dan serial kelas atas dalam 4K UHD HDR, Dolby Atmos, dengan profil milik sendiri.',
    overview: [
      'Paket Netflix Premium 2026 adalah satu-satunya tier yang membuka kualitas gambar 4K Ultra HD + HDR10 / Dolby Vision beserta dukungan Dolby Atmos dan Netflix Spatial Audio untuk pengalaman suara sinematik di TV maupun headphone.',
      'Di Al Muthi Creative, kamu mendapatkan profil pribadi terpisah bebas iklan dengan dukungan unduhan offline hingga 6 perangkat sesuai kuota paket, siap pakai di Smart TV, laptop, maupun HP.',
    ],
    metadataServices: [
      '4K Ultra HD + HDR10 / Dolby Vision',
      'Dolby Atmos & Spatial Audio',
      'Profil Pribadi Ber-PIN',
      'Download Offline',
      'Bebas Iklan Penuh',
    ],
    highlights2026: [
      {
        name: '4K UHD + Dolby Vision',
        tier: 'Kualitas Tertinggi',
        detail: 'Detail warna dan kontras maksimal untuk seluruh katalog serial dan film original terbaru 2026.',
      },
      {
        name: 'Netflix Spatial Audio & Atmos',
        tier: 'Audio Imersif',
        detail: 'Menghadirkan ruang suara sinematik baik pada sistem surround maupun speaker stereo biasa.',
      },
      {
        name: 'Profil Sendiri Tanpa Gangguan',
        tier: 'Standar AMC',
        detail: 'Rekomendasi tontonan, daftar simpanan, dan riwayat lanjut tonton tetap rapi di profil pribadimu.',
      },
    ],
    specs: [
      { label: 'Resolusi Video', value: '4K Ultra HD + HDR' },
      { label: 'Audio', value: 'Dolby Atmos & Spatial Audio' },
      { label: 'Tipe Akses', value: 'Profil Pribadi 1 Bulan' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menonton film akhir pekan bersama keluarga di Smart TV 4K dengan detail tajam dan bebas jeda iklan.',
      'Mengunduh episode serial favorit sebelum penerbangan atau perjalanan jarak jauh.',
      'Menjaga riwayat tontonan terpisah dalam satu profil yang terkunci PIN pribadi.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  youtube: {
    name: 'YouTube Premium',
    shortName: 'YouTube Premium',
    heroImage: '/showcase/youtube.webp',
    galleryImage: '/showcase/streaming-cinema-gallery.webp',
    heroImageAlt: 'Visual 3D prisma putar kaca bening dan panel layar keramik untuk YouTube Premium',
    galleryImageAlt: 'Visual 3D lensa optik sinema dan lapisan audio spasial AMC',
    updateTag: 'STANDAR 2026 • 1080P ENHANCED BITRATE & YT MUSIC',
    tagline: 'Nonton tanpa iklan, 1080p Enhanced Bitrate lebih tajam, background play, plus YouTube Music.',
    overview: [
      'YouTube Premium menghapus seluruh jeda iklan sebelum dan di tengah video sekaligus membuka opsi 1080p Premium Enhanced Bitrate untuk ketajaman video lebih tinggi pada adegan gerak cepat, pemutaran layar terkunci, serta akses penuh YouTube Music.',
      'Dengan harga mulai Rp15.000 per 30 hari di Al Muthi Creative, pengalaman belajar tutorial, mendengarkan podcast, dan memutar musik harian menjadi jauh lebih nyaman di semua perangkat.',
    ],
    metadataServices: [
      '100% Bebas Iklan',
      '1080p Premium Enhanced Bitrate',
      'Background Play & PiP',
      'Termasuk YouTube Music',
      'Download Video Offline',
    ],
    highlights2026: [
      {
        name: '1080p Premium Enhanced Bitrate',
        tier: 'Video Lebih Tajam',
        detail: 'Bitrate lebih tinggi menjaga detail teks tutorial, rekaman game, dan video musik tetap bersih tanpa kompresi kasar.',
      },
      {
        name: 'Background Play & YouTube Music',
        tier: 'Multitasking',
        detail: 'Putar podcast atau playlist YouTube Music dengan layar HP terkunci maupun saat membuka aplikasi lain.',
      },
      {
        name: 'Hemat Mulai Rp15.000 / 30 Hari',
        tier: 'Best Value AMC',
        detail: 'Aktif cepat di lintas perangkat (HP, tablet, laptop, Smart TV) dengan garansi penuh masa aktif.',
      },
    ],
    specs: [
      { label: 'Kualitas', value: 'Hingga 4K & 1080p Enhanced' },
      { label: 'Bonus Layanan', value: 'YouTube Music Premium' },
      { label: 'Durasi', value: '30 Hari' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mengikuti kursus coding, desain, atau kuliah di YouTube tanpa terpotong iklan berulang.',
      'Memutar musik dan podcast saat berkendara atau bekerja dengan layar ponsel dimatikan.',
      'Menyimpan video edukasi secara offline agar hemat kuota saat bepergian.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  spotify: {
    name: 'Spotify Premium',
    shortName: 'Spotify Premium',
    heroImage: '/showcase/spotify.webp',
    galleryImage: '/showcase/streaming-cinema-gallery.webp',
    heroImageAlt: 'Visual 3D gelombang akustik konsentris 24-bit dan kapsul suara untuk Spotify Lossless 2026',
    galleryImageAlt: 'Visual 3D lensa optik sinema dan lapisan audio spasial AMC',
    updateTag: 'UPDATE 2026 • SPOTIFY LOSSLESS FLAC 24-BIT',
    tagline: 'Audio Lossless 24-bit/44.1kHz FLAC resmi di paket Premium, bebas iklan, dan download offline.',
    overview: [
      'Pembaruan besar Spotify yang kini aktif penuh sepanjang 2026 menghadirkan streaming audio Lossless FLAC hingga 24-bit/44.1kHz langsung di paket Premium standar tanpa biaya tier tambahan, lengkap dengan dukungan Exclusive Mode di desktop untuk pengguna DAC kabel.',
      'Melalui Flash Sale 11.11 dan katalog resmi AMC, kamu bisa menikmati jutaan lagu, podcast, dan playlist bebas iklan dengan kualitas suara jernih mulai Rp15.000 per bulan.',
    ],
    metadataServices: [
      'Spotify Lossless FLAC 24-bit/44.1kHz',
      'Exclusive Output Mode (Desktop)',
      'Bebas Iklan & Skip Tanpa Batas',
      'Download Playlist Offline',
      'Tersedia di Flash Sale 11.11',
    ],
    highlights2026: [
      {
        name: 'Spotify Lossless FLAC 24-bit/44.1kHz',
        tier: 'Termasuk di Premium 2026',
        detail: 'Tingkatkan kualitas suara dari 320kbps ke FLAC tanpa kompresi lossy langsung lewat menu Media Quality.',
      },
      {
        name: 'Exclusive Mode & Spotify Connect',
        tier: 'Audio Bit-Perfect',
        detail: 'Mendukung perangkat Spotify Connect serta output DAC langsung di Windows untuk detail instrumen lebih jernih.',
      },
      {
        name: 'Promo Spesial 11.11 di AMC',
        tier: 'Rp15.000 / Bulan',
        detail: 'Dapatkan paket Spotify Premium bergaransi penuh dengan proses aktivasi cepat lewat QRIS.',
      },
    ],
    specs: [
      { label: 'Format Audio 2026', value: 'FLAC Lossless 24-bit/44.1kHz' },
      { label: 'Mode Putar', value: 'Bebas Iklan & Offline' },
      { label: 'Promo Aktif', value: 'Flash Sale Rp15.000 / 1 Bulan' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mendengarkan album favorit dengan detail vokal dan instrumen utuh lewat IEM atau speaker kabel.',
      'Menyimpan playlist kerja dan olahraga secara offline tanpa gangguan iklan audio.',
      'Mengontrol pemutaran musik antar HP, laptop, dan speaker lewat Spotify Connect.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  discord: {
    name: 'Discord Nitro',
    shortName: 'Discord Nitro',
    heroImage: '/showcase/ai-productivity-gallery.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D ruang komunitas digital modular biru langit untuk Discord Nitro',
    galleryImageAlt: 'Visual 3D salib geometris kaca dan bola refraktif ekosistem AMC',
    updateTag: 'UPDATE 2026 • STREAMING HD, 500MB UPLOAD & 2 BOOST',
    tagline: 'Streaming layar resolusi tinggi, unggah berkas hingga 500MB, 2 Server Boost, dan kustomisasi profil.',
    overview: [
      'Discord Nitro 2026 membuka kualitas siaran layar hingga 4K/60fps, kapasitas unggah file hingga 500MB, 2 Server Boost ditambah diskon 30% untuk boost tambahan, Super Reactions, serta tema profil animasi.',
      'Sangat cocok bagi pengelola komunitas, tim developer, dan pemain game yang ingin kualitas audio-video jernih saat mabar atau rapat layar bersama.',
    ],
    metadataServices: [
      'HD & 4K Screen Streaming',
      'Upload File hingga 500MB',
      '2 Server Boost + Diskon 30%',
      'Emoji & Profil Animasi',
      'Garansi Penuh AMC',
    ],
    highlights2026: [
      {
        name: 'Streaming Layar HD hingga 4K/60fps',
        tier: 'Komunitas & Kerja',
        detail: 'Tampilkan kode, desain, atau gameplay dengan teks tajam dan frame rate mulus di voice channel.',
      },
      {
        name: '2 Server Boost + Upload 500MB',
        tier: 'Nitro Penuh',
        detail: 'Kirim video mentah, arsip proyek, dan tingkatkan level server komunitas favoritmu.',
      },
      {
        name: 'Personalisasi Profil & Super Reactions',
        tier: 'Identitas Unik',
        detail: 'Gunakan banner animasi, efek profil, latar video kustom, dan emoji lintas server.',
      },
    ],
    specs: [
      { label: 'Kapasitas Upload', value: 'Hingga 500MB per File' },
      { label: 'Bonus Server', value: '2 Server Boost' },
      { label: 'Cek Paket Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Berbagi layar saat review desain, pair programming, atau nobar komunitas dalam resolusi tajam.',
      'Mengirim file video, build aplikasi, dan aset desain berukuran besar langsung di channel kerja.',
      'Mendukung perkembangan server komunitas dengan 2 Server Boost aktif.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  zoom: {
    name: 'Zoom Pro',
    shortName: 'Zoom Pro',
    heroImage: '/showcase/ai-productivity-gallery.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D ruang kerja digital modular untuk Zoom Pro dengan AI Companion 2026',
    galleryImageAlt: 'Visual 3D salib geometris kaca dan bola refraktif ekosistem AMC',
    updateTag: 'UPDATE 2026 • MEETING 30 JAM & ZOOM AI COMPANION',
    tagline: 'Rapat hingga 30 jam tanpa putus, 100 peserta, cloud recording, dan Zoom AI Companion otomatis.',
    overview: [
      'Zoom Pro 2026 menghilangkan batas rapat 40 menit menjadi hingga 30 jam per sesi untuk 100 peserta, dilengkapi 5 GB cloud recording, Zoom Clips, serta Zoom AI Companion tanpa biaya tambahan untuk ringkasan rapat, transkrip real-time, dan daftar tindak lanjut.',
      'Ideal untuk kelas daring, webinar, sidang skripsi, hingga rapat klien harian dengan aktivasi kilat dari AMC.',
    ],
    metadataServices: [
      'Durasi Rapat hingga 30 Jam',
      'Kapasitas 100 Peserta',
      'Zoom AI Companion (Ringkasan & Transkrip)',
      '5 GB Cloud Recording',
      'Live Streaming YouTube/FB',
    ],
    highlights2026: [
      {
        name: 'Zoom AI Companion Included',
        tier: 'Termasuk di Paket Pro 2026',
        detail: 'Membuat ringkasan otomatis, menangkap pertanyaan selama rapat, dan menyusun action item tanpa mencatat manual.',
      },
      {
        name: 'Bebas Batas 40 Menit (30 Jam)',
        tier: '100 Peserta',
        detail: 'Jalankan workshop, kuliah online, dan rapat tim panjang tanpa harus membuat ulang tautan rapat.',
      },
      {
        name: 'Cloud Recording & Zoom Clips',
        tier: 'Arsip Rapat',
        detail: 'Simpan rekaman sesi langsung ke cloud 5 GB dan bagikan tautan tayangan ulang dengan praktis.',
      },
    ],
    specs: [
      { label: 'Batas Durasi', value: 'Hingga 30 Jam / Sesi' },
      { label: 'Fitur AI 2026', value: 'Zoom AI Companion' },
      { label: 'Peserta', value: '100 Peserta' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menyelenggarakan kelas online, bimbingan tugas akhir, dan seminar komunitas tanpa terputus.',
      'Mendapatkan notulensi dan daftar tugas rapat secara otomatis begitu sesi selesai.',
      'Menyiarkan acara daring secara simultan ke YouTube Live atau Facebook Live.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  gdrive: {
    name: 'Google Drive / Google One',
    shortName: 'Google Drive',
    heroImage: '/showcase/ai-productivity-gallery.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D blok penyimpanan awan kaca biru langit untuk Google Drive dan Google One',
    galleryImageAlt: 'Visual 3D salib geometris kaca dan bola refraktif ekosistem AMC',
    updateTag: 'UPDATE 2026 • GOOGLE ONE CLOUD STORAGE',
    tagline: 'Ruang penyimpanan cloud lega untuk Google Drive, Gmail, dan Google Photos tanpa takut penuh.',
    overview: [
      'Pembaruan paket Google One 2026 menyediakan kapasitas penyimpanan besar lintas Google Drive, Gmail, dan Google Photos sehingga berkas kerja, cadangan foto resolusi asli, serta arsip video aman tersinkronisasi di seluruh perangkat.',
      'Dapatkan ekspansi ruang simpan resmi dengan aktivasi transparan dan dukungan garansi dari Al Muthi Creative.',
    ],
    metadataServices: [
      'Sinkronisasi Drive, Gmail & Photos',
      'Backup Perangkat Otomatis',
      'Berbagi File Aman',
      'Akses Lintas Perangkat',
      'Garansi Penuh AMC',
    ],
    highlights2026: [
      {
        name: 'Penyimpanan Terpadu Google One',
        tier: 'Drive + Gmail + Photos',
        detail: 'Satu kuota cloud besar mencegah kotak masuk Gmail terhenti atau cadangan foto tertunda.',
      },
      {
        name: 'Kolaborasi Docs, Sheets & Slides',
        tier: 'Produktivitas Tim',
        detail: 'Simpan file mentah desain, rekaman video, dan dokumen tim tanpa kompresi paksa.',
      },
      {
        name: 'Aktivasi Mudah di AMC',
        tier: 'Cek Varian Live',
        detail: 'Pilih kapasitas dan durasi yang sesuai langsung di Web Shop order.amc.web.id.',
      },
    ],
    specs: [
      { label: 'Ekosistem', value: 'Drive, Gmail & Photos' },
      { label: 'Varian Kuota', value: 'Cek Stok Live Web Shop' },
      { label: 'Perangkat', value: 'Web, Windows, Mac, iOS, Android' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mencadangkan ribuan foto dan video resolusi penuh dari smartphone secara otomatis.',
      'Mengirim dan menyimpan file proyek video atau desain berukuran gigabyte untuk klien.',
      'Menjaga akun Gmail utama tetap lancar menerima email penting tanpa batas 15 GB.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  gmail: {
    name: 'Gmail Fresh',
    shortName: 'Gmail Fresh',
    heroImage: '/showcase/ai-productivity-gallery.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D blok komunikasi digital putih dan biru langit untuk Gmail Fresh',
    galleryImageAlt: 'Visual 3D salib geometris kaca dan bola refraktif ekosistem AMC',
    updateTag: 'READY STOK 2026 • AKUN BERSIH SIAP PAKAI',
    tagline: 'Akun Gmail baru bersih untuk kebutuhan administrasi bisnis, pendaftaran platform, atau proyek tim.',
    overview: [
      'Layanan Gmail Fresh AMC menyediakan akun email Google siap pakai yang bersih dan belum terhubung ke layanan pihak ketiga mana pun. Cocok untuk memisahkan email kerja, pendaftaran perangkat uji, atau operasional tim digital.',
      'Setiap akun dikirim bersama panduan pengamanan awal agar kamu bisa langsung mengganti kata sandi dan menambahkan pemulihan pribadi.',
    ],
    metadataServices: [
      'Akun Bersih Belum Terpakai',
      'Bebas Atur Sandi & Pemulihan',
      'Siap untuk Kebutuhan Bisnis',
      'Pengiriman Cepat',
    ],
    highlights2026: [
      {
        name: 'Akun Baru Siap Pakai',
        tier: 'Stok Harian AMC',
        detail: 'Langsung siap digunakan untuk verifikasi operasional, administrasi toko, atau pengujian sistem.',
      },
      {
        name: 'Kendali Keamanan Penuh',
        tier: 'Milik Pembeli',
        detail: 'Setelah diterima, kamu dapat langsung mengubah sandi dan menautkan email pemulihan sendiri.',
      },
      {
        name: 'Tersedia Satuan & Borongan',
        tier: 'Web Shop & Admin WA',
        detail: 'Cek ketersediaan stok harian langsung lewat order.amc.web.id atau chat CS 24 jam.',
      },
    ],
    specs: [
      { label: 'Kondisi Akun', value: 'Baru & Bersih' },
      { label: 'Kepemilikan', value: 'Penuh (Ubah Sandi Mandiri)' },
      { label: 'Pengiriman', value: 'Cepat via Web Shop / WA' },
      { label: 'Bantuan', value: 'CS 24 Jam AMC' },
    ],
    useCases: [
      'Memisahkan email operasional toko online, kanal media sosial, dan email pribadi.',
      'Kebutuhan pengujian aplikasi, QA tim developer, atau pembuatan akun layanan terpisah.',
      'Menyiapkan akun baru dengan cepat tanpa repot menyiapkan banyak nomor verifikasi.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  getcontact: {
    name: 'GetContact Premium',
    shortName: 'GetContact',
    heroImage: '/showcase/ai-productivity-gallery.webp',
    galleryImage: '/showcase/vpn-security-hero.webp',
    heroImageAlt: 'Visual 3D modul verifikasi dan proteksi panggilan untuk GetContact Premium',
    galleryImageAlt: 'Visual 3D prisma perisai kristal keamanan digital AMC',
    updateTag: 'UPDATE 2026 • PROTEKSI SPAM & CEK TAG PENUH',
    tagline: 'Lihat tag nomor penelepon, statistik pencarian, dan aktifkan proteksi spam tanpa iklan.',
    overview: [
      'GetContact Premium membantu mengidentifikasi nomor tak dikenal secara akurat, memblokir panggilan telemarketing atau penipuan otomatis, serta melihat daftar tag dan statistik pencarian nomor tanpa gangguan iklan.',
      'Aktivasi cepat melalui AMC cocok bagi pemilik usaha, freelancer, dan siapa saja yang rutin menerima panggilan dari nomor baru.',
    ],
    metadataServices: [
      'Cek Tag & Pencarian Nomor',
      'Blokir Panggilan Spam Otomatis',
      'Bebas Iklan di Aplikasi',
      'Lencana Verifikasi Premium',
    ],
    highlights2026: [
      {
        name: 'Identifikasi Nomor Tak Dikenal',
        tier: 'Keamanan Harian',
        detail: 'Periksa reputasi nomor baru sebelum mengangkat telepon atau melakukan transaksi bisnis.',
      },
      {
        name: 'Statistik & Daftar Tag Lengkap',
        tier: 'Fitur Premium',
        detail: 'Lihat siapa saja yang mencari nomormu dan kelola visibilitas tag secara leluasa.',
      },
      {
        name: 'Pengalaman Bebas Iklan',
        tier: 'iOS & Android',
        detail: 'Buka informasi nomor lebih cepat tanpa pop-up iklan mengganggu.',
      },
    ],
    specs: [
      { label: 'Platform', value: 'Android & iOS' },
      { label: 'Fokus Utama', value: 'Cek Tag & Anti-Spam' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Memverifikasi nomor pembeli atau kurir baru sebelum bertransaksi online.',
      'Menyaring panggilan spam dan nomor penipuan secara otomatis sepanjang hari.',
      'Melihat rekam jejak tag nomor bisnis agar kepercayaan pelanggan terjaga.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  scribd: {
    name: 'Scribd Premium',
    shortName: 'Scribd',
    heroImage: '/showcase/ai-productivity-gallery.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D pustaka digital kaca berlapis biru langit untuk Scribd Premium',
    galleryImageAlt: 'Visual 3D salib geometris kaca dan bola refraktif ekosistem AMC',
    updateTag: 'STANDAR 2026 • DOKUMEN, E-BOOK & REFERENSI TANPA BATAS',
    tagline: 'Akses dan unduh jutaan dokumen akademik, jurnal, presentasi, dan buku digital secara bebas.',
    overview: [
      'Scribd Premium membuka kunci jutaan dokumen referensi, makalah, template presentasi, lembar musik, hingga koleksi e-book dan audiobook lintas disiplin ilmu tanpa syarat unggah dokumen terlebih dahulu.',
      'Sangat membantu mahasiswa, dosen, peneliti, dan profesional yang memerlukan akses cepat terhadap referensi tertulis setiap hari.',
    ],
    metadataServices: [
      'Download Dokumen PDF/DOCX',
      'Akses Jurnal & Presentasi',
      'Baca Offline di Aplikasi',
      'Bebas Syarat Upload',
    ],
    highlights2026: [
      {
        name: 'Unduh Dokumen Tanpa Ribet',
        tier: 'Akses Penuh',
        detail: 'Unduh berkas PDF, PPT, dan panduan referensi langsung tanpa harus menukar unggahan.',
      },
      {
        name: 'Pustaka Lintas Bidang',
        tier: 'Akademik & Bisnis',
        detail: 'Mencakup referensi teknik, hukum, ekonomi, desain, hingga template laporan profesional.',
      },
      {
        name: 'Sinkronisasi Web & Mobile',
        tier: 'Garansi AMC',
        detail: 'Simpan koleksi bacaan dan lanjutkan membaca dari browser laptop maupun ponsel.',
      },
    ],
    specs: [
      { label: 'Konten', value: 'Dokumen, Presentasi, Buku' },
      { label: 'Platform', value: 'Web, Android, iOS' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mengumpulkan referensi literatur dan studi pendamping untuk skripsi, tesis, dan makalah kuliah.',
      'Mengunduh contoh kontrak, template SOP, atau slide presentasi bisnis.',
      'Membaca koleksi buku digital dan partitur musik saat senggang.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  alight: {
    name: 'Alight Motion Pro',
    shortName: 'Alight Motion',
    heroImage: '/showcase/creative-studio-gallery.webp',
    galleryImage: '/showcase/capcut.webp',
    heroImageAlt: 'Visual 3D ruang gerak grafis dan kurva bezier krom untuk Alight Motion Pro',
    galleryImageAlt: 'Visual 3D timeline video kaca berlapis biru langit AMC',
    updateTag: 'STANDAR 2026 • MOTION GRAPHIC BEBAS WATERMARK',
    tagline: 'Animasi keyframe, grafik vektor, efek Pro lengkap, dan impor preset XML tanpa watermark.',
    overview: [
      'Alight Motion Pro adalah andalan editor mobile untuk membuat animasi motion graphic presisi dengan kurva easing kustom, dukungan layer vektor dan bitmap, kamera virtual, serta impor preset XML tanpa batas.',
      'Aktivasi melalui Al Muthi Creative menghilangkan tanda air ekspor dan membuka seluruh efek Pro agar hasil edit jedag-jedug maupun tipografi kinetik tampil bersih.',
    ],
    metadataServices: [
      'Bebas Watermark Ekspor',
      'Seluruh Efek & Blending Pro',
      'Impor Preset XML & Link',
      'Keyframe & Easing Kustom',
    ],
    highlights2026: [
      {
        name: 'Ekspor Bersih Tanpa Watermark',
        tier: 'Video & GIF HD',
        detail: 'Render animasi hingga resolusi tinggi tanpa logo aplikasi di sudut layar.',
      },
      {
        name: 'Preset XML & Efek Pro Lengkap',
        tier: 'Workflow Cepat',
        detail: 'Gunakan preset komunitas dan efek kamera, blur, serta warna lanjutan secara utuh.',
      },
      {
        name: 'Kontrol Kurva Easing Presisi',
        tier: 'Motion Designer Mobile',
        detail: 'Atur kecepatan gerak antar keyframe layaknya perangkat lunak animasi desktop.',
      },
    ],
    specs: [
      { label: 'Platform', value: 'Android & iOS' },
      { label: 'Format Ekspor', value: 'MP4, GIF, PNG Sequence' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Membuat animasi tipografi kinetik, transisi musik, dan intro konten pendek langsung dari HP.',
      'Mengimpor dan memodifikasi paket preset XML dengan efek Pro terbuka penuh.',
      'Merancang animasi logo sederhana untuk keperluan promosi media sosial.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  picsart: {
    name: 'Picsart Gold / Pro',
    shortName: 'Picsart',
    heroImage: '/showcase/creative-studio-gallery.webp',
    galleryImage: '/showcase/canva.webp',
    heroImageAlt: 'Visual 3D kolase papan desain kaca buram untuk Picsart Pro',
    galleryImageAlt: 'Visual 3D pita desain kaca biru langit AMC',
    updateTag: 'UPDATE 2026 • AI PHOTO EDITING & ASET GOLD',
    tagline: 'Hapus objek dan latar foto instan, filter premium, stiker Gold, serta alat AI kreatif.',
    overview: [
      'Picsart Pro membuka jutaan stiker, font, bingkai kolase, efek retouch, dan fitur AI seperti penghapus latar otomatis, peningkatan resolusi foto, serta pergantian objek cepat dari ponsel maupun browser.',
      'Cocok bagi kreator katalog produk, desainer poster cepat, dan pengguna media sosial yang ingin hasil olah foto instan tanpa watermark.',
    ],
    metadataServices: [
      'AI Remove Background & Object',
      'AI Enhance Resolusi Foto',
      'Font, Filter & Stiker Premium',
      'Bebas Iklan & Watermark',
    ],
    highlights2026: [
      {
        name: 'AI Retouch & Background Remover',
        tier: 'Olah Foto Cepat',
        detail: 'Rapikan foto produk UMKM dan hapus gangguan latar dalam satu sentuhan.',
      },
      {
        name: 'Katalog Aset & Font Gold',
        tier: 'Konten Sosmed',
        detail: 'Akses ribuan template kolase, efek tipografi, dan filter tren tanpa kunci berbayar.',
      },
      {
        name: 'Ekspor Resolusi Tinggi',
        tier: 'Web & Mobile',
        detail: 'Simpan desain dalam format tajam siap unggah ke marketplace maupun Instagram.',
      },
    ],
    specs: [
      { label: 'Platform', value: 'Android, iOS & Web' },
      { label: 'Alat Utama', value: 'AI Enhance & Background Cut' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menyiapkan foto katalog marketplace dengan latar bersih dan pencahayaan seimbang.',
      'Membuat kolase foto, thumbnail video, dan poster pengumuman dari HP.',
      'Memperjelas foto buram atau resolusi rendah dengan fitur AI Enhance.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  meitu: {
    name: 'Meitu VIP',
    shortName: 'Meitu VIP',
    heroImage: '/showcase/creative-studio-gallery.webp',
    galleryImage: '/showcase/adobe-express.webp',
    heroImageAlt: 'Visual 3D studio retouch potret kaca bersih untuk Meitu VIP',
    galleryImageAlt: 'Visual 3D kartu tata letak studio desain modern AMC',
    updateTag: 'UPDATE 2026 • AI PORTRAIT & VIDEO RETOUCH VIP',
    tagline: 'Retouch potret natural, perbaikan kualitas foto HD, dan filter estetis VIP tanpa batas.',
    overview: [
      'Meitu VIP menghadirkan perangkat retouch wajah dan video berpresisi tinggi, pemulihan detail foto HD, penghapus objek, serta koleksi filter warna estetis yang populer di kalangan kreator gaya hidup dan fotografer potret.',
      'Semua fitur VIP terbuka penuh tanpa tanda air melalui aktivasi cepat dari Al Muthi Creative.',
    ],
    metadataServices: [
      'AI Portrait & Skin Retouch',
      'Pemulihan Foto & Video HD',
      'Filter & Preset VIP Lengkap',
      'Ekspor Tanpa Watermark',
    ],
    highlights2026: [
      {
        name: 'Retouch Potret & Video Presisi',
        tier: 'VIP Penuh',
        detail: 'Haluskan detail pencahayaan dan warna kulit pada foto maupun klip video dengan hasil natural.',
      },
      {
        name: 'AI Photo Restoration HD',
        tier: 'Kualitas Tajam',
        detail: 'Tingkatkan kejernihan foto malam hari atau potret lama secara otomatis.',
      },
      {
        name: 'Filter & Template Estetis',
        tier: 'Konten Lifestyle',
        detail: 'Buka seluruh paket filter warna, makeup digital, dan bingkai editorial VIP.',
      },
    ],
    specs: [
      { label: 'Platform', value: 'Android & iOS' },
      { label: 'Fokus', value: 'Retouch Foto & Video VIP' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menyempurnakan foto katalog fashion, lookbook, dan potret konten media sosial.',
      'Memperbaiki ketajaman video vlog pendek sebelum diunggah ke Reels atau TikTok.',
      'Menerapkan tone warna konsisten di seluruh feed galeri pribadi maupun brand.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  applemusic: {
    name: 'Apple Music',
    shortName: 'Apple Music',
    heroImage: '/showcase/streaming-cinema-gallery.webp',
    galleryImage: '/showcase/spotify.webp',
    heroImageAlt: 'Visual 3D lensa akustik kaca biru langit untuk Apple Music Hi-Res Lossless',
    galleryImageAlt: 'Visual 3D gelombang suara konsentris audio lossless AMC',
    updateTag: 'STANDAR 2026 • HI-RES LOSSLESS 24-BIT/192KHZ & DOLBY ATMOS',
    tagline: 'Audio Hi-Res Lossless hingga 24-bit/192kHz, Spatial Audio Dolby Atmos, dan Apple Music Sing.',
    overview: [
      'Apple Music tetap menjadi rujukan audiophile berkat pustaka luas dalam format ALAC Hi-Res Lossless hingga 24-bit/192kHz serta Spatial Audio dengan Dolby Atmos yang sudah termasuk di paket langganan tanpa biaya ekstra.',
      'Dilengkapi lirik waktu nyata Apple Music Sing dan bebas iklan penuh di iPhone, iPad, Mac, Android, maupun Windows.',
    ],
    metadataServices: [
      'Hi-Res Lossless 24-bit/192kHz',
      'Spatial Audio + Dolby Atmos',
      'Apple Music Sing (Lirik Live)',
      'Bebas Iklan & Offline',
    ],
    highlights2026: [
      {
        name: 'Hi-Res Lossless 24-bit/192kHz',
        tier: 'Kualitas Studio',
        detail: 'Menjaga dinamika rekaman master studio utuh saat diputar melalui DAC atau perangkat audio kabel.',
      },
      {
        name: 'Spatial Audio dengan Dolby Atmos',
        tier: 'Suara 360 Derajat',
        detail: 'Menghadirkan panggung suara imersif di AirPods, Beats, dan sistem audio yang mendukung Atmos.',
      },
      {
        name: 'Lirik Sinkron & Offline Penuh',
        tier: 'Lintas Perangkat',
        detail: 'Tersedia mulus di iOS, macOS, Android, Windows, hingga CarPlay.',
      },
    ],
    specs: [
      { label: 'Format Puncak', value: 'ALAC 24-bit/192kHz + Atmos' },
      { label: 'Platform', value: 'iOS, Mac, Android, Windows' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menikmati album master studio dengan kualitas audio resolusi tinggi tanpa kompresi.',
      'Bernyanyi bersama teman menggunakan fitur lirik sinkron dan kontrol vokal Apple Music Sing.',
      'Menyimpan pustaka album favorit secara offline di perangkat Apple maupun Android.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  hbomax: {
    name: 'HBO Max',
    shortName: 'HBO Max',
    heroImage: '/showcase/streaming-cinema-gallery.webp',
    galleryImage: '/showcase/netflix.webp',
    heroImageAlt: 'Visual 3D lensa optik sinema biru gelap dan sky blue untuk HBO Max 4K',
    galleryImageAlt: 'Visual 3D layar lengkung sinema 4K HDR AMC',
    updateTag: 'UPDATE 2026 • 4K UHD, DOLBY VISION & KATALOG WARNER BROS',
    tagline: 'Serial original HBO, semesta DC, film bioskop Warner Bros., hingga kualitas 4K Dolby Atmos.',
    overview: [
      'HBO Max 2026 menyatukan katalog lengkap serial premium HBO, film layar lebar Warner Bros., semesta DC, dan rilisan blockbuster terbaru dengan dukungan 4K UHD, HDR10, Dolby Vision, dan Dolby Atmos pada tier tertinggi.',
      'Aktifkan layanan HBO Max lewat Al Muthi Creative dengan harga terjangkau dan dukungan CS 24 jam.',
    ],
    metadataServices: [
      'Serial Original HBO Lengkap',
      'Film Warner Bros. & DC',
      '4K UHD, HDR10 & Dolby Vision',
      'Dolby Atmos & Download Offline',
    ],
    highlights2026: [
      {
        name: 'Katalog HBO & Warner Bros.',
        tier: 'Rilisan Eksklusif',
        detail: 'Tonton serial unggulan seperti House of the Dragon, The Last of Us, hingga rilis bioskop Warner Bros.',
      },
      {
        name: '4K UHD + Dolby Vision & Atmos',
        tier: 'Tier Premium',
        detail: 'Kualitas visual dan tata suara sinematik di Smart TV, tablet, maupun smartphone.',
      },
      {
        name: 'Subtitle Indonesia Lengkap',
        tier: 'Nyaman Ditonton',
        detail: 'Mendukung subtitle resmi bahasa Indonesia dan pengunduhan offline untuk ditonton kapan saja.',
      },
    ],
    specs: [
      { label: 'Kualitas Puncak', value: 'Hingga 4K UHD & Dolby Atmos' },
      { label: 'Katalog', value: 'HBO, Warner Bros., DC, Max' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mengikuti serial drama pemenang penghargaan HBO secara legal dengan subtitle resmi.',
      'Menonton film blockbuster Warner Bros. di rumah dengan dukungan 4K HDR.',
      'Mengunduh episode pilihan untuk menemani waktu istirahat tanpa buffering.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  primevideo: {
    name: 'Prime Video',
    shortName: 'Prime Video',
    heroImage: '/showcase/streaming-cinema-gallery.webp',
    galleryImage: '/showcase/netflix.webp',
    heroImageAlt: 'Visual 3D lensa sinema dan lapisan HDR10+ Advanced untuk Amazon Prime Video',
    galleryImageAlt: 'Visual 3D layar lengkung sinema 4K HDR AMC',
    updateTag: 'UPDATE 2026 • 4K HDR10+ ADVANCED & AMAZON ORIGINALS',
    tagline: 'Serial Amazon Originals, film Asia & Hollywood, serta dukungan 4K HDR10+ dan X-Ray.',
    overview: [
      'Prime Video pada 2026 memperluas dukungan kualitas gambar termasuk HDR10+ Advanced (rilis Agustus 2026), Dolby Vision, dan katalog luas mulai dari The Boys, The Rings of Power, hingga film Indonesia dan drama Korea eksklusif.',
      'Dilengkapi fitur X-Ray untuk melihat profil pemeran dan musik latar langsung saat menonton, aktif cepat lewat AMC.',
    ],
    metadataServices: [
      'Amazon Originals & Film Indonesia',
      '4K UHD & HDR10+ Advanced',
      'Fitur X-Ray Pemeran & Soundtrack',
      'Download Offline Multi-Perangkat',
    ],
    highlights2026: [
      {
        name: 'Dukungan HDR10+ Advanced 2026',
        tier: 'Visual Tajam',
        detail: 'Reproduksi kontras dan ketajaman warna yang lebih hidup pada televisi dan layar modern.',
      },
      {
        name: 'Katalog Global & Lokal',
        tier: 'Film & Serial',
        detail: 'Menghadirkan tayangan eksklusif Amazon Originals, anime, drakor, hingga sinema lokal pilihan.',
      },
      {
        name: 'Fitur Interaktif X-Ray',
        tier: 'Eksklusif Prime',
        detail: 'Cek nama aktor, trivia adegan, dan judul lagu latar langsung di layar tanpa keluar dari film.',
      },
    ],
    specs: [
      { label: 'Format Video', value: 'HD hingga 4K HDR10+' },
      { label: 'Fitur Khas', value: 'X-Ray & Download Offline' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menonton serial eksklusif Amazon Originals dan film Indonesia terbaru secara legal.',
      'Menyaksikan tayangan favorit di Smart TV, laptop, maupun HP dengan subtitle Indonesia.',
      'Mengunduh film sebelum perjalanan agar tetap bisa menonton tanpa koneksi internet.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  viu: {
    name: 'Viu Premium',
    shortName: 'Viu Premium',
    heroImage: '/showcase/streaming-cinema-gallery.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D ruang tayangan hiburan Asia kaca biru langit untuk Viu Premium',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'STANDAR 2026 • DRAKOR, VARIETY SHOW & VIO ORIGINALS',
    tagline: 'Nonton drama Korea, drama Asia, dan variety show terbaru tanpa iklan dengan subtitle cepat.',
    overview: [
      'Viu Premium menjadi pilihan utama pecinta drama Korea, Thailand, Jepang, dan variety show Asia berkat terjemahan bahasa Indonesia yang cepat tayang mengikuti jadwal rilis asli.',
      'Nikmati kualitas Full HD tanpa iklan, akses episode lebih awal, serta unduhan offline tak terbatas lewat langganan resmi AMC.',
    ],
    metadataServices: [
      'Bebas Iklan Sepenuhnya',
      'Episode Terbaru Lebih Cepat',
      'Kualitas Full HD + Subtitle ID',
      'Download Offline Tanpa Batas',
    ],
    highlights2026: [
      {
        name: 'Subtitle Indonesia Tayang Cepat',
        tier: 'Drakor & Variety Show',
        detail: 'Ikuti episode on-going favorit tepat setelah tayang tanpa terganggu jeda iklan.',
      },
      {
        name: 'Unduhan Offline Praktis',
        tier: 'Hemat Kuota',
        detail: 'Simpan beberapa episode sekaligus di aplikasi HP untuk ditonton saat komuter.',
      },
      {
        name: 'Bisa di HP & Smart TV',
        tier: 'Multi-Perangkat',
        detail: 'Lanjutkan episode yang sama lintas perangkat dengan riwayat tontonan tersinkron.',
      },
    ],
    specs: [
      { label: 'Fokus Katalog', value: 'Drakor, Asia & Variety Show' },
      { label: 'Resolusi', value: 'Full HD 1080p' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menonton drama Korea on-going dan acara ragam favorit tanpa jeda iklan berulang.',
      'Mengunduh episode baru lewat Wi-Fi untuk ditonton di perjalanan.',
      'Menonton maraton serial Viu Originals di layar TV bersama keluarga.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  wetv: {
    name: 'WeTV VIP',
    shortName: 'WeTV VIP',
    heroImage: '/showcase/streaming-cinema-gallery.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D ruang streaming drama dan anime Asia untuk WeTV VIP',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'STANDAR 2026 • DRAMA ASIA, ANIME & SERIAL LOKAL VIP',
    tagline: 'Akses episode VIP lebih awal untuk drama China, serial Indonesia, dan anime dalam Blu-ray 1080p.',
    overview: [
      'WeTV VIP membuka akses tontonan lebih awal (Fast Track / VIP early access) untuk drama China populer, WeTV Originals Indonesia, serta katalog donghua dan anime dalam kualitas 1080p Blu-ray bebas iklan.',
      'Aktifkan WeTV VIP secara cepat lewat Al Muthi Creative dengan jaminan garansi penuh selama masa aktif.',
    ],
    metadataServices: [
      'Akses Episode VIP Lebih Awal',
      'Kualitas 1080p Blu-ray',
      'Bebas Iklan Video',
      'Drama China, Lokal & Donghua',
    ],
    highlights2026: [
      {
        name: 'Tonton Lebih Cepat dari Akun Gratis',
        tier: 'Keunggulan VIP',
        detail: 'Buka episode terbaru serial WeTV Originals dan drama Asia tanpa menunggu jadwal rilis gratis.',
      },
      {
        name: 'Resolusi 1080p Tajam',
        tier: 'Audio & Visual Bersih',
        detail: 'Pilihan bitrate tinggi menjaga detail adegan aksi donghua dan drama kostum tetap jernih.',
      },
      {
        name: 'Tanpa Iklan & Bisa Download',
        tier: 'Garansi AMC',
        detail: 'Menonton lebih lancar dari awal hingga akhir episode di HP, tablet, maupun TV.',
      },
    ],
    specs: [
      { label: 'Katalog Utama', value: 'C-Drama, Lokal & Donghua' },
      { label: 'Resolusi', value: 'Hingga 1080p Blu-ray' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mengikuti serial WeTV Originals Indonesia dan drama China terbaru lebih awal.',
      'Menonton donghua dan anime favorit dengan kualitas video 1080p tanpa iklan.',
      'Menyimpan episode secara offline di aplikasi untuk tontonan santai.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  vidio: {
    name: 'Vidio Platinum',
    shortName: 'Vidio Platinum',
    heroImage: '/showcase/streaming-cinema-gallery.webp',
    galleryImage: '/showcase/netflix.webp',
    heroImageAlt: 'Visual 3D ruang tayangan siaran olahraga dan serial lokal untuk Vidio Platinum',
    galleryImageAlt: 'Visual 3D layar lengkung sinema 4K HDR AMC',
    updateTag: 'STANDAR 2026 • OLAHRAGA LIVE, ORIGINAL SERIES & TV',
    tagline: 'Saksikan pertandingan olahraga, Vidio Original Series, film Indonesia, dan saluran TV premium.',
    overview: [
      'Vidio Platinum menghadirkan kombinasi lengkap antara siaran olahraga populer, Vidio Original Series lokal, film bioskop Indonesia, drama Asia, hingga saluran TV nasional dan internasional dalam satu aplikasi.',
      'Cocok untuk penonton bola dan keluarga yang menginginkan siaran stabil berkualitas Full HD lewat aktivasi cepat AMC.',
    ],
    metadataServices: [
      'Siaran Olahraga & Liga Pilihan',
      'Vidio Original Series Lengkap',
      'Saluran TV & Film Bioskop',
      'Streaming Stabil Full HD',
    ],
    highlights2026: [
      {
        name: 'Olahraga & Siaran Langsung',
        tier: 'Paket Platinum / Diamond',
        detail: 'Nikmati pertandingan liga pilihan dan tayangan ulang momen penting dengan server lokal responsif.',
      },
      {
        name: 'Vidio Original Series & Film Lokal',
        tier: 'Eksklusif Indonesia',
        detail: 'Akses episode perdana serial lokal populer serta katalog film Indonesia pilihan.',
      },
      {
        name: 'Cek Varian Paket Live di Web Shop',
        tier: 'Transparan di AMC',
        detail: 'Pilih paket Platinum Mobile atau All Screen sesuai perangkat yang kamu pakai di order.amc.web.id.',
      },
    ],
    specs: [
      { label: 'Konten Utama', value: 'Olahraga, Series Lokal & TV' },
      { label: 'Resolusi', value: 'Full HD 1080p' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menonton pertandingan olahraga live tanpa harus mencari tautan tidak resmi yang patah-patah.',
      'Mengikuti Vidio Original Series terbaru bersama keluarga di rumah.',
      'Menyaksikan saluran berita dan hiburan TV nasional langsung dari HP atau Smart TV.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  wink: {
    name: 'Wink VIP',
    shortName: 'Wink VIP',
    heroImage: '/showcase/creative-studio-gallery.webp',
    galleryImage: '/showcase/capcut.webp',
    heroImageAlt: 'Visual 3D studio pemulihan kualitas video 4K AI untuk Wink VIP',
    galleryImageAlt: 'Visual 3D timeline video kaca berlapis biru langit AMC',
    updateTag: 'UPDATE 2026 • AI VIDEO QUALITY RESTORATION 4K',
    tagline: 'Tingkatkan kejernihan video buram ke HD/4K, stabilisasi AI, dan retouch video tanpa batas.',
    overview: [
      'Wink VIP adalah alat favorit kreator video pendek untuk memulihkan kualitas rekaman buram menjadi tajam (AI Video Quality Repair hingga 4K), menghaluskan pencahayaan potret pada video, dan menambah subtitle otomatis tanpa batasan kuota harian.',
      'Aktifkan Wink VIP melalui AMC agar proses polishing footage Reels dan TikTok berjalan mulus tanpa watermark.',
    ],
    metadataServices: [
      'AI Video Quality Repair (HD/4K)',
      'Retouch Video Potret Otomatis',
      'Penghapus Watermark & Objek',
      'Kuota Ekspor VIP Penuh',
    ],
    highlights2026: [
      {
        name: 'Pemulihan Ketajaman Video AI',
        tier: 'Andalan Kreator',
        detail: 'Pertajam rekaman low-light atau klip lama sebelum masuk ke tahap penyuntingan akhir.',
      },
      {
        name: 'Retouch Video Otomatis',
        tier: 'VIP Penuh',
        detail: 'Koreksi warna, pencahayaan wajah, dan kontras secara konsisten di sepanjang klip.',
      },
      {
        name: 'Tanpa Batas Kuota Gratis',
        tier: 'Garansi AMC',
        detail: 'Proses banyak klip dalam sehari tanpa antrean panjang atau pembatasan fitur VIP.',
      },
    ],
    specs: [
      { label: 'Platform', value: 'Android & iOS' },
      { label: 'Fitur Inti', value: 'AI Video Repair & Retouch' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mempertajam cuplikan video sebelum diedit di CapCut atau Alight Motion.',
      'Memperbaiki rekaman video produk di ruangan minim cahaya agar tetap jernih.',
      'Menghasilkan konten vlog dan testimoni produk yang bersih langsung dari ponsel.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  vpnexpress: {
    name: 'ExpressVPN',
    shortName: 'ExpressVPN',
    heroImage: '/showcase/vpn-security-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D perisai kristal geometris dan cincin meridian biru langit untuk ExpressVPN',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'STANDAR 2026 • PROTOKOL LIGHTWAY & PRIVASI NO-LOGS',
    tagline: 'Koneksi VPN berkecepatan tinggi dengan protokol Lightway, server global, dan enkripsi kuat.',
    overview: [
      'ExpressVPN dikenal dengan kecepatan stabil protokol Lightway, kebijakan tanpa pencatatan aktivitas (no-logs) yang teraudit independen, serta keandalan tinggi untuk mengakses katalog streaming internasional dan mengamankan jaringan Wi-Fi publik.',
      'Dapatkan akun ExpressVPN siap pakai dan bergaransi penuh dari Al Muthi Creative.',
    ],
    metadataServices: [
      'Protokol Lightway Cepat & Stabil',
      'Jaringan Server 100+ Negara',
      'Kebijakan No-Logs Teraudit',
      'Mendukung Streaming Global',
    ],
    highlights2026: [
      {
        name: 'Protokol Lightway Berlatensi Rendah',
        tier: 'Kecepatan 2026',
        detail: 'Menyambung dalam hitungan detik dengan penurunan kecepatan minimal untuk kerja maupun streaming 4K.',
      },
      {
        name: 'Perlindungan Wi-Fi Publik & Privasi',
        tier: 'Enkripsi AES-256',
        detail: 'Melindungi lalu lintas data saat bekerja dari kafe, bandara, atau jaringan bersama.',
      },
      {
        name: 'Akses Multi-Platform',
        tier: 'Desktop, Mobile & TV',
        detail: 'Tersedia di Windows, macOS, Android, iOS, ekstensi browser, dan Smart TV.',
      },
    ],
    specs: [
      { label: 'Protokol Utama', value: 'Lightway & OpenVPN' },
      { label: 'Privasi', value: 'TrustedServer (RAM-only)' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Mengamankan koneksi saat mengakses akun kerja dan perbankan di Wi-Fi publik.',
      'Membuka katalog regional layanan streaming serta riset pasar luar negeri.',
      'Menguji tampilan situs web dari berbagai lokasi negara secara cepat.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  vpnsurfshark: {
    name: 'Surfshark VPN',
    shortName: 'Surfshark VPN',
    heroImage: '/showcase/vpn-security-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D perisai kristal keamanan siber untuk Surfshark VPN',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'STANDAR 2026 • WIREGUARD, CLEANWEB & MULTI-PERANGKAT',
    tagline: 'VPN cepat berprotokol WireGuard lengkap dengan pemblokir iklan CleanWeb dan koneksi fleksibel.',
    overview: [
      'Surfshark VPN memadukan kecepatan protokol WireGuard, fitur pemblokir iklan dan pelacak CleanWeb, serta dukungan lintas sistem operasi yang ringan dipakai sepanjang hari untuk bekerja, riset, dan hiburan.',
      'Tersedia dengan aktivasi cepat dan jaminan garansi penuh melalui Web Shop Al Muthi Creative.',
    ],
    metadataServices: [
      'Protokol WireGuard Cepat',
      'CleanWeb Pemblokir Iklan & Tracker',
      'Server Global 100 Negara',
      'MultiHop & Bypass Regional',
    ],
    highlights2026: [
      {
        name: 'WireGuard + CleanWeb',
        tier: 'Cepat & Bersih',
        detail: 'Menyaring iklan pelacak dan domain berbahaya sekaligus menjaga koneksi tetap ringan.',
      },
      {
        name: 'Akses Katalog Global',
        tier: 'Streaming & Riset',
        detail: 'Beralih lokasi server dengan cepat untuk layanan streaming internasional dan riset konten.',
      },
      {
        name: 'Harga Sangat Ekonomis di AMC',
        tier: 'Best Value VPN',
        detail: 'Perlindungan privasi harian dengan dukungan CS 24 jam jika butuh bantuan konfigurasi.',
      },
    ],
    specs: [
      { label: 'Protokol', value: 'WireGuard, IKEv2, OpenVPN' },
      { label: 'Fitur Ekstra', value: 'CleanWeb & MultiHop' },
      { label: 'Cek Harga Live', value: 'order.amc.web.id' },
      { label: 'Garansi', value: 'Penuh Selama Masa Aktif' },
    ],
    useCases: [
      'Menjaga privasi penjelajahan web sekaligus memblokir pelacak iklan.',
      'Mengakses layanan kerja atau situs riset lintas wilayah dengan latensi rendah.',
      'Menonton katalog tayangan luar negeri secara lancar dari laptop atau HP.',
    ],
    activationNotes: PREMIUM_ACTIVATION_NOTES,
  },

  'buzzer-instagram': {
    name: 'Buzzer Instagram',
    shortName: 'Buzzer Instagram',
    heroImage: '/showcase/buzzer-social-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D grafik pertumbuhan dan cincin jangkauan biru langit untuk Buzzer Instagram',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'LAYANAN SOSMED 2026 • TANPA PASSWORD AKUN',
    tagline: 'Layanan followers, likes, views Reels, dan interaksi Instagram aman hanya dengan username.',
    overview: [
      'Buzzer Instagram AMC membantu brand, kreator, dan toko online memperkuat sinyal bukti sosial pada profil, postingan feed, maupun video Reels tanpa pernah meminta akses login atau kata sandi akunmu.',
      'Cukup pastikan akun diatur publik selama pengerjaan, pilih paket sesuai kebutuhan di Web Shop, dan pantau progresnya bersama tim admin 24 jam.',
    ],
    metadataServices: [
      'Followers, Likes & Views Reels',
      '100% Tanpa Password',
      'Cukup Username / Link Post',
      'Pilihan Paket Fleksibel',
    ],
    highlights2026: [
      {
        name: 'Privasi Terjaga Tanpa Password',
        tier: 'Keamanan Utama',
        detail: 'Pemesanan hanya memerlukan username profil atau tautan postingan publik.',
      },
      {
        name: 'Mendukung Feed, Reels & Story',
        tier: 'Beragam Pilihan',
        detail: 'Tersedia opsi likes, views Reels, hingga followers untuk menunjang kampanye peluncuran produk.',
      },
      {
        name: 'Order Transparan via Web Shop',
        tier: 'order.amc.web.id/#buzzer',
        detail: 'Pilih jumlah dan jenis layanan langsung dengan perhitungan harga otomatis.',
      },
    ],
    specs: [
      { label: 'Syarat Akun', value: 'Publik (Tidak Diprivat)' },
      { label: 'Keamanan', value: 'Tanpa Kata Sandi' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#buzzer' },
      { label: 'Dukungan', value: 'Admin 24 Jam AMC' },
    ],
    useCases: [
      'Meningkatkan kredibilitas awal akun brand atau toko online baru di Instagram.',
      'Mendorong visibilitas postingan promosi, giveaway, dan peluncuran produk di Reels.',
      'Menjaga ritme interaksi pada konten kampanye musiman.',
    ],
    activationNotes: BUZZER_ACTIVATION_NOTES,
  },

  'buzzer-tiktok': {
    name: 'Buzzer TikTok',
    shortName: 'Buzzer TikTok',
    heroImage: '/showcase/buzzer-social-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D grafik pertumbuhan dan gelombang jangkauan untuk Buzzer TikTok',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'LAYANAN SOSMED 2026 • DORONG JANGKAUAN TIKTOK',
    tagline: 'Followers, likes, views video, dan interaksi TikTok aman tanpa login akun.',
    overview: [
      'Buzzer TikTok AMC mendukung pertumbuhan awal akun kreator, afiliator, dan bisnis dengan layanan followers, likes, serta views video yang diproses cepat cukup bermodalkan username atau tautan video publik.',
      'Seluruh proses berjalan tanpa kata sandi sehingga keamanan akun dan keranjang TikTok Shop tetap terlindungi.',
    ],
    metadataServices: [
      'Followers, Likes & Views Video',
      'Aman Tanpa Kata Sandi',
      'Cocok untuk Kreator & Afiliator',
      'Pemesanan Cepat QRIS',
    ],
    highlights2026: [
      {
        name: 'Cukup Kirim Link Video Publik',
        tier: 'Tanpa Login',
        detail: 'Proses otomatis dimulai setelah pembayaran tanpa risiko kebocoran akses akun.',
      },
      {
        name: 'Mendukung Target Kampanye',
        tier: 'Fleksibel',
        detail: 'Tersedia pilihan jumlah kecil sampai besar sesuai kebutuhan promosi produk.',
      },
      {
        name: 'Bantuan Admin 24 Jam',
        tier: 'Standar AMC',
        detail: 'Konsultasikan paket yang paling pas dengan CS AMC kapan pun diperlukan.',
      },
    ],
    specs: [
      { label: 'Syarat Akun', value: 'Publik (Tidak Diprivat)' },
      { label: 'Keamanan', value: 'Tanpa Kata Sandi' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#buzzer' },
      { label: 'Dukungan', value: 'Admin 24 Jam AMC' },
    ],
    useCases: [
      'Memenuhi syarat jumlah followers awal untuk fitur profil dan live kreator.',
      'Memperkuat tampilan interaksi pada video promosi produk dan review afiliasi.',
      'Membangun kepercayaan audiens baru saat pertama kali mengunjungi profil.',
    ],
    activationNotes: BUZZER_ACTIVATION_NOTES,
  },

  'buzzer-facebook': {
    name: 'Buzzer Facebook',
    shortName: 'Buzzer Facebook',
    heroImage: '/showcase/buzzer-social-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D grafik pertumbuhan dan gelombang jangkauan untuk Buzzer Facebook',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'LAYANAN SOSMED 2026 • HALAMAN & PROFIL FACEBOOK',
    tagline: 'Tingkatkan pengikut halaman, likes postingan, dan views video Facebook tanpa password.',
    overview: [
      'Layanan Buzzer Facebook di Al Muthi Creative membantu memperkuat citra profesional Fanpage bisnis, profil kreator Mode Profesional, dan postingan promosi cukup melalui tautan halaman publik.',
      'Proses transparan dan aman tanpa pernah meminta akses admin halaman atau kata sandi.',
    ],
    metadataServices: [
      'Followers Fanpage & Profil',
      'Likes & Views Postingan',
      '100% Tanpa Password',
      'Order Mudah di Web Shop',
    ],
    highlights2026: [
      {
        name: 'Mendukung Fanpage & Mode Profesional',
        tier: 'Bisnis & Kreator',
        detail: 'Bantu profil bisnis tampil lebih meyakinkan bagi calon pembeli dari iklan maupun pencarian.',
      },
      {
        name: 'Tanpa Akses Admin',
        tier: 'Privasi Aman',
        detail: 'Hanya butuh tautan Fanpage atau postingan yang diatur publik.',
      },
      {
        name: 'Harga Jelas per Paket',
        tier: 'order.amc.web.id/#buzzer',
        detail: 'Cek seluruh variasi paket dan estimasi pengerjaan langsung di Web Shop.',
      },
    ],
    specs: [
      { label: 'Syarat', value: 'Halaman / Post Publik' },
      { label: 'Keamanan', value: 'Tanpa Kata Sandi' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#buzzer' },
      { label: 'Dukungan', value: 'Admin 24 Jam AMC' },
    ],
    useCases: [
      'Membangun kesan tepercaya pada Fanpage UMKM dan toko jasa lokal.',
      'Menambah interaksi awal pada unggahan katalog atau pengumuman acara.',
      'Mendukung perkembangan profil kreator Facebook Mode Profesional.',
    ],
    activationNotes: BUZZER_ACTIVATION_NOTES,
  },

  'buzzer-telegram': {
    name: 'Buzzer Telegram',
    shortName: 'Buzzer Telegram',
    heroImage: '/showcase/buzzer-social-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D grafik pertumbuhan dan cincin jangkauan untuk Buzzer Telegram',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'LAYANAN SOSMED 2026 • CHANNEL & GRUP TELEGRAM',
    tagline: 'Penambahan member channel, grup, dan views postingan Telegram cukup lewat link publik.',
    overview: [
      'Buzzer Telegram AMC membantu pengelola channel informasi, komunitas, dan grup penjualan membangun jumlah anggota serta tayangan pesan yang solid secara praktis.',
      'Cukup masukkan tautan channel atau grup publik tanpa perlu menyerahkan hak pemilik maupun kode login.',
    ],
    metadataServices: [
      'Member Channel & Grup',
      'Post Views Telegram',
      'Tanpa Login & Tanpa OTP',
      'Pemesanan Cepat 24 Jam',
    ],
    highlights2026: [
      {
        name: 'Aman Tanpa Kode OTP',
        tier: 'Cukup Link Channel',
        detail: 'Tidak pernah meminta nomor telepon pribadi, kode login, atau akses admin utama.',
      },
      {
        name: 'Channel & Grup Publik',
        tier: 'Komunitas & Bisnis',
        detail: 'Memperkuat daya tarik channel pengumuman, katalog promo, maupun komunitas minat.',
      },
      {
        name: 'Pilihan Paket Variatif',
        tier: 'order.amc.web.id/#buzzer',
        detail: 'Atur target penambahan member atau post views sesuai skala channel.',
      },
    ],
    specs: [
      { label: 'Syarat', value: 'Channel / Grup Publik' },
      { label: 'Keamanan', value: 'Tanpa OTP / Password' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#buzzer' },
      { label: 'Dukungan', value: 'Admin 24 Jam AMC' },
    ],
    useCases: [
      'Memperkuat angka anggota awal channel pengumuman brand atau komunitas baru.',
      'Meningkatkan jumlah pembaca (post views) pada pesan promosi penting.',
      'Menumbuhkan kepercayaan calon anggota baru saat membuka tautan undangan Telegram.',
    ],
    activationNotes: BUZZER_ACTIVATION_NOTES,
  },

  'buzzer-shopee': {
    name: 'Buzzer Shopee',
    shortName: 'Buzzer Shopee',
    heroImage: '/showcase/buzzer-social-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D grafik pertumbuhan toko dan jangkauan biru langit untuk Buzzer Shopee',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'LAYANAN MARKETPLACE 2026 • FOLLOWERS & FAVORIT TOKO',
    tagline: 'Tingkatkan pengikut toko dan interaksi produk Shopee untuk mendongkrak kepercayaan pembeli.',
    overview: [
      'Buzzer Shopee AMC membantu seller baru maupun toko berkembang membangun tampilan profil toko yang meyakinkan melalui layanan followers toko dan favorit produk cukup dengan tautan toko publik.',
      'Tanpa akses akun Seller Centre dan tanpa kata sandi sehingga operasional toko tetap aman sepenuhnya.',
    ],
    metadataServices: [
      'Followers Toko Shopee',
      'Likes / Favorit Produk',
      '100% Tanpa Password Seller',
      'Order Mudah via QRIS',
    ],
    highlights2026: [
      {
        name: 'Tanpa Akses Seller Centre',
        tier: 'Aman 100%',
        detail: 'Cukup kirim username atau tautan toko Shopee yang ingin ditingkatkan.',
      },
      {
        name: 'Perkuat Kepercayaan Pengunjung',
        tier: 'Dukungan Penjualan',
        detail: 'Toko dengan jumlah pengikut dan favorit produk solid lebih cepat meyakinkan calon pembeli baru.',
      },
      {
        name: 'Dukungan CS 24 Jam',
        tier: 'order.amc.web.id/#buzzer',
        detail: 'Cek variasi layanan Shopee dan konsultasikan kebutuhan kampanye toko kapan saja.',
      },
    ],
    specs: [
      { label: 'Syarat', value: 'Link Toko / Produk Aktif' },
      { label: 'Keamanan', value: 'Tanpa Login Seller' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#buzzer' },
      { label: 'Dukungan', value: 'Admin 24 Jam AMC' },
    ],
    useCases: [
      'Mempersiapkan profil toko baru sebelum menjalankan kampanye tanggal kembar.',
      'Meningkatkan angka favorit pada etalase produk unggulan.',
      'Membangun bukti sosial awal bagi pembeli yang membandingkan beberapa toko.',
    ],
    activationNotes: BUZZER_ACTIVATION_NOTES,
  },

  'game-mlbb': {
    name: 'Mobile Legends',
    shortName: 'Mobile Legends',
    heroImage: '/showcase/gaming-arena-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D kristal prisma arena esports biru langit untuk Top Up Diamond Mobile Legends',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'TOP UP INSTAN 2026 • DIAMOND & WEEKLY DIAMOND PASS',
    tagline: 'Top up Diamond MLBB dan Weekly Diamond Pass masuk 1 sampai 3 menit cukup pakai User ID & Zone ID.',
    overview: [
      'Top up Mobile Legends di Al Muthi Creative mendukung nominal Diamond harian, event promo 11.11, hingga Weekly Diamond Pass dan Starlight dengan pengiriman otomatis super cepat dalam 1 sampai 3 menit.',
      'Cukup masukkan User ID beserta Zone ID, bayar via QRIS, dan Diamond langsung masuk ke akun game tanpa perlu login.',
    ],
    metadataServices: [
      'Diamond Resmi & Legal',
      'Weekly Diamond Pass',
      'Proses Instan 1–3 Menit',
      'Cukup User ID + Zone ID',
    ],
    highlights2026: [
      {
        name: 'Proses Masuk 1 sampai 3 Menit',
        tier: 'Otomatis 24 Jam',
        detail: 'Langsung terisi begitu pembayaran QRIS terkonfirmasi tanpa menunggu jam kerja admin.',
      },
      {
        name: 'Nominal Lengkap & Weekly Pass',
        tier: 'Event & Harian',
        detail: 'Tersedia paket hemat dari nominal kecil sampai kebutuhan gacha skin kolektor dan promo 11.11.',
      },
      {
        name: '100% Tanpa Login Akun',
        tier: 'Aman',
        detail: 'Cukup masukkan User ID dan Zone ID tujuan secara tepat di Web Shop.',
      },
    ],
    specs: [
      { label: 'Data Tujuan', value: 'User ID + Zone ID' },
      { label: 'Estimasi Masuk', value: '1 sampai 3 Menit' },
      { label: 'Pembayaran', value: 'QRIS & Saldo AMC' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#game' },
    ],
    useCases: [
      'Mengisi Weekly Diamond Pass rutin untuk koleksi skin Starlight dan event bulanan.',
      'Top up cepat tengah malam saat promo skin terbatas sedang berlangsung.',
      'Hadiah top up Diamond langsung ke ID teman mabar tanpa perlu akses akun.',
    ],
    activationNotes: GAME_ACTIVATION_NOTES,
  },

  'game-roblox': {
    name: 'Roblox',
    shortName: 'Roblox',
    heroImage: '/showcase/gaming-arena-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D kristal prisma biru langit untuk Top Up Robux Roblox',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'TOP UP INSTAN 2026 • ROBUX & VOUCHER RESMI',
    tagline: 'Isi Robux untuk avatar, game pass, dan item eksklusif dengan pembayaran QRIS praktis.',
    overview: [
      'Top up Roblox melalui Al Muthi Creative memudahkan pemain Indonesia membeli Robux atau voucher resmi untuk membuka game pass, aksesori avatar, dan server pribadi tanpa kartu kredit.',
      'Cek nominal yang tersedia secara real-time di Web Shop order.amc.web.id dengan dukungan CS 24 jam.',
    ],
    metadataServices: [
      'Nominal Robux Beragam',
      'Bayar QRIS E-Wallet / Bank',
      'Proses Cepat & Transparan',
      'Admin Siaga 24 Jam',
    ],
    highlights2026: [
      {
        name: 'Mudah Tanpa Kartu Kredit',
        tier: 'QRIS Semua Bank & E-Wallet',
        detail: 'Selesaikan pembayaran lewat DANA, OVO, GoPay, ShopeePay, atau mobile banking dalam hitungan detik.',
      },
      {
        name: 'Beragam Pilihan Nominal',
        tier: 'order.amc.web.id/#game',
        detail: 'Tersedia paket hemat untuk kebutuhan avatar harian sampai upgrade game pass besar.',
      },
      {
        name: 'Bantuan CS Responsif',
        tier: '24 Jam',
        detail: 'Panduan klaim jelas jika memilih paket voucher atau pengisian langsung.',
      },
    ],
    specs: [
      { label: 'Produk', value: 'Robux / Gift Voucher' },
      { label: 'Pembayaran', value: 'QRIS & Saldo AMC' },
      { label: 'Estimasi', value: 'Cepat Setelah Bayar' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#game' },
    ],
    useCases: [
      'Membeli game pass, VIP server, dan item terbatas di berbagai map populer Roblox.',
      'Mengisi saldo avatar anak atau adik secara aman menggunakan nominal terukur.',
      'Transaksi praktis lewat QRIS tanpa perlu menautkan kartu pembayaran di perangkat.',
    ],
    activationNotes: GAME_ACTIVATION_NOTES,
  },

  'game-valorant': {
    name: 'Valorant',
    shortName: 'Valorant',
    heroImage: '/showcase/gaming-arena-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D kristal arena esports untuk Top Up Valorant Points',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'TOP UP INSTAN 2026 • VALORANT POINTS (VP) RIOT ID',
    tagline: 'Isi Valorant Points untuk Battle Pass, Night Market, dan bundle skin cukup dengan Riot ID.',
    overview: [
      'Top up Valorant Points (VP) di Al Muthi Creative masuk cepat ke akun Riot ID kamu dalam 1 sampai 3 menit sehingga kamu tidak ketinggalan rotasi harian toko skin, Night Market, maupun Battle Pass terbaru.',
      'Tanpa login akun Riot, cukup tulis Riot ID beserta tag (#) dengan benar saat checkout QRIS.',
    ],
    metadataServices: [
      'Valorant Points Resmi (VP)',
      'Cukup Riot ID#Tag',
      'Proses Instan 1–3 Menit',
      'Siap untuk Night Market & Bundle',
    ],
    highlights2026: [
      {
        name: 'Pengiriman Kilat 1–3 Menit',
        tier: 'Anti Ketinggalan Rotasi',
        detail: 'VP langsung masuk saat senjata incaran muncul di toko harian atau Night Market.',
      },
      {
        name: 'Tanpa Password Riot Account',
        tier: 'Cukup Riot ID',
        detail: 'Keamanan akun kompetitifmu tetap utuh karena tidak membutuhkan akses login.',
      },
      {
        name: 'Pilihan Nominal Lengkap',
        tier: 'order.amc.web.id/#game',
        detail: 'Dari paket pas untuk Battle Pass hingga jumlah besar untuk satu bundle koleksi penuh.',
      },
    ],
    specs: [
      { label: 'Data Tujuan', value: 'Riot ID (Nama#Tag)' },
      { label: 'Estimasi Masuk', value: '1 sampai 3 Menit' },
      { label: 'Pembayaran', value: 'QRIS & Saldo AMC' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#game' },
    ],
    useCases: [
      'Membuka Battle Pass episode terbaru dan mengumpulkan Radianite Points.',
      'Membeli skin senjata pilihan saat muncul di Night Market atau daily store.',
      'Isi VP cepat sebelum match malam bersama tim.',
    ],
    activationNotes: GAME_ACTIVATION_NOTES,
  },

  'game-freefire': {
    name: 'Free Fire',
    shortName: 'Free Fire',
    heroImage: '/showcase/gaming-arena-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D kristal prisma biru langit untuk Top Up Diamond Free Fire',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'TOP UP INSTAN 2026 • DIAMOND FF & MEMBERSHIP',
    tagline: 'Top up Diamond Free Fire dan Membership Mingguan/Bulanan instan cukup dengan Player ID.',
    overview: [
      'Isi Diamond Free Fire maupun Membership Mingguan/Bulanan di Al Muthi Creative dengan harga bersaing dan proses otomatis 1 sampai 3 menit langsung ke Player ID tujuan.',
      'Tersedia 24 jam penuh lewat checkout QRIS sehingga kamu bisa langsung mengikuti event Booyah Pass dan skin senjata kapan saja.',
    ],
    metadataServices: [
      'Diamond Free Fire Resmi',
      'Membership Mingguan & Bulanan',
      'Proses 1–3 Menit (24 Jam)',
      'Cukup Player ID',
    ],
    highlights2026: [
      {
        name: 'Masuk Cepat via Player ID',
        tier: '1–3 Menit',
        detail: 'Tidak memerlukan login akun Facebook, VK, atau Google.',
      },
      {
        name: 'Nominal Lengkap & Terjangkau',
        tier: 'order.amc.web.id/#game',
        detail: 'Dari nominal kecil untuk spin harian hingga paket besar untuk bundle eksklusif.',
      },
      {
        name: 'Tersedia 24 Jam Penuh',
        tier: 'QRIS Otomatis',
        detail: 'Order tengah malam tetap terproses otomatis dengan invoice resmi.',
      },
    ],
    specs: [
      { label: 'Data Tujuan', value: 'Player ID Free Fire' },
      { label: 'Estimasi Masuk', value: '1 sampai 3 Menit' },
      { label: 'Pembayaran', value: 'QRIS & Saldo AMC' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#game' },
    ],
    useCases: [
      'Membuka Booyah Pass bulanan dan hadiah event kolaborasi terbaru.',
      'Mengisi Membership Mingguan untuk panen Diamond rutin setiap hari.',
      'Top up kilat tanpa kartu kredit cukup pakai QRIS.',
    ],
    activationNotes: GAME_ACTIVATION_NOTES,
  },

  'game-pubg': {
    name: 'PUBG Mobile',
    shortName: 'PUBG Mobile',
    heroImage: '/showcase/gaming-arena-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D kristal prisma arena untuk Top Up UC PUBG Mobile',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'TOP UP INSTAN 2026 • UNKNOWN CASH (UC) RESMI',
    tagline: 'Top up UC PUBG Mobile legal masuk cepat ke Character ID untuk Royale Pass dan crate eksklusif.',
    overview: [
      'Top up Unknown Cash (UC) PUBG Mobile di Al Muthi Creative berjalan aman dan cepat cukup memakai Character ID, cocok untuk mengaktifkan Royale Pass musim terbaru serta berburu outfit pilihan.',
      'Proses instan 1 sampai 3 menit dengan pembayaran QRIS dan dukungan CS 24 jam.',
    ],
    metadataServices: [
      'UC Resmi & Legal',
      'Cocok untuk Royale Pass',
      'Cukup Character ID',
      'Proses Instan 1–3 Menit',
    ],
    highlights2026: [
      {
        name: 'Proses Otomatis 1–3 Menit',
        tier: 'Tanpa Login',
        detail: 'UC masuk langsung ke kotak surat / saldo game tanpa memerlukan akses akun.',
      },
      {
        name: 'Pilihan Paket Royale Pass',
        tier: 'order.amc.web.id/#game',
        detail: 'Nominal variatif mulai dari kebutuhan Elite Pass hingga paket crate besar.',
      },
      {
        name: 'Layanan 24 Jam Penuh',
        tier: 'Standar AMC',
        detail: 'Checkout praktis kapan pun dengan bukti transaksi yang jelas.',
      },
    ],
    specs: [
      { label: 'Data Tujuan', value: 'Character ID PUBG Mobile' },
      { label: 'Estimasi Masuk', value: '1 sampai 3 Menit' },
      { label: 'Pembayaran', value: 'QRIS & Saldo AMC' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#game' },
    ],
    useCases: [
      'Mengaktifkan Elite Royale Pass setiap pergantian musim PUBG Mobile.',
      'Mengikuti event spin senjata upgradeable dan kolaborasi terbatas.',
      'Isi saldo UC praktis lewat e-wallet atau mobile banking via QRIS.',
    ],
    activationNotes: GAME_ACTIVATION_NOTES,
  },

  'game-genshin': {
    name: 'Genshin Impact',
    shortName: 'Genshin Impact',
    heroImage: '/showcase/gaming-arena-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D kristal prisma biru langit untuk Top Up Genesis Crystals Genshin Impact',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'TOP UP INSTAN 2026 • GENESIS CRYSTALS & WELKIN MOON',
    tagline: 'Isi Blessing of the Welkin Moon dan Genesis Crystals aman cukup menggunakan UID & Server.',
    overview: [
      'Top up Genshin Impact di Al Muthi Creative mendukung pengisian Blessing of the Welkin Moon maupun Genesis Crystals resmi langsung melalui UID dan pilihan server (Asia, America, Europe, TW/HK/MO).',
      'Diproses cepat 1 sampai 3 menit via jalur resmi tanpa kata sandi akun HoYoverse sehingga akun petualanganmu tetap aman.',
    ],
    metadataServices: [
      'Blessing of the Welkin Moon',
      'Genesis Crystals Resmi',
      'Cukup UID + Server',
      'Proses 1–3 Menit Tanpa Login',
    ],
    highlights2026: [
      {
        name: 'Welkin Moon & Genesis Crystals',
        tier: 'Siap Gacha Banner',
        detail: 'Kumpulkan Primogem harian secara hemat atau siapkan Genesis Crystals untuk karakter bintang 5 incaran.',
      },
      {
        name: '100% Legal via UID & Server',
        tier: 'Aman Anti Minus',
        detail: 'Pengisian jalur resmi tanpa login akun HoYoverse.',
      },
      {
        name: 'Checkout QRIS 24 Jam',
        tier: 'order.amc.web.id/#game',
        detail: 'Langsung masuk saat banner karakter baru rilis di hari pertama.',
      },
    ],
    specs: [
      { label: 'Data Tujuan', value: 'UID + Pilihan Server' },
      { label: 'Estimasi Masuk', value: '1 sampai 3 Menit' },
      { label: 'Pembayaran', value: 'QRIS & Saldo AMC' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#game' },
    ],
    useCases: [
      'Memperpanjang Blessing of the Welkin Moon bulanan untuk tabungan Primogem.',
      'Menambah Genesis Crystals menjelang penutupan banner karakter atau senjata terbatas.',
      'Membeli kostum karakter resmi langsung dari toko dalam game.',
    ],
    activationNotes: GAME_ACTIVATION_NOTES,
  },

  'game-hok': {
    name: 'Honor of Kings',
    shortName: 'Honor of Kings',
    heroImage: '/showcase/gaming-arena-hero.webp',
    galleryImage: '/showcase/amc-ecosystem-gallery.webp',
    heroImageAlt: 'Visual 3D kristal prisma arena MOBA untuk Top Up Token Honor of Kings',
    galleryImageAlt: 'Visual 3D salib geometris kaca ekosistem AMC',
    updateTag: 'TOP UP INSTAN 2026 • HOK TOKENS & HONOR PASS',
    tagline: 'Isi Token Honor of Kings dan Weekly Card instan cukup dengan Player ID untuk skin & event 11.11.',
    overview: [
      'Top up Token Honor of Kings di Al Muthi Creative siap melayani kebutuhan Honor Pass, Weekly Card, dan diskon skin event November 2026 dengan pengiriman kilat 1 sampai 3 menit.',
      'Cukup masukkan Player ID yang tertera pada profil game dan selesaikan pembayaran QRIS tanpa login akun.',
    ],
    metadataServices: [
      'HOK Tokens Resmi',
      'Weekly Card & Honor Pass',
      'Cukup Player ID',
      'Proses Instan 1–3 Menit',
    ],
    highlights2026: [
      {
        name: 'Siap Event Skin & Promo 11.11',
        tier: 'Update Nov 2026',
        detail: 'Isi token cepat untuk mengamankan skin terbatas dan pembaruan Honor Pass terbaru.',
      },
      {
        name: 'Pengiriman Otomatis 1–3 Menit',
        tier: 'Cukup Player ID',
        detail: 'Token masuk langsung ke saldo akun tanpa berbagi kata sandi.',
      },
      {
        name: 'Pembayaran QRIS Praktis',
        tier: 'order.amc.web.id/#game',
        detail: 'Didukung seluruh e-wallet dan mobile banking Indonesia selama 24 jam.',
      },
    ],
    specs: [
      { label: 'Data Tujuan', value: 'Player ID Honor of Kings' },
      { label: 'Estimasi Masuk', value: '1 sampai 3 Menit' },
      { label: 'Pembayaran', value: 'QRIS & Saldo AMC' },
      { label: 'Katalog Live', value: 'order.amc.web.id/#game' },
    ],
    useCases: [
      'Mengaktifkan Honor Pass musiman dan Weekly Card untuk bonus token harian.',
      'Membeli skin kolaborasi dan diskon event terbatas tepat waktu.',
      'Top up cepat sebelum push rank bersama skuad.',
    ],
    activationNotes: GAME_ACTIVATION_NOTES,
  },
};

const featuredBySlug = new Map(products.featuredProducts.map((p) => [p.slug, p]));
const flashBySlug = new Map(products.flashSale.items.map((item) => [item.slug, item]));

const ALL_DETAILS: ProductDetail[] = products.allServices.map((svc, idx, arr) => {
  const featured = featuredBySlug.get(svc.slug);
  const flash = flashBySlug.get(svc.slug);
  const override = DETAIL_OVERRIDES[svc.slug];

  if (!override) {
    throw new Error(`Missing product detail override for slug "${svc.slug}"`);
  }

  const next = arr[(idx + 1) % arr.length];
  const prev = arr[(idx - 1 + arr.length) % arr.length];
  const displayName = override.name ?? featured?.name ?? svc.name;
  const botKeyword = encodeURIComponent(
    svc.slug.replace(/^game-|^buzzer-/, '')
  );

  return {
    slug: svc.slug,
    name: displayName,
    shortName: override.shortName ?? svc.name,
    category: svc.category,
    logo: svc.logo,
    orderHref: svc.href,
    waOrderHref: `https://wa.me/27748304118?text=${botKeyword}`,
    price: featured?.price ?? null,
    duration: featured?.duration ?? null,
    badge: featured?.badge ?? null,
    flashSale: flash
      ? {
          duration: flash.duration,
          originalPrice: flash.originalPrice,
          promoPrice: flash.promoPrice,
          stockLeft: flash.stockLeft,
          stockTotal: flash.stockTotal,
        }
      : null,
    heroImage: override.heroImage,
    galleryImage: override.galleryImage,
    heroImageAlt: override.heroImageAlt,
    galleryImageAlt: override.galleryImageAlt,
    updateTag: override.updateTag,
    tagline: override.tagline,
    overview: override.overview,
    metadataServices: override.metadataServices,
    highlights2026: override.highlights2026,
    specs: override.specs,
    useCases: override.useCases,
    activationNotes: override.activationNotes,
    nextSlug: next.slug,
    prevSlug: prev.slug,
  };
});

const DETAIL_BY_SLUG = new Map(ALL_DETAILS.map((item) => [item.slug, item]));

export function getAllProductDetails(): ProductDetail[] {
  return ALL_DETAILS;
}

export function getProductDetailBySlug(slug: string): ProductDetail | undefined {
  return DETAIL_BY_SLUG.get(slug);
}
