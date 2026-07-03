// src/hooks/useOfflineDownload.js
import { useCallback, useEffect, useState } from 'react';
import { DATA_BASE } from './useDictionary';

const CONCURRENCY = 6;

function storageKey(dialectKey) {
  return `ferheng-offline-${dialectKey}`;
}

/**
 * Lets a user eagerly pre-fetch every word-data chunk for a dialect, so the
 * service worker's runtime cache (CacheFirst on data JSON files, see
 * vite.config.js) has full offline coverage instead of only whatever the
 * user happened to search while online.
 */
export function useOfflineDownload(dialectKey, manifest) {
  const [status, setStatus] = useState('idle'); // idle | downloading | done | error
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setStatus(localStorage.getItem(storageKey(dialectKey)) === '1' ? 'done' : 'idle');
    setProgress({ done: 0, total: 0 });
  }, [dialectKey]);

  const download = useCallback(async () => {
    if (!manifest || status === 'downloading') return;

    const files = Object.values(manifest.letters).flat();
    const totalBytes = files.reduce((sum, part) => sum + part.bytes, 0);
    let doneBytes = 0;

    setStatus('downloading');
    setErrorMessage('');
    setProgress({ done: 0, total: totalBytes });

    let index = 0;
    let failed = null;

    async function worker() {
      while (index < files.length && !failed) {
        const part = files[index++];
        try {
          const res = await fetch(`${DATA_BASE}/${dialectKey}/${part.file}`);
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          await res.arrayBuffer();
          doneBytes += part.bytes;
          setProgress({ done: doneBytes, total: totalBytes });
        } catch (err) {
          failed = err;
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    if (failed) {
      setStatus('error');
      setErrorMessage(failed.message || 'Download failed.');
      return;
    }

    localStorage.setItem(storageKey(dialectKey), '1');
    setStatus('done');
  }, [manifest, dialectKey, status]);

  return { status, progress, errorMessage, download };
}
