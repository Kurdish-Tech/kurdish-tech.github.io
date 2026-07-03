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

/** Does a chunk part's [first,last] word range overlap with everything that
 * could start with `prefix`? Used to avoid fetching every part of a
 * multi-file letter bucket once the query narrows things down. */
function partOverlapsPrefix(part, prefix) {
  if (!prefix) return true;
  const first = part.first.toLowerCase();
  const last = part.last.toLowerCase();
  const queryHigh = prefix + '\uFFFF';
  return prefix <= last && queryHigh >= first;
}

// Cheap one-pass check for edit distance <= 1 (single insertion, deletion,
// or substitution) — enough to catch a single typo without pulling in a
// full Levenshtein matrix.
function withinOneEdit(a, b) {
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
function matchRank(word, query) {
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
      if (!query) return { results: [], truncated: false, stale: false };

      const idx = await getIndex(dialectKey);
      const firstChar = query[0];
      const letters = candidateLetters(dialectKey, firstChar).filter(
        (l) => idx.letters[l]
      );

      // Only prefix matches are guaranteed to live in the alphabetical
      // range partOverlapsPrefix checks — a substring or typo match can sort
      // anywhere within the letter bucket, so once the query is long enough
      // to plausibly be a substring/fuzzy search (rather than someone still
      // typing a prefix), fetch every part of the candidate letter buckets
      // instead of just the narrow overlapping range.
      const mayNeedFullBucket = query.length >= 3;
      const partsToFetch = [];
      for (const letter of letters) {
        for (const part of idx.letters[letter]) {
          if (mayNeedFullBucket || partOverlapsPrefix(part, query)) {
            partsToFetch.push(part.file);
          }
        }
      }

      const chunks = await Promise.all(
        partsToFetch.map((file) => getChunk(dialectKey, file))
      );

      // A later keystroke started a newer search — discard this stale result.
      if (myRequestId !== requestId.current) {
        return { results: [], truncated: false, stale: true };
      }

      const seen = new Set();
      const matches = [];
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

          if (seen.has(entry.word + '|' + (entry.pos || ''))) continue;
          seen.add(entry.word + '|' + (entry.pos || ''));
          matches.push({ ...entry, _rank: viaSynonym ? rank + 0.5 : rank });
        }
      }

      matches.sort((a, b) => {
        if (a._rank !== b._rank) return a._rank - b._rank;
        return a.word.localeCompare(b.word);
      });

      const MAX_RESULTS = 60;
      return {
        results: matches.slice(0, MAX_RESULTS),
        truncated: matches.length > MAX_RESULTS,
        totalMatches: matches.length,
        stale: false,
      };
    },
    [dialectKey]
  );

  return { manifest, manifestError, search };
}
