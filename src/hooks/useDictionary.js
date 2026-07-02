// src/hooks/useDictionary.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { candidateLetters } from '../lib/kurdishAlphabet';

const indexCache = new Map(); // dialectKey -> manifest
const chunkCache = new Map(); // "dialectKey/file" -> entries array
const DATA_BASE = import.meta.env.BASE_URL + 'data';

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
  if (chunkCache.has(cacheKey)) return chunkCache.get(cacheKey);
  const data = await fetchJSON(`${DATA_BASE}/${dialectKey}/${file}`);
  chunkCache.set(cacheKey, data);
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

      const partsToFetch = [];
      for (const letter of letters) {
        for (const part of idx.letters[letter]) {
          if (partOverlapsPrefix(part, query)) {
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
          const wordStarts = wordLower.startsWith(query);
          const synonymMatch =
            !wordStarts &&
            (entry.synonyms || []).some((s) => s.toLowerCase().startsWith(query));
          if (!wordStarts && !synonymMatch) continue;
          if (seen.has(entry.word + '|' + (entry.pos || ''))) continue;
          seen.add(entry.word + '|' + (entry.pos || ''));
          matches.push({ ...entry, _exact: wordLower === query, _viaSynonym: synonymMatch });
        }
      }

      matches.sort((a, b) => {
        if (a._exact !== b._exact) return a._exact ? -1 : 1;
        if (a._viaSynonym !== b._viaSynonym) return a._viaSynonym ? 1 : -1;
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
