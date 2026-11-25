import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import products from '@/data/products.json';
import content from '@/data/content.json';
import { buildProductOrderUrl, formatRupiah, getStockProgressPercent, resolveOrderRedirect } from '@/utils/format';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe('Single Source of Truth, Official White-Bg Logos, Multi-Page Nav & Anti-Slop Gate', () => {
  it('contains all 9 verified Featured Products with exact slugs, Rupiah prices, and official white-bg SVGs', () => {
    expect(products.featuredProducts).toHaveLength(9);
    const map = Object.fromEntries(products.featuredProducts.map((p) => [p.slug, p.price]));
    expect(map).toEqual({
      chatgpt: 190000,
      claude: 120000,
      adobe: 125000,
      'adobe-express': 60000,
      canva: 30000,
      capcut: 60000,
      gemini: 25000,
      netflix: 120000,
      youtube: 15000,
    });
    for (const p of products.featuredProducts) {
      expect(p.logo.startsWith('/logos/'), `Featured product ${p.slug} must use official /logos/*.svg`).toBe(true);
    }
  });

  it('contains all 6 verified Flash Sale 11.11 items and WIB deadline', () => {
    expect(products.flashSale.endsAt).toBe('2026-11-30T23:59:00+07:00');
    expect(products.flashSale.items).toHaveLength(6);
    expect(products.flashSale.items.map((i) => i.promoPrice)).toEqual([
      100000, 30000, 15000, 15000, 50000, 15000,
    ]);
  });

  it('contains complete catalog of all >= 35 AMC services across every category for tunnel & /produk page', () => {
    expect(products.categories).toHaveLength(5);
    expect(products.allServices.length).toBeGreaterThanOrEqual(35);
    const categories = new Set(products.allServices.map((s) => s.category));
    expect(categories.has('AI & Produktivitas')).toBe(true);
    expect(categories.has('Kreasi & Desain')).toBe(true);
    expect(categories.has('Hiburan & Musik')).toBe(true);
    expect(categories.has('Buzzer Sosmed')).toBe(true);
    expect(categories.has('Top Up Game')).toBe(true);
  });

  it('routes primary navbar links to dedicated multi-page routes instead of hash-only scrolling', () => {
    const hrefs = content.header.navLinks.map((l) => l.href);
    expect(hrefs).toEqual(['/produk/', '/kategori/', '/flash-sale/', '/cara-order/', '/about/', '/faq/']);
    for (const link of content.header.overlayLinks) {
      expect(link.href.startsWith('/')).toBe(true);
    }
  });

  it('enforces zero em dashes (R-02) and zero forbidden portfolio terms across all JSON content', () => {
    const allStrings = [...collectStrings(products), ...collectStrings(content)];
    const forbiddenWords = /\b(project|projects|portofolio|klien studio|case study)\b/i;

    for (const str of allStrings) {
      expect(str, `Found forbidden em dash in: "${str}"`).not.toContain('—');
      expect(str, `Found forbidden portfolio word in: "${str}"`).not.toMatch(forbiddenWords);
    }
  });

  it('links testimonials & reviews directly to official live reviews at https://order.amc.web.id/#ulasan (R-18)', () => {
    expect(content.testimonials.reviewsUrl).toBe('https://order.amc.web.id/#ulasan');
    expect(content.testimonials.ratingValue).toBe('4.8/5');
    expect(content.testimonials.reviewCountLabel).toContain('1.266');
  });

  it('ensures every local logo path referenced in products.json exists inside public/', () => {
    const publicDir = resolve(process.cwd(), 'public');
    const logos = [
      ...products.featuredProducts.map((p) => p.logo),
      ...products.flashSale.items.map((i) => i.logo),
      ...products.marqueeLogos.map((m) => m.logo),
      ...products.allServices.map((s) => s.logo),
    ];
    for (const logoPath of logos) {
      const cleanRel = logoPath.replace(/^\//, '');
      expect(existsSync(resolve(publicDir, cleanRel)), `Missing asset public/${cleanRel}`).toBe(true);
    }
  });

  it('formats Rupiah, builds store product URLs, and preserves legacy /order redirects accurately', () => {
    expect(formatRupiah(190000)).toBe('Rp190.000');
    expect(formatRupiah(15000)).toBe('Rp15.000');
    expect(buildProductOrderUrl('chatgpt')).toBe('https://order.amc.web.id/#aplikasi/chatgpt');
    expect(getStockProgressPercent(4, 20)).toBe(20);

    expect(resolveOrderRedirect('/order', '', '#aplikasi/claude')).toBe(
      'https://order.amc.web.id/#aplikasi/claude'
    );
    expect(resolveOrderRedirect('/order/promo', '?src=hero', '#game')).toBe(
      'https://order.amc.web.id/promo?src=hero#game'
    );
    expect(resolveOrderRedirect('/', '', '')).toBeNull();
  });
});
