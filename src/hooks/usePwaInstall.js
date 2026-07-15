// src/hooks/usePwaInstall.js
import { useEffect, useState, useCallback } from 'react';

function isRunningStandalone() {
  if (typeof window === 'undefined') return false;
  // iOS Safari has no `display-mode` media query support for this; it
  // exposes its own legacy `navigator.standalone` flag instead.
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

/**
 * Wraps the browser's `beforeinstallprompt` event — the one-tap native
 * install flow Chrome/Chromium offer on Android (and desktop Chrome).
 * That event fires early and only once, so it has to be captured in a
 * listener mounted from app start, not requested on demand later. Safari
 * (iOS, and macOS) never fires it at all; there, `canPromptInstall` just
 * stays false and the UI falls back to manual instructions.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(isRunningStandalone);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return { canPromptInstall: deferredPrompt !== null, promptInstall, isStandalone };
}
