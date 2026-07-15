// scripts/patch-android-manifest.cjs
//
// The dictionary ships several multi-megabyte JSON chunk files (see
// src/hooks/useDictionary.js) as bundled app assets. On Android those are
// served to the WebView through Tauri's native asset-protocol bridge
// (Rust.handleRequest -> RustWebViewClient.shouldInterceptRequest), and
// real devices have hit java.lang.OutOfMemoryError there against the
// default ~256MB heap — confirmed via `adb shell dumpsys dropbox --print
// data_app_crash` on a real device, both while loading a chunk and, once
// the heap was already exhausted, while handling keyboard input.
// android:largeHeap grants a substantially bigger heap ceiling; like the
// signing config and icons, AndroidManifest.xml doesn't survive between
// `tauri android init` runs, so this has to be re-applied every time.
const fs = require('fs');

const path = process.argv[2];
if (!path) {
  console.error('usage: node patch-android-manifest.cjs <path-to-AndroidManifest.xml>');
  process.exit(1);
}

let content = fs.readFileSync(path, 'utf8');

const ANCHOR = 'android:usesCleartextTraffic="${usesCleartextTraffic}">';
if (!content.includes(ANCHOR)) {
  throw new Error(`expected <application> anchor not found in ${path} — Tauri's template may have changed`);
}
content = content.replace(
  ANCHOR,
  `${ANCHOR.slice(0, -1)}\n        android:largeHeap="true">`
);

fs.writeFileSync(path, content);
console.log(`patched ${path} with android:largeHeap="true"`);
