export function computeHorizontalScrollDistance(trackWidth: number, viewportWidth: number): number {
  if (!Number.isFinite(trackWidth) || !Number.isFinite(viewportWidth)) return 0;
  return Math.max(0, Math.round(trackWidth - viewportWidth));
}

export function computeDetailProgress(scrollOffset: number, maxScrollDistance: number): number {
  if (!Number.isFinite(scrollOffset) || !Number.isFinite(maxScrollDistance) || maxScrollDistance <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, scrollOffset / maxScrollDistance));
}

export function computeActivePanelIndex(progress: number, panelCount: number): number {
  if (!Number.isFinite(progress) || panelCount <= 1) return 0;
  const clamped = Math.max(0, Math.min(1, progress));
  return Math.min(panelCount - 1, Math.floor(clamped * panelCount));
}
