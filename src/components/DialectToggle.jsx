// src/components/DialectToggle.jsx
import { DIALECTS } from '../lib/kurdishAlphabet';

export default function DialectToggle({ active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Dialect"
      className="inline-flex rounded-full border border-paper-border bg-paper-raised p-1 shadow-sm dark:border-ink-border dark:bg-ink-raised"
    >
      {Object.values(DIALECTS).map((d) => {
        const isActive = d.key === active;
        return (
          <button
            key={d.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(d.key)}
            className={`relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 sm:px-5 sm:py-2 sm:text-sm ${
              isActive
                ? 'bg-roj text-ink shadow-sm'
                : 'text-slate-light hover:text-ink dark:text-slate-dark dark:hover:text-paper'
            }`}
          >
            <span className={d.fontClass === 'font-arabic' ? 'font-arabic' : ''}>
              {d.nativeLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
