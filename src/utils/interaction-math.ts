export interface CardTiltAngles {
  rotateX: number;
  rotateY: number;
}

export function computeCardTilt(normX: number, normY: number, maxDeg = 8): CardTiltAngles {
  const clampedX = Math.max(0, Math.min(1, normX));
  const clampedY = Math.max(0, Math.min(1, normY));

  const rotateY = (clampedX - 0.5) * 2 * maxDeg;
  const rotateX = (0.5 - clampedY) * 2 * maxDeg;

  return {
    rotateX: Math.max(-maxDeg, Math.min(maxDeg, rotateX)),
    rotateY: Math.max(-maxDeg, Math.min(maxDeg, rotateY)),
  };
}

export function lerpNumber(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}

export function nextReelStepIndex(current: number, total: number, delta = 1): number {
  if (total <= 0) return 0;
  return ((current + delta) % total + total) % total;
}
