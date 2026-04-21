# Roadmap — Permaculture Tree Guilds Designer

## Aktueller Stand

Die PWA (`pwa/`) ist der aktive Entwicklungszweig und ersetzt die älteren PowerShell-Skripte. Sie läuft im Browser, speichert Daten lokal (IndexedDB) und kann ohne Installation offline genutzt werden.

### Implementiert

- **Pflanzenverwaltung** — Erstellen, Bearbeiten, Löschen von Pflanzen mit ~50 Attributen (Nutzung, Ökosystemfunktionen, Sonne/Wasser/pH, Wachstum, Blüte-/Fruchtmonate)
- **Pflanzendaten-Import** — Suche via lokale Golden-Master-DB (`plants-db.json`) + Wikidata-API (automatisch bei Import), Anreicherung via PFAF & NaturaDB (Netlify-Proxy)
- **CSV- & JSON-Import/Export** — inkl. CSV-Vorlagen-Download
- **Drei Ansichten** — Kachelansicht, Listenansicht (sortierbar), Kartenansicht (Poly- & Streifenkarten); Toggle in der Toolbar
- **Suchleiste** — prominent, mit Lupe-Icon, floating Dropdown, Multi-Add, Wikidata/PFAF/NaturaDB-Enrichment direkt beim Import
- **Kartenvorschau** — Live-Vorschau der Pflanzenkarten im Browser
- **PDF-Export** — Polykarten (70×120 mm) und Streifenkarten (290×17 mm) via pdf-lib; Bulk-PDF aus Selektion
- **Bulk-Operationen** — Auswählen, Löschen, Ergänzen, JSON/CSV/PDF-Export ausgewählter Pflanzen
- **Feldprovenenz** — `_sources` pro Datenpunkt; Quell-Badges im Edit-Dialog; Outline-Chips in Kacheln/Liste
- **Einstellungsseite** — Datenquellen aktivieren/deaktivieren
- **UI-Redesign** (Branch `ui`, noch nicht auf `main` gemergt):
  - Kachelansicht: Bildvorschau, farbiger Akzentstreifen nach Primärnutzung, Vollständigkeitsbalken
  - Listenansicht: Akzentpunkt, Nutzungsdots-Spalte, Vollständigkeitsbalken, sortierbar nach Vollständigkeit
  - Leerer Zustand: Fiddlehead-Illustration + CTA
  - Pflanzenzahl-Chip im Header
  - Visuelles Vokabular: ausgefüllte Badges = Verwendung, Outline-Chips = Datenquelle
- **PWA / Offline** — Service Worker, installierbar auf Desktop & Mobil

---

## Kurzfristig

### UI / UX
- [ ] **Branch `ui` → `main` mergen** — nach finalem Review
- [ ] **Dark Mode** — Farbsystem ist bereits strukturiert (warm=Nutzung, cool=Ökosystem); dunkle Variante ergänzen
- [ ] **Konfigurierbare Farbthemen** — Farbenblindheits-Modus
- [ ] **Bild-Fallback** — Silhouette nach Pflanzentyp wenn kein Foto vorhanden

### PDF-Rendering
- [ ] Qualitäts-Check: Karten in mehreren Viewern testen (Chrome, Firefox, Evince, Okular)
- [ ] Druckränder und Schnittmarken als Option

### Feldprovenenz (Feinschliff)
- [ ] **Kartenvorschau & PDF** — kompakte Quell-Darstellung auf der gedruckten Karte (z.B. farbiger Punkt-Cluster in der Infozeile)

### QR-Code
- [ ] QR-Code pro Karte (Link zur Wikidata-Seite oder eigener Pflanzendatensatz)

### Daten
- [ ] **Pflanzenbild-Upload** — Bild lokal speichern (Base64 in IndexedDB oder File in OPFS), nicht nur externe URL
- [ ] **Bild-Bearbeitung im Edit-Dialog** — Vorschau des aktuellen Bilds, ersetzen/löschen
- [ ] Fehlende Felder: Boden-Typ, Ausbreitungsart (Samen/Ableger/Wurzel), Wurzeltiefe
- [ ] Validierung verbessern: Warnungen bei unvollständigen Datensätzen

### Vordefinierte Pflanzendatenbank (Golden Master, Feinschliff)
- [ ] **Nutzerseitig editierbar** — Änderungen an Golden-Master-Pflanzen landen in IndexedDB (Override-Schicht), Original bleibt unverändert
- [ ] **Pflege-Workflow** — Wie kommen neue kuratierte Pflanzen in die DB? (PR-Prozess definieren)

---

## Mittelfristig

### Gilden-Komposition
- [ ] Gilde-Objekt: benannte Gruppe von Pflanzen mit Rolle (Ankerart, Begleiter, Bodendecker …)
- [ ] Gilden-Übersicht: Welche Pflanzen funktionieren zusammen?
- [ ] Einfache Kompatibilitätsmatrix (Sonne/Wasser/pH-Abgleich)

### Visuelles Layout
- [ ] Pflanzplan-Ansicht: Bäume/Sträucher als Kreise auf einem 2D-Raster platzieren
- [ ] Maßstabstreue Darstellung (z.B. 1 m = 10 px), Export als SVG/PNG
- [ ] Schichtmodell-Visualisierung (Baumkrone → Strauch → Staude → Bodendecker → Wurzel)

### Datenquellen
- [ ] Offline-Datenbank einbinden (z.B. Open Food Facts Pflanzen, GBIF-Subset)
- [ ] Eigene Proxy-Erweiterungen: weitere Quellen (Pflanzkollektiv, OpenEcoSystems)
- [ ] Wikidata-Properties erweitern (Bestäuber, Schädlingsabwehr)

---

## Langfristig

### PocketBase als Server-Backend (Option)

Aktuell speichert die App alle Daten lokal im Browser (IndexedDB). PFAF/NaturaDB-Abfragen laufen über eine Netlify Serverless Function als CORS-Proxy.

Ein Wechsel zu **PocketBase** (selbst-gehostetes Open-Source-Backend, SQLite + REST + Realtime) würde folgende Use Cases ermöglichen:

| Use Case | Jetzt (PWA + Netlify) | Mit PocketBase |
|---|---|---|
| Datenspeicher | IndexedDB, pro Browser | SQLite auf eigenem Server |
| Multi-Gerät-Sync | ✗ | ✓ automatisch |
| Gemeinsame Pflanzenbibliothek | ✗ | ✓ (geteilte DB) |
| Offline-Nutzung | ✓ vollständig | möglich, aber Sync-Logik nötig |
| PFAF/NaturaDB-Proxy | Netlify Function | PocketBase Hook oder eigene Route |
| Auth / Benutzerkonten | — | eingebaut (OAuth2, E-Mail) |
| Deployment | Netlify (kostenlos) | VPS / Fly.io / Railway (ab ~5 €/Mo.) |
| Datenverlust bei Browser-Löschung | ✓ Risiko | ✗ kein Risiko |
| Komplexität | gering | mittel |

**Wann sinnvoll:** mehrere Geräte, mehrere Nutzer, geteilte Pflanzenbibliothek, kein Datenverlustrisiko.  
**Wann nicht:** rein persönliches Einzelgerät-Tool, vollständige Offline-Nutzung ohne Sync-Aufwand.

Mögliche Migrationsstrategie: PocketBase als optionaler Sync-Layer, IndexedDB bleibt primärer Cache — ähnlich wie Google Docs offline-first mit Cloud-Sync.

### Mehrsprachigkeit
- [ ] UI auf Englisch lokalisieren (i18n-Infrastruktur aufsetzen)
- [ ] Pflanzennamen mehrsprachig speichern (de/en/la)

### Zusammenarbeit
- [ ] Export-Format für den Austausch mit anderen Nutzern (standardisiertes JSON-Schema)
- [ ] Optionaler Cloud-Sync (z.B. via eigenen Server oder CRDTs für Peer-to-Peer)

### Migration PowerShell → PWA
- [ ] PowerShell-Skripte als Legacy markieren, README aktualisieren (PWA als primären Einstieg dokumentieren)
- [ ] Migrationshilfe: Import bestehender `.psd1`-Datensätze in die PWA

---

## Bekannte Probleme / Tech Debt

| Problem | Status |
|---|---|
| PDF-Streifen in LibreWolf (SMask/pdf.js) | ✅ behoben — raw RGB via `flateStream`, kein SMask |
| `svg-template.ts` und `card-svg.ts` — redundant neben Canvas-Renderer | ✅ gelöscht |
| Root-Verzeichnis enthält Build-Artefakte (`index.html`, `sw.js`, `manifest.json`) | ✅ bereinigt |
| PowerShell-Skripte als Legacy markieren, README aktualisieren | ✅ nach `legacy/` verschoben |
| `netlify.toml` in `pwa/` — Proxy-Functions nicht erreichbar | ✅ behoben — `netlify.toml` ins Repo-Root mit `base = "pwa"` |
| Netlify-Proxy hat kein Rate-Limiting | offen |
| Netlify-Proxy manchmal nicht erreichbar (keine Suchergebnisse für PFAF/NaturaDB) | offen |
| Service Worker Cache-Version muss manuell erhöht werden | offen — Build-Hash automatisieren |
| Branch `ui` noch nicht auf `main` gemergt | offen |
