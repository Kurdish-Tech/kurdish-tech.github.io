// src/hooks/useDictionary.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { candidateLetters } from '../lib/kurdishAlphabet';

const indexCache = new Map(); // dialectKey -> manifest
export const DATA_BASE = import.meta.env.BASE_URL + 'data';

// Bounded LRU for parsed chunk data — the service worker's own Cache
// Storage (disk) already keeps every fetched chunk for instant offline
// re-fetch, so this only needs to avoid re-parsing JSON on the very next
// keystroke. Without a cap, a long session searching many different
// letters would keep every parsed chunk (each up to ~1.75MB of JS
// objects) resident in the tab's memory for the page's entire lifetime.
const CHUNK_CACHE_LIMIT = 20;
const chunkCache = new Map(); // "dialectKey/file" -> entries array

function chunkCacheGet(key) {
  if (!chunkCache.has(key)) return undefined;
  const value = chunkCache.get(key);
  chunkCache.delete(key);
  chunkCache.set(key, value); // refresh recency
  return value;
}

function chunkCacheSet(key, value) {
  chunkCache.set(key, value);
  if (chunkCache.size > CHUNK_CACHE_LIMIT) {
    chunkCache.delete(chunkCache.keys().next().value); // evict least-recently-used
  }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  }
  return res.json();
}

async function getIndex(dialectKey) {
  if (indexCache.has(dialectKey)) return indexCache.get(dialectKey);
  const data = await fetchJSON(`${DATA_BASE}/${dialectKey}/index.json`);
  indexCache.set(dialectKey, data);
  return data;
}

async function getChunk(dialectKey, file) {
  const cacheKey = `${dialectKey}/${file}`;
  const cached = chunkCacheGet(cacheKey);
  if (cached) return cached;
  const data = await fetchJSON(`${DATA_BASE}/${dialectKey}/${file}`);
  chunkCacheSet(cacheKey, data);
  return data;
}

/**
 * Fetches one exact entry from a given dialect, regardless of which
 * dialect (if any) is the currently "active" one in the UI — used by the
 * Arabic reverse-search, which can point at entries in any of the three
 * dialects at once. Reuses the same index/chunk caches as normal search,
 * so looking up a word that a regular search already touched is free.
 */
export async function findEntry(dialectKey, word) {
  const idx = await getIndex(dialectKey);
  const wordLower = word.toLowerCase();
  const firstChar = wordLower[0];
  const letters = candidateLetters(dialectKey, firstChar).filter((l) => idx.letters[l]);
  for (const letter of letters) {
    for (const part of idx.letters[letter]) {
      if (!partOverlapsPrefix(part, wordLower)) continue;
      const chunk = await getChunk(dialectKey, part.file);
      const found = chunk.find((e) => e.word.toLowerCase() === wordLower);
      if (found) return found;
    }
  }
  return null;
}

/** Does a chunk part's [first,last] word range overlap with everything that
 * could start with `prefix`? Used to avoid fetching every part of a
 * multi-file letter bucket once the query narrows things down. */
export function partOverlapsPrefix(part, prefix) {
  if (!prefix) return true;
  const first = part.first.toLowerCase();
  const last = part.last.toLowerCase();
  const queryHigh = prefix + '\uFFFF';
  return prefix <= last && queryHigh >= first;
}

// Cheap one-pass check for edit distance <= 1 (single insertion, deletion,
// or substitution) — enough to catch a single typo without pulling in a
// full Levenshtein matrix.
export function withinOneEdit(a, b) {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return false;
    if (la === lb) {
      i++;
      j++;
    } else if (la > lb) {
      i++;
    } else {
      j++;
    }
  }
  edits += la - i + (lb - j);
  return edits <= 1;
}

// Ranks how a query matched an entry, used to sort exact/prefix hits above
// looser substring or typo-tolerant ones. Lower is better; null means no match.
export function matchRank(word, query) {
  if (word === query) return 0;
  if (word.startsWith(query)) return 1;
  if (word.includes(query)) return 2;
  if (query.length >= 3 && Math.abs(word.length - query.length) <= 1 && withinOneEdit(query, word)) {
    return 3;
  }
  return null;
}

/**
 * Loads the manifest for a dialect once (for the alphabet rail / stats),
 * and exposes a `search(query)` function that fetches only the chunk
 * parts needed to answer it, then filters client-side.
 */
export function useDictionary(dialectKey) {
  const [manifest, setManifest] = useState(null);
  const [manifestError, setManifestError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setManifest(null);
    setManifestError(null);
    getIndex(dialectKey)
      .then((data) => {
        if (!cancelled) setManifest(data);
      })
      .catch((err) => {
        if (!cancelled) setManifestError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [dialectKey]);

  const search = useCallback(
    async (rawQuery) => {
      const myRequestId = ++requestId.current;
      const query = rawQuery.trim().toLowerCase();
      if (!query) return { results: [], stale: false };

      const idx = await getIndex(dialectKey);
      const firstChar = query[0];
      const letters = candidateLetters(dialectKey, firstChar).filter(
        (l) => idx.letters[l]
      );

      // A prefix match is guaranteed to live in the alphabetical range
      // partOverlapsPrefix checks, so that narrow fetch is enough for the
      // common case. A substring or typo match can sort anywhere in the
      // bucket, but fetching the *whole* bucket on every 3+ character
      // keystroke was a real cost — a bucket can be several parts and
      // several MB, so a search that would've been answered by one small
      // narrow part was paying for all of them regardless. Now the full
      // bucket is only fetched as a fallback, when the fast narrow search
      // comes up empty — exactly when substring/typo matching is actually
      // needed, and never when a plain prefix search would have worked.
      const narrowFiles = [];
      const broadFiles = [];
      for (const letter of letters) {
        for (const part of idx.letters[letter]) {
          (partOverlapsPrefix(part, query) ? narrowFiles : broadFiles).push(part.file);
        }
      }

      function findMatches(chunks) {
        const seen = new Set();
        const found = [];
        for (const chunk of chunks) {
          for (const entry of chunk) {
            const wordLower = entry.word.toLowerCase();
            let rank = matchRank(wordLower, query);
            let viaSynonym = false;

            if (rank === null) {
              for (const s of entry.synonyms || []) {
                const synRank = matchRank(s.toLowerCase(), query);
                if (synRank !== null && (rank === null || synRank < rank)) {
                  rank = synRank;
                  viaSynonym = true;
                }
              }
            }
            if (rank === null) continue;

            const key = entry.word + '|' + (entry.pos || '');
            if (seen.has(key)) continue;
            seen.add(key);
            found.push({ ...entry, _rank: viaSynonym ? rank + 0.5 : rank });
          }
        }
        found.sort((a, b) => {
          if (a._rank !== b._rank) return a._rank - b._rank;
          return a.word.localeCompare(b.word);
        });
        return found;
      }

      const narrowChunks = await Promise.all(narrowFiles.map((f) => getChunk(dialectKey, f)));
      if (myRequestId !== requestId.current) return { results: [], stale: true };

      let matches = findMatches(narrowChunks);

      if (matches.length === 0 && query.length >= 3 && broadFiles.length > 0) {
        const broadChunks = await Promise.all(broadFiles.map((f) => getChunk(dialectKey, f)));
        if (myRequestId !== requestId.current) return { results: [], stale: true };
        matches = findMatches([...narrowChunks, ...broadChunks]);
      }

      // Capping how many results are *shown* is a presentation concern
      // (typed searches cap at 60 to stay focused; browsing a whole
      // letter paginates through everything) — the hook's job is just to
      // find every match and hand back the full list.
      return { results: matches, stale: false };
    },
    [dialectKey]
  );

  return { manifest, manifestError, search };
}
