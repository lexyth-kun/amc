import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const server = spawn('./node_modules/.bin/astro', ['preview', '--host', '127.0.0.1', '--port', '4325'], {
  stdio: 'ignore',
});

const reportPath = '/tmp/amc-lighthouse-mobile.json';

try {
  await waitForServer('http://127.0.0.1:4325');

  await new Promise((res, rej) => {
    const lh = spawn(
      'npx',
      [
        'lighthouse',
        'http://127.0.0.1:4325/',
        '--output=json',
        `--output-path=${reportPath}`,
        '--only-categories=performance,accessibility,best-practices,seo',
        '--form-factor=mobile',
        '--screenEmulation.mobile=true',
        '--chrome-path=/usr/bin/google-chrome',
        '--chrome-flags=--headless=new --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage',
        '--quiet',
      ],
      { stdio: 'inherit' }
    );
    lh.on('exit', (code) => (code === 0 ? res() : rej(new Error(`Lighthouse exited ${code}`))));
  });

  const data = JSON.parse(readFileSync(resolve(reportPath), 'utf8'));
  const perf = Math.round((data.categories.performance?.score ?? 0) * 100);
  const a11y = Math.round((data.categories.accessibility?.score ?? 0) * 100);
  const bp = Math.round((data.categories['best-practices']?.score ?? 0) * 100);
  const seo = Math.round((data.categories.seo?.score ?? 0) * 100);
  const lcpMs = data.audits['largest-contentful-paint']?.numericValue ?? 0;
  const cls = data.audits['cumulative-layout-shift']?.numericValue ?? 0;
  const tbtMs = data.audits['total-blocking-time']?.numericValue ?? 0;

  console.log(
    JSON.stringify(
      {
        performance: perf,
        accessibility: a11y,
        bestPractices: bp,
        seo,
        lcpSeconds: Number((lcpMs / 1000).toFixed(2)),
        cls: Number(cls.toFixed(4)),
        tbtMs: Math.round(tbtMs),
      },
      null,
      2
    )
  );

  if (perf < 85 || lcpMs >= 2500 || cls >= 0.1) {
    const opportunities = Object.values(data.audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.numericValue)
      .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
      .slice(0, 5)
      .map((a) => `${a.id}: ${a.displayValue || Math.round(a.numericValue)}`);
    console.log('Top audits to improve:', opportunities);
    process.exitCode = 1;
  }
} finally {
  server.kill('SIGTERM');
}
