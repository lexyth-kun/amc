import { describe, expect, it } from 'vitest';
import { AMC_COLOR_PAIRS, contrastRatio, passesWcagAA } from '@/utils/contrast';

describe('WCAG 2.x AA Contrast Verification — order.amc.web.id Sky Blue Palette (R-25)', () => {
  it('computes accurate WCAG contrast ratios for Sky Blue AMC tokens', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#0C4A6E', '#FFFFFF')).toBeGreaterThan(9);
    expect(contrastRatio('#082F49', '#38BDF8')).toBeGreaterThan(6);
    expect(contrastRatio('#082F49', '#7DD3FC')).toBeGreaterThan(8);
  });

  it('uses authentic order.amc.web.id Sky Blue tokens with zero royal-indigo #1A36FF / #233DFF', () => {
    const serialized = JSON.stringify(AMC_COLOR_PAIRS).toUpperCase();
    expect(serialized).toContain('#38BDF8');
    expect(serialized).toContain('#7DD3FC');
    expect(serialized).toContain('#0369A1');
    expect(serialized).not.toContain('#1A36FF');
    expect(serialized).not.toContain('#233DFF');
  });

  it('verifies every shipped AMC text/background color pair meets WCAG AA (>= 4.5:1 normal, >= 3.0:1 large)', () => {
    for (const pair of AMC_COLOR_PAIRS) {
      const ok = passesWcagAA(pair.fg, pair.bg, pair.isLargeText ?? false);
      const ratio = contrastRatio(pair.fg, pair.bg);
      expect(ok, `${pair.label} (${pair.fg} on ${pair.bg}) failed with ${ratio.toFixed(2)}:1`).toBe(true);
    }
  });
});
