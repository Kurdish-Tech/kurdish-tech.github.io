// src/components/InstallPwaToast.jsx
import { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { detectPlatform, isIOS, isTauri } from '../lib/platform';

const DISMISSED_KEY = 'ferheng-pwa-install-dismissed';

function ShareIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 16V4M7 8l5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

function MoreMenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

// Ferheng's PWA already covers everything a native Android/iOS app would
// (standalone window, offline, auto-update — see vite.config.js's
// `display: 'standalone'`), so this offers that install instead of a
// native app. On Chrome/Android, the browser's own one-tap prompt is
// used directly; iOS Safari never exposes that API, so it gets manual
// "Share -> Add to Home Screen" steps instead. Same corner-toast
// treatment as DesktopDownloadToast for a consistent, non-intrusive nudge.
export default function InstallPwaToast() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');
  const { canPromptInstall, promptInstall, isStandalone } = usePwaInstall();
  const platform = detectPlatform();
  const isAndroid = platform === 'android';

  if (isTauri || isStandalone || dismissed || !(isAndroid || isIOS)) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const handleInstall = async () => {
    await promptInstall();
    dismiss();
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

      <div className="pr-4 text-sm font-semibold text-ink dark:text-paper">Sazkirina Ferheng</div>
      <p className="mt-1 text-xs text-slate-light dark:text-slate-dark">Ferheng jî wekî sepan heye.</p>

      {canPromptInstall ? (
        <button
          onClick={handleInstall}
          className="mt-3 rounded-full bg-roj px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-roj-soft"
        >
          Sazkirin
        </button>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-xs text-ink dark:bg-ink dark:text-paper">
          <span className="shrink-0 text-slate-light dark:text-slate-dark">Gav:</span>
          {isIOS ? (
            <>
              <ShareIcon width={14} height={14} className="shrink-0 text-roj" />
              <span>→ "Add to Home Screen"</span>
            </>
          ) : (
            <>
              <MoreMenuIcon width={14} height={14} className="shrink-0 text-roj" />
              <span>→ "Install app"</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
