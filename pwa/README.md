# Permaculture Guild Designer — PWA

Browser-basierte PWA zur Gestaltung und Verwaltung von Permakultur-Pflanzengilden. Ersetzt das PowerShell-Modul durch eine offline-faehige Web-App.

## Features

- Pflanzendaten verwalten (CRUD) mit lokaler IndexedDB-Speicherung
- SVG-Pflanzenkarten (Polyculture Card 70x120mm, Stripe Card 290x16mm)
- PDF-Export (Einzelkarten oder alle auf A4)
- CSV-Import (kompatibel mit dem bestehenden override.csv-Format)
- JSON Import/Export
- Offline-faehig (Service Worker + IndexedDB)
- Installierbar als PWA

## Entwicklung

```sh
nvm use           # Node 24
npm install
npm run dev       # Dev-Server auf localhost:4321
```

## Build

```sh
npm run build     # Static Build nach ./dist/
npm run preview   # Lokale Vorschau des Builds
```

## Deployment (Netlify)

- Build Command: `npm run build`
- Publish Directory: `dist`
- Netlify-Config liegt in `netlify.toml`

## Projektstruktur

```
pwa/
  src/
    layouts/Layout.astro    # Haupt-Layout mit Navigation
    pages/
      index.astro           # Pflanzenliste + Bearbeitungsdialog
      cards.astro           # Kartenansicht + PDF-Export
    lib/
      types.ts              # PlantData Interface
      db.ts                 # IndexedDB Store
      card-svg.ts           # SVG-Rendering (Poly + Stripe)
      pdf-export.ts         # PDF-Generierung (jsPDF + svg2pdf.js)
      csv-import.ts         # CSV-Import (PowerShell-Format)
      sample-data.ts        # Beispielpflanzen
  public/
    manifest.json           # PWA-Manifest
    sw.js                   # Service Worker
    favicon.svg
  netlify.toml
```
