// src/App.jsx
import { useState, useEffect } from 'react';
import { useHashRoute } from './hooks/useHashRoute';
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate';
import { parseWordRoute } from './lib/wordRoute';
import { isTauri } from './lib/platform';
import Header from './components/Header';
import Footer from './components/Footer';
import UpdateToast from './components/UpdateToast';
import AppDownloadToast from './components/AppDownloadToast';
import Home from './Home';
import About from './About';
import Download from './Download';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('ferheng-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ferheng-theme', theme);

    // Keep the native window chrome (Windows/macOS title bar) in sync
    // with the in-app theme — the desktop window starts in dark mode by
    // default (see src-tauri/tauri.conf.json), but should follow the
    // user's actual choice once the app has mounted.
    if (isTauri) {
      import('@tauri-apps/api/window')
        .then(({ getCurrentWindow }) => getCurrentWindow().setTheme(theme))
        .catch(() => {});
    }
  }, [theme]);

  return [theme, setTheme];
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [route, navigate] = useHashRoute();
  const { needRefresh, applyUpdate } = useServiceWorkerUpdate();
  // Only parsed on first render on purpose — Home seeds its own state
  // from this once, then owns it; re-parsing on every route change would
  // fight with the URL updates Home itself makes as the user searches.
  const [initialWord] = useState(() => parseWordRoute(route));

  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} onThemeChange={setTheme} route={route} navigate={navigate} />
      <div className="flex-1">
        {route === '/about' ? (
          <About navigate={navigate} />
        ) : route === '/download' ? (
          <Download navigate={navigate} />
        ) : (
          <Home initialWord={initialWord} />
        )}
      </div>
      <Footer navigate={navigate} />
      {needRefresh && <UpdateToast onUpdate={applyUpdate} />}
      <AppDownloadToast navigate={navigate} />
    </div>
  );
}
