import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRecentSearches, useFavorites } from './useWordList';

beforeEach(() => {
  localStorage.clear();
});

describe('useFavorites', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.list).toEqual([]);
  });

  it('adds an entry and reports it via has()', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.add('ku', 'kurdistan'));
    expect(result.current.has('ku', 'kurdistan')).toBe(true);
    expect(result.current.list).toEqual([{ dialectKey: 'ku', word: 'kurdistan' }]);
  });

  it('does not add the same dialect+word twice — it moves it to the front instead', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.add('ku', 'a'));
    act(() => result.current.add('ku', 'b'));
    act(() => result.current.add('ku', 'a')); // re-add
    expect(result.current.list).toEqual([
      { dialectKey: 'ku', word: 'a' },
      { dialectKey: 'ku', word: 'b' },
    ]);
  });

  it('treats the same word in different dialects as distinct entries', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.add('ku', 'av'));
    act(() => result.current.add('zza', 'av'));
    expect(result.current.list).toHaveLength(2);
  });

  it('removes an entry', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.add('ku', 'kurdistan'));
    act(() => result.current.remove('ku', 'kurdistan'));
    expect(result.current.list).toEqual([]);
    expect(result.current.has('ku', 'kurdistan')).toBe(false);
  });

  it('is not capped', () => {
    const { result } = renderHook(() => useFavorites());
    for (let i = 0; i < 20; i++) {
      act(() => result.current.add('ku', `word${i}`));
    }
    expect(result.current.list).toHaveLength(20);
  });

  it('persists to localStorage and is picked up by a fresh hook instance', () => {
    const first = renderHook(() => useFavorites());
    act(() => first.result.current.add('ku', 'kurdistan'));

    const second = renderHook(() => useFavorites());
    expect(second.result.current.list).toEqual([{ dialectKey: 'ku', word: 'kurdistan' }]);
  });
});

describe('useRecentSearches', () => {
  it('caps at 12 entries, dropping the oldest', () => {
    const { result } = renderHook(() => useRecentSearches());
    for (let i = 0; i < 15; i++) {
      act(() => result.current.add('ku', `word${i}`));
    }
    expect(result.current.list).toHaveLength(12);
    // Most recent first; the oldest 3 (word0, word1, word2) should be gone.
    expect(result.current.list[0]).toEqual({ dialectKey: 'ku', word: 'word14' });
    expect(result.current.list.some((e) => e.word === 'word0')).toBe(false);
  });

  it('uses a separate localStorage key from favorites (they do not collide)', () => {
    const favorites = renderHook(() => useFavorites());
    act(() => favorites.result.current.add('ku', 'shared-word'));

    const recent = renderHook(() => useRecentSearches());
    expect(recent.result.current.list).toEqual([]);
  });
});
