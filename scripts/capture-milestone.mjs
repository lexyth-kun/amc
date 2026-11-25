import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const milestone = process.argv[2] || 'a';
const targetSelector = process.argv[3] || '';
const outDir = resolve(process.cwd(), 'screenshots');
mkdirSync(outDir, { recursive: true });

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Preview server did not start at ${url}`);
}

async function triggerScrollReveals(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.65));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

const server = spawn('./node_modules/.bin/astro', ['preview', '--host', '127.0.0.1', '--port', '4322'], {
  stdio: 'ignore',
});

try {
  await waitForServer('http://127.0.0.1:4322');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });

  const errors = [];

  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktopPage.on('pageerror', (err) => errors.push(`Desktop pageerror: ${err.message}`));
  desktopPage.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Desktop console.error: ${msg.text()}`);
  });

  await desktopPage.goto('http://127.0.0.1:4322/', { waitUntil: 'load' });
  await desktopPage.waitForTimeout(1950);
  await triggerScrollReveals(desktopPage);

  if (targetSelector) {
    const loc = desktopPage.locator(targetSelector);
    await loc.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(350);
    await loc.screenshot({ path: resolve(outDir, `milestone-${milestone}-desktop.png`) });
  } else {
    await desktopPage.screenshot({
      path: resolve(outDir, `milestone-${milestone}-desktop.png`),
      fullPage: true,
    });
  }

  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobilePage.on('pageerror', (err) => errors.push(`Mobile pageerror: ${err.message}`));
  mobilePage.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Mobile console.error: ${msg.text()}`);
  });

  await mobilePage.goto('http://127.0.0.1:4322/', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(1950);
  await triggerScrollReveals(mobilePage);

  const overflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth - window.innerWidth;
  });

  if (targetSelector) {
    const loc = mobilePage.locator(targetSelector);
    await loc.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(350);
    await loc.screenshot({ path: resolve(outDir, `milestone-${milestone}-mobile.png`) });
  } else {
    await mobilePage.screenshot({
      path: resolve(outDir, `milestone-${milestone}-mobile.png`),
      fullPage: true,
    });
  }

  await browser.close();

  if (overflow > 1) {
    throw new Error(`Horizontal overflow detected on mobile 390px: +${overflow}px`);
  }
  if (errors.length > 0) {
    throw new Error(`Console/Page errors detected:\n${errors.join('\n')}`);
  }

  console.log(`Captured milestone-${milestone} desktop & mobile screenshots cleanly (0 errors, 0 overflow).`);
} finally {
  server.kill('SIGTERM');
}
