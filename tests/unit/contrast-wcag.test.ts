import { describe, expect, it } from 'vitest';
import { AMC_COLOR_PAIRS, contrastRatio, passesWcagAA } from '@/utils/contrast';

describe('WCAG 2.x AA Contrast Verification (R-25)', () => {
  it('computes accurate WCAG contrast ratios for reference colors', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#0B1B4D', '#FFFFFF')).toBeGreaterThan(16);
  });

  it('verifies every shipped AMC text/background color pair meets WCAG AA (>= 4.5:1 normal, >= 3.0:1 large)', () => {
    for (const pair of AMC_COLOR_PAIRS) {
      const ok = passesWcagAA(pair.fg, pair.bg, pair.isLargeText ?? false);
      const ratio = contrastRatio(pair.fg, pair.bg);
      expect(ok, `${pair.label} (${pair.fg} on ${pair.bg}) failed with ${ratio.toFixed(2)}:1`).toBe(true);
    }
  });
});
