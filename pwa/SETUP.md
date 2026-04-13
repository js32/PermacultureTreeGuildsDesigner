# PWA — Setup & Deployment

## Voraussetzungen

- **Node.js** >= 22 (empfohlen: aktuelle LTS)
- **npm** (kommt mit Node.js)

Node.js installieren (falls nicht vorhanden):

```bash
# Option A: nvm (empfohlen)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 24
nvm use 24

# Option B: direkt von https://nodejs.org
```

## Lokale Entwicklung

```bash
cd pwa
npm install        # Abhängigkeiten installieren (einmalig)
npm run dev        # Dev-Server starten → http://localhost:4321
```

Der Dev-Server aktualisiert automatisch bei Dateiänderungen (Hot Reload).

### Weitere Befehle

| Befehl              | Beschreibung                          |
|---------------------|---------------------------------------|
| `npm run build`     | Produktions-Build nach `dist/`        |
| `npm run preview`   | Build lokal testen (nach `build`)     |

## Deployment auf Netlify

### Ersteinrichtung

1. https://app.netlify.com → **Add new site** → **Import an existing project**
2. GitHub-Repo verbinden
3. Build-Einstellungen:
   - **Base directory:** `pwa`
   - **Build command:** `npm run build`
   - **Publish directory:** `pwa/dist`
4. **Deploy**

### Danach

Jeder Push auf `main` löst automatisch ein neues Deployment aus.

## Architektur

- **Astro** — Static Site Generator, erzeugt reines HTML/CSS/JS
- **Tailwind CSS** — Utility-first CSS Framework
- **IndexedDB** — Pflanzendaten lokal im Browser (kein Server nötig)
- **Wikidata API** — Pflanzensuche direkt vom Browser (kein Proxy)
- **jsPDF + svg2pdf.js** — PDF-Export im Browser
- **Service Worker** — Offline-Fähigkeit

Kein Backend, kein Proxy, kein Server. Alles läuft im Browser.
