export interface ColorPairSpec {
  label: string;
  fg: string;
  bg: string;
  isLargeText?: boolean;
}

export function relativeLuminance(hex: string): number {
  const clean = hex.replace(/^#/, '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function passesWcagAA(fg: string, bg: string, isLargeText = false): boolean {
  const threshold = isLargeText ? 3.0 : 4.5;
  return contrastRatio(fg, bg) >= threshold;
}

export const AMC_COLOR_PAIRS: ColorPairSpec[] = [
  { label: 'Headline sky-navy on base white', fg: '#0C4A6E', bg: '#FFFFFF' },
  { label: 'Headline sky-navy on sky-50 alt surface', fg: '#0C4A6E', bg: '#F0F9FF' },
  { label: 'Headline sky-navy on sky-100 surface', fg: '#0C4A6E', bg: '#E0F2FE' },
  { label: 'Primary slate ink on base white', fg: '#0F172A', bg: '#FFFFFF' },
  { label: 'Body slate on base white', fg: '#475569', bg: '#FFFFFF' },
  { label: 'Body slate on sky-50 alt surface', fg: '#475569', bg: '#F0F9FF' },
  { label: 'Body slate on sky-100 showreel surface', fg: '#475569', bg: '#E0F2FE' },
  { label: 'Eyebrow sky-ink on base white', fg: '#0369A1', bg: '#FFFFFF' },
  { label: 'Eyebrow sky-ink on sky-50 alt surface', fg: '#0369A1', bg: '#F0F9FF' },
  { label: 'Eyebrow sky-ink on sky-100 surface', fg: '#0369A1', bg: '#E0F2FE' },
  { label: 'Deep sky-950 CTA text on order.amc.web.id brand gradient start', fg: '#082F49', bg: '#7DD3FC' },
  { label: 'Deep sky-950 CTA text on order.amc.web.id brand gradient end', fg: '#082F49', bg: '#38BDF8' },
  { label: 'Deep sky-950 CTA text on sky-500 hover state', fg: '#082F49', bg: '#0EA5E9' },
  { label: 'White text on sky-700 solid accent', fg: '#FFFFFF', bg: '#0369A1' },
  { label: 'Large display gradient sky-600 on white', fg: '#0284C7', bg: '#FFFFFF', isLargeText: true },
  { label: 'White badge text on sale-ink red', fg: '#FFFFFF', bg: '#D92D20' },
  { label: 'Dark forest ink on WhatsApp green CTA', fg: '#052E16', bg: '#25D366' },
  { label: 'White headline on deep sky-night cinematic stage', fg: '#FFFFFF', bg: '#082F49' },
  { label: 'Sky-400 highlight text on deep sky-night stage', fg: '#38BDF8', bg: '#082F49' },
  { label: 'Sky-300 highlight text on deep sky-night stage', fg: '#7DD3FC', bg: '#082F49' },
];
