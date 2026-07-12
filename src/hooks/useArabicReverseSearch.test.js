import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// useArabicReverseSearch caches the fetched index at module scope (by
// design — it's meant to be fetched once total, ever). That means every
// test in this file shares one fixture and one fetch call; don't swap
// the mock response between tests, or later tests will silently see the
// first test's cached index instead of their own.
const mockIndex = {
  'شجر': [{ d: 'ku', w: 'dar' }, { d: 'zza', w: 'dare' }],
  'شجرة': [{ d: 'ku', w: 'dardar' }],
  'وضوء': [{ d: 'ku', w: 'avdest' }],
  'كلمة1': [{ d: 'ku', w: 'peyv' }],
  'كلمة2': [{ d: 'ku', w: 'peyv' }], // same pointer as كلمة1, under a different Arabic key
  'ناقصة': [{ d: 'sor', w: 'missing' }, { d: 'ku', w: 'dar' }],
};

vi.mock('./useDictionary', () => ({
  DATA_BASE: '/data',
  findEntry: vi.fn(async (dialectKey, word) => {
    if (word === 'missing') return null;
    return { word, pos: 'noun', pos_title: 'Navdêr' };
  }),
}));

import { findEntry } from './useDictionary';
import { useArabicReverseSearch } from './useArabicReverseSearch';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => mockIndex }))
  );
});

describe('useArabicReverseSearch', () => {
  it('resolves an exact key match to entries from every pointed-at dialect', async () => {
    const { result } = renderHook(() => useArabicReverseSearch());
    const { results } = await result.current.search('شجر');
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.dialectKey).sort()).toEqual(['ku', 'zza']);
    expect(results.map((r) => r.entry.word).sort()).toEqual(['dar', 'dare']);
  });

  it('strips diacritics before looking up the key', async () => {
    const { result } = renderHook(() => useArabicReverseSearch());
    const { results } = await result.current.search('شَجَر'); // diacritized form of "شجر"
    expect(results).toHaveLength(2);
  });

  it('falls back to a prefix scan when there is no exact key', async () => {
    const { result } = renderHook(() => useArabicReverseSearch());
    // "شجر" and "شجرة" both start with "شج" — a query of just "شج" should
    // match both via the prefix/substring fallback.
    const { results } = await result.current.search('شج');
    const words = results.map((r) => r.entry.word).sort();
    expect(words).toEqual(['dar', 'dardar', 'dare']);
  });

  it('returns nothing for a query with no matching key at all', async () => {
    const { result } = renderHook(() => useArabicReverseSearch());
    const { results } = await result.current.search('غير موجود إطلاقا');
    expect(results).toEqual([]);
  });

  it('deduplicates pointers shared across different matched keys', async () => {
    const { result } = renderHook(() => useArabicReverseSearch());
    // كلمة1 and كلمة2 both point at the same (ku, peyv) entry.
    const { results } = await result.current.search('كلمة');
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ dialectKey: 'ku', entry: { word: 'peyv', pos: 'noun', pos_title: 'Navdêr' } });
  });

  it('silently drops pointers whose entry can no longer be found', async () => {
    const { result } = renderHook(() => useArabicReverseSearch());
    const { results } = await result.current.search('ناقصة');
    expect(results).toHaveLength(1);
    expect(results[0].entry.word).toBe('dar');
  });

  it('returns an empty result for an empty query without calling findEntry', async () => {
    const { result } = renderHook(() => useArabicReverseSearch());
    const callsBefore = findEntry.mock.calls.length;
    const { results, stale } = await result.current.search('   ');
    expect(results).toEqual([]);
    expect(stale).toBe(false);
    expect(findEntry.mock.calls.length).toBe(callsBefore);
  });
});
