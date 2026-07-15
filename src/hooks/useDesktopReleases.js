// src/hooks/useDesktopReleases.js
import { useEffect, useState } from 'react';

const RELEASES_API =
  'https://api.github.com/repos/Kurdish-Tech/kurdish-tech.github.io/releases/latest';

// Installer filenames carry the version number (from the Tauri/cargo-bundle
// build), so there's no fixed URL to link to directly — the release has to
// be fetched and its assets matched by extension. Order matters: the first
// match per OS wins when a release has more than one installer for it.
function pickAsset(assets, extensions) {
  for (const ext of extensions) {
    const found = assets.find((a) => a.name.toLowerCase().endsWith(ext));
    if (found) return { name: found.name, url: found.browser_download_url, size: found.size };
  }
  return null;
}

export function parseRelease(release) {
  const assets = release.assets || [];
  return {
    // Tags look like "app-v1.0.0" so they don't collide with any web
    // versioning scheme — that "app-" namespacing is an implementation
    // detail and shouldn't leak into what's shown to people.
    version: release.tag_name.replace(/^app-/, ''),
    windows: pickAsset(assets, ['.exe', '.msi']),
    macos: pickAsset(assets, ['.dmg']),
    linux: pickAsset(assets, ['.appimage', '.deb']),
  };
}

let releasePromise = null;

function fetchLatestRelease() {
  if (!releasePromise) {
    releasePromise = fetch(RELEASES_API, { headers: { Accept: 'application/vnd.github+json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json();
      })
      .then(parseRelease)
      .catch((err) => {
        releasePromise = null;
        throw err;
      });
  }
  return releasePromise;
}

export function useDesktopReleases() {
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    let cancelled = false;
    fetchLatestRelease()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable', data: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
