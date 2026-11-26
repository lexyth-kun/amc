export interface FluidTrailDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  life: number; // 1 -> 0
  decay: number;
  huePhase: number;
  swirl: number;
  kind: 'slick' | 'ripple';
}

export interface OilWaterColorStops {
  inner: string;
  mid: string;
  outer: string;
  rim: string;
}

/**
 * Generates light-blue dominant iridescent oil-on-water color stops.
 * Anchors around Sky Blue (196deg) while shifting organically across
 * aqua-mint (176deg), ice-cyan (192deg), periwinkle-sky (222deg),
 * and whisper lilac-pearl (262deg) like thin-film interference on water.
 */
export function computeOilWaterStopColors(
  phase: number,
  life: number,
  velocityNorm = 0.5
): OilWaterColorStops {
  const alpha = Math.max(0, Math.min(1, life));
  const shimmer = Math.sin(phase) * 0.5 + 0.5;
  const shift = Math.cos(phase * 0.72 + velocityNorm * 1.4);

  // Dominant light sky blue core (192..204 deg)
  const coreHue = Math.round(197 + Math.sin(phase * 0.55) * 8);
  // Aqua-cyan oil shimmer (174..206 deg)
  const midHue = Math.round(188 + shift * 18);
  // Subtle rainbow thin-film edge drifting between aqua-mint (168) and pastel periwinkle-lilac (268)
  const prismHue = Math.round(218 + Math.sin(phase * 0.9 + 1.1) * 46);
  const rimHue = Math.round(190 + shimmer * 68);

  return {
    inner: `hsla(${coreHue}, 96%, 76%, ${(alpha * 0.42).toFixed(3)})`,
    mid: `hsla(${midHue}, 92%, 74%, ${(alpha * 0.30).toFixed(3)})`,
    outer: `hsla(${prismHue}, 88%, 78%, ${(alpha * 0.22).toFixed(3)})`,
    rim: `hsla(${rimHue}, 90%, 72%, ${(alpha * 0.34).toFixed(3)})`,
  };
}

/**
 * Advances fluid oil-on-water trail droplets with gentle curl dispersion,
 * radius expansion, velocity damping, and automatic pruning of expired drops.
 */
export function stepFluidTrailDrops(
  drops: FluidTrailDrop[],
  dt = 1
): FluidTrailDrop[] {
  const step = Math.max(0.25, Math.min(2.2, dt));
  const alive: FluidTrailDrop[] = [];

  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    d.life -= d.decay * step;
    if (d.life <= 0.008) continue;

    d.huePhase += 0.055 * step;
    // Gentle water-current curl drift
    const curlX = Math.cos(d.huePhase * 1.3 + d.swirl) * 0.16 * step;
    const curlY = Math.sin(d.huePhase * 1.1 - d.swirl) * 0.16 * step;

    d.x += (d.vx + curlX) * step;
    d.y += (d.vy + curlY) * step;
    d.vx *= Math.pow(0.93, step);
    d.vy *= Math.pow(0.93, step);

    // Oil film spreads wider as it dissolves into water
    const spreadRate = d.kind === 'ripple' ? 0.12 : 0.065;
    d.radius += (d.maxRadius - d.radius) * spreadRate * step;
    alive.push(d);
  }

  return alive;
}
