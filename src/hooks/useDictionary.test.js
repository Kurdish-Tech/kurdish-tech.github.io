import { describe, it, expect } from 'vitest';
import { matchRank, withinOneEdit, partOverlapsPrefix } from './useDictionary';

describe('withinOneEdit', () => {
  it('is true for identical strings', () => {
    expect(withinOneEdit('kurdistan', 'kurdistan')).toBe(true);
  });

  it('catches a single substitution', () => {
    expect(withinOneEdit('kurmanic', 'kurmanix')).toBe(true);
  });

  it('catches a single deletion/insertion (off-by-one length)', () => {
    expect(withinOneEdit('kurmanci', 'kurmancî')).toBe(true); // one char different, same length via substitution
    expect(withinOneEdit('kurmanc', 'kurmancî')).toBe(true); // one shorter
    expect(withinOneEdit('kurmancîi', 'kurmancî')).toBe(true); // one longer
  });

  it('rejects two or more edits', () => {
    expect(withinOneEdit('kurmanci', 'sormance')).toBe(false);
  });

  it('rejects strings whose length differs by more than one', () => {
    expect(withinOneEdit('ab', 'abcd')).toBe(false);
  });
});

describe('matchRank', () => {
  it('ranks an exact match highest (0)', () => {
    expect(matchRank('kurdistan', 'kurdistan')).toBe(0);
  });

  it('ranks a prefix match next (1)', () => {
    expect(matchRank('kurdistan', 'kurd')).toBe(1);
  });

  it('ranks a substring match below prefix (2)', () => {
    expect(matchRank('kurdistan', 'dist')).toBe(2);
  });

  it('ranks a typo-tolerant match lowest of the matches (3), only for queries of 3+ chars', () => {
    expect(matchRank('kurmancî', 'kurmanci')).toBe(3);
    // A 2-char query is too short to risk fuzzy false-positives on.
    expect(matchRank('ab', 'ac')).toBeNull();
  });

  it('returns null when nothing matches at all', () => {
    expect(matchRank('kurdistan', 'zzz')).toBeNull();
  });
});

describe('partOverlapsPrefix', () => {
  const part = { first: 'kirin', last: 'kûsî' };

  it('is always true for an empty prefix', () => {
    expect(partOverlapsPrefix(part, '')).toBe(true);
  });

  it('is true when the prefix range overlaps the part range', () => {
    expect(partOverlapsPrefix(part, 'kur')).toBe(true);
  });

  it('is false when the prefix sorts entirely before the part', () => {
    expect(partOverlapsPrefix(part, 'ab')).toBe(false);
  });

  it('is false when the prefix sorts entirely after the part', () => {
    expect(partOverlapsPrefix(part, 'zz')).toBe(false);
  });
});
