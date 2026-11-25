export function isAtDocumentBottom(
  scrollY: number,
  viewportHeight: number,
  scrollHeight: number,
  thresholdPx = 12
): boolean {
  if (scrollHeight <= viewportHeight) return true;
  return scrollY + viewportHeight >= scrollHeight - thresholdPx;
}

export function advanceOverscrollCharge(
  currentCharge: number,
  deltaY: number,
  requiredPx = 620
): number {
  if (!Number.isFinite(currentCharge) || !Number.isFinite(deltaY) || requiredPx <= 0) {
    return 0;
  }
  const next = currentCharge + deltaY / requiredPx;
  return Math.max(0, Math.min(1, next));
}

export function decayOverscrollCharge(
  currentCharge: number,
  dtSeconds: number,
  decayRate = 0.75
): number {
  if (!Number.isFinite(currentCharge) || !Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return Math.max(0, Math.min(1, currentCharge || 0));
  }
  return Math.max(0, currentCharge - dtSeconds * decayRate);
}

export function shouldTriggerNextPage(charge: number): boolean {
  return Number.isFinite(charge) && charge >= 1;
}
