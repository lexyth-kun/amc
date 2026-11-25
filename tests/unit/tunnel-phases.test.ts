import { describe, expect, it } from 'vitest';
import { computeTunnelPhaseState } from '@/utils/tunnel-phases';

describe('300vh Pinned Cinematic Tunnel Reversible Phase Math (Milestone D)', () => {
  it('maps progress into Phases 1, 2, 3, and 4 accurately', () => {
    expect(computeTunnelPhaseState(0.1).phase).toBe(1);
    expect(computeTunnelPhaseState(0.4).phase).toBe(2);
    expect(computeTunnelPhaseState(0.68).phase).toBe(3);
    expect(computeTunnelPhaseState(0.9).phase).toBe(4);
  });

  it('is 100% deterministic and reversible when scrubbed forward and backward', () => {
    const forward = computeTunnelPhaseState(0.42);
    const afterEnd = computeTunnelPhaseState(0.95);
    const scrubbedBack = computeTunnelPhaseState(0.42);

    expect(afterEnd.whiteoutOpacity).toBe(1);
    expect(scrubbedBack).toEqual(forward);
    expect(scrubbedBack.cameraZ).toBeLessThan(computeTunnelPhaseState(0.05).cameraZ);
  });

  it('narrows tunnel vortex and expands orb in Phase 3, then locks pure whiteout in Phase 4', () => {
    const p2 = computeTunnelPhaseState(0.4);
    const p3 = computeTunnelPhaseState(0.76);
    const p4 = computeTunnelPhaseState(0.88);

    expect(p3.tunnelRadiusScale).toBeLessThan(p2.tunnelRadiusScale);
    expect(p3.orbScale).toBeGreaterThan(p2.orbScale);
    expect(p4.whiteoutOpacity).toBe(1);
    expect(p4.phase4RevealProgress).toBeGreaterThan(0.4);
  });
});
