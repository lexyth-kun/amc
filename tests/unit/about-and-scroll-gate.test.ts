import { describe, expect, it } from 'vitest';
import aboutData from '@/data/about.json';
import {
  advanceOverscrollCharge,
  decayOverscrollCharge,
  isAtDocumentBottom,
  resolveFooterNextPage,
  shouldTriggerNextPage,
} from '@/utils/next-page-scroll';
import {
  computeReviewDeckFlipState,
  findSphereAtPoint,
  stepSphereParticlePhysics,
  waveIndexToScrollProgress,
  type SphereBody,
} from '@/utils/about-interactive';
import {
  computeOilWaterStopColors,
  stepFluidTrailDrops,
  type FluidTrailDrop,
} from '@/utils/fluid-trail';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe('About Page (Hologram Solo Creator, 3D Flip Reviews, Movable Spheres & Auto Scroll Gate)', () => {
  it('lists strictly one solo creator named Adrian Ali Muthi with real portrait photo and zero fabricated team members', () => {
    expect(aboutData.creators).toHaveLength(1);
    expect(aboutData.creators[0].index).toBe('001');
    expect(aboutData.creators[0].name).toBe('Adrian Ali Muthi');
    expect(aboutData.creators[0].photo).toBe('/adrian-founder.webp');
  });

  it('groups real buyer reviews into 3 flip clusters (Adobe CC, ChatGPT/Claude/Gemini, CapCut/Canva/Wink) with Ayo Order Sekarang CTA and zero slop', () => {
    expect(aboutData.reviewWaves).toHaveLength(3);
    expect(aboutData.reviewWaves[0].label).toMatch(/adobe/i);
    expect(aboutData.reviewWaves[1].label).toMatch(/chatgpt.*claude.*gemini/i);
    expect(aboutData.reviewWaves[2].label).toMatch(/capcut.*canva.*wink/i);

    for (const wave of aboutData.reviewWaves) {
      expect(wave.reviews).toHaveLength(3);
      for (const review of wave.reviews) {
        expect(review.author.length).toBeGreaterThan(1);
        expect(review.quote.length).toBeGreaterThan(12);
        expect(review.rating).toBeGreaterThanOrEqual(4);
        expect(review.logo).toMatch(/^\/logos\/.+\.svg$/);
      }
    }

    expect(aboutData.orderCta.headlineLine1).toMatch(/ayo order/i);
    expect(aboutData.orderCta.headlineLine2).toMatch(/sekarang/i);
    expect(aboutData.orderCta.botHref).toContain('27748304118');
    expect(aboutData.orderCta.shopHref).toContain('order.amc.web.id');

    const allStrings = collectStrings(aboutData);
    const forbiddenWords = /\b(project|projects|portofolio|klien studio|case study)\b/i;
    for (const s of allStrings) {
      expect(s, `Found em dash in about.json: "${s}"`).not.toContain('—');
      expect(s, `Found forbidden word in about.json: "${s}"`).not.toMatch(forbiddenWords);
      expect(s.toLowerCase()).not.toContain('gerakkan bola-bola 3d');
      expect(s.toLowerCase()).not.toContain('geser & lempar bola 3d');
    }

    const joined = allStrings.join(' ');
    expect(joined).toContain('1.266');
    expect(joined).toContain('4.8');
    expect(joined).toContain('1.300+');
  });

  it('computes light-blue dominant oil-on-water iridescent fluid trail colors and prunes faded drops cleanly', () => {
    const stops = computeOilWaterStopColors(0.8, 0.9, 0.7);
    expect(stops.inner).toMatch(/^hsla\((18[5-9]|19[0-9]|20[0-9]),/);
    expect(stops.mid).toMatch(/^hsla\(/);
    expect(stops.outer).toMatch(/^hsla\(/);

    const drops: FluidTrailDrop[] = [
      { x: 100, y: 100, vx: 3, vy: -2, radius: 14, maxRadius: 48, life: 0.8, decay: 0.04, huePhase: 0, swirl: 0.5, kind: 'slick' },
      { x: 120, y: 120, vx: 0, vy: 0, radius: 30, maxRadius: 40, life: 0.02, decay: 0.04, huePhase: 1, swirl: 1.0, kind: 'ripple' },
    ];
    const next = stepFluidTrailDrops(drops, 1);
    expect(next).toHaveLength(1);
    expect(next[0].radius).toBeGreaterThan(14);
    expect(next[0].life).toBeLessThan(0.8);
  });

  it('computes reversible 3D scroll-flip angles (0 -> 180 -> 360 deg) across 3 review waves without mirroring text', () => {
    const atWave0 = computeReviewDeckFlipState(waveIndexToScrollProgress(0), 3);
    expect(atWave0.activeWaveIndex).toBe(0);
    for (const card of atWave0.cards) {
      expect(card.angleDeg).toBe(0);
      expect(card.showingFace).toBe('front');
      expect(card.frontWaveIndex).toBe(0);
      expect(card.visibleWaveIndex).toBe(0);
    }

    const midFlip1 = computeReviewDeckFlipState(0.32, 3);
    expect(midFlip1.cards[0].angleDeg).toBeGreaterThan(midFlip1.cards[1].angleDeg);
    expect(midFlip1.cards[1].angleDeg).toBeGreaterThan(midFlip1.cards[2].angleDeg);
    expect(midFlip1.cards[0].sheenOpacity).toBeGreaterThan(0);

    const atWave1 = computeReviewDeckFlipState(waveIndexToScrollProgress(1), 3);
    expect(atWave1.activeWaveIndex).toBe(1);
    for (const card of atWave1.cards) {
      expect(card.angleDeg).toBe(180);
      expect(card.showingFace).toBe('back');
      expect(card.backWaveIndex).toBe(1);
      expect(card.frontWaveIndex).toBe(2);
      expect(card.visibleWaveIndex).toBe(1);
    }

    const atWave2 = computeReviewDeckFlipState(waveIndexToScrollProgress(2), 3);
    expect(atWave2.activeWaveIndex).toBe(2);
    for (const card of atWave2.cards) {
      expect(card.angleDeg).toBe(360);
      expect(card.showingFace).toBe('front');
      expect(card.frontWaveIndex).toBe(2);
      expect(card.visibleWaveIndex).toBe(2);
    }
  });

  it('moves, pushes, grabs, and resolves elastic collisions for interactive 3D sphere particles', () => {
    const spheres: SphereBody[] = [
      { x: 200, y: 200, vx: 0, vy: 0, radius: 32, mass: 1, tone: 'sky', phase: 0 },
      { x: 255, y: 200, vx: 0, vy: 0, radius: 32, mass: 1, tone: 'pearl', phase: 1 },
    ];

    expect(findSphereAtPoint(spheres, 205, 204)).toBe(0);
    expect(findSphereAtPoint(spheres, 20, 20)).toBeNull();

    // Drag sphere 0 rightward into sphere 1 and verify elastic collision separates and accelerates sphere 1
    stepSphereParticlePhysics(
      spheres,
      { x: 235, y: 200, vx: 14, vy: 0, active: true, grabbedIndex: 0 },
      { width: 800, height: 600 },
      1
    );
    expect(spheres[0].x).toBeGreaterThan(200);
    expect(spheres[1].vx).toBeGreaterThan(0);

    // Cursor hover repulsion moves nearby free sphere away from pointer
    const freeSpheres: SphereBody[] = [
      { x: 300, y: 300, vx: 0, vy: 0, radius: 28, mass: 1, tone: 'deep', phase: 0 },
    ];
    stepSphereParticlePhysics(
      freeSpheres,
      { x: 270, y: 300, vx: 6, vy: 0, active: true, grabbedIndex: null },
      { width: 800, height: 600 },
      1
    );
    expect(freeSpheres[0].vx).toBeGreaterThan(0);
    expect(freeSpheres[0].x).toBeGreaterThan(300);
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

  it('routes footer auto-scroll from landing/info pages to /about/ and from /about/ directly to https://order.amc.web.id', () => {
    const fromHome = resolveFooterNextPage('/', '/');
    expect(fromHome.href).toBe('/about/');
    expect(fromHome.title).toContain('Tentang');
    expect(fromHome.external).toBe(false);

    const fromSubpathHome = resolveFooterNextPage('/amc/', '/amc');
    expect(fromSubpathHome.href).toBe('/about/');

    const fromAbout = resolveFooterNextPage('/about/', '/');
    expect(fromAbout.href).toBe('https://order.amc.web.id');
    expect(fromAbout.title).toContain('order.amc.web.id');
    expect(fromAbout.external).toBe(true);

    const fromSubpathAbout = resolveFooterNextPage('/amc/about/', '/amc');
    expect(fromSubpathAbout.href).toBe('https://order.amc.web.id');
    expect(fromSubpathAbout.external).toBe(true);

    const fromKategori = resolveFooterNextPage('/kategori/', '/');
    expect(fromKategori.href).toBe('/produk/');

    const fromProduk = resolveFooterNextPage('/produk/', '/');
    expect(fromProduk.href).toBe('/about/');
  });
});
