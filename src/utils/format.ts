export function formatRupiah(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  const grouped = safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp${grouped}`;
}

export function buildProductOrderUrl(slug: string, baseUrl = 'https://order.amc.web.id'): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanSlug = slug.replace(/^\/+/, '');
  return `${cleanBase}/#aplikasi/${cleanSlug}`;
}

export function getStockProgressPercent(stockLeft: number, stockTotal: number): number {
  if (stockTotal <= 0) return 0;
  return Math.min(100, Math.max(6, Math.round((stockLeft / stockTotal) * 100)));
}

export function resolveOrderRedirect(pathname: string, search = '', hash = ''): string | null {
  const lower = pathname.toLowerCase();
  if (lower !== '/order' && lower !== '/order/' && !lower.startsWith('/order/')) {
    return null;
  }
  const rest = pathname.replace(/^\/order\/?/i, '');
  return `https://order.amc.web.id/${rest}${search}${hash}`;
}
