import { describe, it, expect } from 'vitest';
import { stripArabicDiacritics, looksLikeArabic } from './arabicNormalize';

describe('stripArabicDiacritics', () => {
  it('removes fatha/damma/kasra/shadda/sukun', () => {
    expect(stripArabicDiacritics('عَمّْ')).toBe('عم');
    expect(stripArabicDiacritics('شَجَرَة')).toBe('شجرة');
    expect(stripArabicDiacritics('وُضُوء')).toBe('وضوء');
  });

  it('leaves plain (undiacritized) Arabic text unchanged', () => {
    expect(stripArabicDiacritics('شجر')).toBe('شجر');
  });

  it('trims surrounding whitespace', () => {
    expect(stripArabicDiacritics('  شجر  ')).toBe('شجر');
  });

  it('is a no-op on Latin text', () => {
    expect(stripArabicDiacritics('kurdistan')).toBe('kurdistan');
  });
});

describe('looksLikeArabic', () => {
  it('detects Arabic-script text', () => {
    expect(looksLikeArabic('شجر')).toBe(true);
    expect(looksLikeArabic('كوردستان')).toBe(true);
  });

  it('rejects Latin-script text', () => {
    expect(looksLikeArabic('kurdistan')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(looksLikeArabic('')).toBe(false);
  });

  it('detects Arabic even mixed with Latin punctuation', () => {
    expect(looksLikeArabic('شجر (tree)')).toBe(true);
  });
});
