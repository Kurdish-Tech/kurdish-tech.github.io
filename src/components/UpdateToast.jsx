// src/components/UpdateToast.jsx
export default function UpdateToast({ onUpdate }) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="animate-rise-in flex items-center gap-3 rounded-2xl border border-paper-border bg-paper-raised px-4 py-3 shadow-lg dark:border-ink-border dark:bg-ink-raised">
        <p className="text-sm text-ink dark:text-paper">
          Guhertoyeke nû ya Ferheng amade ye.
        </p>
        <button
          onClick={onUpdate}
          className="shrink-0 rounded-full bg-roj px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-roj-soft"
        >
          Nûve bike
        </button>
      </div>
    </div>
  );
}
