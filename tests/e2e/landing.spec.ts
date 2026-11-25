import { expect, test } from '@playwright/test';

test.describe('AMC × Lusion Multi-Page & Spatial Scroll E2E Verification', () => {
  test('verifies Sky Blue palette, official white-bg logos, extended 620vh tunnel with all 41 services, ulasan link, WA phone opt-in, and all interactive controls', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    await expect(page).toHaveTitle('Al Muthi Creative – Akun Premium Murah & Terpercaya');
    await expect(page.locator('#amc-preloader')).toBeHidden({ timeout: 2200 });

    // Anti-slop DOM text gate: zero em dashes, zero studio/portfolio words
    const visibleText = await page.evaluate(() => document.body.innerText);
    expect(visibleText).not.toContain('—');
    expect(visibleText).not.toMatch(/\b(project|projects|portofolio|klien studio|case study)\b/i);

    // Verify exact order.amc.web.id Sky Blue CSS variable & zero cobalt #1A36FF
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        sky: style.getPropertyValue('--sky').trim().toUpperCase(),
        skyLight: style.getPropertyValue('--sky-light').trim().toUpperCase(),
        amc: style.getPropertyValue('--amc').trim().toUpperCase(),
      };
    });
    expect(tokens.sky).toBe('#38BDF8');
    expect(tokens.skyLight).toBe('#7DD3FC');
    expect(tokens.amc).toBe('#0284C7');

    // JSON-LD Organization + 3 Products
    const ldRaw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ldRaw).toBeTruthy();
    const ld = JSON.parse(ldRaw!);
    expect(ld['@graph']).toHaveLength(4);

    // Hero secondary CTA smooth-scrolls to #cara-order and sticky header backdrop activates
    await page.click('#hero a[href="#cara-order"]');
    await expect
      .poll(
        async () =>
          page
            .locator('#header-backdrop')
            .evaluate((el) => parseFloat(getComputedStyle(el).opacity)),
        { timeout: 3000 }
      )
      .toBeGreaterThan(0.8);

    // Hero marquee & canvas pause toggle (R-39)
    await page.evaluate(() => {
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (win.__amcScrollTo) win.__amcScrollTo(0);
      else window.scrollTo(0, 0);
    });
    const heroPauseBtn = page.locator('[data-marquee-toggle="hero-logo-marquee"]');
    await heroPauseBtn.click();
    await expect(heroPauseBtn).toHaveAttribute('aria-pressed', 'true');
    await heroPauseBtn.click();
    await expect(heroPauseBtn).toHaveAttribute('aria-pressed', 'false');

    // Hero interactive 3D canvas responds to click without errors
    await page.locator('#hero-canvas').click({ position: { x: 220, y: 260 }, force: true });

    // Menu Overlay opens, validates phone/WA promo form, and closes with Escape
    await page.click('#menu-toggle-btn');
    await expect(page.locator('#menu-overlay')).toBeVisible();
    const overlayForm = page.locator('#menu-overlay .js-newsletter-form');
    await overlayForm.locator('button[type="submit"]').click();
    await expect(overlayForm.locator('.js-newsletter-feedback')).toContainText('terlebih dahulu');
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-overlay')).toBeHidden();

    // Showreel ticker toggle + modal open, pause, step switch, Escape close
    await page.locator('#open-reel-btn').scrollIntoViewIfNeeded();
    const reelTickerToggle = page.locator('[data-marquee-toggle="reel-text-marquee"]');
    await reelTickerToggle.click();
    await expect(reelTickerToggle).toHaveAttribute('aria-pressed', 'true');

    await page.click('#open-reel-btn');
    await expect(page.locator('#showreel-modal')).toBeVisible();
    await page.click('#reel-pause-btn');
    await expect(page.locator('#reel-pause-btn')).toHaveAttribute('aria-pressed', 'true');
    await page.click('[data-reel-tab="2"]');
    await expect(page.locator('[data-reel-slide="2"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#showreel-modal')).toBeHidden();

    // All 9 Featured Product cards link to dedicated /produk/<slug>/ detail pages with 3D showcase + official white-bg logo
    const productCards = page.locator('[data-product-card]');
    await expect(productCards).toHaveCount(9);
    expect(await productCards.first().getAttribute('href')).toBe('/produk/chatgpt/');
    expect(await productCards.first().locator('[data-card-visual] > img').getAttribute('src')).toBe(
      '/showcase/chatgpt.webp'
    );
    expect(await productCards.first().locator('[data-card-media] img').getAttribute('src')).toBe(
      '/logos/chatgpt.svg'
    );

    // Flash Sale live countdown & 6 cards pointing to dedicated detail pages
    const secText = await page.locator('#cd-seconds').textContent();
    expect(secText?.trim()).toMatch(/^\d{2}$/);
    await expect(page.locator('#flash-sale a[href^="/produk/"]')).toHaveCount(6);

    // Extended 620vh Cinematic Tunnel renders ZERO cards — only pure floating official logo icons across all 41 services
    await expect(page.locator('#dunia-baru .rounded-card')).toHaveCount(0);
    const tunnelIconsCount = await page.locator('#cinematic-phase2 [data-tunnel-icon][href^="/produk/"]').count();
    expect(tunnelIconsCount).toBeGreaterThanOrEqual(41);

    await page.evaluate(() => {
      const sec = document.getElementById('dunia-baru');
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (sec) {
        const y = sec.offsetTop + window.innerHeight * 2.4;
        if (win.__amcScrollTo) win.__amcScrollTo(y);
        else window.scrollTo(0, y);
      }
    });
    await expect
      .poll(
        async () =>
          page
            .locator('#cinematic-phase2')
            .evaluate((el) => parseFloat(el.style.opacity || '0')),
        { timeout: 3500 }
      )
      .toBeGreaterThan(0.85);

    const activeAnimatedIcons = await page.locator('#cinematic-phase2 [data-tunnel-icon]').evaluateAll((els) =>
      els.filter((el) => parseFloat((el as HTMLElement).style.opacity || '0') > 0.7 && Boolean((el as HTMLElement).style.transform)).length
    );
    expect(activeAnimatedIcons).toBeGreaterThan(0);

    await page.evaluate(() => {
      const sec = document.getElementById('dunia-baru');
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (sec) {
        const y = sec.offsetTop + window.innerHeight * 6.0;
        if (win.__amcScrollTo) win.__amcScrollTo(y);
        else window.scrollTo(0, y);
      }
    });
    await expect
      .poll(
        async () =>
          page
            .locator('#cinematic-whiteout')
            .evaluate((el) => parseFloat(el.style.opacity || '0')),
        { timeout: 3500 }
      )
      .toBeGreaterThan(0.9);

    await page.evaluate(() => {
      const sec = document.getElementById('dunia-baru');
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (sec) {
        const y = sec.offsetTop + window.innerHeight * 0.25;
        if (win.__amcScrollTo) win.__amcScrollTo(y);
        else window.scrollTo(0, y);
      }
    });
    await expect
      .poll(
        async () =>
          page
            .locator('#cinematic-whiteout')
            .evaluate((el) => parseFloat(el.style.opacity || '1')),
        { timeout: 3500 }
      )
      .toBeLessThan(0.1);

    // How-To-Order 4-step bot preview switches on click
    await page.locator('#cara-order').scrollIntoViewIfNeeded();
    await page.click('[data-order-step-btn="2"]');
    await expect(page.locator('[data-order-step-panel="2"]')).toBeVisible();

    // Reviews section links directly to https://order.amc.web.id/#ulasan
    await page.locator('#testimoni').scrollIntoViewIfNeeded();
    const ulasanLinks = page.locator('#testimoni a[href="https://order.amc.web.id/#ulasan"]');
    expect(await ulasanLinks.count()).toBeGreaterThanOrEqual(2);

    // FAQ accordion & Garansi/T&C modal
    await page.locator('#faq').scrollIntoViewIfNeeded();
    await page.click('[data-faq-btn="1"]');
    await expect(page.locator('#faq-panel-1')).toBeVisible();
    await page.locator('#faq [data-open-tnc]').click();
    await expect(page.locator('#tnc-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#tnc-modal')).toBeHidden();

    // Footer Phone / WhatsApp Promo Opt-In: empty -> invalid -> valid with live WA confirm button
    await page.locator('#kontak').scrollIntoViewIfNeeded();
    const footerForm = page.locator('#kontak .js-newsletter-form');
    await footerForm.locator('button[type="submit"]').click();
    await expect(footerForm.locator('.js-newsletter-feedback')).toContainText('terlebih dahulu');

    await footerForm.locator('input[name="phone"]').fill('abc-salah');
    await footerForm.locator('button[type="submit"]').click();
    await expect(footerForm.locator('.js-newsletter-feedback')).toContainText('Format nomor');

    await footerForm.locator('input[name="phone"]').fill('0812-3456-7890');
    await footerForm.locator('button[type="submit"]').click();
    await expect(footerForm.locator('.js-newsletter-feedback')).toContainText('Nomor tercatat');
    const waConfirmHref = await footerForm.locator('.js-wa-confirm-link').getAttribute('href');
    expect(waConfirmHref).toContain('https://wa.me/6285117120101?text=');
    expect(waConfirmHref).toContain('6281234567890');

    expect(errors).toEqual([]);
  });

  test('navigates across dedicated multi-page routes from navbar and filters all 41 services on /produk/', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('#amc-preloader')).toBeHidden({ timeout: 2200 });

    // Click navbar "Produk" -> opens /produk/
    await page.click('header nav a[href="/produk/"]');
    await expect(page).toHaveURL(/\/produk\/?$/);
    await expect(page.locator('header nav a[href="/produk/"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-catalog-item]')).toHaveCount(41);

    // Filter to Top Up Game -> only 7 game items visible
    await page.click('[data-catalog-filter="Top Up Game"]');
    const visibleGames = await page.locator('[data-catalog-item]:not([hidden])').count();
    expect(visibleGames).toBe(7);

    // Navigate to remaining navbar pages
    for (const [href, headingPart] of [
      ['/kategori/', 'Kategori'],
      ['/flash-sale/', 'FLASH SALE'],
      ['/cara-order/', 'Cara Order'],
      ['/faq/', 'Pertanyaan Umum'],
    ] as const) {
      await page.click(`header nav a[href="${href}"]`);
      await expect(page).toHaveURL(new RegExp(`${href.replace('/', '\\/')}?$`));
      await expect(page.locator('main')).toContainText(headingPart);
    }

    // Open /kontak/ via footer link
    await page.goto('/kontak/', { waitUntil: 'load' });
    await expect(page.locator('h1')).toContainText('Admin 24 Jam');

    expect(errors).toEqual([]);
  });

  test('holds zero horizontal overflow on 390px mobile and 768px tablet with prefers-reduced-motion: reduce', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator('#amc-preloader')).toBeHidden();
    await expect(page.locator('#cinematic-whiteout')).toBeVisible();

    await page.click('#menu-toggle-btn');
    await expect(page.locator('#menu-overlay')).toBeVisible();
    await page.click('#menu-close-btn');
    await expect(page.locator('#menu-overlay')).toBeHidden();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(tabletOverflow).toBeLessThanOrEqual(1);

    await context.close();
  });

  test('preserves legacy /order redirect to https://order.amc.web.id with hash intact', async ({
    page,
  }) => {
    let redirectedUrl = '';
    await page.route('https://order.amc.web.id/**', async (route) => {
      redirectedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html><body>AMC Store Stub</body></html>',
      });
    });

    await page.goto('/order/#aplikasi/chatgpt', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.url(), { timeout: 3000 }).toBe(
      'https://order.amc.web.id/#aplikasi/chatgpt'
    );
    expect(redirectedUrl).toContain('https://order.amc.web.id/');
  });

  test('transitions from product card into Lusion-style detail page with desktop horizontal scroll, mobile vertical scroll, and Nov 2026 specs', async ({
    browser,
  }) => {
    // 1) Desktop 1440x900: Card click morph -> /produk/gemini/ -> horizontal rightward scroll -> Next Product
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopCtx.newPage();
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/produk/', { waitUntil: 'load' });
    await page.locator('[data-product-card][href="/produk/gemini/"]').click();
    await expect(page).toHaveURL(/\/produk\/gemini\/?$/, { timeout: 6000 });
    await expect(page.locator('#product-detail-heading')).toContainText('Gemini AI Pro');

    // Verify Nov 2026 Gemini 4 lineup (Hydrogen, Neon, Carbon) & official order CTA
    const geminiBody = await page.evaluate(() => document.body.innerText);
    expect(geminiBody).toContain('Hydrogen');
    expect(geminiBody).toContain('Neon');
    expect(geminiBody).toContain('Carbon');
    expect(geminiBody).not.toContain('—');
    expect(geminiBody).not.toMatch(/\b(project|projects|portofolio|klien studio|case study)\b/i);
    await expect(
      page.locator('#product-detail-stage a[href="https://order.amc.web.id/#aplikasi/gemini"]').first()
    ).toBeVisible();

    // Verify desktop horizontal scroll translates #product-detail-track horizontally to the left (scrolling rightward)
    await page.waitForTimeout(350);
    await page.evaluate(() => {
      const win = window as Window & { __amcDetailScrollToProgress?: (p: number) => void };
      win.__amcDetailScrollToProgress?.(0.5);
    });
    await expect
      .poll(
        async () =>
          page.locator('#product-detail-track').evaluate((el) => {
            const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
            return m.m41;
          }),
        { timeout: 4000 }
      )
      .toBeLessThan(-1000);
    await expect(page.locator('#detail-panel-counter')).toHaveText(/0[34] \/ 06/);

    // Scroll all the way right to Panel 06 (PRODUK BERIKUTNYA) & open next product
    await page.evaluate(() => {
      const win = window as Window & { __amcDetailScrollToProgress?: (p: number) => void };
      win.__amcDetailScrollToProgress?.(1);
    });
    await expect(page.locator('#detail-panel-counter')).toHaveText('06 / 06');
    await page.locator('[data-detail-panel="5"] a[data-product-link]').first().click();
    await expect(page).toHaveURL(/\/produk\/supergrok\/?$/, { timeout: 6000 });
    await expect(page.locator('main')).toContainText('Grok 4.7');

    // Check ChatGPT GPT-6.2 Astra & Sol directly
    await page.goto('/produk/chatgpt/', { waitUntil: 'load' });
    const chatgptText = await page.evaluate(() => document.body.innerText);
    expect(chatgptText).toContain('GPT-6.2 Astra');
    expect(chatgptText).toContain('GPT-6.2 Sol');

    expect(errors).toEqual([]);
    await desktopCtx.close();

    // 2) Mobile 390x844: Vertical scroll downward on /produk/claude/ with zero horizontal overflow
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mPage = await mobileCtx.newPage();
    const mErrors: string[] = [];
    mPage.on('pageerror', (err) => mErrors.push(err.message));

    await mPage.goto('/produk/claude/', { waitUntil: 'load' });
    await expect(mPage.locator('#product-detail-heading')).toContainText('Claude Pro');
    const claudeText = await mPage.evaluate(() => document.body.innerText);
    expect(claudeText).toContain('Opus 5.5');
    expect(claudeText).toContain('Sonnet 5.5');
    expect(claudeText).toContain('Fable 5.2');

    // Verify vertical stack (height > viewport) and ZERO horizontal overflow
    const metrics = await mPage.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      docHeight: document.documentElement.scrollHeight,
      flexDir: getComputedStyle(document.getElementById('product-detail-track')!).flexDirection,
    }));
    expect(metrics.flexDir).toBe('column');
    expect(metrics.docHeight).toBeGreaterThan(2200);
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(mErrors).toEqual([]);
    await mobileCtx.close();
  });

  test('auto-transitions from end of landing page to /about/ on continued scroll and verifies solo creator Adrian Ali Muthi', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('#amc-preloader')).toBeHidden({ timeout: 2200 });

    // Scroll to the very bottom of the landing page
    await page.evaluate(() => {
      const maxY = document.documentElement.scrollHeight;
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (win.__amcScrollTo) win.__amcScrollTo(maxY);
      else window.scrollTo(0, maxY);
    });
    await expect(page.locator('footer#kontak #next-page-scroll-gate')).toBeVisible();
    await expect(page.locator('footer#kontak #next-page-scroll-gate')).toContainText('Tentang AMC');

    // Keep scrolling down via real mouse wheel at bottom of footer -> automatically opens /about/
    await page.mouse.move(720, 450);
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 180);
      await page.waitForTimeout(45);
    }

    await expect(page).toHaveURL(/\/about\/?$/, { timeout: 6000 });
    await expect(page.locator('#founder-heading')).toContainText('Adrian Ali Muthi');

    const aboutText = await page.evaluate(() => document.body.innerText);
    expect(aboutText).toContain('[[ 001 ]]');
    expect(aboutText).toContain('Adrian Ali Muthi');
    expect(aboutText).toContain('PEMBUAT TUNGGAL');
    expect(aboutText).toContain('1.266');
    expect(aboutText).toContain('1.300+');
    expect(aboutText).not.toContain('—');
    expect(aboutText).not.toMatch(/\b(project|projects|portofolio|klien studio|case study)\b/i);

    // Pause control on fluid particle background works (R-39)
    await page.click('#about-particles-pause');
    await expect(page.locator('#about-particles-pause')).toHaveAttribute('aria-pressed', 'true');

    // Integrated footer NextPageScrollGate on /about/ points directly to https://order.amc.web.id
    const aboutGate = page.locator('footer#kontak #next-page-scroll-gate');
    await expect(aboutGate).toHaveAttribute('data-next-page-href', 'https://order.amc.web.id');
    await expect(aboutGate).toHaveAttribute('data-next-page-external', 'true');
    await expect(aboutGate).toContainText('order.amc.web.id');

    // Mobile 390px zero horizontal overflow on /about/
    await page.setViewportSize({ width: 390, height: 844 });
    const mOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(mOverflow).toBeLessThanOrEqual(1);

    // Real overscroll at bottom of /about/ footer redirects directly to https://order.amc.web.id
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route('https://order.amc.web.id/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html><body><h1>Order AMC Web Shop</h1></body></html>',
      });
    });

    await page.evaluate(() => {
      const maxY = document.documentElement.scrollHeight;
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (win.__amcScrollTo) win.__amcScrollTo(maxY);
      else window.scrollTo(0, maxY);
    });
    await page.waitForTimeout(150);
    await page.mouse.move(720, 450);
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 180);
      await page.waitForTimeout(45);
    }

    await expect(page).toHaveURL(/^https:\/\/order\.amc\.web\.id\/?$/, { timeout: 6000 });
    expect(errors).toEqual([]);
    await ctx.close();
  });
});
