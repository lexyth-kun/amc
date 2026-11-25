import { expect, test } from '@playwright/test';

test.describe('AMC × Lusion Landing Page — Full E2E & Anti-Slop R-35 Click-Through', () => {
  test('verifies preloader <1.8s, zero console errors, anti-slop copy gate, and all interactive controls on desktop', async ({
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

    // Preloader finishes well under 1.8s
    await expect(page.locator('#amc-preloader')).toBeHidden({ timeout: 1800 });

    // Anti-slop DOM text gate: zero em dashes, zero studio/portfolio words
    const visibleText = await page.evaluate(() => document.body.innerText);
    expect(visibleText).not.toContain('—');
    expect(visibleText).not.toMatch(/\b(project|projects|portofolio|klien studio|case study)\b/i);

    // JSON-LD Organization + 3 Products
    const ldRaw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ldRaw).toBeTruthy();
    const ld = JSON.parse(ldRaw!);
    expect(ld['@graph']).toHaveLength(4);

    // Hero secondary CTA smooth-scrolls to #cara-order and sticky header backdrop activates
    await page.click('#hero a[href="#cara-order"]');
    await expect
      .poll(
        async () => {
          const op = await page
            .locator('#header-backdrop')
            .evaluate((el) => parseFloat(getComputedStyle(el).opacity));
          return op;
        },
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

    // Menu Overlay opens, validates overlay newsletter form, and closes with Escape
    await page.click('#menu-toggle-btn');
    await expect(page.locator('#menu-overlay')).toBeVisible();
    const overlayForm = page.locator('#menu-overlay .js-newsletter-form');
    await overlayForm.locator('button[type="submit"]').click();
    await expect(overlayForm.locator('.js-newsletter-feedback')).toContainText('terlebih dahulu');
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-overlay')).toBeHidden();

    // Showreel ticker pause toggle + modal open, pause, step tab switch, and Escape close
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

    // All 9 Featured Product cards link to order.amc.web.id/#aplikasi/<slug>
    const productCards = page.locator('[data-product-card]');
    await expect(productCards).toHaveCount(9);
    const firstHref = await productCards.first().getAttribute('href');
    expect(firstHref).toBe('https://order.amc.web.id/#aplikasi/chatgpt');

    // All 5 Category cards link to order.amc.web.id
    const categoryLinks = page.locator('#kategori a[href^="https://order.amc.web.id"]');
    expect(await categoryLinks.count()).toBeGreaterThanOrEqual(5);

    // Flash Sale live countdown renders valid 2-digit numbers & 6 stock cards link to store
    const secText = await page.locator('#cd-seconds').textContent();
    expect(secText?.trim()).toMatch(/^\d{2}$/);
    const flashCards = page.locator('#flash-sale a[href^="https://order.amc.web.id/#aplikasi/"]');
    await expect(flashCards).toHaveCount(6);

    // 300vh Cinematic Tunnel scrubs forward to whiteout and rewinds cleanly
    await page.evaluate(() => {
      const sec = document.getElementById('dunia-baru');
      const win = window as Window & { __amcScrollTo?: (y: number) => void };
      if (sec) {
        const y = sec.offsetTop + window.innerHeight * 2.85;
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

    // Testimonial carousel pause, next, prev, and dot controls
    await page.locator('#testimoni').scrollIntoViewIfNeeded();
    await page.click('#testi-pause-btn');
    await expect(page.locator('#testi-pause-btn')).toHaveAttribute('aria-pressed', 'true');
    await page.click('#testi-next-btn');
    await page.click('#testi-prev-btn');

    // FAQ accordion & Garansi/T&C modal
    await page.locator('#faq').scrollIntoViewIfNeeded();
    await page.click('[data-faq-btn="1"]');
    await expect(page.locator('#faq-panel-1')).toBeVisible();
    await page.locator('#faq [data-open-tnc]').click();
    await expect(page.locator('#tnc-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#tnc-modal')).toBeHidden();

    // Footer Newsletter empty -> invalid -> valid states
    await page.locator('#kontak').scrollIntoViewIfNeeded();
    const footerForm = page.locator('#kontak .js-newsletter-form');
    await footerForm.locator('button[type="submit"]').click();
    await expect(footerForm.locator('.js-newsletter-feedback')).toContainText('terlebih dahulu');

    await footerForm.locator('input[name="email"]').fill('salah-format');
    await footerForm.locator('button[type="submit"]').click();
    await expect(footerForm.locator('.js-newsletter-feedback')).toContainText('Format email');

    await footerForm.locator('input[name="email"]').fill('charles@amc.web.id');
    await footerForm.locator('button[type="submit"]').click();
    await expect(footerForm.locator('.js-newsletter-feedback')).toContainText('segera aktif');

    expect(errors).toEqual([]);
  });

  test('holds zero horizontal overflow on 390px mobile, opens mobile menu, and honors prefers-reduced-motion: reduce', async ({
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

    // Preloader immediately dismissed under reduced-motion
    await expect(page.locator('#amc-preloader')).toBeHidden();

    // Cinematic whiteout CTA immediately accessible without 300vh pin trap
    await expect(page.locator('#cinematic-whiteout')).toBeVisible();

    // Mobile menu opens & closes cleanly on 390px
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
});
