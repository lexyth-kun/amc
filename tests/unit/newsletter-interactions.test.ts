import { describe, expect, it } from 'vitest';
import { formatAnimatedCounter, validateWhatsappOptIn } from '@/utils/newsletter';

describe('WhatsApp / Phone Promo Opt-In Validation & Counter Formatting', () => {
  it('returns explicit empty, invalid, and valid states targeting Bot WA (+27 74 830 4118) directly without extra confirmation', () => {
    expect(validateWhatsappOptIn('')).toEqual({
      status: 'empty',
      message: 'Masukkan nomor telepon atau WhatsApp terlebih dahulu.',
    });

    expect(validateWhatsappOptIn('abc-123')).toEqual({
      status: 'invalid',
      message: 'Format nomor belum valid. Contoh: 081234567890 atau +6281234567890.',
    });

    const localId = validateWhatsappOptIn('0812-3456-7890');
    expect(localId.status).toBe('valid');
    expect(localId.normalizedPhone).toBe('6281234567890');
    expect(localId.waBotUrl).toContain('https://wa.me/27748304118?text=');
    expect(localId.waBotUrl).toContain('6281234567890');
    expect(localId.waBotUrl).not.toContain('6285117120101');
    expect(localId.message.toLowerCase()).not.toContain('konfirmasi');

    const intl = validateWhatsappOptIn('+62 851 1712 0101');
    expect(intl.status).toBe('valid');
    expect(intl.normalizedPhone).toBe('6285117120101');
    expect(intl.waBotUrl).toContain('https://wa.me/27748304118?text=');
  });

  it('formats animated counter values with Indonesian thousands separators and suffixes', () => {
    expect(formatAnimatedCounter(1300, 0, '+')).toBe('1.300+');
    expect(formatAnimatedCounter(4.8, 1, '/5')).toBe('4.8/5');
    expect(formatAnimatedCounter(37, 0, '+')).toBe('37+');
    expect(formatAnimatedCounter(24, 0, ' Jam')).toBe('24 Jam');
  });
});
