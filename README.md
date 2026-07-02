# Ferheng — Kurmancî ⇄ Soranî Dictionary

A static, zero-backend Kurdish dictionary web app. 453,574 words (447,139
Kurmancî + 6,435 Soranî), served entirely as pre-chunked static JSON —
no database, no API server, no monthly cost.

Word data: [Wîkîferheng](https://ku.wiktionary.org) (Kurdish Wiktionary),
via the [kaikki.org/kuwiktionary](https://kaikki.org/kuwiktionary/index.html)
structured extraction. Licensed CC BY-SA 4.0 + GFDL.

## Run locally

```bash
npm install
npm run dev
```

## Architecture

```
public/data/
  ku/            Kurmancî — 447,139 words, 105 files, ~65MB
    index.json   manifest: which files exist per letter, with byte ranges
    a-1.json     ...a-2.json (only "a" and "b" needed >1 file)
    b-1.json ... b-5.json
    c-1.json
    ...
  sor/           Soranî — 6,435 words, 65 files, ~0.9MB
    index.json
    ک-1.json
    ...
```

### Chunking strategy

Each dictionary is bucketed by the first letter of the headword (lowercased),
then greedily packed into part files capped at 1.8MB (comfortably under the
2MB requirement — largest file on disk is 1.8MB, verified). Only two
Kurmancî letters (`a`, `b`) needed more than one part; everything else fits
in a single file per letter.

Each entry is stripped of fields that are constant across an entire
language directory (`lang`, `lang_code`, `source`) and of empty arrays,
then minified (no whitespace). That took the source data from 167MB down
to ~65MB before gzip — Vercel/Netlify both gzip/brotli static assets
automatically, so the real over-the-wire size is smaller still.

`index.json` per language records, for every part file, its `first` and
`last` word (alphabetically). The frontend uses this to fetch **only** the
part(s) that could contain a match for what's been typed so far, instead
of pulling an entire multi-part letter on every keystroke — e.g. typing
"bar" only fetches the one ~1.8MB part that actually covers that range,
not all five parts of the "b" bucket.

### Search

Client-side only. Typing debounces 180ms, then:
1. Look up the manifest for the active dialect (cached after first load).
2. Determine which letter bucket(s) the query could match — for Kurmancî,
   this also checks the plain-ASCII fallback letter (typing "s" also checks
   the "ş" bucket, etc., for people without a Kurdish keyboard layout).
3. Fetch only the chunk part(s) whose word-range overlaps the query.
4. Filter client-side: matches on the headword itself, or on a listed
   synonym, both by prefix.

Everything fetched is cached in memory for the session, so browsing the
same letter twice costs one network request, not two.

### A note on the "82 Kurmancî letter buckets"

Kurmancî's real alphabet has 31 letters, but the manifest has more buckets
than that — this is genuine, not a bug. Some words tagged `lang: "Kurmancî"`
in the source data are written in Arabic script (the Badini sub-dialect has
historically been written that way), plus a handful of loanword entries use
other Latin diacritics or Cyrillic. All of it is real Wiktionary data and is
included; the alphabet quick-nav rail shows the 31 standard letters, but
free-text search reaches everything regardless of script.

### Known limitations, honestly

- The "Wekhev" (synonym) and cross-dialect tags come straight from
  Wiktionary's own data — most entries don't have a cross-dialect link yet
  (only ~888 Kurmancî entries do), because that's genuinely how complete
  the upstream source is right now, not something this app is hiding.
- Search is prefix-based, not fuzzy — typing "kurdi" won't currently find
  "tkurdi" for typos. Worth adding if this gets real usage.
- Fonts (Fraunces / Manrope / Noto Naskh Arabic) load from Google Fonts.
  If you need a fully offline-capable build, self-host those three font
  files under `public/fonts/` and update the `@font-face` rules — the app
  doesn't otherwise depend on any external service at runtime.

## License

Code: MIT, Kurdish Tech Organization.
Dictionary data: CC BY-SA 4.0 + GFDL, via Wîkîferheng/Wiktionary contributors.
