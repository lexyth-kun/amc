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
    p < 0.25 ? 1 : p < 0.55 ? 2 : p < 0.8 ? 3 : 4;

  // Camera travels smoothly into tunnel across 0..0.82
  const travelT = rangeMap(p, 0, 0.82);
  const cameraZ = 14 - travelT * 50;

  // Phase 3 vortex narrowing (0.55..0.80)
  const vortexT = rangeMap(p, 0.55, 0.8);
  const tunnelRadiusScale = 1 - vortexT * 0.68;
  const tunnelTwistRad = p * Math.PI * 2.4 + vortexT * Math.PI * 1.8;

  // Orb gentle float in Phase 1-2, dramatic expansion toward camera in Phase 3
  const orbExpandT = Math.pow(rangeMap(p, 0.54, 0.81), 2.1);
  const orbScale = 1 + rangeMap(p, 0.25, 0.54) * 0.22 + orbExpandT * 6.4;
  const orbGlowIntensity = 1.2 + vortexT * 3.5;

  // Reverse black-hole whiteout burst locking to pure white at >= 0.82
  const whiteoutOpacity = p >= 0.82 ? 1 : Math.pow(rangeMap(p, 0.71, 0.82), 1.6);

  // Phase 1 headline scrub in & fade out
  const phase1WordProgress = 0.38 + 0.62 * rangeMap(p, 0.0, 0.1);
  const phase1FadeOut = 1 - rangeMap(p, 0.21, 0.26);
  const phase1Opacity = p < 0.27 ? phase1FadeOut : 0;

  // Phase 2 tunnel caption visibility
  const p2In = rangeMap(p, 0.28, 0.34);
  const p2Out = 1 - rangeMap(p, 0.48, 0.54);
  const phase2Opacity = Math.min(p2In, p2Out);

  // Phase 4 pure white world reveal
  const phase4RevealProgress = rangeMap(p, 0.82, 0.94);

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
    phase4RevealProgress,
  };
}
