// src/hooks/useArabicReverseSearch.js
import { useCallback, useRef } from 'react';
import { DATA_BASE, findEntry } from './useDictionary';
import { stripArabicDiacritics } from '../lib/arabicNormalize';

let indexPromise = null; // module-level: fetched once total, shared by every component

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${DATA_BASE}/ar-reverse-index.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching ar-reverse-index.json`);
        return res.json();
      })
      .catch((err) => {
        // A transient network hiccup shouldn't permanently wedge the
        // feature for the rest of the session — without this, one failed
        // fetch would leave every future search silently rejecting
        // against the same cached failure until the page reloads.
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

const MAX_ARABIC_KEYS_SCANNED = 400; // prefix/substring fallback safety valve

/**
 * Arabic -> Kurdish reverse lookup. Not a dialect of its own — the index
 * is a flat { arabicWord: [{d, w}, ...] } map (see
 * build-arabic-reverse-index.cjs), pointing at real entries in whichever
 * of ku/sor/zza happen to have that Arabic translation on file. Fetched
 * lazily (only once someone actually enables the feature), independent
 * of which dialect tab is currently active.
 */
export function useArabicReverseSearch() {
  const requestId = useRef(0);

  const search = useCallback(async (rawQuery) => {
    const myRequestId = ++requestId.current;
    const query = stripArabicDiacritics(rawQuery.trim());
    if (!query) return { results: [], stale: false };

    const index = await loadIndex();

    // Exact key hit is by far the common case (index keys are real
    // Wiktionary translation words, not free text) — only fall back to
    // scanning keys for a prefix/substring match if nothing matched
    // exactly, and cap how many keys that fallback will touch so a
    // short, broad query (e.g. a single letter) can't scan all 16k keys
    // synchronously on every keystroke.
    let matchedKeys = [];
    if (index[query]) {
      matchedKeys = [query];
    } else {
      for (const key of Object.keys(index)) {
        if (key.startsWith(query) || key.includes(query)) {
          matchedKeys.push(key);
          if (matchedKeys.length >= MAX_ARABIC_KEYS_SCANNED) break;
        }
      }
    }

    const pointers = [];
    const seenPointer = new Set();
    for (const key of matchedKeys) {
      for (const p of index[key]) {
        const pointerKey = p.d + '|' + p.w;
        if (seenPointer.has(pointerKey)) continue;
        seenPointer.add(pointerKey);
        pointers.push(p);
      }
    }

    const entries = await Promise.all(pointers.map((p) => findEntry(p.d, p.w)));
    if (myRequestId !== requestId.current) return { results: [], stale: true };

    const results = [];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i]) results.push({ dialectKey: pointers[i].d, entry: entries[i] });
    }
    return { results, stale: false };
  }, []);

  return { search };
}
