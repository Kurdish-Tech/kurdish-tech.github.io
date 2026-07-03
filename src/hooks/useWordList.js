// src/hooks/useWordList.js
import { useCallback, useState } from 'react';

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function sameEntry(a, b) {
  return a.dialectKey === b.dialectKey && a.word === b.word;
}

/** Shared localStorage-backed list of { dialectKey, word } entries, used
 * for both "recent searches" (capped, most-recent-first) and "favorites"
 * (uncapped, toggled). */
function useWordList(storageKey, { cap } = {}) {
  const [list, setList] = useState(() => load(storageKey));

  const add = useCallback(
    (dialectKey, word) => {
      setList((prev) => {
        const entry = { dialectKey, word };
        const next = [entry, ...prev.filter((e) => !sameEntry(e, entry))];
        const capped = cap ? next.slice(0, cap) : next;
        save(storageKey, capped);
        return capped;
      });
    },
    [storageKey, cap]
  );

  const remove = useCallback(
    (dialectKey, word) => {
      setList((prev) => {
        const next = prev.filter((e) => !sameEntry(e, { dialectKey, word }));
        save(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const has = useCallback((dialectKey, word) => list.some((e) => sameEntry(e, { dialectKey, word })), [list]);

  const clear = useCallback(() => {
    setList([]);
    save(storageKey, []);
  }, [storageKey]);

  return { list, add, remove, has, clear };
}

export function useRecentSearches() {
  return useWordList('ferheng-recent', { cap: 12 });
}

export function useFavorites() {
  return useWordList('ferheng-favorites');
}
