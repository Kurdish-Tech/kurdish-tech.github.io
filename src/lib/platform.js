// src/lib/platform.js
//
// Narrowly-scoped platform detection — used only for the couple of
// spots where the desktop shell genuinely needs different behavior than
// the web build (native title bar theming, macOS's overlay title bar).
// Everything else in the app is fully shared between web and desktop.

export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const isMac =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent || '');

// Best-effort OS/device guess, based on the browser's own platform, not
// the (possibly different) machine/device the app will actually run on.
// Two separate things read this: DesktopDownloadToast (windows/macos/
// linux — a real Tauri installer exists for those) and InstallPwaToast
// (android — no installer, but there's a PWA install prompt to offer).
// iOS gets null here since neither of those applies to it; InstallPwaToast
// checks isIOS directly instead.
export function detectPlatform() {
  if (typeof navigator === 'undefined') return null;
  const ua = `${navigator.userAgent || ''} ${navigator.platform || ''}`;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return null;
  if (/mac/i.test(ua)) return 'macos';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
  return null;
}

export const isIOS =
  typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent || '');
