// src/components/ArabicSearchToggle.jsx
import { useState } from 'react';

const PROMO_SEEN_KEY = 'ferheng-arabic-search-promo-seen';

function SwitchIcon({ on, ...props }) {
  return (
    <svg viewBox="0 0 36 20" width="36" height="20" {...props}>
      <rect x="1" y="1" width="34" height="18" rx="9" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
      <circle cx={on ? 26 : 10} cy="10" r="6" fill={on ? '#fff' : 'currentColor'} />
    </svg>
  );
}

/**
 * Deliberately NOT a 4th dialect tab — Arabic isn't a Kurdish dialect,
 * and putting it next to Kurmancî/Soranî/Zazakî would blur what this app
 * is. Instead: a one-time promo introduces the capability, then it lives
 * on as a small, ordinary toggle. Once on, typing Arabic into the same
 * search box just works — there's no separate Arabic mode/alphabet to
 * browse, so nothing about the rest of the UI changes when it's enabled.
 */
export default function ArabicSearchToggle({ enabled, onToggle }) {
  const [promoSeen, setPromoSeen] = useState(() => localStorage.getItem(PROMO_SEEN_KEY) === '1');

  const dismissPromo = () => {
    localStorage.setItem(PROMO_SEEN_KEY, '1');
    setPromoSeen(true);
  };

  const handleEnable = () => {
    onToggle(true);
    dismissPromo();
  };

  if (!promoSeen && !enabled) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-roj/30 bg-roj/[0.07] px-4 py-3 text-center dark:border-roj/25 dark:bg-roj/[0.05]">
        <p className="text-sm text-ink dark:text-paper">
          <span className="font-semibold">Nizanî peyv bi kurdî çi ye?</span>{' '}
          Bi erebî binivîse, em peyva kurdî li her zaravayekê ji te re nîşan didin.
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-3">
          <button
            onClick={handleEnable}
            className="rounded-full bg-roj px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-roj-soft"
          >
            Vekirin
          </button>
          <button
            onClick={dismissPromo}
            className="text-xs font-medium text-slate-light hover:text-ink dark:text-slate-dark dark:hover:text-paper"
          >
            Ne niha
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      className={`mx-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        enabled
          ? 'border-roj/40 bg-roj/10 text-roj-deep dark:border-roj/30 dark:bg-roj/10 dark:text-roj-soft'
          : 'border-paper-border text-slate-light hover:text-ink dark:border-ink-border dark:text-slate-dark dark:hover:text-paper'
      }`}
    >
      <SwitchIcon on={enabled} />
      Lêgerîna bi erebî
    </button>
  );
}
