import { describe, expect, it } from 'vitest';
import { formatAnimatedCounter, validateWhatsappOptIn } from '@/utils/newsletter';

describe('WhatsApp / Phone Promo Opt-In Validation & Counter Formatting', () => {
  it('returns explicit empty, invalid, and valid states with normalized WhatsApp link (R-26, R-27)', () => {
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
    expect(localId.waConfirmUrl).toContain('https://wa.me/6285117120101?text=');
    expect(localId.waConfirmUrl).toContain('6281234567890');

    const intl = validateWhatsappOptIn('+62 851 1712 0101');
    expect(intl.status).toBe('valid');
    expect(intl.normalizedPhone).toBe('6285117120101');
  });

  it('formats animated counter values with Indonesian thousands separators and suffixes', () => {
    expect(formatAnimatedCounter(1300, 0, '+')).toBe('1.300+');
    expect(formatAnimatedCounter(4.8, 1, '/5')).toBe('4.8/5');
    expect(formatAnimatedCounter(37, 0, '+')).toBe('37+');
    expect(formatAnimatedCounter(24, 0, ' Jam')).toBe('24 Jam');
  });
});
