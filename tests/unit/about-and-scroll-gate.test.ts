import { describe, expect, it } from 'vitest';
import aboutData from '@/data/about.json';
import {
  advanceOverscrollCharge,
  decayOverscrollCharge,
  isAtDocumentBottom,
  shouldTriggerNextPage,
} from '@/utils/next-page-scroll';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe('About Page (Solo Creator Adrian Ali Muthi) & Lusion Auto Next-Page Scroll Gate', () => {
  it('lists strictly one solo creator named Adrian Ali Muthi with zero fabricated team members', () => {
    expect(aboutData.creators).toHaveLength(1);
    expect(aboutData.creators[0].index).toBe('001');
    expect(aboutData.creators[0].name).toBe('Adrian Ali Muthi');
  });

  it('contains all 4 Lusion-style expertise pillars and verified AMC milestones without slop', () => {
    expect(aboutData.expertise).toHaveLength(4);
    expect(aboutData.expertise.map((e) => e.letter)).toEqual(['A', 'K', 'H', 'G']);

    const allStrings = collectStrings(aboutData);
    const forbiddenWords = /\b(project|projects|portofolio|klien studio|case study)\b/i;
    for (const s of allStrings) {
      expect(s, `Found em dash in about.json: "${s}"`).not.toContain('—');
      expect(s, `Found forbidden word in about.json: "${s}"`).not.toMatch(forbiddenWords);
    }

    const joined = allStrings.join(' ');
    expect(joined).toContain('1.266');
    expect(joined).toContain('4.8');
    expect(joined).toContain('1.300+');
  });

  it('detects document bottom and charges/decays overscroll progress deterministically', () => {
    expect(isAtDocumentBottom(0, 900, 3000)).toBe(false);
    expect(isAtDocumentBottom(2095, 900, 3000, 12)).toBe(true);
    expect(isAtDocumentBottom(2100, 900, 3000, 12)).toBe(true);

    let charge = 0;
    charge = advanceOverscrollCharge(charge, 310, 620);
    expect(charge).toBeCloseTo(0.5, 4);
    expect(shouldTriggerNextPage(charge)).toBe(false);

    charge = advanceOverscrollCharge(charge, -124, 620);
    expect(charge).toBeCloseTo(0.3, 4);

    charge = advanceOverscrollCharge(charge, 500, 620);
    expect(charge).toBe(1);
    expect(shouldTriggerNextPage(charge)).toBe(true);

    expect(decayOverscrollCharge(0.5, 0.2, 0.8)).toBeCloseTo(0.34, 4);
    expect(decayOverscrollCharge(0.05, 1.0, 0.8)).toBe(0);
  });
});
