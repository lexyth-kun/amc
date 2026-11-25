import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

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

  const scrollToTunnelProgress = async (page, progress) => {
    await page.evaluate((p) => {
      const sec = document.getElementById('dunia-baru');
      if (!sec) return;
      const startY = sec.offsetTop;
      const pinDistance = window.innerHeight * 3;
      window.scrollTo(0, startY + pinDistance * p);
    }, progress);
    await page.waitForTimeout(1650);
  };

  // Desktop 1440x900
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktopPage.on('pageerror', (err) => errors.push(`Desktop pageerror: ${err.message}`));
  desktopPage.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Desktop console.error: ${msg.text()}`);
  });

  await desktopPage.goto('http://127.0.0.1:4322/', { waitUntil: 'load' });
  await desktopPage.waitForTimeout(2100);

  await scrollToTunnelProgress(desktopPage, 0.14);
  await desktopPage.screenshot({ path: resolve(outDir, 'milestone-d-phase1-desktop.png') });

  await scrollToTunnelProgress(desktopPage, 0.42);
  await desktopPage.screenshot({ path: resolve(outDir, 'milestone-d-phase2-desktop.png') });

  await scrollToTunnelProgress(desktopPage, 0.94);
  await desktopPage.screenshot({ path: resolve(outDir, 'milestone-d-phase4-desktop.png') });

  // Scrub backward test: verify whiteout returns to 0 when rewound to Phase 1
  await scrollToTunnelProgress(desktopPage, 0.14);
  const rewoundOpacity = await desktopPage.evaluate(() => {
    const el = document.getElementById('cinematic-whiteout');
    return parseFloat(el?.style.opacity || '1');
  });
  if (rewoundOpacity > 0.05) {
    throw new Error(`Tunnel did not rewind cleanly: whiteout opacity=${rewoundOpacity}`);
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

  await scrollToTunnelProgress(mobilePage, 0.16);
  await mobilePage.screenshot({ path: resolve(outDir, 'milestone-d-phase1-mobile.png') });

  await scrollToTunnelProgress(mobilePage, 0.94);
  await mobilePage.screenshot({ path: resolve(outDir, 'milestone-d-phase4-mobile.png') });

  const overflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth - window.innerWidth;
  });

  await browser.close();

  if (overflow > 1) {
    throw new Error(`Horizontal overflow on mobile during tunnel: +${overflow}px`);
  }
  if (errors.length > 0) {
    throw new Error(`Console/Page errors:\n${errors.join('\n')}`);
  }

  console.log('Captured Milestone D Phase 1, Phase 2, Phase 4 & verified backward rewind cleanly.');
} finally {
  server.kill('SIGTERM');
}
