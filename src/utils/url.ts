export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  const rawBase = import.meta.env.BASE_URL || '/';
  const base = rawBase.replace(/\/+$/, '');
  if (!base) return path;
  if (path === base || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}
