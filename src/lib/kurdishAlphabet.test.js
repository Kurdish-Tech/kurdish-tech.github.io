import { describe, it, expect } from 'vitest';
import { DIALECTS, candidateLetters } from './kurdishAlphabet';

describe('candidateLetters', () => {
  it('falls back plain-ASCII typing to the accented Kurmancî bucket too', () => {
    expect(candidateLetters('ku', 's')).toEqual(['s', 'ş']);
    expect(candidateLetters('ku', 'u')).toEqual(['u', 'û']);
    expect(candidateLetters('ku', 'S')).toEqual(['s', 'ş']); // case-insensitive
  });

  it('has no fallback for a letter that has none', () => {
    expect(candidateLetters('ku', 'b')).toEqual(['b']);
  });

  it("Zazakî's ASCII fallback for 'u' is 'ü', not Kurmancî's 'û'", () => {
    expect(candidateLetters('zza', 'u')).toEqual(['u', 'ü']);
  });

  it('Soranî has no ASCII fallback (Arabic script has no plain-ASCII typing path)', () => {
    expect(candidateLetters('sor', 's')).toEqual(['s']);
  });

  it('an unknown dialect key degrades to just the plain letter, not a crash', () => {
    expect(candidateLetters('made-up', 's')).toEqual(['s']);
  });
});

describe('DIALECTS', () => {
  it('every dialect has the fields the rest of the app assumes exist', () => {
    for (const dialect of Object.values(DIALECTS)) {
      expect(dialect.key).toBeTruthy();
      expect(['ltr', 'rtl']).toContain(dialect.dir);
      expect(Array.isArray(dialect.alphabet)).toBe(true);
      expect(dialect.alphabet.length).toBeGreaterThan(0);
      expect(dialect.nativeLabel).toBeTruthy();
    }
  });

  it('alphabets have no duplicate letters', () => {
    for (const dialect of Object.values(DIALECTS)) {
      const unique = new Set(dialect.alphabet);
      expect(unique.size).toBe(dialect.alphabet.length);
    }
  });
});
