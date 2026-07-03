// src/components/AlphabetRail.jsx

export default function AlphabetRail({ dialect, activeLetter, onSelect, availableLetters }) {
  return (
    <nav
      aria-label={`Browse ${dialect.label} by letter`}
      dir={dialect.dir}
      className="flex flex-nowrap gap-1.5 overflow-x-auto px-1 py-0.5 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
    >
      {dialect.alphabet.map((letter) => {
        const isAvailable = !availableLetters || availableLetters.has(letter);
        const isActive = activeLetter === letter;
        return (
          <button
            key={letter}
            disabled={!isAvailable}
            onClick={() => onSelect(letter)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors sm:h-9 sm:w-9 ${dialect.fontClass} ${
              isActive
                ? 'bg-roj text-ink'
                : isAvailable
                ? 'text-slate-light hover:bg-paper-raised hover:text-ink dark:text-slate-dark dark:hover:bg-ink-raised dark:hover:text-paper'
                : 'text-slate-light/30 dark:text-slate-dark/30'
            }`}
          >
            {letter}
          </button>
        );
      })}
    </nav>
  );
}
