export type LogoFormationKind =
  | 'helix'
  | 'spiral'
  | 'horizon'
  | 'binary'
  | 'starburst'
  | 'chevron';

export interface TunnelPhaseState {
  progress: number;
  phase: 1 | 2 | 3 | 4;
  cameraZ: number;
  tunnelRadiusScale: number;
  tunnelTwistRad: number;
  orbScale: number;
  orbGlowIntensity: number;
  warpStreakScale: number;
  whiteoutOpacity: number;
  phase1Opacity: number;
  phase1WordProgress: number;
  phase2Opacity: number;
  showcaseProgress: number;
  phase4RevealProgress: number;
}

export interface TunnelWorldTheme {
  waveIndex: number;
  formation: LogoFormationKind;
  bgHex: number;
  accentHex: number;
  ringSides: number;
  watermark: string;
}

const WORLD_THEMES: readonly TunnelWorldTheme[] = [
  { waveIndex: 0, formation: 'helix', bgHex: 0x06253c, accentHex: 0x38bdf8, ringSides: 6, watermark: 'AI 2026' },
  { waveIndex: 1, formation: 'spiral', bgHex: 0x0a2246, accentHex: 0x60a5fa, ringSides: 32, watermark: 'KREASI' },
  { waveIndex: 2, formation: 'horizon', bgHex: 0x0b1f3d, accentHex: 0x7dd3fc, ringSides: 8, watermark: 'HIBURAN' },
  { waveIndex: 3, formation: 'binary', bgHex: 0x042838, accentHex: 0x22d3ee, ringSides: 6, watermark: 'PRIVASI' },
  { waveIndex: 4, formation: 'starburst', bgHex: 0x082d52, accentHex: 0x38bdf8, ringSides: 5, watermark: 'BUZZER' },
  { waveIndex: 5, formation: 'chevron', bgHex: 0x051c36, accentHex: 0xbae6fd, ringSides: 4, watermark: 'GAMING' },
];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function rangeMap(v: number, inMin: number, inMax: number): number {
  if (inMax <= inMin) return 0;
  return clamp01((v - inMin) / (inMax - inMin));
}

function smoothstep(v: number): number {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
}

export function getTunnelWorldTheme(waveIndex: number): TunnelWorldTheme {
  const idx = Math.max(0, Math.min(WORLD_THEMES.length - 1, Math.floor(waveIndex)));
  return WORLD_THEMES[idx];
}

export function waveIndexToTunnelProgress(waveIndex: number, groupCount = 6): number {
  const safeGroups = Math.max(1, groupCount);
  const clamped = Math.max(0, Math.min(safeGroups - 1, waveIndex));
  const showcaseTarget = (clamped + 0.5) / safeGroups;
  // Phase 2 showcase maps linearly over overall scroll progress 0.16..0.76
  return Number((0.16 + showcaseTarget * 0.6).toFixed(4));
}

export function computeTunnelPhaseState(rawProgress: number): TunnelPhaseState {
  const p = clamp01(rawProgress);

  const phase: 1 | 2 | 3 | 4 =
    p < 0.16 ? 1 : p < 0.78 ? 2 : p < 0.9 ? 3 : 4;

  // Extended camera flight across 0..0.90 so every AMC world glides smoothly into view
  const travelT = rangeMap(p, 0, 0.9);
  const cameraZ = 16 - travelT * 92;

  // Phase 3 vortex narrowing (0.78..0.90)
  const vortexT = rangeMap(p, 0.78, 0.9);
  const tunnelRadiusScale = 1 - vortexT * 0.68;
  const tunnelTwistRad = p * Math.PI * 3.4 + vortexT * Math.PI * 2.2;

  // Orb gentle float in Phase 1-2, dramatic expansion toward camera in Phase 3
  const orbExpandT = Math.pow(rangeMap(p, 0.76, 0.9), 2.1);
  const orbScale = 1 + rangeMap(p, 0.16, 0.76) * 0.28 + orbExpandT * 6.4;
  const orbGlowIntensity = 1.2 + vortexT * 3.5;

  // Phase 2 extended all-services showcase (0.16..0.78)
  const p2In = rangeMap(p, 0.15, 0.21);
  const p2Out = 1 - rangeMap(p, 0.74, 0.8);
  const phase2Opacity = Math.min(p2In, p2Out);
  const showcaseProgress = rangeMap(p, 0.16, 0.76);

  // Dynamic warp speed streaks surge subtly between waves and overdrive in Phase 3
  const wavePulse = Math.abs(Math.sin(showcaseProgress * Math.PI * 6));
  const warpStreakScale = 1 + (1 - wavePulse) * 0.85 + vortexT * 4.5;

  // Reverse black-hole whiteout burst locking to pure white at >= 0.90
  const whiteoutOpacity = p >= 0.9 ? 1 : Math.pow(rangeMap(p, 0.83, 0.9), 1.6);

  // Phase 1 headline scrub in & fade out (0.00..0.16)
  const phase1WordProgress = 0.55 + 0.45 * rangeMap(p, 0.0, 0.055);
  const phase1FadeOut = 1 - rangeMap(p, 0.12, 0.17);
  const phase1Opacity = p < 0.18 ? phase1FadeOut : 0;

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
    warpStreakScale,
    whiteoutOpacity,
    phase1Opacity,
    phase1WordProgress,
    phase2Opacity,
    showcaseProgress,
    phase4RevealProgress,
  };
}

export interface LogoWaveMotion {
  visible: boolean;
  formation: LogoFormationKind;
  opacity: number;
  scale: number;
  radialFactor: number;
  angleRad: number;
  xNorm: number;
  yNorm: number;
  rotateDeg: number;
  tiltYDeg: number;
}

export function computeLogoWaveMotion(
  showcaseProgress: number,
  groupIndex: number,
  groupCount: number,
  itemIndex: number,
  itemCount = 8
): LogoWaveMotion {
  const safeGroups = Math.max(1, groupCount);
  const safeItems = Math.max(1, itemCount);
  const theme = getTunnelWorldTheme(groupIndex % WORLD_THEMES.length);
  const formation = theme.formation;

  const slice = 1 / safeGroups;
  const pad = slice * 0.05;
  const start = Math.max(0, groupIndex * slice - pad);
  const end = Math.min(1, (groupIndex + 1) * slice + pad);
  const span = Math.max(0.0001, end - start);
  const t = (clamp01(showcaseProgress) - start) / span;

  const fallbackAngle =
    (itemIndex / safeItems) * Math.PI * 2 - Math.PI / 2 + groupIndex * 0.42;

  if (t <= 0 || t >= 1) {
    return {
      visible: false,
      formation,
      opacity: 0,
      scale: 0.35,
      radialFactor: 0.32,
      angleRad: fallbackAngle,
      xNorm: 0,
      yNorm: 0,
      rotateDeg: 0,
      tiltYDeg: 0,
    };
  }

  const stagger = (itemIndex % 5) * 0.016;
  const enter = smoothstep(rangeMap(t, stagger, 0.26 + stagger));
  const exit = smoothstep(rangeMap(t, 0.74 + stagger * 0.28, 1.0));
  const opacity = clamp01(enter * (1 - exit));

  // Base formation coordinates in normalized viewport space (-1..+1)
  let baseX = 0;
  let baseY = 0;
  let rotateDeg = 0;
  let tiltYDeg = 0;
  let prominenceScale = 1;

  if (formation === 'helix') {
    // 01 AI & Produktivitas: Twin neural double-helix ribbon framing central gyro core
    const strand = itemIndex % 2 === 0 ? -1 : 1;
    const cols = Math.max(1, Math.ceil(safeItems / 2));
    const colIdx = Math.floor(itemIndex / 2);
    const u = cols > 1 ? colIdx / (cols - 1) : 0.5;
    baseX = (u - 0.5) * 1.56 + strand * 0.05;
    const wave = Math.sin(u * Math.PI * 1.45 + (t - 0.5) * Math.PI * 1.15);
    baseY = strand * (0.54 + wave * 0.16);
    rotateDeg = strand * wave * 6;
    tiltYDeg = (u - 0.5) * 18;
  } else if (formation === 'spiral') {
    // 02 Kreasi & Desain: Sculptural Bauhaus fan arc & golden spiral with open left/right gallery clearance
    const u = safeItems > 1 ? itemIndex / (safeItems - 1) : 0.5;
    const theta = -Math.PI * 0.78 + u * Math.PI * 1.56 + (t - 0.5) * 0.52;
    const band = 0.66 + (itemIndex % 2) * 0.22;
    baseX = Math.cos(theta) * band * 1.08;
    baseY = Math.sin(theta) * band * 0.88;
    rotateDeg = Math.cos(theta) * 8;
    tiltYDeg = Math.sin(theta) * 16;
  } else if (formation === 'horizon') {
    // 03 Hiburan & Musik: Dual panoramic stereo equalizer waves framing the glowing gyro core
    const half = Math.ceil(safeItems / 2);
    const row = itemIndex < half ? -1 : 1;
    const col = itemIndex < half ? itemIndex : itemIndex - half;
    const rowCount = itemIndex < half ? half : Math.max(1, safeItems - half);
    const u = rowCount > 1 ? col / (rowCount - 1) - 0.5 : 0;
    const drift = row * (t - 0.5) * 0.16;
    const eqBounce = Math.sin(t * Math.PI * 2.8 + col * 1.15 + row) * 0.07;
    baseX = u * 1.5 + drift;
    baseY = row * 0.6 + eqBounce;
    rotateDeg = row * Math.cos(t * Math.PI * 2 + col) * 4;
    tiltYDeg = u * 14;
  } else if (formation === 'binary') {
    // 04 VPN & Keamanan: Bold twin planetary shield lock flanking central security core
    const theta = (itemIndex / safeItems) * Math.PI * 2 + (t - 0.5) * Math.PI * 0.88;
    baseX = Math.cos(theta) * 0.62;
    baseY = Math.sin(theta) * 0.36;
    rotateDeg = Math.sin(theta) * 6;
    tiltYDeg = Math.cos(theta) * 20;
    prominenceScale = 1.16;
  } else if (formation === 'starburst') {
    // 05 Buzzer Sosmed: Energetic radial pentagon viral shockwave framing central orb
    const theta = (itemIndex / safeItems) * Math.PI * 2 - Math.PI / 2 + (t - 0.5) * 0.45;
    const pulse = 0.78 + Math.sin(t * Math.PI * 3 + itemIndex * 0.7) * 0.06;
    baseX = Math.cos(theta) * pulse * 1.04;
    baseY = Math.sin(theta) * pulse * 0.94;
    rotateDeg = Math.sin(t * Math.PI * 2 + itemIndex) * 7;
    tiltYDeg = Math.cos(theta) * 16;
  } else {
    // 06 Top Up Game: Hyper-warp V-squadron chevron flying high above central gyro core
    const center = (safeItems - 1) / 2;
    const offset = center > 0 ? (itemIndex - center) / center : 0;
    const absOff = Math.abs(offset);
    baseX = offset * 0.92;
    baseY = -0.72 + absOff * 1.12 + Math.sin(t * Math.PI * 2.4 + itemIndex) * 0.04;
    rotateDeg = offset * 8;
    tiltYDeg = -offset * 22;
  }

  const radialFactor = 0.36 + enter * 0.64 + exit * 0.56;
  const breath = Math.sin(t * Math.PI * 2 + itemIndex * 0.85) * 0.025;
  const scale = (0.38 + enter * 0.62 + breath + exit * 0.56) * prominenceScale;

  // Radial emerge from central core on enter, then sweep past camera on exit
  const xNorm = baseX * radialFactor;
  const yNorm = baseY * radialFactor;
  const angleRad = Math.atan2(yNorm, xNorm);

  return {
    visible: opacity > 0.01,
    formation,
    opacity,
    scale,
    radialFactor,
    angleRad,
    xNorm,
    yNorm,
    rotateDeg,
    tiltYDeg,
  };
}
