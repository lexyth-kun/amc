export interface ReviewCardFlipState {
  angleDeg: number;
  frontWaveIndex: 0 | 2;
  backWaveIndex: 1;
  showingFace: 'front' | 'back';
  visibleWaveIndex: 0 | 1 | 2;
  sheenOpacity: number;
  liftPx: number;
}

export interface ReviewDeckState {
  activeWaveIndex: 0 | 1 | 2;
  progress: number;
  cards: ReviewCardFlipState[];
}

export interface SphereBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  tone: 'pearl' | 'sky' | 'light' | 'deep';
  phase: number;
}

export interface SpherePointerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  grabbedIndex: number | null;
}

export interface ViewportBounds {
  width: number;
  height: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function waveIndexToScrollProgress(waveIndex: 0 | 1 | 2): number {
  if (waveIndex === 0) return 0.04;
  if (waveIndex === 1) return 0.55;
  return 0.96;
}

/**
 * Computes deterministic, reversible 3D scroll-flip angles across 3 review waves
 * (Wave 0: 0deg Front -> Wave 1: 180deg Back -> Wave 2: 360deg Front).
 * The front face swaps between Wave 0 and Wave 2 at 180deg while completely hidden
 * behind backface-visibility: hidden, preventing mirrored text or flicker in either scroll direction.
 */
export function computeReviewDeckFlipState(progress: number, cardCount = 3): ReviewDeckState {
  const p = clamp01(progress);
  const cards: ReviewCardFlipState[] = [];

  for (let i = 0; i < cardCount; i++) {
    const stagger = i * 0.045;
    const flip1Start = 0.18 + stagger;
    const flip1End = 0.42 + stagger;
    const flip2Start = 0.59 + stagger;
    const flip2End = 0.83 + stagger;

    let angleDeg = 0;
    if (p <= flip1Start) {
      angleDeg = 0;
    } else if (p < flip1End) {
      const local = (p - flip1Start) / (flip1End - flip1Start);
      angleDeg = easeInOutCubic(local) * 180;
    } else if (p <= flip2Start) {
      angleDeg = 180;
    } else if (p < flip2End) {
      const local = (p - flip2Start) / (flip2End - flip2Start);
      angleDeg = 180 + easeInOutCubic(local) * 180;
    } else {
      angleDeg = 360;
    }

    const frontWaveIndex: 0 | 2 = angleDeg < 180 ? 0 : 2;
    const backWaveIndex: 1 = 1;
    const showingFace: 'front' | 'back' = angleDeg >= 90 && angleDeg < 270 ? 'back' : 'front';
    const visibleWaveIndex: 0 | 1 | 2 = showingFace === 'back' ? 1 : frontWaveIndex;

    const turnIntensity = Math.abs(Math.sin((angleDeg * Math.PI) / 180));
    const sheenOpacity = Number((turnIntensity * 0.65).toFixed(4));
    const liftPx = Number((turnIntensity * 28).toFixed(2));

    cards.push({
      angleDeg: Number(angleDeg.toFixed(3)),
      frontWaveIndex,
      backWaveIndex,
      showingFace,
      visibleWaveIndex,
      sheenOpacity,
      liftPx,
    });
  }

  const activeWaveIndex: 0 | 1 | 2 = p < 0.34 ? 0 : p < 0.75 ? 1 : 2;
  return {
    activeWaveIndex,
    progress: p,
    cards,
  };
}

export function findSphereAtPoint(spheres: SphereBody[], x: number, y: number): number | null {
  for (let i = spheres.length - 1; i >= 0; i--) {
    const s = spheres[i];
    const dx = x - s.x;
    const dy = y - s.y;
    const hitRadius = s.radius + 8;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      return i;
    }
  }
  return null;
}

/**
 * Advances interactive 3D-shaded sphere particles with cursor wake repulsion,
 * grab-and-throw spring control, pairwise elastic collision, and viewport wall bounce.
 */
export function stepSphereParticlePhysics(
  spheres: SphereBody[],
  pointer: SpherePointerState,
  bounds: ViewportBounds,
  dt = 1
): void {
  const step = Math.max(0.25, Math.min(2.2, dt));
  const maxSpeed = 24;

  for (let i = 0; i < spheres.length; i++) {
    const s = spheres[i];
    s.phase += 0.012 * step;

    if (pointer.grabbedIndex === i && pointer.active) {
      const pullX = (pointer.x - s.x) * 0.34;
      const pullY = (pointer.y - s.y) * 0.34;
      s.vx = pullX + pointer.vx * 0.35;
      s.vy = pullY + pointer.vy * 0.35;
      s.x += s.vx * step;
      s.y += s.vy * step;
      continue;
    }

    // Gentle buoyant drift
    s.vx += Math.cos(s.phase) * 0.018 * step;
    s.vy += Math.sin(s.phase * 0.85) * 0.016 * step;

    // Tactile hover push & cursor wake transfer
    if (pointer.active && pointer.grabbedIndex === null) {
      const dx = s.x - pointer.x;
      const dy = s.y - pointer.y;
      const influence = s.radius + 130;
      const distSq = dx * dx + dy * dy;
      if (distSq > 1 && distSq < influence * influence) {
        const dist = Math.sqrt(distSq);
        const proximity = 1 - dist / influence;
        const push = proximity * proximity * 2.2 * step;
        s.vx += (dx / dist) * push + pointer.vx * proximity * 0.16;
        s.vy += (dy / dist) * push + pointer.vy * proximity * 0.16;
      }
    }

    // Smooth fluid damping & speed clamp
    const damp = Math.pow(0.976, step);
    s.vx *= damp;
    s.vy *= damp;

    const speed = Math.hypot(s.vx, s.vy);
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      s.vx *= ratio;
      s.vy *= ratio;
    }

    s.x += s.vx * step;
    s.y += s.vy * step;
  }

  // Pairwise elastic sphere-to-sphere collisions
  for (let i = 0; i < spheres.length; i++) {
    for (let j = i + 1; j < spheres.length; j++) {
      const a = spheres[i];
      const b = spheres[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const minDist = a.radius + b.radius + 2;
      const distSq = dx * dx + dy * dy;

      if (distSq > 0.0001 && distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;

        const aGrabbed = pointer.grabbedIndex === i && pointer.active;
        const bGrabbed = pointer.grabbedIndex === j && pointer.active;

        if (aGrabbed && !bGrabbed) {
          b.x += nx * overlap;
          b.y += ny * overlap;
        } else if (bGrabbed && !aGrabbed) {
          a.x -= nx * overlap;
          a.y -= ny * overlap;
        } else {
          const totalMass = a.mass + b.mass;
          a.x -= nx * overlap * (b.mass / totalMass);
          a.y -= ny * overlap * (b.mass / totalMass);
          b.x += nx * overlap * (a.mass / totalMass);
          b.y += ny * overlap * (a.mass / totalMass);
        }

        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const velAlongNormal = rvx * nx + rvy * ny;
        if (velAlongNormal < 0) {
          const restitution = 0.84;
          const invMassA = aGrabbed ? 0 : 1 / a.mass;
          const invMassB = bGrabbed ? 0 : 1 / b.mass;
          const denom = invMassA + invMassB;
          if (denom > 0) {
            const impulse = (-(1 + restitution) * velAlongNormal) / denom;
            a.vx -= impulse * invMassA * nx;
            a.vy -= impulse * invMassA * ny;
            b.vx += impulse * invMassB * nx;
            b.vy += impulse * invMassB * ny;
          }
        }
      }
    }
  }

  // Soft elastic wall containment
  const pad = 6;
  for (let i = 0; i < spheres.length; i++) {
    const s = spheres[i];
    const minX = s.radius + pad;
    const maxX = Math.max(minX, bounds.width - s.radius - pad);
    const minY = s.radius + pad;
    const maxY = Math.max(minY, bounds.height - s.radius - pad);

    if (s.x < minX) {
      s.x = minX;
      s.vx = Math.abs(s.vx) * 0.78;
    } else if (s.x > maxX) {
      s.x = maxX;
      s.vx = -Math.abs(s.vx) * 0.78;
    }

    if (s.y < minY) {
      s.y = minY;
      s.vy = Math.abs(s.vy) * 0.78;
    } else if (s.y > maxY) {
      s.y = maxY;
      s.vy = -Math.abs(s.vy) * 0.78;
    }
  }
}
