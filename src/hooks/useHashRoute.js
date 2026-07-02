// src/hooks/useHashRoute.js
import { useState, useEffect, useCallback } from 'react';

// Hash-based routing (URLs like "yoursite.com/#/about") instead of a real
// router library or path-based routes. Deliberate choice: path-based routes
// (e.g. "/about") need a server-side rewrite rule so a direct visit or
// refresh doesn't 404 on a static host — that's an extra deploy-config step
// on Vercel/Netlify. Hash routes never leave the browser, so they work on
// any static host with zero configuration, which matches the "$0 budget,
// deploy anywhere" goal of this whole project.

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function useHashRoute() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onHashChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((nextPath) => {
    window.location.hash = nextPath;
    // Direct assignment (not scrollTo) so this ignores the global
    // `scroll-behavior: smooth` CSS rule — a route change should jump
    // instantly, not animate while the page content is also swapping.
    document.documentElement.scrollTop = 0;
  }, []);

  return [path, navigate];
}
