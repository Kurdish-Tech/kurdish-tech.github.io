// src/components/Pagination.jsx
import { useState } from 'react';

function ChevronIcon({ flip, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const buttonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-paper-border bg-paper-raised text-ink transition-colors hover:border-roj hover:text-roj-deep disabled:pointer-events-none disabled:opacity-30 dark:border-ink-border dark:bg-ink-raised dark:text-paper dark:hover:border-roj dark:hover:text-roj-soft';

/** Prev/Next + jump-to-page control for browsing a full letter bucket,
 * which can run to hundreds of pages — Prev/Next alone would make the
 * far side of a large letter practically unreachable. */
export default function Pagination({ page, pageCount, onChange, dir = 'ltr' }) {
  const [jumpValue, setJumpValue] = useState('');
  const isRtl = dir === 'rtl';

  if (pageCount <= 1) return null;

  const goTo = (p) => onChange(Math.max(0, Math.min(pageCount - 1, p)));

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(jumpValue, 10);
    if (!Number.isNaN(n)) goTo(n - 1);
    setJumpValue('');
  };

  return (
    <nav aria-label="Pagination" dir={dir} className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
        className={buttonClass}
      >
        <ChevronIcon flip={!isRtl} />
      </button>

      <span className="flex items-center gap-1.5 text-sm text-slate-light dark:text-slate-dark">
        <span>Rûpel</span>
        <form onSubmit={handleJumpSubmit} className="contents">
          <input
            type="text"
            inputMode="numeric"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ''))}
            onBlur={() => setJumpValue('')}
            placeholder={String(page + 1)}
            aria-label="Jump to page"
            className="w-12 rounded-lg border border-paper-border bg-paper px-1.5 py-1 text-center text-ink outline-none focus:border-roj dark:border-ink-border dark:bg-ink dark:text-paper"
          />
        </form>
        <span>ji {pageCount.toLocaleString()}</span>
      </span>

      <button
        onClick={() => goTo(page + 1)}
        disabled={page === pageCount - 1}
        aria-label="Next page"
        className={buttonClass}
      >
        <ChevronIcon flip={isRtl} />
      </button>
    </nav>
  );
}
