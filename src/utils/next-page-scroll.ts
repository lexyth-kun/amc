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

export interface FooterNextPageTarget {
  href: string;
  title: string;
  eyebrow: string;
  nextLabel: string;
  hint: string;
  external: boolean;
}

export function resolveFooterNextPage(
  rawPathname: string,
  rawBaseUrl = '/'
): FooterNextPageTarget {
  const base = rawBaseUrl.replace(/\/+$/, '');
  let normalized = rawPathname || '/';
  if (base && (normalized === base || normalized.startsWith(`${base}/`))) {
    normalized = normalized.slice(base.length) || '/';
  }
  normalized = normalized.replace(/\/+$/, '') || '/';

  if (normalized === '/about') {
    return {
      href: 'https://order.amc.web.id',
      title: 'order.amc.web.id',
      eyebrow: 'TERUS SCROLL UNTUK MULAI ORDER',
      nextLabel: 'Menuju Web Shop Resmi',
      hint: 'Scroll terus ke bawah atau klik untuk langsung order di order.amc.web.id.',
      external: true,
    };
  }

  if (normalized === '/kategori') {
    return {
      href: '/produk/',
      title: 'Semua Produk (41+)',
      eyebrow: 'TERUS SCROLL UNTUK LANJUT',
      nextLabel: 'Halaman Berikutnya',
      hint: 'Scroll terus ke bawah atau klik untuk menjelajahi seluruh 41+ layanan.',
      external: false,
    };
  }

  return {
    href: '/about/',
    title: 'Tentang AMC',
    eyebrow: 'TERUS SCROLL UNTUK LANJUT',
    nextLabel: 'Halaman Berikutnya',
    hint: 'Scroll terus ke bawah atau klik untuk mengenal pembuat Al Muthi Creative.',
    external: false,
  };
}
