export interface TunnelPhaseState {
  progress: number;
  phase: 1 | 2 | 3 | 4;
  cameraZ: number;
  tunnelRadiusScale: number;
  tunnelTwistRad: number;
  orbScale: number;
  orbGlowIntensity: number;
  whiteoutOpacity: number;
  phase1Opacity: number;
  phase1WordProgress: number;
  phase2Opacity: number;
  showcaseProgress: number;
  phase4RevealProgress: number;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function rangeMap(v: number, inMin: number, inMax: number): number {
  if (inMax <= inMin) return 0;
  return clamp01((v - inMin) / (inMax - inMin));
}

export function computeTunnelPhaseState(rawProgress: number): TunnelPhaseState {
  const p = clamp01(rawProgress);

  const phase: 1 | 2 | 3 | 4 =
    p < 0.16 ? 1 : p < 0.78 ? 2 : p < 0.9 ? 3 : 4;

  // Extended camera flight across 0..0.90 so every AMC service glides smoothly into view
  const travelT = rangeMap(p, 0, 0.9);
  const cameraZ = 16 - travelT * 88;

  // Phase 3 vortex narrowing (0.78..0.90)
  const vortexT = rangeMap(p, 0.78, 0.9);
  const tunnelRadiusScale = 1 - vortexT * 0.68;
  const tunnelTwistRad = p * Math.PI * 3.2 + vortexT * Math.PI * 1.8;

  // Orb gentle float in Phase 1-2, dramatic expansion toward camera in Phase 3
  const orbExpandT = Math.pow(rangeMap(p, 0.76, 0.9), 2.1);
  const orbScale = 1 + rangeMap(p, 0.16, 0.76) * 0.28 + orbExpandT * 6.4;
  const orbGlowIntensity = 1.2 + vortexT * 3.5;

  // Reverse black-hole whiteout burst locking to pure white at >= 0.90
  const whiteoutOpacity = p >= 0.9 ? 1 : Math.pow(rangeMap(p, 0.83, 0.9), 1.6);

  // Phase 1 headline scrub in & fade out (0.00..0.16)
  const phase1WordProgress = 0.35 + 0.65 * rangeMap(p, 0.0, 0.08);
  const phase1FadeOut = 1 - rangeMap(p, 0.12, 0.17);
  const phase1Opacity = p < 0.18 ? phase1FadeOut : 0;

  // Phase 2 extended all-services showcase (0.16..0.78)
  const p2In = rangeMap(p, 0.15, 0.21);
  const p2Out = 1 - rangeMap(p, 0.74, 0.8);
  const phase2Opacity = Math.min(p2In, p2Out);
  const showcaseProgress = rangeMap(p, 0.16, 0.76);

  // Phase 4 pure white world reveal (0.90..1.00)
  const phase4RevealProgress = rangeMap(p, 0.9, 0.97);

  return {
    progress: p,
    phase,
    cameraZ,
    tunnelRadiusScale,
    tunnelTwistRad,
    orbScale,
    orbGlowIntensity,
    whiteoutOpacity,
    phase1Opacity,
    phase1WordProgress,
    phase2Opacity,
    showcaseProgress,
    phase4RevealProgress,
  };
}
