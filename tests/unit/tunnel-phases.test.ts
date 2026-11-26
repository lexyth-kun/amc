import { describe, expect, it } from 'vitest';
import {
  computeLogoWaveMotion,
  computeTunnelPhaseState,
  getTunnelWorldTheme,
  waveIndexToTunnelProgress,
} from '@/utils/tunnel-phases';

describe('Extended Pinned Cinematic Tunnel Reversible Phase Math (6 Distinct Digital Worlds)', () => {
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

  it('narrows tunnel vortex, surges warp streaks, and expands orb in Phase 3, then locks pure whiteout in Phase 4', () => {
    const p2 = computeTunnelPhaseState(0.45);
    const p3 = computeTunnelPhaseState(0.84);
    const p4 = computeTunnelPhaseState(0.95);

    expect(p3.tunnelRadiusScale).toBeLessThan(p2.tunnelRadiusScale);
    expect(p3.orbScale).toBeGreaterThan(p2.orbScale);
    expect(p3.warpStreakScale).toBeGreaterThan(p2.warpStreakScale);
    expect(p4.whiteoutOpacity).toBe(1);
    expect(p4.phase4RevealProgress).toBeGreaterThan(0.5);
  });

  it('animates frameless logo waves emerging radially from center into non-overlapping formations and flying past camera', () => {
    const beforeWave = computeLogoWaveMotion(0.0, 2, 6, 0, 10);
    const entering = computeLogoWaveMotion(0.34, 2, 6, 0, 10);
    const peakA = computeLogoWaveMotion(0.415, 2, 6, 0, 10);
    const peakB = computeLogoWaveMotion(0.415, 2, 6, 5, 10);
    const exiting = computeLogoWaveMotion(0.495, 2, 6, 0, 10);
    const afterWave = computeLogoWaveMotion(0.85, 2, 6, 0, 10);

    expect(beforeWave.visible).toBe(false);
    expect(beforeWave.opacity).toBe(0);
    expect(entering.visible).toBe(true);
    expect(entering.scale).toBeLessThan(1);
    expect(entering.radialFactor).toBeLessThan(peakA.radialFactor);
    expect(peakA.opacity).toBeGreaterThan(0.95);
    expect(peakA.scale).toBeGreaterThanOrEqual(0.95);
    expect(peakA.scale).toBeLessThanOrEqual(1.08);
    expect(Math.abs(peakA.angleRad - peakB.angleRad)).toBeGreaterThan(2.5);
    expect(exiting.scale).toBeGreaterThan(1.1);
    expect(exiting.radialFactor).toBeGreaterThan(peakA.radialFactor);
    expect(exiting.opacity).toBeLessThan(peakA.opacity);
    expect(afterWave.visible).toBe(false);
  });

  it('assigns 6 unique spatial formations and watermarks across all 6 worlds with accurate jump targets', () => {
    const formations = new Set<string>();
    const watermarks = new Set<string>();

    for (let w = 0; w < 6; w++) {
      const theme = getTunnelWorldTheme(w);
      formations.add(theme.formation);
      watermarks.add(theme.watermark);

      const jumpP = waveIndexToTunnelProgress(w, 6);
      const phaseState = computeTunnelPhaseState(jumpP);
      expect(phaseState.phase).toBe(2);
      const peak = computeLogoWaveMotion(phaseState.showcaseProgress, w, 6, 0, 7);
      expect(peak.visible).toBe(true);
      expect(peak.opacity).toBeGreaterThan(0.95);
      expect(peak.formation).toBe(theme.formation);
    }

    expect(formations.size).toBe(6);
    expect(watermarks.size).toBe(6);
  });
});
