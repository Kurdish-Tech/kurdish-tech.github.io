// src/lib/arabicNormalize.js
//
// Strips Arabic diacritics (tashkeel) so "شَجَر" and "شجر" are treated as
// the same lookup key — most people typing Arabic day-to-day don't add
// diacritics at all. Must stay byte-for-byte identical to the stripping
// rule used in build-arabic-reverse-index.cjs when that index was built,
// since a mismatch here would silently break every lookup.
export function stripArabicDiacritics(s) {
  return s.replace(/[ً-ْٰـ]/g, '').trim();
}

const ARABIC_RANGE_RE = /[؀-ۿ]/;

export function looksLikeArabic(s) {
  return ARABIC_RANGE_RE.test(s);
}
