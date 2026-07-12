// src/lib/platform.js
//
// Narrowly-scoped platform detection — used only for the couple of
// spots where the desktop shell genuinely needs different behavior than
// the web build (native title bar theming, macOS's overlay title bar).
// Everything else in the app is fully shared between web and desktop.

export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const isMac =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent || '');

// Best-effort guess at which desktop installer to recommend on the
// download section — based on the browser's own OS, not the (possibly
// different) machine the app will actually run on. Deliberately returns
// null for phones/tablets rather than guessing wrong, since there's no
// mobile build to offer yet.
export function detectDesktopOS() {
  if (typeof navigator === 'undefined') return null;
  const ua = `${navigator.userAgent || ''} ${navigator.platform || ''}`;
  if (/android|iphone|ipad|ipod/i.test(ua)) return null;
  if (/mac/i.test(ua)) return 'macos';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
  return null;
}
