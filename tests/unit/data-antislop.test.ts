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

describe('Single Source of Truth & Anti-Slop Copy Gate (Milestone A)', () => {
  it('contains all 9 verified Featured Products with exact slugs and Rupiah prices', () => {
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
  });

  it('contains all 6 verified Flash Sale 11.11 items and WIB deadline', () => {
    expect(products.flashSale.endsAt).toBe('2026-11-30T23:59:00+07:00');
    expect(products.flashSale.items).toHaveLength(6);
    expect(products.flashSale.items.map((i) => i.promoPrice)).toEqual([
      100000, 30000, 15000, 15000, 50000, 15000,
    ]);
  });

  it('contains 5 service categories covering all AMC catalog groups', () => {
    expect(products.categories).toHaveLength(5);
  });

  it('enforces zero em dashes (R-02) and zero forbidden portfolio terms across all JSON content', () => {
    const allStrings = [...collectStrings(products), ...collectStrings(content)];
    const forbiddenWords = /\b(project|projects|portofolio|klien studio|case study)\b/i;

    for (const str of allStrings) {
      expect(str, `Found forbidden em dash in: "${str}"`).not.toContain('—');
      expect(str, `Found forbidden portfolio word in: "${str}"`).not.toMatch(forbiddenWords);
    }
  });

  it('uses honest labeled placeholders for testimonials until real customer reviews are supplied (R-18, R-38)', () => {
    expect(content.testimonials.items).toHaveLength(3);
    for (const item of content.testimonials.items) {
      expect(item.isPlaceholder).toBe(true);
      expect(item.quote).toContain('[MENUNGGU ULASAN ASLI');
    }
  });

  it('ensures every local logo path referenced in products.json exists inside public/', () => {
    const publicDir = resolve(process.cwd(), 'public');
    const logos = [
      ...products.featuredProducts.map((p) => p.logo),
      ...products.flashSale.items.map((i) => i.logo),
      ...products.marqueeLogos.map((m) => m.logo),
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
