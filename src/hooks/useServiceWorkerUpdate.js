// src/hooks/useServiceWorkerUpdate.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

// Dictionary users tend to keep a tab open for a long time rather than
// reloading often, so a new service worker installed in the background
// can sit unnoticed indefinitely. Periodically asking the browser to
// check for an update means even a long-lived tab surfaces the "update
// available" prompt within an hour of a new deploy, not just on the
// next accidental reload.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

// Once an update is available, wait this long before auto-applying it —
// long enough that it never feels like the page is yanked out from under
// someone mid-action, short enough that most users get the new version
// without ever touching the "update now" button.
const AUTO_UPDATE_DELAY_MS = 45 * 1000;
// If the user is mid-typing/editing when the delay elapses, don't force
// it — check back at this cadence and apply as soon as they pause.
const BUSY_RECHECK_INTERVAL_MS = 5 * 1000;

function isUserEditing() {
  const el = document.activeElement;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

export function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef(null);

  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegisteredSW(_url, registration) {
        if (!registration) return;
        setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL_MS);
      },
    });
  }, []);

  const applyUpdate = useCallback(() => {
    updateSWRef.current?.(true);
  }, []);

  useEffect(() => {
    if (!needRefresh) return;
    let timer;
    const tryAutoUpdate = () => {
      if (isUserEditing()) {
        timer = setTimeout(tryAutoUpdate, BUSY_RECHECK_INTERVAL_MS);
      } else {
        applyUpdate();
      }
    };
    timer = setTimeout(tryAutoUpdate, AUTO_UPDATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [needRefresh, applyUpdate]);

  return { needRefresh, applyUpdate };
}
