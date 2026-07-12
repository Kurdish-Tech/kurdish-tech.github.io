// src/components/BackHomeButton.jsx
export default function BackHomeButton({ navigate }) {
  return (
    <button
      onClick={() => navigate('/')}
      className="mb-6 inline-flex animate-rise-in items-center gap-1.5 text-sm font-medium text-slate-light transition-colors hover:text-roj-deep dark:text-slate-dark dark:hover:text-roj-soft"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Malper
    </button>
  );
}
