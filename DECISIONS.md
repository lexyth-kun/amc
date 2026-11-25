# DECISIONS.md — Catatan Keputusan Desain & Teknis (`amc.web.id`)

Dokumen ini mencatat seluruh keputusan arsitektur, desain, kontras warna, performa, serta rekonsiliasi Anti-Slop pada proyek rebuild landing page `amc.web.id` (AMC × Lusion Spatial Scroll).

## 1. Lingkungan & Model Eksekusi (Bagian 0.A)
- **Keputusan:** Proyek dikerjakan di Google Antigravity dengan mode penalaran penuh (*high thinking effort*) dan urutan disiplin `obra/superpowers` (`brainstorming` → isolasi Git & tag backup `landing-lama-v1` → `writing-plans` → `test-driven-development` → `verification-before-completion`) serta `antislop` mode `during`.
- **Alasan:** Menjamin seluruh codebase lama dibaca penuh sebelum menulis kode, spesifikasi disepakati di muka oleh pemilik (Charles), dan setiap milestone terverifikasi otomatis maupun visual.

## 2. Stack Teknis & Konfigurasi Cloudflare Pages (Bagian 4 & 8.B)
- **Keputusan:** Memilih **Astro 5 (Static Output, `inlineStylesheets: 'always'`)** + **Tailwind CSS v3** + **Vanilla TypeScript** + **GSAP 3 / ScrollTrigger** + **Lenis** (`lerp: 0.09`) + **Three.js** (*lazy-loaded* via dynamic `import()`).
- **Alternatif yang ditolak:**
  - *Next.js Static Export:* Membawa runtime React (~90 KB gzip) yang tidak diperlukan untuk landing page marketing statis dan memperberat TBT di perangkat mobile.
  - *Single HTML Monolitik:* Menyulitkan pengujian unit TDD per modul dan pemeliharaan jangka panjang.
- **Catatan Deploy:** Di Cloudflare Pages, pastikan *Build Command* diset ke `npm run build` dan *Build Output Directory* diset ke `dist`. Redirect `/order` dan `/order/*` tetap dijaga identik melalui `public/_redirects`, `public/order/index.html`, dan skrip instan di `<head>`.

## 3. Rekonsiliasi Kontras Warna WCAG AA (`antislop` R-25 & Bagian 3.1)
- **Keputusan:** Mempertahankan seluruh 13 token warna resmi AMC dari Prompt v4, dan menambahkan pasangan warna teks pendamping aman-AA (`--sky-ink: #0369A1`, `--sale-ink: #D92D20`, `--wa-ink: #052E16`, serta kartu putih di dalam section Flash Sale).
- **Alasan:** Perhitungan luminansi WCAG 2.x menunjukkan teks kecil `#0EA5E9` di atas `#FFFFFF` hanya `2.77:1` (gagal AA `4.5:1`), teks putih di atas `#25D366` hanya `1.98:1` (gagal AA), dan teks putih di atas `#38BDF8` hanya `2.14:1`. Dengan pasangan warna teks pendamping ini, nuansa Putih + Sky Blue AMC tetap 100% terjaga sekaligus lulus audit kontras WCAG AA (`>= 4.5:1`).

## 4. Aturan Copywriting, Em Dash (`R-02`), Ikon (`R-04`), & Testimoni Jujur (`R-18`)
- **Keputusan:**
  - Mengganti seluruh karakter em dash (`—`) di teks antarmuka menjadi koma (`,`), titik dua (`:`), atau titik (`.`) sesuai persetujuan pemilik untuk mematuhi `antislop` R-02.
  - Mempertahankan simbol `⚡` pada judul `"⚡ FLASH SALE 11.11"` dan `♥` pada footer `"Dibuat dengan ♥ di Indonesia"` sebagai arahan eksplisit pemilik di Prompt v4 (`R-37` owner override), sementara seluruh ikon antarmuka lain dibuat menggunakan inline SVG kustom.
  - Menampilkan 3 slot testimoni menggunakan label placeholder jujur `[MENUNGGU ULASAN ASLI PELANGGAN #1..#3]` di `src/data/content.json` sampai pemilik mengirimkan 3 kutipan ulasan pelanggan asli, demi mematuhi larangan keras mengarang ulasan (`R-18`, `R-38`, Bagian B.4).

## 5. Aset Logo Lokal (`Claude` & `Adobe Express`) & Optimasi Gambar WebP (Bagian 3.3 & 7)
- **Keputusan:** Membuat `public/logo-claude.svg` dan `public/logo-adobe-express.svg` secara lokal karena kedua file tersebut belum tersedia di antara 28 logo di root repo lama, serta mengonversi aset logo berukuran besar (seperti `logo-amc.png` 495 KB → `logo-amc.webp` 7.9 KB) ke varian `.webp` ringan dengan tetap menyimpan file asli di `public/`.
- **Alasan:** Mencegah *hotlinking* eksternal (dilarang di Bagian 3.3) sekaligus memastikan LCP mobile < 2.5 detik.

## 6. Form Newsletter v1 Tanpa Backend (`R-26`, `R-38` & Bagian 5.13)
- **Keputusan:** Form newsletter di Menu Overlay dan Footer memvalidasi input kosong/email tidak valid, menyimpan email secara lokal di `localStorage` dengan penanda `// TODO(v2)` di kode sumber, serta menampilkan pesan jujur bahwa fitur buletin email segera aktif disertai pintasan ke `@almuthi_creative` & WhatsApp Admin.
- **Alasan:** Memenuhi permintaan v1 tanpa backend di Bagian 5.13 tanpa menipu pengunjung bahwa email mereka sudah masuk ke server mailing list aktif (`antislop` R-26 & R-38).

## 7. Optimasi Performa Mobile Lighthouse ≥ 85 & LCP < 2.5s (Bagian 7 & R-40)
- **Keputusan:**
  - Menginlining CSS utama (~8 KB gzip) ke dalam `<head>` (`inlineStylesheets: 'always'`) dan menjalankan animasi Preloader `0 → 100` + FLIP logo langsung saat parse HTML tanpa menunggu unduhan bundel JS eksternal.
  - Di layar mobile `< 768px`, Hero merender bentuk plus 3D ber-bevel lewat renderer Canvas 2D tanpa `shadowBlur` agar bebas kompilasi shader berat saat boot; di layar desktop, Hero merender adegan Three.js penuh (`MeshPhysicalMaterial` di GPU perangkat keras, atau `MeshPhongMaterial` + throttle interval di software rasterizer agar main thread tetap responsif), sementara Sekuens Terowongan `300vh` hanya dimuat via `IntersectionObserver` saat mendekati section `#dunia-baru`.
- **Hasil Terukur (Lighthouse Mobile CLI, `scripts/run-lighthouse.mjs`):**
  - **Standard Headless Chrome (`--headless=new --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage`):** Performance **97/100**, Accessibility **100/100**, Best Practices **100/100**, SEO **100/100**, LCP **1.76s**, CLS **0.0222**, TBT **194ms**, bundel JS awal **57.99 KB gzip** (total seluruh JS termasuk lazy Three.js: **194.10 KB gzip**).
  - **Catatan Metodologi (Transparansi):** Pada lingkungan VM tanpa GPU ini, jika flag software GPU `--use-gl=angle --use-angle=swiftshader` dipaksakan ke Lighthouse mobile, skor turun ke Performance **63/100** (LCP **2.74s**, TBT **1629ms**, A11y/BP/SEO tetap **100/100**) akibat cold-start stall compositor SwiftShader Vulkan (~1.3 detik unattributable pada VM CPU-only), bukan dari JS aplikasi. Verifikasi ulang di perangkat nyata / PageSpeed Insights pasca-deploy ke Cloudflare Pages tetap disarankan.

## 8. Revisi v2 Sesuai Masukan Pemilik (Sky Blue `order.amc.web.id`, Logo Resmi, Terowongan 41 Layanan, Ulasan, WA Opt-In, Multi-Halaman)
- **Keputusan:**
  1. **Palet Sky Blue Identik `order.amc.web.id`:** Seluruh biru cobalt `#1A36FF`/`#233DFF`/`#0B1B4D` diganti total ke skala Sky Blue resmi `order.amc.web.id` (`--sky-light: #7DD3FC`, `--sky: #38BDF8`, `--sky-deep: #0EA5E9`, `--amc: #0284C7`, `--amc-2: #0369A1`, `--navy: #0C4A6E`, `--bg-alt: #F0F9FF`, `--bg-deep: #E0F2FE`, `--bg-space: #082F49`, `--line: #BAE6FD`). CTA primer memakai gradien resmi `--brand-gradient` (`#7DD3FC → #38BDF8`) dengan teks `#082F49` (kontras WCAG AA/AAA `6.48:1`–`8.32:1`).
  2. **Logo Resmi Asli di Atas Latar Putih Murni (`#FFFFFF`):** Mengganti seluruh ikon biru monokrom lama dengan 36 vektor SVG resmi masing-masing platform di `public/logos/*.svg` (ditambah 5 ikon game resmi penuh warna) berlatar dasar `#FFFFFF`.
  3. **Sekuens `"Masuk ke dunia baru."` Diperpanjang (`+=620%`) + 41 Layanan:** Jarak pin scroll digandakan menjadi `+=620%` (`scrub: 1.6`) dengan seluruh 41 layanan AMC tampil baik sebagai sprite 3D di terowongan maupun dek kategori tersinkronisasi (6 kategori, 100% *reversible*).
  4. **Portal Ulasan Langsung ke `https://order.amc.web.id/#ulasan`:** Menghapus kartu placeholder testimoni dan menggantinya dengan ringkasan rating terverifikasi (`4.8/5` dari `1.266 ulasan`) yang langsung membuka ulasan live pembeli di `https://order.amc.web.id/#ulasan`.
  5. **Form Info Promo & Stok Baru Khusus Nomor Telepon / WhatsApp:** Mengganti input email menjadi `type="tel"` dengan validasi nomor Indonesia/internasional, penyimpanan lokal, serta tombol konfirmasi 1-klik ke WhatsApp Admin (`+62 851-1712-0101`).
  6. **Navbar Multi-Halaman (7 Rute Astro Statis):** Setiap tautan navbar membuka halaman dedikasi nyata (`/produk/`, `/kategori/`, `/flash-sale/`, `/cara-order/`, `/faq/`, `/kontak/`) dengan tirai transisi halaman Sky Blue, indikator `aria-current="page"`, serta cerminan statis ke root repo agar kompatibel 100% pada Cloudflare Pages baik mode root statis `/` maupun build Astro `dist/`.
- **Hasil Terukur Pasca-Revisi v2:** `tsc --noEmit` 0 error, `7/7` halaman ter-build (`58.49 KB gzip` JS awal / `195.60 KB gzip` total), `26/26` Vitest lulus, `4/4` Playwright E2E lulus, Lighthouse Mobile standard headless Performance **93/100**, Accessibility **100/100**, Best Practices **100/100**, SEO **100/100**, LCP **1.80s**, CLS **0.0004**, TBT **305ms**.


