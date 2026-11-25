import { describe, expect, it } from 'vitest';
import { computeCardTilt, lerpNumber, nextReelStepIndex } from '@/utils/interaction-math';

describe('Featured Card 3D Tilt & Showreel Step Math (Milestone B)', () => {
  it('computes 3D tilt clamped strictly within ±8 degrees from normalized pointer coordinates', () => {
    const center = computeCardTilt(0.5, 0.5, 8);
    expect(center.rotateX).toBeCloseTo(0);
    expect(center.rotateY).toBeCloseTo(0);

    const topRight = computeCardTilt(1, 0, 8);
    expect(topRight.rotateX).toBe(8);
    expect(topRight.rotateY).toBe(8);

    const outOfBounds = computeCardTilt(3.5, -2, 8);
    expect(outOfBounds.rotateX).toBe(8);
    expect(outOfBounds.rotateY).toBe(8);
  });

  it('cycles showreel steps modulo total step count cleanly', () => {
    expect(nextReelStepIndex(0, 4)).toBe(1);
    expect(nextReelStepIndex(3, 4)).toBe(0);
    expect(nextReelStepIndex(0, 4, -1)).toBe(3);
  });

  it('interpolates smoothly via lerpNumber', () => {
    expect(lerpNumber(0, 10, 0.1)).toBeCloseTo(1);
  });
});
