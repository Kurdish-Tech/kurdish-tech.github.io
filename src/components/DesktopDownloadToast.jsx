// src/components/DesktopDownloadToast.jsx
import { useState } from 'react';
import { useDesktopReleases } from '../hooks/useDesktopReleases';
import { detectDesktopOS, isTauri } from '../lib/platform';
import { PLATFORMS } from '../lib/platforms';

const DISMISSED_KEY = 'ferheng-desktop-promo-dismissed';

// A corner notification, not a banner baked into the page — it should
// read as "by the way, here's a thing," not compete with the search UX
// the way an inline card did. Only ever appears for a detected desktop
// OS (Windows/macOS/Linux); phones, tablets, and anything unrecognized
// get nothing, since there's no mobile build to offer.
export default function DesktopDownloadToast({ navigate }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');
  const { status, data } = useDesktopReleases();
  const os = detectDesktopOS();

  if (isTauri || dismissed || !os || status !== 'ready' || !data[os]) return null;

  const platform = PLATFORMS.find((p) => p.key === os);
  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs animate-rise-in rounded-2xl border border-paper-border bg-paper-raised p-4 shadow-lg dark:border-ink-border dark:bg-ink-raised">
      <button
        onClick={dismiss}
        aria-label="Vekirinê paşguh bike"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-light hover:bg-paper hover:text-ink dark:text-slate-dark dark:hover:bg-ink dark:hover:text-paper"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-center gap-2 pr-4 text-sm font-semibold text-ink dark:text-paper">
        {platform.icon({ width: 16, height: 16, className: 'shrink-0 text-roj' })}
        Hûn li ser {platform.label} in
      </div>
      <p className="mt-1 text-xs text-slate-light dark:text-slate-dark">
        Ferheng jî wekî app sermaseyê heye.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <a
          href={data[os].url}
          onClick={dismiss}
          className="rounded-full bg-roj px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-roj-soft"
        >
          Sazkirin
        </a>
        <button
          onClick={() => {
            navigate('/download');
            dismiss();
          }}
          className="text-xs font-medium text-slate-light underline decoration-dotted underline-offset-2 hover:text-ink dark:text-slate-dark dark:hover:text-paper"
        >
          Hemû guhertoyan bibîne
        </button>
      </div>
    </div>
  );
}
