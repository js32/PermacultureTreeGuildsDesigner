# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git

Always use `nit` instead of `git`. `nit` is installed at `/usr/local/bin/nit` and passes unknown commands through to git. Push to the `fork` remote (not `origin`).

## Build & Dev

All commands run from `pwa/` with Node ≥ 22 (use `~/.nvm/versions/node/v24.13.1/bin/node`):

```bash
# Local dev server
PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH" npm run dev

# Production build (run before committing to catch TS errors)
PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH" npm run build
```

No test suite exists. Build success is the primary correctness signal.

## Architecture

**Astro static PWA** — three pages (`index.astro`, `cards.astro`, `settings.astro`), no framework components, all interactivity is vanilla TypeScript in `<script>` blocks within each page. There is no component folder; shared logic lives in `src/lib/`.

**Data flow:**
1. Plant data lives in IndexedDB (`permaculture-guilds` DB, `plants` store) — `src/lib/db.ts`
2. Search hits the local `public/plants-db.json` first, then Wikidata API directly, then the Netlify proxy for PFAF/NaturaDB enrichment
3. `_sources: Partial<Record<keyof PlantData, DataSource>>` tracks per-field provenance — every import path must call `trackSources()` after writing fields

**Netlify proxy** (`pwa/netlify/functions/plant-proxy.mts`) scrapes PFAF and NaturaDB HTML and merges results. Reachable at `/api/plant-proxy?name=LatinName` via the redirect in `netlify.toml` (which must stay at repo root with `base = "pwa"`).

**PDF export** (`src/lib/pdf-export.ts`) uses raw `flateStream` with RGB bytes instead of `embedPng()` — this avoids an SMask that breaks rendering in LibreWolf/pdf.js. Don't revert to `embedPng()`.

**View modes** on `index.astro`: `'grid' | 'list' | 'cards'` — state variable `viewMode` controls which branch of `renderList()` runs. The cards view reuses the same `renderPolyCardHtml`/`renderStripeCardHtml` from `src/lib/card-html.ts` that `cards.astro` uses.

**CSV import** (`src/lib/csv-import.ts`) detects format by checking for `Lateinisch`/`Deutsch` headers (app's own export format) vs. the legacy PowerShell `b_*`/`t_*` column names.

**Settings** (`src/lib/settings.ts`) persist enabled data sources to localStorage. `isSourceEnabled('pfaf')` etc. gate all proxy/Wikidata calls — check these before assuming enrichment will run.

## Key types

```typescript
// src/lib/types.ts
type DataSource = 'wikidata' | 'pfaf' | 'naturadb' | 'manual' | 'csv' | 'sample';

interface PlantData {
  id: string;
  latinName: string;
  commonName: string;
  // ~50 boolean/number fields for plant attributes
  fruitMonths: boolean[];   // length 12
  flowerMonths: boolean[];  // length 12
  _sources?: Partial<Record<keyof PlantData, DataSource>>;
}
```

`createEmptyPlant()` initialises all arrays and defaults — always use it instead of constructing `PlantData` manually.
