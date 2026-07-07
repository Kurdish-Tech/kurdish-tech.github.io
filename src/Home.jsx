// src/Home.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { DIALECTS } from './lib/kurdishAlphabet';
import { useDictionary } from './hooks/useDictionary';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useRecentSearches, useFavorites } from './hooks/useWordList';
import RojDisc from './components/RojDisc';
import SearchBar from './components/SearchBar';
import DialectToggle from './components/DialectToggle';
import AlphabetRail from './components/AlphabetRail';
import ResultCard from './components/ResultCard';
import LinkButton from './components/LinkButton';
import OfflineDownload from './components/OfflineDownload';
import Pagination from './components/Pagination';
import TipsBanner from './components/TipsBanner';
import { buildWordRoute } from './lib/wordRoute';

const GITHUB_ORG_URL = 'https://github.com/Kurdish-Tech';
const KEYBOARD_URL = 'https://kurdish-tech.github.io/kurdish-kurmanci-keyboard-layout/';

// Proper ISO codes for the <html lang> attribute — screen readers use
// this to pick pronunciation, and it differs from our internal dialect
// keys for Soranî (Wiktionary/our own code is "sor", but the actual ISO
// 639-1 code for Central Kurdish is "ckb").
const HTML_LANG = { ku: 'ku', sor: 'ckb', zza: 'zza' };

function focusCardAt(container, index) {
  const cards = container?.querySelectorAll('[data-card]');
  if (!cards || cards.length === 0) return;
  const clamped = Math.max(0, Math.min(cards.length - 1, index));
  cards[clamped].focus();
}

// A typed search stays capped and fast — it's about finding one specific
// word, so showing more than a page of matches would just be noise.
// Clicking a single letter in the AlphabetRail means "let me browse this
// whole letter," so that path paginates through everything instead.
const SEARCH_RESULT_CAP = 60;
const BROWSE_PAGE_SIZE = 60;

export default function Home({ initialWord }) {
  const [dialectKey, setDialectKey] = useState(() => initialWord?.dialectKey || 'ku');
  const [query, setQuery] = useState(() => initialWord?.word || '');
  const debouncedQuery = useDebouncedValue(query, 180);

  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(0);

  const dialect = DIALECTS[dialectKey];
  const { manifest, manifestError, search } = useDictionary(dialectKey);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const recentSearches = useRecentSearches();
  const favorites = useFavorites();
  const { add: addRecentSearch } = recentSearches;

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[dialectKey] || 'ku';
    return () => {
      document.documentElement.lang = 'ku';
    };
  }, [dialectKey]);

  const runSearch = useCallback(
    async (q) => {
      if (!q.trim()) {
        setResults([]);
        setStatus('idle');
        // Clearing the search (the "×" button, or deleting it by hand)
        // should drop any word-link hash too — otherwise a reload right
        // after clearing would re-seed the search from the stale URL
        // instead of actually starting empty.
        if (window.location.hash && window.location.hash !== '#/') {
          window.history.replaceState(null, '', '#/');
        }
        return;
      }
      setStatus('loading');
      try {
        const { results: r, stale } = await search(q);
        if (stale) return;
        setResults(r);
        setStatus('ready');
        // Only remember fully-typed, exact-match searches — partial
        // keystrokes-in-progress would otherwise flood recent history.
        if (r.length > 0 && r[0]._rank === 0) {
          addRecentSearch(dialectKey, r[0].word);
          // Sync the address bar so the current word is shareable/
          // bookmarkable. replaceState (not a real hash navigation) on
          // purpose — it doesn't fire 'hashchange', so it can't loop back
          // into useHashRoute or spam back-button history on every search.
          const shareableHash = '#' + buildWordRoute(dialectKey, r[0].word);
          if (window.location.hash !== shareableHash) {
            window.history.replaceState(null, '', shareableHash);
          }
        }
      } catch (err) {
        setErrorMessage(err.message || 'Something went wrong loading that data.');
        setStatus('error');
      }
    },
    [search, dialectKey, addRecentSearch]
  );

  useEffect(() => {
    setPage(0);
    runSearch(debouncedQuery);
  }, [debouncedQuery, dialectKey, runSearch]);

  const handleDialectChange = (key) => {
    setDialectKey(key);
    setQuery('');
    setResults([]);
    setStatus('idle');
    inputRef.current?.focus();
  };

  const handleTermClick = (targetDialectKey, word) => {
    if (targetDialectKey !== dialectKey) {
      setDialectKey(targetDialectKey);
    }
    setQuery(word);
    document.documentElement.scrollTop = 0;
  };

  const availableLetters = manifest ? new Set(Object.keys(manifest.letters)) : null;
  const activeLetter = query.length === 1 ? query.toLowerCase() : null;

  // Clicking a single letter means "browse this whole letter" — paginate
  // through every match instead of the tight cap a typed search gets.
  const isBrowsing = activeLetter !== null;
  const pageSize = isBrowsing ? BROWSE_PAGE_SIZE : SEARCH_RESULT_CAP;
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const visibleResults = isBrowsing
    ? results.slice(page * pageSize, (page + 1) * pageSize)
    : results.slice(0, pageSize);
  const searchTruncated = !isBrowsing && results.length > pageSize;

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    document.documentElement.scrollTop = 0;
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown' && visibleResults.length > 0) {
      e.preventDefault();
      focusCardAt(resultsRef.current, 0);
    }
  };

  const handleResultsKeyDown = (e) => {
    const container = resultsRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('[data-card]'));
    const currentIndex = cards.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCardAt(container, currentIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex <= 0) inputRef.current?.focus();
      else focusCardAt(container, currentIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusCardAt(container, 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusCardAt(container, cards.length - 1);
    }
  };

  return (
    <div>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-roj/10 blur-3xl dark:bg-roj/[0.07]"
          aria-hidden="true"
        />

        <section
          className={`relative mx-auto max-w-3xl px-6 text-center ${
            query ? 'pb-4 pt-4 sm:pb-5 sm:pt-6' : 'pb-8 pt-8 sm:pb-10 sm:pt-16'
          }`}
        >
          {/* Collapsed to just the essentials while actively typing, so on
              mobile the on-screen keyboard doesn't push results out of
              view — the user shouldn't need to scroll or dismiss the
              keyboard just to see the first result. */}
          {!query ? (
            <>
              <h1 className="mb-3 animate-rise-in font-display text-3xl font-medium leading-tight tracking-tight text-ink dark:text-paper sm:text-5xl">
                456.000 Peyvên Kurdî,
                <br />
                Ferhenga Herî Mezin
              </h1>
              <p
                className="mx-auto mb-6 max-w-lg animate-rise-in text-sm text-slate-light dark:text-slate-dark sm:mb-8 sm:text-base"
                style={{ animationDelay: '60ms' }}
              >
                Li peyvên Kurmancî û Soranî bigere. Bê daxistin, bi lez û hêsan.
              </p>
            </>
          ) : (
            // The visual hero (including its <h1>) is hidden while
            // actively typing/browsing to save space, but the document
            // should still always have exactly one <h1> for screen
            // readers and SEO.
            <h1 className="sr-only">Ferheng — Kurdish Dictionary</h1>
          )}

          <div className="mb-4 flex animate-rise-in justify-center" style={{ animationDelay: '100ms' }}>
            <DialectToggle active={dialectKey} onChange={handleDialectChange} />
          </div>

          <div className="animate-rise-in" style={{ animationDelay: '140ms' }}>
            <SearchBar
              ref={inputRef}
              value={query}
              onChange={setQuery}
              onKeyDown={handleSearchKeyDown}
              dialect={dialect}
              loading={status === 'loading'}
              autoFocus
            />
          </div>

          {!query && (
            <>
              {manifest && (
                <p className="mt-3 text-xs text-slate-light dark:text-slate-dark">
                  {manifest.total_words.toLocaleString()} peyvên {dialect.nativeLabel} tomar bûne
                </p>
              )}

              <OfflineDownload dialect={dialect} manifest={manifest} />

              <div
                className="mt-6 flex animate-rise-in flex-wrap items-center justify-center gap-2 sm:mt-7 sm:gap-3"
                style={{ animationDelay: '180ms' }}
              >
                <LinkButton href={GITHUB_ORG_URL} icon="code" shortLabel="GitHub">
                  Rêxistina Me li GitHub
                </LinkButton>
                <LinkButton href={KEYBOARD_URL} icon="keyboard" shortLabel="Klavyeya Windows">
                  Daxistina Keyboarda Kurdî bo Windows
                </LinkButton>
              </div>
            </>
          )}
        </section>
      </div>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <div
          className={`mb-8 overflow-hidden rounded-2xl border border-paper-border bg-paper-raised/60 p-3 dark:border-ink-border dark:bg-ink-raised/60 sm:p-4 ${
            query && !isBrowsing ? 'hidden sm:block' : ''
          }`}
        >
          <AlphabetRail
            dialect={dialect}
            activeLetter={activeLetter}
            availableLetters={availableLetters}
            onSelect={(letter) => setQuery(letter)}
          />
        </div>

        {manifestError && (
          <p className="rounded-xl border border-roj/30 bg-roj/10 p-4 text-center text-sm text-roj-deep dark:text-roj-soft">
            Couldn't load the {dialect.nativeLabel} index ({manifestError}). Try
            reloading the page.
          </p>
        )}

        {status === 'error' && (
          <p className="rounded-xl border border-roj/30 bg-roj/10 p-4 text-center text-sm text-roj-deep dark:text-roj-soft">
            Couldn't load results ({errorMessage}). Check your connection and try again.
          </p>
        )}

        {status === 'idle' && !query && (
          <div className="flex flex-col items-center gap-8 py-12 text-center">
            {favorites.list.length === 0 && recentSearches.list.length === 0 && (
              <div className="flex flex-col items-center gap-3 text-slate-light dark:text-slate-dark">
                <RojDisc size={40} rayCount={12} className="opacity-30" />
                <p className="text-sm">
                  Li jor peyvekê binivîse, an jî tîpekê hilbijêre.
                </p>
              </div>
            )}

            <TipsBanner />

            {favorites.list.length > 0 && (
              <div className="w-full max-w-2xl">
                <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-light dark:text-slate-dark">
                  Bijarte
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {favorites.list.map((e) => (
                    <button
                      key={e.dialectKey + e.word}
                      onClick={() => handleTermClick(e.dialectKey, e.word)}
                      className={`rounded-full border border-paper-border bg-paper-raised px-3 py-1.5 text-sm text-ink transition-colors hover:border-roj hover:text-roj-deep dark:border-ink-border dark:bg-ink-raised dark:text-paper dark:hover:border-roj dark:hover:text-roj-soft ${DIALECTS[e.dialectKey].fontClass}`}
                    >
                      {e.word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentSearches.list.length > 0 && (
              <div className="w-full max-w-2xl">
                <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-light dark:text-slate-dark">
                  Lêgerînên Dawî
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentSearches.list.map((e) => (
                    <button
                      key={e.dialectKey + e.word}
                      onClick={() => handleTermClick(e.dialectKey, e.word)}
                      className={`rounded-full border border-paper-border bg-paper px-3 py-1.5 text-sm text-slate-light transition-colors hover:border-roj hover:text-roj-deep dark:border-ink-border dark:bg-ink dark:text-slate-dark dark:hover:border-roj dark:hover:text-roj-soft ${DIALECTS[e.dialectKey].fontClass}`}
                    >
                      {e.word}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'ready' && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-slate-light dark:text-slate-dark">
              No {dialect.nativeLabel} entries start with{' '}
              <span className={`font-semibold text-ink dark:text-paper ${dialect.fontClass}`}>
                "{query}"
              </span>
              {' '}yet.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <>
            {isBrowsing && (
              <p className="mb-4 text-center text-sm text-slate-light dark:text-slate-dark">
                {results.length.toLocaleString()} peyvên {dialect.nativeLabel} bi{' '}
                <span className={`font-semibold text-ink dark:text-paper ${dialect.fontClass}`}>
                  "{activeLetter}"
                </span>{' '}
                dest pê dikin
              </p>
            )}

            <div
              ref={resultsRef}
              onKeyDown={handleResultsKeyDown}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {visibleResults.map((entry, i) => (
                <ResultCard
                  key={entry.word + i}
                  entry={entry}
                  dialectKey={dialectKey}
                  onTermClick={handleTermClick}
                  isFavorite={favorites.has(dialectKey, entry.word)}
                  onToggleFavorite={(dk, word) =>
                    favorites.has(dk, word) ? favorites.remove(dk, word) : favorites.add(dk, word)
                  }
                  style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                />
              ))}
            </div>

            {isBrowsing ? (
              <Pagination page={page} pageCount={pageCount} onChange={handlePageChange} dir={dialect.dir} />
            ) : (
              searchTruncated && (
                <p className="mt-6 text-center text-sm text-slate-light dark:text-slate-dark">
                  Showing {SEARCH_RESULT_CAP} of {results.length.toLocaleString()} matches — keep typing to narrow it down.
                </p>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}
