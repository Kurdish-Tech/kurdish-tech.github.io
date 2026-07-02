// src/lib/kurdishAlphabet.js
//
// True Kurmancî (Hawar/Latin) and Soranî (Arabic-script) alphabetical
// orders, used for the alphabet quick-nav rail. This is intentionally
// decoupled from how data chunks are stored on disk (which just buckets by
// raw first character) — the nav rail should read correctly to a Kurdish
// speaker regardless of storage details.

export const KURMANCI_ALPHABET = [
  'a', 'b', 'c', 'ç', 'd', 'e', 'ê', 'f', 'g', 'h', 'i', 'î', 'j', 'k', 'l',
  'm', 'n', 'o', 'p', 'q', 'r', 's', 'ş', 't', 'u', 'û', 'v', 'w', 'x', 'y', 'z',
];

// Sorani (Central Kurdish) letters in the commonly-taught order.
export const SORANI_ALPHABET = [
  'ئ', 'ا', 'ب', 'پ', 'ت', 'ج', 'چ', 'ح', 'خ', 'د', 'ر', 'ڕ', 'ز', 'ژ', 'س',
  'ش', 'ع', 'غ', 'ف', 'ڤ', 'ق', 'ک', 'گ', 'ل', 'ڵ', 'م', 'ن', 'ه', 'ھ', 'و',
  'ۆ', 'ی', 'ێ', 'ە',
];

export const DIALECTS = {
  ku: {
    key: 'ku',
    label: 'Kurmancî',
    nativeLabel: 'Kurmancî',
    dir: 'ltr',
    fontClass: 'font-display',
    alphabet: KURMANCI_ALPHABET,
    placeholder: 'Peyvekê binivîse… (bo nimûne: kurdistan)',
    heroTitle: 'Ferhengê Kurmancî bigere',
  },
  sor: {
    key: 'sor',
    label: 'Soranî',
    nativeLabel: 'سۆرانی',
    dir: 'rtl',
    fontClass: 'font-arabic',
    alphabet: SORANI_ALPHABET,
    placeholder: 'وشەیەک بنووسە… ',
    heroTitle: 'فەرهەنگی سۆرانی بگەڕێ',
  },
};

// When typing Kurmancî on a keyboard without dedicated keys, people often
// fall back to the plain ASCII letter. When the user types "s", also check
// the "ş" bucket, etc., so they still find the word without hunting for
// special characters.
export const ASCII_FALLBACK_KU = {
  c: ['ç'],
  e: ['ê'],
  i: ['î'],
  s: ['ş'],
  u: ['û'],
};

export function candidateLetters(dialectKey, firstChar) {
  const lower = firstChar.toLowerCase();
  if (dialectKey !== 'ku') return [lower];
  const fallback = ASCII_FALLBACK_KU[lower] || [];
  return [lower, ...fallback];
}
