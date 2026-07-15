// src/lib/platform.js
//
// Narrowly-scoped platform detection — used only for the couple of
// spots where the desktop shell genuinely needs different behavior than
// the web build (native title bar theming, macOS's overlay title bar).
// Everything else in the app is fully shared between web and desktop.

export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const isMac =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent || '');

// Best-effort guess at which install to recommend on the download
// section — based on the browser's own OS, not the (possibly different)
// machine/device the app will actually run on. Returns null for iOS and
// anything unrecognized rather than guessing wrong, since there's no iOS
// build to offer.
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
