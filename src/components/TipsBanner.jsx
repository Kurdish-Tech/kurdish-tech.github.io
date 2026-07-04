// src/components/TipsBanner.jsx
import { useState } from 'react';

const STORAGE_KEY = 'ferheng-tips-dismissed';

const TIPS = [
  'Nizane rastnivîsê gotinê bi tevahî? Nivîsîna nêzîk jê binivise wê derkeve.',
  'Tîpekê hilbijêre da ku hemû peyvên wê tîpê bibînî.',
  'Bêînternet jî ti dikare bikarbîne ferheng — li jor "daxistin" hilbijêre.',
];

// Several real capabilities (fuzzy search, full alphabetical browsing,
// offline download) are invisible unless someone already knows to look
// for them. A quiet, dismissible hint — not a modal or forced tour — is
// enough for that first-time discovery without nagging returning users.
export default function TipsBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-paper-border bg-paper-raised/60 px-4 py-3 dark:border-ink-border dark:bg-ink-raised/60">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-light dark:text-slate-dark">
          Şîret
        </h2>
        <button
          onClick={dismiss}
          aria-label="Şîretan veşêre"
          className="rounded-full p-1 text-slate-light hover:bg-paper hover:text-ink dark:text-slate-dark dark:hover:bg-ink dark:hover:text-paper"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ul className="space-y-1 text-left text-sm text-ink/80 dark:text-paper/80">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span className="text-roj">·</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
