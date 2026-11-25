import { describe, expect, it } from 'vitest';
import { formatAnimatedCounter, validateNewsletterEmail } from '@/utils/newsletter';

describe('Newsletter Validation & Counter Formatting (Milestone E)', () => {
  it('returns explicit empty, invalid, and honest-v1-valid states for newsletter input (R-26, R-27)', () => {
    expect(validateNewsletterEmail('')).toEqual({
      status: 'empty',
      message: 'Masukkan alamat email terlebih dahulu.',
    });

    expect(validateNewsletterEmail('bukan-email')).toEqual({
      status: 'invalid',
      message: 'Format email belum sesuai, contoh: nama@email.com.',
    });

    const ok = validateNewsletterEmail('pembeli@amc.web.id');
    expect(ok.status).toBe('valid');
    expect(ok.message).toContain('segera aktif');
  });

  it('formats animated counter values with Indonesian thousands separators and suffixes', () => {
    expect(formatAnimatedCounter(1300, 0, '+')).toBe('1.300+');
    expect(formatAnimatedCounter(4.8, 1, '/5')).toBe('4.8/5');
    expect(formatAnimatedCounter(37, 0, '+')).toBe('37+');
    expect(formatAnimatedCounter(24, 0, ' Jam')).toBe('24 Jam');
  });
});
