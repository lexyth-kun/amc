export interface NewsletterValidationResult {
  status: 'empty' | 'invalid' | 'valid';
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// TODO(v2): Connect newsletter form to official AMC mailing list endpoint once backend is provisioned.
export function validateNewsletterEmail(rawEmail: string): NewsletterValidationResult {
  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return {
      status: 'empty',
      message: 'Masukkan alamat email terlebih dahulu.',
    };
  }

  if (!EMAIL_RE.test(trimmed)) {
    return {
      status: 'invalid',
      message: 'Format email belum sesuai, contoh: nama@email.com.',
    };
  }

  return {
    status: 'valid',
    message:
      'Email dicatat di perangkat ini (server buletin email segera aktif). Untuk info promo tercepat hari ini, cek @almuthi_creative atau chat Admin WA.',
  };
}

export function formatAnimatedCounter(value: number, decimals = 0, suffix = ''): string {
  if (decimals > 0) {
    return `${value.toFixed(decimals)}${suffix}`;
  }
  const rounded = Math.round(value);
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped}${suffix}`;
}
