import { describe, expect, it } from 'vitest';
import { computeCountdownParts } from '@/utils/countdown';

describe('Flash Sale WIB Countdown Calculator (Milestone C)', () => {
  const targetIso = '2026-11-30T23:59:00+07:00';

  it('computes accurate days, hours, minutes, and seconds before WIB deadline', () => {
    const now = new Date('2026-11-25T15:58:30+07:00').getTime();
    const parts = computeCountdownParts(targetIso, now);

    expect(parts.isExpired).toBe(false);
    expect(parts.days).toBe('05');
    expect(parts.hours).toBe('08');
    expect(parts.minutes).toBe('00');
    expect(parts.seconds).toBe('30');
  });

  it('clamps to 00:00:00:00 and sets isExpired=true at or after deadline', () => {
    const after = new Date('2026-12-01T00:00:01+07:00').getTime();
    const parts = computeCountdownParts(targetIso, after);

    expect(parts.isExpired).toBe(true);
    expect(parts.days).toBe('00');
    expect(parts.hours).toBe('00');
    expect(parts.minutes).toBe('00');
    expect(parts.seconds).toBe('00');
  });
});
