// src/components/SearchBar.jsx
import { forwardRef } from 'react';
import RojDisc from './RojDisc';

const SearchBar = forwardRef(function SearchBar(
  { value, onChange, dialect, autoFocus, loading = false, onKeyDown },
  ref
) {
  return (
    <div className="relative w-full">
      <span
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-light dark:text-slate-dark"
        style={{ left: dialect.dir === 'rtl' ? 'auto' : '1.25rem', right: dialect.dir === 'rtl' ? '1.25rem' : 'auto' }}
      >
        {loading ? (
          <RojDisc size={20} rayCount={10} spinning className="text-roj" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        )}
      </span>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={dialect.placeholder}
        aria-label={`Search ${dialect.nativeLabel}`}
        autoFocus={autoFocus}
        dir={dialect.dir}
        spellCheck={false}
        autoComplete="off"
        className={`w-full rounded-2xl border border-paper-border bg-paper-raised py-5 text-lg text-ink shadow-[0_1px_2px_rgba(20,23,31,0.06)] outline-none transition-all placeholder:text-slate-light/70 focus:border-roj focus:shadow-[0_0_0_4px_rgba(227,167,60,0.15)] dark:border-ink-border dark:bg-ink-raised dark:text-paper dark:placeholder:text-slate-dark/60 ${
          dialect.dir === 'rtl' ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5'
        } ${dialect.fontClass}`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-light hover:bg-paper hover:text-ink dark:text-slate-dark dark:hover:bg-ink dark:hover:text-paper ${
            dialect.dir === 'rtl' ? 'left-2' : 'right-2'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

export default SearchBar;
