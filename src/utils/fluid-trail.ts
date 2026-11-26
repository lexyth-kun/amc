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
  kind: 'droplet' | 'ripple';
}

export interface OilWaterColorStops {
  coreWhite: string;
  outlineLight: string;
  outlineBlue: string;
  outlinePrism: string;
  shadowBlue: string;
}

/**
 * Generates restrained clear-white oil-on-water color stops where the main body
 * stays pure translucent white and only the outer shadow & refractive contour
 * outline shimmer in light sky blue with a whisper of water-oil iridescence.
 */
export function computeOilWaterStopColors(
  phase: number,
  life: number,
  velocityNorm = 0.5
): OilWaterColorStops {
  const alpha = Math.max(0, Math.min(1, life));
  const blueHue = Math.round(199 + Math.sin(phase * 0.65) * 6);
  const prismHue = Math.round(206 + Math.sin(phase * 0.95 + velocityNorm) * 28);

  return {
    coreWhite: `rgba(255, 255, 255, ${(alpha * 0.56).toFixed(3)})`,
    outlineLight: `rgba(255, 255, 255, ${(alpha * 0.82).toFixed(3)})`,
    outlineBlue: `hsla(${blueHue}, 94%, 62%, ${(alpha * 0.58).toFixed(3)})`,
    outlinePrism: `hsla(${prismHue}, 88%, 74%, ${(alpha * 0.36).toFixed(3)})`,
    shadowBlue: `hsla(${blueHue}, 92%, 68%, ${(alpha * 0.24).toFixed(3)})`,
  };
}

/**
 * Advances restrained clear-white oil-on-water trail droplets with subtle liquid
 * drift, gentle expansion, and automatic pruning once evaporated.
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
    if (d.life <= 0.01) continue;

    d.huePhase += 0.05 * step;
    const curlX = Math.cos(d.huePhase * 1.1 + d.swirl) * 0.12 * step;
    const curlY = Math.sin(d.huePhase * 0.95 - d.swirl) * 0.12 * step;

    d.x += (d.vx + curlX) * step;
    d.y += (d.vy + curlY) * step;
    d.vx *= Math.pow(0.91, step);
    d.vy *= Math.pow(0.91, step);

    const spreadRate = d.kind === 'ripple' ? 0.11 : 0.075;
    d.radius += (d.maxRadius - d.radius) * spreadRate * step;
    alive.push(d);
  }

  return alive;
}
