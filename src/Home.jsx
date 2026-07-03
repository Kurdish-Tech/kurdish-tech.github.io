// src/Home.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { DIALECTS } from './lib/kurdishAlphabet';
import { useDictionary } from './hooks/useDictionary';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import RojDisc from './components/RojDisc';
import SearchBar from './components/SearchBar';
import DialectToggle from './components/DialectToggle';
import AlphabetRail from './components/AlphabetRail';
import ResultCard from './components/ResultCard';
import LinkButton from './components/LinkButton';
import OfflineDownload from './components/OfflineDownload';

const GITHUB_ORG_URL = 'https://github.com/Kurdish-Tech';
const KEYBOARD_URL = 'https://kurdish-tech.github.io/kurdish-kurmanci-keyboard-layout/';

export default function Home() {
  const [dialectKey, setDialectKey] = useState('ku');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 180);

  const [results, setResults] = useState([]);
  const [truncated, setTruncated] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState('');

  const dialect = DIALECTS[dialectKey];
  const { manifest, manifestError, search } = useDictionary(dialectKey);
  const inputRef = useRef(null);

  const runSearch = useCallback(
    async (q) => {
      if (!q.trim()) {
        setResults([]);
        setStatus('idle');
        return;
      }
      setStatus('loading');
      try {
        const { results: r, truncated: t, totalMatches: tm, stale } = await search(q);
        if (stale) return;
        setResults(r);
        setTruncated(t);
        setTotalMatches(tm || r.length);
        setStatus('ready');
      } catch (err) {
        setErrorMessage(err.message || 'Something went wrong loading that data.');
        setStatus('error');
      }
    },
    [search]
  );

  useEffect(() => {
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

  return (
    <div>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-roj/10 blur-3xl dark:bg-roj/[0.07]"
          aria-hidden="true"
        />

        <section className="relative mx-auto max-w-3xl px-6 pb-8 pt-8 text-center sm:pb-10 sm:pt-16">
          <h1
            className="mb-3 animate-rise-in font-display text-3xl font-medium leading-tight tracking-tight text-ink dark:text-paper sm:text-5xl"
          >
            453.000 Peyvên Kurdî,
            <br />
            Ferhenga Herî Mezin
          </h1>
          <p
            className="mx-auto mb-6 max-w-lg animate-rise-in text-sm text-slate-light dark:text-slate-dark sm:mb-8 sm:text-base"
            style={{ animationDelay: '60ms' }}
          >
            Li peyvên Kurmancî û Soranî bigere. Bê daxistin, bi lez û hêsan.
          </p>

          <div className="mb-4 flex animate-rise-in justify-center" style={{ animationDelay: '100ms' }}>
            <DialectToggle active={dialectKey} onChange={handleDialectChange} />
          </div>

          <div className="animate-rise-in" style={{ animationDelay: '140ms' }}>
            <SearchBar
              ref={inputRef}
              value={query}
              onChange={setQuery}
              dialect={dialect}
              loading={status === 'loading'}
              autoFocus
            />
          </div>

          {manifest && (
            <p className="mt-3 text-xs text-slate-light dark:text-slate-dark">
              {manifest.total_words.toLocaleString()} {dialect.nativeLabel} entries indexed
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
        </section>
      </div>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-8 overflow-hidden rounded-2xl border border-paper-border bg-paper-raised/60 p-3 dark:border-ink-border dark:bg-ink-raised/60 sm:p-4">
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
          <div className="flex flex-col items-center gap-3 py-16 text-center text-slate-light dark:text-slate-dark">
            <RojDisc size={40} rayCount={12} className="opacity-30" />
            <p className="text-sm">
              Li jor peyvekê binivîse, an jî tîpekê hilbijêre.
            </p>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {results.map((entry, i) => (
                <ResultCard
                  key={entry.word + i}
                  entry={entry}
                  dialectKey={dialectKey}
                  onTermClick={handleTermClick}
                  style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                />
              ))}
            </div>
            {truncated && (
              <p className="mt-6 text-center text-sm text-slate-light dark:text-slate-dark">
                Showing 60 of {totalMatches.toLocaleString()} matches — keep typing to narrow it down.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
