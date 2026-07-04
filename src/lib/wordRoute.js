// src/lib/wordRoute.js
import { DIALECTS } from './kurdishAlphabet';

const WORD_ROUTE_RE = /^\/w\/([a-z]+)\/(.+)$/;

/** Parses a "/w/{dialectKey}/{word}" hash route. Returns null for anything
 * that doesn't match, including a dialect key that isn't recognized —
 * this parses arbitrary user-supplied URL fragments (typed by hand, or
 * pointing at a dialect that no longer exists), so it must fail safely
 * rather than hand back something the rest of the app would crash on. */
export function parseWordRoute(route) {
  const match = WORD_ROUTE_RE.exec(route);
  if (!match) return null;
  const [, dialectKey, encodedWord] = match;
  if (!DIALECTS[dialectKey]) return null;
  try {
    const word = decodeURIComponent(encodedWord);
    if (!word) return null;
    return { dialectKey, word };
  } catch {
    return null;
  }
}

export function buildWordRoute(dialectKey, word) {
  return `/w/${dialectKey}/${encodeURIComponent(word)}`;
}
