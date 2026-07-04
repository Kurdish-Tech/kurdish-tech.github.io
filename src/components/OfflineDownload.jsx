// src/components/OfflineDownload.jsx
import { useOfflineDownload } from '../hooks/useOfflineDownload';

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

export default function OfflineDownload({ dialect, manifest }) {
  const { status, progress, errorMessage, download } = useOfflineDownload(dialect.key, manifest);

  if (!manifest) return null;

  if (status === 'done') {
    return (
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-light dark:text-slate-dark">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {dialect.nativeLabel} amade ye bo karanîna bêînternetê
      </p>
    );
  }

  if (status === 'downloading') {
    const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div className="mx-auto mt-3 max-w-xs">
        <div className="h-1.5 overflow-hidden rounded-full bg-paper-border dark:bg-ink-border">
          <div
            className="h-full rounded-full bg-roj transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-light dark:text-slate-dark">
          Dakêşan… {pct}%
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col items-center gap-1">
      <button
        onClick={download}
        className="text-xs font-medium text-slate-light underline decoration-dotted underline-offset-2 transition-colors hover:text-roj-deep dark:text-slate-dark dark:hover:text-roj-soft"
      >
        Daxistina {dialect.nativeLabel} bo karanîna bêînternetê ({formatSize(manifest.total_bytes)})
      </button>
      {status === 'error' && (
        <p className="text-xs text-roj-deep dark:text-roj-soft">
          Dakêşan biserneket ({errorMessage}).
        </p>
      )}
    </div>
  );
}
