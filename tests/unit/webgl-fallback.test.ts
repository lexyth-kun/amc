import { describe, expect, it } from 'vitest';
import { detectRenderMode, getAdaptiveObjectBudget } from '@/utils/webgl-support';

describe('WebGL Fallback & Mobile Budget Scaler (Milestone A)', () => {
  it('returns static mode immediately when prefers-reduced-motion is enabled', () => {
    const mode = detectRenderMode({
      prefersReducedMotion: true,
      createContext: () => ({}) as WebGLRenderingContext,
    });
    expect(mode).toBe('static');
  });

  it('falls back cleanly to canvas2d when WebGL context creation returns null or throws', () => {
    expect(
      detectRenderMode({
        prefersReducedMotion: false,
        createContext: () => null,
      })
    ).toBe('canvas2d');

    expect(
      detectRenderMode({
        prefersReducedMotion: false,
        createContext: () => {
          throw new Error('GPU context blocked');
        },
      })
    ).toBe('canvas2d');
  });

  it('selects webgl mode when WebGL context succeeds and motion is permitted', () => {
    expect(
      detectRenderMode({
        prefersReducedMotion: false,
        createContext: () => ({}) as WebGLRenderingContext,
      })
    ).toBe('webgl');
  });

  it('reduces hero 3D objects by ~40% and tunnel particles by 50% on mobile or low-memory devices', () => {
    const desktop = getAdaptiveObjectBudget({ viewportWidth: 1440, deviceMemoryGb: 8, dpr: 2.5 });
    const mobile = getAdaptiveObjectBudget({ viewportWidth: 390, deviceMemoryGb: 4, dpr: 3 });

    expect(desktop.maxDpr).toBe(2);
    expect(desktop.heroCrossCount).toBe(15);
    expect(desktop.heroOrbCount).toBe(6);
    expect(desktop.tunnelParticleCount).toBe(240);

    expect(mobile.maxDpr).toBeLessThanOrEqual(2);
    expect(mobile.heroCrossCount).toBe(9);
    expect(mobile.heroOrbCount).toBe(4);
    expect(mobile.tunnelParticleCount).toBe(120);
  });
});
