# Al Muthi Creative (`amc.web.id`) — AMC × Lusion Spatial Scroll Landing Page

Rebuild halaman depan `amc.web.id` dengan koreografi *spatial storytelling* satu halaman panjang ala `lusion.co`, diadaptasi penuh ke identitas terang **Putih & Sky Blue Al Muthi Creative (AMC)** dan katalog produk digital resmi `https://order.amc.web.id`.

## Model & Disiplin Kerja (Bagian 0.A & 0.B)

- **Lingkungan & Model Agent:** Dikerjakan di **Google Antigravity** dengan mode penalaran penuh (*high thinking effort*). Seluruh kode lama telah dibaca penuh sebelum penulisan kode baru.
- **Framework Skill:** Mengikuti alur `obra/superpowers` (`brainstorming` → isolasi Git & tag backup `landing-lama-v1` → `writing-plans` → `test-driven-development` → `verification-before-completion`) dan `antislop` mode `during`.

## Hasil Verifikasi Terukur (Milestone F)

- **Lighthouse Mobile CLI (`scripts/run-lighthouse.mjs`, standard headless Chrome, Slow 4G + 4x CPU slowdown):**
  - **Performance:** `93 / 100` (target `≥ 85`)
  - **Accessibility:** `100 / 100`
  - **Best Practices:** `100 / 100`
  - **SEO:** `100 / 100`
  - **LCP:** `1.80s` (target `< 2.5s`)
  - **CLS:** `0.0004` (target `< 0.1`)
  - **TBT:** `305ms`
  - *Catatan metodologi:* Pengukuran dilakukan di VM Linux tanpa GPU menggunakan flag headless Chrome standar (`--headless=new --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage`).
- **Ukuran Bundel JS (Gzip):**
  - **Bundel Interaksi Awal (`gsap` + `ScrollTrigger` + `Lenis` + UI):** `58.49 KB gzip`
  - **Bundel Three.js (Lazy-Loaded asinkron):** `129.46 KB gzip`
  - **Total Seluruh JS Situs:** `195.60 KB gzip` (jauh di bawah batas `< 300 KB gzip`)
- **Otomasi Pengujian:** `tsc --noEmit` (0 error), `7/7` halaman Astro statis (`/`, `/produk/`, `/kategori/`, `/flash-sale/`, `/cara-order/`, `/faq/`, `/kontak/`), `7/7` file Vitest (`26/26` unit & anti-slop tests), dan `4/4` skenario penuh Playwright E2E lulus tanpa error console.

## Stack Teknis

- **Astro 5 (Static Output)** — HTML statis murni tanpa runtime framework UI di browser (`dist/`), dengan CSS utama ter-inline otomatis untuk memangkas *round-trip* di jaringan seluler.
- **Tailwind CSS v3** + CSS Variables resmi AMC (`src/styles/global.css`).
- **GSAP 3 + ScrollTrigger** — Pinning `300vh`, garis motif biru `scrub: 1`, split-text per kata, dan pergantian latar tajam antar-dunia.
- **Lenis (`lerp: 0.09`)** — Smooth scroll berbobot sinematik di desktop yang tersinkron langsung ke `gsap.ticker`.
- **Three.js (Lazy-Loaded)** + **Canvas 2D Fallback** — Hero 3D glossy crosses/orbs interaktif dan sekuens terowongan cahaya `300vh` yang *reversible* saat di-scroll maju maupun mundur.
- **Vitest + Playwright + Lighthouse CLI** — Pengujian unit TDD, uji klik penuh E2E (`R-35`), regresi visual Desktop/Mobile, dan audit performa mobile.

## Cara Menjalankan & Build Lokal

```bash
npm install
npm run dev                        # Server pengembangan lokal
npm test                           # Jalankan 23 unit test Vitest (data, kontras WCAG AA, countdown, fase 3D)
npm run build                      # Build produksi statis ke folder dist/
npm run test:e2e                   # Jalankan verifikasi penuh Playwright E2E
node scripts/run-lighthouse.mjs    # Audit Lighthouse Mobile otomatis
```

## Konfigurasi Deploy Cloudflare Pages (`lexyth-kun/amc`)

Repo ini sudah mendukung **dua mode deploy Cloudflare Pages** sekaligus:

1. **Mode Langsung Tanpa Ubah Pengaturan (Static Root `/`):** Hasil build statis (`index.html`, `_astro/`, `_redirects`, `order/index.html`, dan seluruh aset logo) telah disalin langsung ke root repo, sehingga deploy Cloudflare Pages lama tanpa build command tetap langsung menampilkan landing page baru.
2. **Mode Rekomendasi untuk Edit Berikutnya (Astro Auto-Build):** Agar perubahan pada `src/data/products.json` atau `src/data/content.json` otomatis ter-build oleh Cloudflare Pages tanpa perlu menyalin ulang ke root, set konfigurasi proyek menjadi:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `22` (atau `>= 20`)

Seluruh aturan redirect `/order` dan `/order/*` menuju `https://order.amc.web.id` tetap aktif di root (`_redirects`, `order/index.html`) maupun di dalam `dist/` serta diperkuat skrip instan di `<head>`.

## Cara Mengubah Harga, Stok & Teks (Single Source of Truth)

- **Harga, Featured Products, Flash Sale & Kategori:** edit `src/data/products.json`.
- **Headline, Cara Order, FAQ, S&K Garansi, Testimoni & Kontak:** edit `src/data/content.json`.
  - *Catatan Testimoni:* Saat ini 3 kartu ulasan memakai label jujur `[MENUNGGU ULASAN ASLI PELANGGAN #1..#3]` agar bebas dari ulasan karangan (`antislop` R-18). Ganti field `author`, `product`, `quote`, dan ubah `"isPlaceholder": false` setelah memilih 3 ulasan asli dari `order.amc.web.id`.

## Prosedur Rollback Cepat (< 5 Menit)

Kondisi landing page lama sebelum redesign telah diamankan pada Git tag `landing-lama-v1`:

```bash
# Opsi 1: Revert merge commit di main
git revert -m 1 <sha-merge-commit>
git push origin main

# Opsi 2: Kembalikan ke tag landing-lama-v1
git checkout landing-lama-v1
```

## Catatan Transparansi Adaptasi dari Referensi `lusion.co`

1. **Palet & Pencahayaan Panggung:** Mengganti atmosfer gelap Lusion menjadi 90% Putih & Sky Blue (`#FFFFFF`, `#F4F8FF`, `#EAF3FF`), dengan satu momen gelap sengaja (`#061A3A`) pada sekuens terowongan `300vh` agar ledakan keluar ke layar putih terasa kontras seperti berpindah dunia.
2. **Tipografi Legal & Gratis:** Mengganti font berbayar `Aeonik` milik Lusion dengan pasangan Google Fonts `Plus Jakarta Sans` ExtraBold + `Inter` (`font-display: swap`).
3. **Geometri Sekuens 300vh:** Mengganti model karakter astronot kompleks milik Lusion dengan **Inti Cahaya Orb AMC + Terowongan Cincin Perspektif Sky Blue + Sprite Squircle Logo Produk AMC** yang ringan di perangkat mobile (partikel dipangkas 50% pada layar kecil/memori rendah) dan dilengkapi fallback Canvas 2D penuh.
4. **Form Newsletter v1:** Sesuai spesifikasi v1 tanpa backend, form memvalidasi input kosong/format email, menyimpan minat secara lokal di browser, serta menampilkan konfirmasi jujur bahwa buletin email segera aktif disertai pintasan ke `@almuthi_creative` & WhatsApp Admin.
