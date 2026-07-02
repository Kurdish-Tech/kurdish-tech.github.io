// src/components/Header.jsx
import RojDisc from './RojDisc';
import ThemeToggle from './ThemeToggle';

export default function Header({ theme, onThemeChange, route, navigate }) {
  return (
    <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5"
        aria-label="Ferheng — go to home page"
      >
        <RojDisc size={28} rayCount={10} className="text-roj" />
        <span className="font-display text-lg font-semibold tracking-tight text-ink dark:text-paper">
          Ferheng
        </span>
      </button>

      <nav className="flex items-center gap-5">
        <button
          onClick={() => navigate('/about')}
          className={`text-sm font-medium transition-colors ${
            route === '/about'
              ? 'text-roj-deep dark:text-roj'
              : 'text-slate-light hover:text-ink dark:text-slate-dark dark:hover:text-paper'
          }`}
        >
          Derbarê Me
        </button>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </nav>
    </header>
  );
}
