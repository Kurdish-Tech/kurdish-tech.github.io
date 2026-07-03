// src/components/ResultCard.jsx
import { DIALECTS } from '../lib/kurdishAlphabet';

const CROSS_FIELD = {
  ku: { key: 'sorani_equivalents', targetDialect: 'sor' },
  sor: { key: 'kurmanci_equivalents', targetDialect: 'ku' },
};

function StarIcon({ filled, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.63 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.63 12 2" />
    </svg>
  );
}

export default function ResultCard({ entry, dialectKey, onTermClick, isFavorite, onToggleFavorite, style }) {
  const dialect = DIALECTS[dialectKey];
  const cross = CROSS_FIELD[dialectKey];
  const crossWords = entry[cross.key] || [];
  const targetDialect = DIALECTS[cross.targetDialect];

  return (
    <article
      style={style}
      className="animate-card-in rounded-2xl border border-paper-border bg-paper-raised p-6 shadow-[0_1px_2px_rgba(20,23,31,0.05)] transition-shadow hover:shadow-md dark:border-ink-border dark:bg-ink-raised"
    >
      <header
        dir={dialect.dir}
        className="mb-3 flex flex-wrap items-baseline gap-3"
      >
        <h3 className={`text-2xl font-semibold text-ink dark:text-paper ${dialect.fontClass}`}>
          {entry.word}
        </h3>
        {entry.pos_title && (
          <span className="rounded-full bg-roj/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-roj-deep dark:bg-roj/20 dark:text-roj-soft">
            {entry.pos_title}
          </span>
        )}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(dialectKey, entry.word)}
            aria-label={isFavorite ? 'Ji bijarte rake' : 'Têxe nav bijarte'}
            aria-pressed={isFavorite}
            className={`ml-auto shrink-0 transition-colors ${
              isFavorite
                ? 'text-roj'
                : 'text-slate-light hover:text-roj dark:text-slate-dark dark:hover:text-roj'
            }`}
          >
            <StarIcon filled={isFavorite} />
          </button>
        )}
      </header>

      {entry.glosses && entry.glosses.length > 0 && (
        <ol
          dir={dialect.dir}
          className={`mb-4 space-y-1.5 text-[15px] leading-relaxed text-ink/85 dark:text-paper/85 ${dialect.fontClass === 'font-arabic' ? 'font-arabic' : ''}`}
        >
          {entry.glosses.map((g, i) => (
            <li key={i} className="flex gap-2">
              {entry.glosses.length > 1 && (
                <span className="shrink-0 text-sm font-semibold text-slate-light dark:text-slate-dark">
                  {i + 1}.
                </span>
              )}
              <span>{g}</span>
            </li>
          ))}
        </ol>
      )}

      {entry.synonyms && entry.synonyms.length > 0 && (
        <div dir={dialect.dir} className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-light dark:text-slate-dark">
            Wekhev
          </span>
          {entry.synonyms.map((s) => (
            <button
              key={s}
              onClick={() => onTermClick(dialectKey, s)}
              className={`rounded-full border border-paper-border bg-paper px-2.5 py-1 text-sm text-ink/80 transition-colors hover:border-roj hover:text-roj-deep dark:border-ink-border dark:bg-ink dark:text-paper/80 dark:hover:border-roj dark:hover:text-roj-soft ${dialect.fontClass}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {crossWords.length > 0 && (
        <div
          dir={targetDialect.dir}
          className="flex flex-wrap items-center gap-1.5 border-t border-paper-border pt-3 dark:border-ink-border"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-zagros-deep dark:text-zagros-soft">
            {targetDialect.nativeLabel} →
          </span>
          {crossWords.map((w) => (
            <button
              key={w}
              onClick={() => onTermClick(cross.targetDialect, w)}
              className={`rounded-full border border-zagros/30 bg-zagros/10 px-2.5 py-1 text-sm text-zagros-deep transition-colors hover:bg-zagros/20 dark:border-zagros/40 dark:bg-zagros/15 dark:text-zagros-soft ${targetDialect.fontClass}`}
            >
              {w}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
