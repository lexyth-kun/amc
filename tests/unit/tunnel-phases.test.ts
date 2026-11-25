import { describe, expect, it } from 'vitest';
import { computeTunnelPhaseState } from '@/utils/tunnel-phases';

describe('Extended Pinned Cinematic Tunnel Reversible Phase Math (All Services Showcase)', () => {
  it('maps progress into extended Phases 1, 2 (long all-services showcase), 3, and 4 accurately', () => {
    expect(computeTunnelPhaseState(0.08).phase).toBe(1);
    expect(computeTunnelPhaseState(0.25).phase).toBe(2);
    expect(computeTunnelPhaseState(0.55).phase).toBe(2);
    expect(computeTunnelPhaseState(0.72).phase).toBe(2);
    expect(computeTunnelPhaseState(0.82).phase).toBe(3);
    expect(computeTunnelPhaseState(0.94).phase).toBe(4);
  });

  it('sweeps showcaseProgress smoothly across 0..1 during the extended Phase 2 all-services glide', () => {
    const startP2 = computeTunnelPhaseState(0.16);
    const midP2 = computeTunnelPhaseState(0.46);
    const endP2 = computeTunnelPhaseState(0.76);

    expect(startP2.showcaseProgress).toBeLessThan(0.1);
    expect(midP2.showcaseProgress).toBeGreaterThan(0.4);
    expect(midP2.showcaseProgress).toBeLessThan(0.6);
    expect(endP2.showcaseProgress).toBeGreaterThan(0.95);
    expect(midP2.phase2Opacity).toBe(1);
  });

  it('is 100% deterministic and reversible when scrubbed forward and backward', () => {
    const forward = computeTunnelPhaseState(0.48);
    const afterEnd = computeTunnelPhaseState(0.96);
    const scrubbedBack = computeTunnelPhaseState(0.48);

    expect(afterEnd.whiteoutOpacity).toBe(1);
    expect(scrubbedBack).toEqual(forward);
    expect(scrubbedBack.cameraZ).toBeLessThan(computeTunnelPhaseState(0.05).cameraZ);
  });

  it('narrows tunnel vortex and expands orb in Phase 3, then locks pure whiteout in Phase 4', () => {
    const p2 = computeTunnelPhaseState(0.45);
    const p3 = computeTunnelPhaseState(0.84);
    const p4 = computeTunnelPhaseState(0.95);

    expect(p3.tunnelRadiusScale).toBeLessThan(p2.tunnelRadiusScale);
    expect(p3.orbScale).toBeGreaterThan(p2.orbScale);
    expect(p4.whiteoutOpacity).toBe(1);
    expect(p4.phase4RevealProgress).toBeGreaterThan(0.5);
  });
});
