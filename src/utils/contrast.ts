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
  { label: 'Headline navy on base white', fg: '#0B1B4D', bg: '#FFFFFF' },
  { label: 'Primary ink on base white', fg: '#0B1220', bg: '#FFFFFF' },
  { label: 'Body slate on base white', fg: '#475569', bg: '#FFFFFF' },
  { label: 'Body slate on alt surface', fg: '#475569', bg: '#F4F8FF' },
  { label: 'Body slate on showreel surface', fg: '#475569', bg: '#EAF3FF' },
  { label: 'Eyebrow sky-ink on base white', fg: '#0369A1', bg: '#FFFFFF' },
  { label: 'Eyebrow sky-ink on alt surface', fg: '#0369A1', bg: '#F4F8FF' },
  { label: 'White CTA text on AMC blue start', fg: '#FFFFFF', bg: '#1A36FF' },
  { label: 'White CTA text on AMC blue end', fg: '#FFFFFF', bg: '#233DFF' },
  { label: 'White Flash Sale header text on deep sky anchor', fg: '#FFFFFF', bg: '#0369A1' },
  { label: 'White badge text on sale-ink red', fg: '#FFFFFF', bg: '#D92D20' },
  { label: 'Dark forest ink on WhatsApp green CTA', fg: '#052E16', bg: '#25D366' },
  { label: 'White headline on dark space cinematic stage', fg: '#FFFFFF', bg: '#061A3A' },
  { label: 'Sky highlight text on dark space stage', fg: '#38BDF8', bg: '#061A3A' },
];
