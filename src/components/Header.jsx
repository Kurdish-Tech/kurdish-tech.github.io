// src/components/Header.jsx
import { useState } from 'react';
import RojDisc from './RojDisc';
import ThemeToggle from './ThemeToggle';
import { isTauri, isMac } from '../lib/platform';

// macOS's overlay title bar (see src-tauri/tauri.conf.json) draws the
// traffic-light buttons directly on top of the webview with no separate
// native strip below them — unlike Windows/Linux, which keep their usual
// native title bar and need no adjustment here at all. Only this one
// platform combination needs extra clearance + a drag handle.
const isMacOverlay = isTauri && isMac;

const GITHUB_ORG_URL = 'https://github.com/Kurdish-Tech';
const KEYBOARD_URL = 'https://kurdish-tech.github.io/kurdish-kurmanci-keyboard-layout/';

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const navLinkClass = (active) =>
  `text-sm font-medium transition-colors ${
    active
      ? 'text-roj-deep dark:text-roj'
      : 'text-slate-light hover:text-ink dark:text-slate-dark dark:hover:text-paper'
  }`;

export default function Header({ theme, onThemeChange, route, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goToAbout = () => {
    navigate('/about');
    setMenuOpen(false);
  };

  const goToDownload = () => {
    navigate('/download');
    setMenuOpen(false);
  };

  return (
    <>
      {isMacOverlay && <div data-tauri-drag-region className="h-7 w-full" />}
      <header
        className={`relative mx-auto grid w-full max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-4 pr-6 pt-8 ${
          isMacOverlay ? 'pl-24' : 'pl-6'
        }`}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 justify-self-start"
          aria-label="Ferheng — go to home page"
        >
          <RojDisc size={28} rayCount={10} className="text-roj" />
          <span className="font-display text-lg font-semibold tracking-tight text-ink dark:text-paper">
            Ferheng
          </span>
        </button>

        {/* Middle grid column, so these are centered in the header's own
            available space — not just pushed up against whichever side
            happens to be wider. Hidden on mobile; collapsed into the
            hamburger menu there instead so the row never wraps. */}
        <nav className="col-start-2 hidden items-center justify-self-center gap-6 sm:flex">
          <button onClick={goToAbout} className={navLinkClass(route === '/about')}>
            Derbarê Me
          </button>
          <a href={KEYBOARD_URL} target="_blank" rel="noopener noreferrer" className={navLinkClass(false)}>
            Klavyeya Kurdî
          </a>
          {!isTauri && (
            <button onClick={goToDownload} className={navLinkClass(route === '/download')}>
              Daxistin li ser Computer
            </button>
          )}
        </nav>

        <div className="col-start-3 flex items-center gap-3 justify-self-end">
          <div className="hidden sm:block">
            <ThemeToggle theme={theme} onChange={onThemeChange} />
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Menûyê bigire' : 'Menûyê veke'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-light transition-colors hover:bg-paper-raised hover:text-ink dark:text-slate-dark dark:hover:bg-ink-raised dark:hover:text-paper sm:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 cursor-default sm:hidden"
          />
          <nav className="absolute right-6 z-50 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-paper-border bg-paper-raised p-2 shadow-lg dark:border-ink-border dark:bg-ink-raised sm:hidden">
            <button
              onClick={goToAbout}
              className={`rounded-xl px-3 py-2 text-left ${navLinkClass(route === '/about')}`}
            >
              Derbarê Me
            </button>
            <a
              href={KEYBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl px-3 py-2 ${navLinkClass(false)}`}
            >
              Klavyeya Kurdî
            </a>
            {!isTauri && (
              <button
                onClick={goToDownload}
                className={`rounded-xl px-3 py-2 text-left ${navLinkClass(route === '/download')}`}
              >
                Daxistin li ser Computer
              </button>
            )}
            <div className="mt-1 flex items-center justify-between rounded-xl border-t border-paper-border px-3 pt-3 dark:border-ink-border">
              <span className="text-sm font-medium text-slate-light dark:text-slate-dark">
                Moda tarî
              </span>
              <ThemeToggle theme={theme} onChange={onThemeChange} />
            </div>
          </nav>
        </>
      )}
    </>
  );
}
