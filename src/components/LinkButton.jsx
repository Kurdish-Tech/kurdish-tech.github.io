// src/components/LinkButton.jsx

// Generic, brand-neutral icons — deliberately not a reproduction of
// GitHub's actual mark (or any other trademarked logo). The button's own
// text label already says exactly where it goes.
function CodeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18-6-6 6-6M15 6l6 6-6 6" />
    </svg>
  );
}

function KeyboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M8 13h8" />
    </svg>
  );
}

export const LINK_BUTTON_ICONS = { code: CodeIcon, keyboard: KeyboardIcon };

export default function LinkButton({ href, icon = 'code', variant = 'secondary', shortLabel, children }) {
  const Icon = LINK_BUTTON_ICONS[icon] || CodeIcon;
  const isPrimary = variant === 'primary';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
        isPrimary
          ? 'bg-roj text-ink hover:bg-roj-soft'
          : 'border border-paper-border bg-paper-raised text-ink hover:border-roj hover:text-roj-deep dark:border-ink-border dark:bg-ink-raised dark:text-paper dark:hover:border-roj dark:hover:text-roj-soft'
      }`}
    >
      <Icon className="shrink-0" />
      {shortLabel ? (
        <>
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{children}</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </a>
  );
}
