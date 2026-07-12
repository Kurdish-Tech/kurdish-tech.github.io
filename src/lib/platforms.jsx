// src/lib/platforms.jsx
// Shared between the desktop-download toast and the full downloads page —
// one place to define what a "platform" looks like so both stay in sync.

export const PLATFORMS = [
  {
    key: 'windows',
    label: 'Windows',
    installerNote: '.exe — nesaziya sazkirinê ya Windows',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="3" y="4" width="8" height="8" />
        <rect x="13" y="4" width="8" height="8" />
        <rect x="3" y="14" width="8" height="6" />
        <rect x="13" y="14" width="8" height="6" />
      </svg>
    ),
  },
  {
    key: 'macos',
    label: 'macOS',
    installerNote: '.dmg — ji bo Apple Silicon û Intel',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M12 3v6" />
        <rect x="4" y="9" width="16" height="12" rx="2.5" />
      </svg>
    ),
  },
  {
    key: 'linux',
    label: 'Linux',
    installerNote: '.AppImage / .deb',
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    ),
  },
];

export function formatAssetSize(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}
