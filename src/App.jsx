// src/App.jsx
import { useState, useEffect } from 'react';
import { useHashRoute } from './hooks/useHashRoute';
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate';
import Header from './components/Header';
import Footer from './components/Footer';
import UpdateToast from './components/UpdateToast';
import Home from './Home';
import About from './About';

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
  }, [theme]);

  return [theme, setTheme];
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [route, navigate] = useHashRoute();
  const { needRefresh, applyUpdate } = useServiceWorkerUpdate();

  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} onThemeChange={setTheme} route={route} navigate={navigate} />
      <div className="flex-1">
        {route === '/about' ? <About /> : <Home />}
      </div>
      <Footer navigate={navigate} />
      {needRefresh && <UpdateToast onUpdate={applyUpdate} />}
    </div>
  );
}
