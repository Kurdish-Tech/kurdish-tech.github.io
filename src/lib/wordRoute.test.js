import { describe, it, expect } from 'vitest';
import { parseWordRoute, buildWordRoute } from './wordRoute';

describe('parseWordRoute', () => {
  it('parses a well-formed word route', () => {
    expect(parseWordRoute('/w/ku/xwendin')).toEqual({ dialectKey: 'ku', word: 'xwendin' });
  });

  it('decodes URI-encoded words, including non-Latin script', () => {
    const encoded = encodeURIComponent('کوردستان');
    expect(parseWordRoute(`/w/sor/${encoded}`)).toEqual({ dialectKey: 'sor', word: 'کوردستان' });
  });

  it('rejects a dialect key that does not exist, rather than handing back garbage', () => {
    expect(parseWordRoute('/w/made-up/test')).toBeNull();
  });

  it('rejects routes that are not the /w/ pattern at all', () => {
    expect(parseWordRoute('/about')).toBeNull();
    expect(parseWordRoute('/')).toBeNull();
    expect(parseWordRoute('/w/ku')).toBeNull(); // missing the word segment
  });

  it('rejects a malformed percent-encoding instead of throwing', () => {
    expect(parseWordRoute('/w/ku/%')).toBeNull();
  });

  it('rejects an empty word', () => {
    expect(parseWordRoute('/w/ku/')).toBeNull();
  });
});

describe('buildWordRoute + parseWordRoute round-trip', () => {
  it('survives a word containing a literal slash', () => {
    const route = buildWordRoute('ku', 'a/b');
    expect(parseWordRoute(route)).toEqual({ dialectKey: 'ku', word: 'a/b' });
  });

  it('survives special characters that need percent-encoding', () => {
    const route = buildWordRoute('ku', "kurd's & Co.");
    expect(parseWordRoute(route)).toEqual({ dialectKey: 'ku', word: "kurd's & Co." });
  });
});
