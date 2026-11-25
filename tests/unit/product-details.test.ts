import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import products from '@/data/products.json';
import { getAllProductDetails, getProductDetailBySlug } from '@/data/product-details';
import {
  computeActivePanelIndex,
  computeDetailProgress,
  computeHorizontalScrollDistance,
} from '@/utils/product-detail-math';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe('Product Detail Pages (November 2026 Catalog & Horizontal Scroll Math)', () => {
  it('provides a complete detail page entry for all 41 AMC services with valid next/prev circular navigation', () => {
    const details = getAllProductDetails();
    expect(details).toHaveLength(products.allServices.length);

    const slugSet = new Set(details.map((d) => d.slug));
    for (const svc of products.allServices) {
      expect(slugSet.has(svc.slug), `Missing detail record for slug "${svc.slug}"`).toBe(true);
    }

    for (const d of details) {
      expect(d.nextSlug).not.toBe(d.slug);
      expect(d.prevSlug).not.toBe(d.slug);
      expect(getProductDetailBySlug(d.nextSlug)).toBeDefined();
      expect(getProductDetailBySlug(d.prevSlug)).toBeDefined();
      expect(d.orderHref.startsWith('https://order.amc.web.id')).toBe(true);
      expect(d.highlights2026.length).toBeGreaterThanOrEqual(3);
      expect(d.metadataServices.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('references existing showcase WebP visuals in public/ for every product hero and gallery frame', () => {
    const publicDir = resolve(process.cwd(), 'public');
    for (const d of getAllProductDetails()) {
      const heroRel = d.heroImage.replace(/^\//, '');
      const galRel = d.galleryImage.replace(/^\//, '');
      expect(existsSync(resolve(publicDir, heroRel)), `Missing hero image public/${heroRel}`).toBe(true);
      expect(existsSync(resolve(publicDir, galRel)), `Missing gallery image public/${galRel}`).toBe(true);
    }
  });

  it('reflects verified November 2026 platform engines and updates across flagship AI, creative, and media products', () => {
    const geminiText = collectStrings(getProductDetailBySlug('gemini')).join(' ');
    expect(geminiText).toContain('Hydrogen');
    expect(geminiText).toContain('Neon');
    expect(geminiText).toContain('Carbon');

    const claudeText = collectStrings(getProductDetailBySlug('claude')).join(' ');
    expect(claudeText).toContain('Opus 5.5');
    expect(claudeText).toContain('Sonnet 5.5');
    expect(claudeText).toContain('Fable 5.2');

    const chatgptText = collectStrings(getProductDetailBySlug('chatgpt')).join(' ');
    expect(chatgptText).toContain('GPT-6');
    expect(chatgptText).toContain('Astra');
    expect(chatgptText).toContain('Sol');

    const grokText = collectStrings(getProductDetailBySlug('supergrok')).join(' ');
    expect(grokText).toContain('Grok 4.7');

    const adobeText = collectStrings(getProductDetailBySlug('adobe')).join(' ');
    expect(adobeText).toContain('MAX 2026');
    expect(adobeText).toContain('Creative Agent');
    expect(adobeText).toContain('Firefly');

    const canvaText = collectStrings(getProductDetailBySlug('canva')).join(' ');
    expect(canvaText).toContain('Affinity');

    const spotifyText = collectStrings(getProductDetailBySlug('spotify')).join(' ');
    expect(spotifyText).toContain('Lossless');
  });

  it('enforces zero em dashes (R-02) and zero forbidden studio/portfolio terminology across all 41 product details', () => {
    const allStrings = collectStrings(getAllProductDetails());
    const forbiddenWords = /\b(project|projects|portofolio|klien studio|case study)\b/i;

    for (const str of allStrings) {
      expect(str, `Found forbidden em dash in: "${str}"`).not.toContain('—');
      expect(str, `Found forbidden portfolio word in: "${str}"`).not.toMatch(forbiddenWords);
    }
  });

  it('computes horizontal scroll distance, progress clamping, and active panel index accurately', () => {
    expect(computeHorizontalScrollDistance(6200, 1440)).toBe(4760);
    expect(computeHorizontalScrollDistance(1000, 1440)).toBe(0);

    expect(computeDetailProgress(-10, 4000)).toBe(0);
    expect(computeDetailProgress(2000, 4000)).toBe(0.5);
    expect(computeDetailProgress(5000, 4000)).toBe(1);
    expect(computeDetailProgress(100, 0)).toBe(0);

    expect(computeActivePanelIndex(0, 6)).toBe(0);
    expect(computeActivePanelIndex(0.5, 6)).toBe(3);
    expect(computeActivePanelIndex(0.99, 6)).toBe(5);
    expect(computeActivePanelIndex(1.2, 6)).toBe(5);
  });
});
