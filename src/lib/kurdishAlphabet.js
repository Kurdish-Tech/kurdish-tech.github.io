// src/lib/kurdishAlphabet.js
//
// True Kurmancî (Hawar/Latin), Soranî (Arabic-script), and Zazakî (Hawar/
// Latin) alphabetical orders, used for the alphabet quick-nav rail. This is
// intentionally decoupled from how data chunks are stored on disk (which
// just buckets by raw first character) — the nav rail should read
// correctly to a Kurdish speaker regardless of storage details.

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

// Zazakî (Vate/Latin orthography) letters — like Kurmancî's alphabet but
// with "ü" instead of "û", plus "ğ" (soft-g), matching what actually occurs
// in the word list rather than assuming it's identical to Kurmancî's.
export const ZAZAKI_ALPHABET = [
  'a', 'b', 'c', 'ç', 'd', 'e', 'ê', 'f', 'g', 'ğ', 'h', 'i', 'î', 'j', 'k',
  'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 'ş', 't', 'u', 'ü', 'v', 'w', 'x', 'y', 'z',
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
  zza: {
    key: 'zza',
    label: 'Zazakî',
    nativeLabel: 'Zazakî',
    dir: 'ltr',
    fontClass: 'font-display',
    alphabet: ZAZAKI_ALPHABET,
    placeholder: 'mesela: babik…',
    heroTitle: 'Zazakî',
  },
};

// When typing on a keyboard without dedicated keys, people often fall back
// to the plain ASCII letter. When someone types "s", also check the "ş"
// bucket, etc., so they still find the word without hunting for special
// characters. Keyed per dialect since which accented letter a plain letter
// should fall back to differs (Kurmancî's "u" maps to "û", Zazakî's to "ü").
export const ASCII_FALLBACK = {
  ku: { c: ['ç'], e: ['ê'], i: ['î'], s: ['ş'], u: ['û'] },
  zza: { c: ['ç'], e: ['ê'], i: ['î'], s: ['ş'], u: ['ü'] },
};

export function candidateLetters(dialectKey, firstChar) {
  const lower = firstChar.toLowerCase();
  const fallback = ASCII_FALLBACK[dialectKey]?.[lower] || [];
  return [lower, ...fallback];
}
