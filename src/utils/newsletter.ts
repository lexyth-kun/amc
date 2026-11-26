export interface WhatsappOptInResult {
  status: 'empty' | 'invalid' | 'valid';
  message: string;
  normalizedPhone?: string;
  waBotUrl?: string;
}

export const AMC_BOT_WA = '27748304118';

export function validateWhatsappOptIn(rawPhone: string): WhatsappOptInResult {
  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return {
      status: 'empty',
      message: 'Masukkan nomor telepon atau WhatsApp terlebih dahulu.',
    };
  }

  if (/[^0-9+\-\s().]/.test(trimmed)) {
    return {
      status: 'invalid',
      message: 'Format nomor belum valid. Contoh: 081234567890 atau +6281234567890.',
    };
  }

  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = `62${digits.slice(1)}`;
  }

  if (digits.length < 9 || digits.length > 15) {
    return {
      status: 'invalid',
      message: 'Format nomor belum valid. Contoh: 081234567890 atau +6281234567890.',
    };
  }

  const text = encodeURIComponent(
    `Halo Bot AMC, daftar info promo & stok baru untuk nomor ${digits}`
  );
  return {
    status: 'valid',
    normalizedPhone: digits,
    waBotUrl: `https://wa.me/${AMC_BOT_WA}?text=${text}`,
    message: `Nomor ${digits} diarahkan langsung ke Bot WhatsApp AMC (+27 74 830 4118).`,
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
