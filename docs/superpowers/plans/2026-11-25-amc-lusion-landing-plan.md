# AMC × Lusion Spatial Scroll Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `amc.web.id` front landing page into a 60fps Lusion-inspired spatial storytelling scroll experience using AMC's bright White & Sky Blue design system, verified store data, Three.js WebGL + Canvas 2D fallbacks, and strict Anti-Slop compliance.

**Architecture:** Pure static Astro 5 build (`dist/`) styled with Tailwind CSS v3 and custom CSS tokens, driven by two single-source-of-truth JSON files (`src/data/products.json` and `src/data/content.json`). Client motion uses a single unified `Lenis` (`lerp: 0.09`) + `GSAP 3 / ScrollTrigger` ticker, while `Three.js` scenes (Hero floating crosses/orbs and the 300vh reversible dark-space product tunnel) are dynamically imported after preloader completion with automatic Canvas 2D fallbacks and `prefers-reduced-motion` static bypass.

**Tech Stack:** Astro 5 (static), Tailwind CSS 3, TypeScript, GSAP 3 + ScrollTrigger, Lenis 1.x, Three.js r170+, Vitest + JSDOM, Playwright + Chromium, Lighthouse CLI.

**Spec:** `docs/superpowers/specs/2026-11-25-amc-lusion-landing-design.md`

## Global Constraints

- Work strictly on branch `redesign/landing-lusion-style` in `lexyth-kun/amc`; never commit to or merge into `main` without explicit owner approval; preserve rollback tag `landing-lama-v1`.
- Zero touches to external store `https://order.amc.web.id`; preserve `/order` and `/order/*` redirects (`public/_redirects`, `public/order/index.html`, and inline `<head>` redirect).
- Zero em dashes (`—`) in any user-facing string (`antislop` R-02).
- Zero forbidden portfolio words (`project`, `projects`, `portofolio`, `klien studio`, `case study`) anywhere on the rendered page.
- Zero fabricated numbers, prices, or testimonials (`antislop` R-17, R-18, R-36, R-38); all prices/stocks live exclusively in `src/data/products.json`, all copy/stats live in `src/data/content.json`.
- WCAG AA contrast >= 4.5:1 for normal text and >= 3.0:1 for large text (`antislop` R-25); glassmorphism capped at 1 element (scrolled sticky header, `R-10`).
- Initial JS bundle < 300 KB gzip; Three.js lazy-loaded asynchronously after preloader; Lighthouse Mobile Performance >= 85, LCP < 2.5s, CLS < 0.1, zero console errors.
- Full keyboard navigation (`Tab`, `Enter`, `Escape`), visible `:focus-visible`, base `cursor: pointer` on enabled controls, pause controls on continuous >5s animations (`R-39`), and complete `prefers-reduced-motion: reduce` support.

## Review Focus

1. **Headless / GPU-blocked or older mobile browsers without WebGL:** `HTMLCanvasElement.getContext('webgl2')` / `THREE.WebGLRenderer` throws or returns null -> must seamlessly mount Canvas 2D fallback in both Hero (§5.2) and 300vh Cinematic Tunnel (§5.8) with zero uncaught errors and zero blank screens.
2. **Flash Sale countdown past `2026-11-30T23:59:00+07:00` or invalid clock skew:** Countdown helper must clamp negative deltas to `00 : 00 : 00 : 00` and expose `isExpired: true` so the UI displays an honest ended state instead of `NaN` or `-1` days.
3. **Mobile narrow viewport (`390px` width) during pinned/horizontal-marquee/2-column Flash Sale sections:** Long Indonesian words, marquee tracks, or 3D-tilted cards must never trigger `document.documentElement.scrollWidth > window.innerWidth` horizontal overflow.
4. **Users with `prefers-reduced-motion: reduce` enabled:** Preloader must not trap the screen (`opacity: 0` / instant dismiss), Lenis & 300vh ScrollTrigger pin must be bypassed, and split-text words must be immediately readable (`opacity: 1`, `transform: none`).
5. **Legacy `/order` deep links (`/order#aplikasi/chatgpt` or `/order/foo?ref=ig`):** Redirect logic in `<head>` and `public/order/index.html` must preserve path suffix, query string, and hash cleanly when redirecting to `https://order.amc.web.id/`.

---

## File Structure Map

- `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`
- `DECISIONS.md`, `README.md`, `PROMPT-v4.md`
- `public/`: all 28 existing brand/product logos, `logo-claude.svg`, `logo-adobe-express.svg`, `_redirects`, `order/index.html`, `robots.txt`
- `src/types/site.ts`: strict TypeScript interfaces for `ProductsData` and `ContentData`
- `src/data/products.json`: 9 featured products, 6 flash sale items + `endsAt`, 5 service categories
- `src/data/content.json`: hero, intro, showreel, how-to-order, benefits, honest testimonial slots, 6 real FAQs, 6 real T&C/Garansi items, CTA, footer, contacts
- `src/utils/format.ts`: IDR currency formatting (`Rp190.000`), stock percentage clamping, `/order` URL builder
- `src/utils/countdown.ts`: timezone-accurate WIB countdown calculator with expiry clamping
- `src/utils/contrast.ts`: WCAG 2.x relative luminance & contrast ratio calculator
- `src/utils/webgl-support.ts`: safe WebGL availability detector + mobile/low-memory particle scaler
- `src/styles/global.css`: AMC CSS custom properties, typography rules, reduced-motion overrides, focus-visible & pointer-cursor base layer
- `src/layouts/BaseLayout.astro`: HTML5 shell (`lang="id"`), `/order` instant redirect, Google Fonts (`Plus Jakarta Sans` + `Inter`), Open Graph & JSON-LD structured data, custom desktop cursor, skip link
- `src/components/`:
  - `Preloader.astro`, `Header.astro`, `MenuOverlay.astro`, `PageTransition.astro`, `BlueLine.astro`
  - `HeroSection.astro`, `IntroSection.astro`, `ShowreelSection.astro`, `FeaturedProductsSection.astro`
  - `CategoriesSection.astro`, `FlashSaleSection.astro`, `CinematicSequenceSection.astro`
  - `HowToOrderSection.astro`, `BenefitsSection.astro`, `TestimonialsSection.astro`, `FaqSection.astro`
  - `FinalCtaSection.astro`, `FooterSection.astro`
- `src/scripts/`:
  - `motion-core.ts`: Lenis (`lerp: 0.09`) + GSAP ScrollTrigger sync, split-text helper, background world-shift triggers, reduced-motion guard
  - `preloader.ts`: `0 -> 100` counter (< 1.8s), FLIP logo flight to header, curtain slide reveal
  - `page-transition.ts`: reusable AMC blue curtain wipe (`runPageTransition`)
  - `header-menu.ts`: sticky header shrink (`88px -> 64px`), accessible Menu Overlay stagger + Escape/focus management
  - `hero-scene.ts`: lazy-loaded Three.js glossy 3D crosses & orbs (mouse rotation, raycast click color-cycle, IntersectionObserver/visibility pause) + `hero-fallback-2d.ts`
  - `cinematic-tunnel.ts`: lazy-loaded 300vh ScrollTrigger-scrubbed 4-phase Three.js orb + sky-blue light tunnel + AMC logo sprites + `cinematic-fallback-2d.ts`
  - `ui-interactions.ts`: 3D card tilt (`±8°`), showreel 4-step modal player, live countdown ticker, WA bot step previewer, tabular counters, swipeable/pausable testimonial carousel, FAQ accordion & Garansi modal, magnetic CTA buttons, v1 newsletter form states
- `src/pages/index.astro`: orchestrates all sections in exact Lusion-mapped sequence
- `tests/unit/`:
  - `data-antislop.test.ts`
  - `contrast-wcag.test.ts`
  - `countdown-format.test.ts`
  - `webgl-fallback.test.ts`
- `tests/e2e/`:
  - `landing.spec.ts` (milestone-by-milestone DOM, interaction click-through `R-35`, mobile overflow, reduced-motion, and `screenshots/` capture)

---

### Milestone A: Workspace Cleanup, Astro/Test Foundation, Data Truth, Preloader, Header/Menu & Hero WebGL

**Files:**
- Archive legacy static root files safely via git history (tag `landing-lama-v1` already pushed) and move static assets (`logo-*`, `_redirects`, `order/index.html`) into `public/`
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `DECISIONS.md`
- Create: `public/logo-claude.svg`, `public/logo-adobe-express.svg`
- Create: `src/types/site.ts`, `src/data/products.json`, `src/data/content.json`, `src/utils/format.ts`, `src/utils/contrast.ts`, `src/utils/webgl-support.ts`
- Create: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Preloader.astro`, `src/components/Header.astro`, `src/components/MenuOverlay.astro`, `src/components/PageTransition.astro`, `src/components/HeroSection.astro`
- Create: `src/scripts/motion-core.ts`, `src/scripts/preloader.ts`, `src/scripts/page-transition.ts`, `src/scripts/header-menu.ts`, `src/scripts/hero-scene.ts`, `src/scripts/hero-fallback-2d.ts`
- Create: `tests/unit/data-antislop.test.ts`, `tests/unit/contrast-wcag.test.ts`, `tests/unit/webgl-fallback.test.ts`

- [ ] **Step 1: Scaffold Astro/Vitest/Playwright config & write failing unit tests (`RED`)**
  - Write `tests/unit/data-antislop.test.ts`, `tests/unit/contrast-wcag.test.ts`, and `tests/unit/webgl-fallback.test.ts` testing:
    - All 9 featured products & 6 flash sale items match verified prices/slugs
    - Zero em dashes (`—`) and zero forbidden portfolio terms (`project`, `portofolio`, `klien studio`, `case study`) across `products.json` and `content.json`
    - All AMC text/background color pairs pass WCAG AA (`>= 4.5:1` normal, `>= 3.0:1` large)
    - WebGL detector cleanly selects Canvas 2D fallback when WebGL context is unavailable and reduces particle count by 40-50% on mobile viewports
    - `/order` redirect resolver preserves path, query, and hash
  - Run `npx vitest run` -> verify `RED` (modules do not exist yet).
- [ ] **Step 2: Implement data JSONs, utility modules, SVG logos, and Milestone A components (`GREEN`)**
  - Create `products.json`, `content.json`, `format.ts`, `contrast.ts`, `webgl-support.ts`, `logo-claude.svg`, `logo-adobe-express.svg`.
  - Implement `BaseLayout.astro`, `Preloader.astro`, `Header.astro`, `MenuOverlay.astro`, `PageTransition.astro`, `HeroSection.astro`, and their client scripts (`preloader.ts`, `header-menu.ts`, `page-transition.ts`, `hero-scene.ts`, `hero-fallback-2d.ts`).
- [ ] **Step 3: Verify unit tests, Astro build, Playwright Desktop/Mobile screenshots & commit Milestone A**
  - Run `npx vitest run` (expect 0 failures) and `npm run build` (expect exit 0).
  - Capture `screenshots/milestone-a-desktop.png` (`1440×900`) & `screenshots/milestone-a-mobile.png` (`390×844`), inspect visually, commit `feat(landing): milestone A preloader, sticky header, menu overlay, and interactive WebGL hero`, and push to `origin redesign/landing-lusion-style`.

---

### Milestone B: Scrub Blue Line, Editorial Intro, Showreel Modal & 9 Featured Products (3D Tilt)

**Files:**
- Create: `src/components/BlueLine.astro`, `src/components/IntroSection.astro`, `src/components/ShowreelSection.astro`, `src/components/FeaturedProductsSection.astro`
- Modify: `src/scripts/ui-interactions.ts`, `src/scripts/motion-core.ts`, `src/pages/index.astro`
- Test: `tests/unit/cards-reel.test.ts`

- [ ] **Step 1: Write failing tests for 3D tilt clamping, showreel step cycling, and Featured Products DOM/links (`RED`)**
  - Verify `computeCardTilt` clamps `rotateX`/`rotateY` strictly within `[-8, 8]` degrees and resets to `0` on leave.
  - Verify all 9 product cards build exact `https://order.amc.web.id/#aplikasi/<slug>` links with non-hardcoded formatted prices.
  - Run `npx vitest run` -> verify `RED`.
- [ ] **Step 2: Implement `BlueLine`, `IntroSection`, `ShowreelSection` (with accessible 4-step autoplay/pause modal + ticker), and `FeaturedProductsSection` (`GREEN`)**
- [ ] **Step 3: Run tests + `npm run build` + capture & inspect `screenshots/milestone-b-*.png` + commit & push**

---

### Milestone C: Service Categories (5 Asymmetric Cards) & Flash Sale 11.11 Live Countdown

**Files:**
- Create: `src/utils/countdown.ts`, `src/components/CategoriesSection.astro`, `src/components/FlashSaleSection.astro`
- Modify: `src/scripts/ui-interactions.ts`, `src/pages/index.astro`
- Test: `tests/unit/countdown-format.test.ts`

- [ ] **Step 1: Write failing tests for WIB countdown calculation, expiry clamping, and stock progress percentage (`RED`)**
  - Test pre-expiry (`2026-11-25T10:00:00+07:00` -> exact `days`, `hours`, `minutes`, `seconds`), exact expiry, and post-expiry (`2026-12-01` -> `00:00:00:00`, `isExpired: true`).
  - Run `npx vitest run` -> verify `RED`.
- [ ] **Step 2: Implement `countdown.ts`, `CategoriesSection.astro`, and `FlashSaleSection.astro` with WCAG AA safe contrast (`GREEN`)**
- [ ] **Step 3: Run tests + `npm run build` + capture & inspect `screenshots/milestone-c-*.png` + commit & push**

---

### Milestone D: 300vh Pinned Reversible Cinematic Storytelling Sequence

**Files:**
- Create: `src/utils/tunnel-phases.ts`, `src/components/CinematicSequenceSection.astro`, `src/scripts/cinematic-tunnel.ts`, `src/scripts/cinematic-fallback-2d.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/unit/tunnel-phases.test.ts`

- [ ] **Step 1: Write failing tests for pure deterministic 4-phase progress mapping (`0..1`) (`RED`)**
  - Verify Phase 1 (`0–0.25`), Phase 2 (`0.25–0.55`), Phase 3 (`0.55–0.80`), Phase 4 (`0.80–1.0`) compute exact reversible camera Z, tunnel narrow factor, whiteout flash opacity (`0 -> 1` cleanly at `>= 0.82`), and text/CTA visibility when scrubbed forward AND backward.
  - Run `npx vitest run` -> verify `RED`.
- [ ] **Step 2: Implement `tunnel-phases.ts`, `CinematicSequenceSection.astro`, Three.js tunnel + logo sprites (`cinematic-tunnel.ts`), and Canvas 2D fallback (`cinematic-fallback-2d.ts`) (`GREEN`)**
- [ ] **Step 3: Run tests + `npm run build` + capture & inspect `screenshots/milestone-d-*.png` (at phase 1, phase 2, phase 4) + commit & push**

---

### Milestone E: How To Order, Benefits + Counters, Testimonials, FAQ/Garansi, Final CTA & Footer

**Files:**
- Create: `src/utils/newsletter.ts`, `src/components/HowToOrderSection.astro`, `src/components/BenefitsSection.astro`, `src/components/TestimonialsSection.astro`, `src/components/FaqSection.astro`, `src/components/FinalCtaSection.astro`, `src/components/FooterSection.astro`
- Modify: `src/scripts/ui-interactions.ts`, `src/pages/index.astro`
- Test: `tests/unit/newsletter-interactions.test.ts`

- [ ] **Step 1: Write failing tests for newsletter email validation/UI states (`empty`, `invalid`, `honest-v1-saved`), counter formatting, and magnetic button clamping (`RED`)**
  - Run `npx vitest run` -> verify `RED`.
- [ ] **Step 2: Implement `newsletter.ts` and remaining sections (`HowToOrder`, `Benefits`, `Testimonials` with honest placeholders + swipe/pause, `FaqSection` + Garansi modal, `FinalCta`, `Footer`) (`GREEN`)**
- [ ] **Step 3: Run tests + `npm run build` + capture & inspect `screenshots/milestone-e-*.png` + commit & push**

---

### Milestone F: Full E2E Click-Through (`R-35`), Lighthouse Mobile >= 85, Reduced-Motion, SEO, Docs, ZIP & PR

**Files:**
- Create: `tests/e2e/landing.spec.ts`, `public/sitemap.xml`, `README.md`, `PROMPT-v4.md`
- Modify: `DECISIONS.md`, bundle/Lighthouse optimizations as needed

- [ ] **Step 1: Write comprehensive Playwright E2E suite (`tests/e2e/landing.spec.ts`) covering all Definition of Done & `antislop` R-35 click-throughs**
  - Verify preloader `< 1.8s`, sticky header shrink, Menu Overlay open/Escape, Showreel modal open/Escape, 9 product links, 5 category links, Flash Sale live countdown, 300vh tunnel scrub forward & backward, WA bot 4-step click, Testimonial pause/next, FAQ accordion toggle, Garansi modal open/Escape, Newsletter empty/invalid/valid submit, zero console errors, zero horizontal scroll at `390px`, `prefers-reduced-motion: reduce`, and zero forbidden words or em dashes in rendered DOM!
- [ ] **Step 2: Run Playwright suite, check gzip JS bundle size (`< 300 KB`), and run Lighthouse Mobile CLI (`>= 85` Performance, `< 2.5s` LCP, `< 0.1` CLS)**
- [ ] **Step 3: Generate final section-by-section Desktop & Mobile screenshots in `screenshots/`, write `README.md`, `DECISIONS.md`, `PROMPT-v4.md`, create `amc-landing-lusion-v1.zip` from `dist/`**
- [ ] **Step 4: Commit, push `redesign/landing-lusion-style`, and open GitHub Pull Request to `main` (without merging)**
