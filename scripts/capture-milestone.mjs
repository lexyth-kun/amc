import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const milestone = process.argv[2] || 'a';
const outDir = resolve(process.cwd(), 'screenshots');
mkdirSync(outDir, { recursive: true });

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not start at ${url}`);
}

const server = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', '4322'], {
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

  // Desktop 1440x900
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktopPage.on('pageerror', (err) => errors.push(`Desktop pageerror: ${err.message}`));
  desktopPage.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Desktop console.error: ${msg.text()}`);
  });

  await desktopPage.goto('http://127.0.0.1:4322/', { waitUntil: 'load' });
  await desktopPage.waitForTimeout(2100);
  await desktopPage.screenshot({
    path: resolve(outDir, `milestone-${milestone}-desktop.png`),
    fullPage: milestone !== 'a',
  });

  // Also capture menu overlay open on Milestone A
  if (milestone === 'a') {
    await desktopPage.click('#menu-toggle-btn');
    await desktopPage.waitForTimeout(650);
    await desktopPage.screenshot({
      path: resolve(outDir, `milestone-a-menu-desktop.png`),
    });
    await desktopPage.keyboard.press('Escape');
    await desktopPage.waitForTimeout(500);
  }

  // Mobile 390x844
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
  await mobilePage.waitForTimeout(2100);

  const overflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth - window.innerWidth;
  });

  await mobilePage.screenshot({
    path: resolve(outDir, `milestone-${milestone}-mobile.png`),
    fullPage: milestone !== 'a',
  });

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
