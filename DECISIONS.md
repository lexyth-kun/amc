# DECISIONS.md — Catatan Keputusan Desain & Teknis (`amc.web.id`)

Dokumen ini mencatat seluruh keputusan arsitektur, desain, kontras warna, serta rekonsiliasi Anti-Slop pada proyek rebuild landing page `amc.web.id` (AMC × Lusion Spatial Scroll).

## 1. Lingkungan & Model Eksekusi (Bagian 0.A)
- **Keputusan:** Proyek dikerjakan di Google Antigravity dengan mode penalaran penuh (*high thinking effort*) dan urutan disiplin `obra/superpowers` (`brainstorming` → `using-git-worktrees`/isolasi branch → `writing-plans` → `test-driven-development` → `verification-before-completion`) serta `antislop` mode `during`.
- **Alasan:** Menjamin seluruh codebase lama dibaca penuh sebelum menulis kode, spesifikasi disepakati di muka oleh pemilik (Charles), dan setiap milestone terverifikasi otomatis maupun visual.

## 2. Stack Teknis & Konfigurasi Cloudflare Pages (Bagian 4 & 8.B)
- **Keputusan:** Memilih **Astro 5 (Static Output)** + **Tailwind CSS v3** + **Vanilla TypeScript** + **GSAP 3 / ScrollTrigger** + **Lenis** (`lerp: 0.09`) + **Three.js** (*lazy-loaded* via dynamic `import()`).
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
- **Keputusan:** Membuat `public/logo-claude.svg` dan `public/logo-adobe-express.svg` secara lokal karena kedua file tersebut belum tersedia di antara 28 logo di root repo lama, serta mengonversi aset logo berukuran besar (seperti `logo-amc.png` 495 KB) ke varian `.webp` ringan dengan tetap menyimpan file asli di `public/`.
- **Alasan:** Mencegah *hotlinking* eksternal (dilarang di Bagian 3.3) sekaligus memastikan LCP mobile < 2.5 detik.

## 6. Form Newsletter v1 Tanpa Backend (`R-26`, `R-38` & Bagian 5.13)
- **Keputusan:** Form newsletter di Menu Overlay dan Footer memvalidasi input kosong/email tidak valid, menyimpan email secara lokal di `localStorage` dengan penanda `// TODO(v2)` di kode sumber, serta menampilkan pesan jujur bahwa fitur buletin email segera aktif disertai pintasan ke `@almuthi_creative` & WhatsApp Admin.
- **Alasan:** Memenuhi permintaan v1 tanpa backend di Bagian 5.13 tanpa menipu pengunjung bahwa email mereka sudah masuk ke server mailing list aktif (`antislop` R-26 & R-38).
