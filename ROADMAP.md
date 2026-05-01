# Roadmap — Permaculture Tree Guilds Designer

## Aktueller Stand

Die PWA (`pwa/`) ist der aktive Entwicklungszweig und ersetzt die älteren PowerShell-Skripte. Sie läuft im Browser, speichert Daten lokal (IndexedDB) und kann ohne Installation offline genutzt werden.

### Implementiert

- **Pflanzenverwaltung** — Erstellen, Bearbeiten, Löschen von Pflanzen mit ~50 Attributen (Nutzung, Ökosystemfunktionen, Sonne/Wasser/pH, Wachstum, Blüte-/Fruchtmonate)
- **Pflanzendaten-Import** — Suche via lokale Golden-Master-DB (`plants-db.json`) + Wikidata-API (automatisch bei Import), Anreicherung via PFAF & NaturaDB (Netlify-Proxy)
- **CSV- & JSON-Import/Export** — inkl. CSV-Vorlagen-Download
- **Drei Ansichten** — Kachelansicht, Listenansicht (sortierbar), Kartenansicht; Toggle in der Toolbar
- **Drei Kartenvarianten** — Polykarte (70×120 mm), Streifenkarte (290×17 mm), **Baumscheibe** (SVG-Template mit Field-Mapped Overlays, A4 Hochformat)
- **Suchleiste** — prominent, mit Lupe-Icon, floating Dropdown, Multi-Add, Wikidata/PFAF/NaturaDB-Enrichment direkt beim Import
- **Kartenvorschau** — Live-Vorschau der Pflanzenkarten im Browser
- **PDF-Export** — Polykarten und Streifenkarten via pdf-lib (Auto-Download); Baumscheibe via pdf-lib (Chrome/Safari) bzw. nativem Druckdialog (Firefox); Bulk-PDF aus Selektion
- **Bulk-Operationen** — Auswählen, Löschen, Ergänzen, JSON/CSV/PDF-Export ausgewählter Pflanzen
- **Feldprovenenz** — `_sources` pro Datenpunkt; Quell-Badges im Edit-Dialog; Outline-Chips in Kacheln/Liste
- **Einstellungsseite** — fünf Sektionen:
  - Datenquellen aktivieren/deaktivieren
  - Standard-Ansicht (Kacheln/Liste/Karten) und -Kartenvariante (Poly/Stripe/Baumscheibe) beim App-Start
  - Theme: Auto / Hell / Dunkel
  - Privatsphäre: Plausible-Reichweitenmessung deaktivieren (lokal)
  - Daten: Pflanzenanzahl + Speicherverbrauch, JSON-Backup-Download, Golden Master neu laden, Danger-Zone „Alle Daten löschen"
- **Dark Mode** — Tailwind-v4 Class-Variant; Pre-Paint-Inline-Skript (kein Light-Flash); Header-Toggle + 3-Stufen-Setting (Auto folgt OS)
- **Reichweitenmessung** — Plausible Analytics, cookieless, EU-gehostet; In-App-Opt-out via `plausible_ignore`-Flag in den Settings
- **Rechtliches** — Datenschutz-Seite (lokal-first, externe Dienste, Plausible inkl. Opt-out-Anleitung), Impressum (Stub), Hilfe/Glossar, Footer-Links auf jeder Seite
- **PWA-Install-Prompts** — Android/Chrome: Banner via `beforeinstallprompt`; iOS Safari: Popup mit Add-to-Home-Screen-Anleitung; beide UA-/Standalone-erkannt und dismissable
- **UI-Redesign**:
  - Kachelansicht: Bildvorschau, farbiger Akzentstreifen nach Primärnutzung, Vollständigkeitsbalken
  - Listenansicht: Akzentpunkt, Nutzungsdots-Spalte, Vollständigkeitsbalken, sortierbar nach Vollständigkeit
  - Leerer Zustand: Fiddlehead-Illustration + CTA
  - Pflanzenzahl-Chip im Header
  - Visuelles Vokabular: ausgefüllte Badges = Verwendung, Outline-Chips = Datenquelle
- **PWA / Offline** — Service Worker, installierbar auf Desktop & Mobil

---

## Kurzfristig

### Launch-Blocker
- [ ] **Impressum füllen** — aktuell Stub; vor öffentlichem Launch nach §5 TMG ergänzen (Name, Anschrift, Kontakt)
- [ ] **Backup-Restore** — Settings → Daten: Backup-Download gibt's, Re-Import (JSON-Datei einlesen, alle Pflanzen + Settings wiederherstellen) fehlt — asymmetrisch
- [ ] **Plausible-Domain** — `data-domain` in `Layout.astro` zeigt auf die Netlify-Subdomain; bei Custom-Domain anpassen + im Plausible-Dashboard registrieren

### UI / UX
- [ ] **Lokaler Filter in der Pflanzenliste** — nach Nutzung, Sonne, Wasser, pH, Vollständigkeit; bei wachsender DB schnell unverzichtbar
- [ ] **Theme-Toggle 3-State** — Header-Toggle setzt aktuell hart hell/dunkel und überschreibt „Auto"; sauber wäre Auto → Hell → Dunkel im Toggle (oder Hinweis, dass Toggle „Auto" deaktiviert)
- [ ] **Tastatur-Shortcuts** — `/` Suche fokussieren, `Esc` Dialog schließen, `n` neue Pflanze, `g/l/c` View-Wechsel
- [ ] **Bulk-Selection: Shift-Klick Range** — aktuell nur Einzel-Checkbox; Range-Select wäre Standard
- [ ] **Empty-State auf `/cards`** — bei 0 Pflanzen ist „PDF exportieren" sinnlos; Hinweis + CTA wie auf Index
- [ ] **Konfigurierbare Farbthemen** — Farbenblindheits-Modus
- [ ] **Bild-Fallback** — Silhouette nach Pflanzentyp wenn kein Foto vorhanden

### Baumscheibe-Karte (Feinschliff)
- [ ] **Fehlende Felder in der SVG ergänzen** — `inkscape:label`-Overlays für `sunFull`/`sunMid`/`sunShadow`, `waterDry`/`waterMid`/`waterWet`, `phVeryAcid`/`phVeryAlkaline`/`phSaline`, `fruitMonths`/`flowerMonths`, `pioneer`, `layer` (Schicht); Renderer findet sie automatisch
- [ ] **Score-Sterne** — `eatableScore`/`medsScore`/`materialScore` als 5-Stern-Element in SVG anlegen (siehe `.ods`: "5 Sterne statt 4")
- [ ] **pH-Skala auf 5 Stufen** — Grafik anpassen (sauer / leicht sauer / neutral / leicht alkalisch / alkalisch)
- [ ] **SVG-Template optimieren** — derzeit 5 MB durch ~30 inline Base64-PNGs; via `svgo` oder externe Raster-Verlinkung verkleinern

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

Eine **Gilde** ist eine benannte Gruppe von Pflanzen rund um eine Ankerart
(typischerweise ein Obstbaum), die sich gegenseitig fördert: Stickstofffixierer
versorgen, Bodendecker halten Feuchtigkeit, Insektenpflanzen locken Bestäuber,
Schädlings­konfusoren stören Schadinsekten, Mineraliensammler holen Nährstoffe
aus der Tiefe.

**Phase 1 — MVP (mechanische Vorschläge aus eigenen Daten)**

- [ ] **Datenmodell** — neuer IndexedDB-Store `guilds`:
  ```ts
  interface Guild {
    id: string;
    name: string;
    description: string;
    anchorPlantId: string;       // Hauptbaum/-strauch aus eigenem Bestand
    members: GuildMember[];
    notes: string;
  }
  interface GuildMember {
    plantId: string;
    role: 'companion' | 'groundCover' | 'nFixer' | 'mineralFixer'
        | 'insectary' | 'pestConfuser' | 'fruitProducer' | 'other';
    notes: string;
  }
  ```
- [ ] **Seite `/gilden`** — Liste aller Gilden als Karten (Anker-Bild + Mitglieder-Chips
  + Vollständigkeits-Indikator: welche Rollen besetzt, welche fehlen).
- [ ] **Editor `/gilden/[id]`** — links die Gilde mit Rollen-Slots zum Befüllen,
  rechts ein „Vorschläge"-Panel das die eigenen Pflanzen filtert nach:
  - **Rolle füllt Lücke?** (z.B. Pflanze mit `nitrogenFix=true`, wenn N-Fixer-Slot leer ist)
  - **Sonne/Wasser/pH überlappen** mit Ankerart und bestehenden Mitgliedern (Schnittmenge ≠ ∅)
  - **Höhe passt ins Schichtmodell** (Anker oben, Begleiter darunter, Bodendecker unten)
  - **Klimazone** kompatibel
- [ ] **Bulk-Add aus Mehrfach­auswahl** — in der Pflanzenliste „Auswahl zur Gilde X hinzufügen"
- [ ] **PDF-Export einer Gilde** — Pflanzkarten der Mitglieder als Set, optional Übersichtsseite

**Phase 2 — Kuratiertes Companion-Wissen**

- [ ] **`companions.json` als Golden Master** — bekannt gute Kombinationen aus Standard­literatur
  (Jacke & Toensmeier "Edible Forest Gardens", Crawford "Creating a Forest Garden",
  Hemenway "Gaia's Garden"). Format z.B.:
  ```json
  { "anchor": "Malus domestica",
    "companions": [
      { "latin": "Symphytum officinale", "role": "mineralFixer", "evidence": "Crawford" },
      { "latin": "Allium schoenoprasum", "role": "pestConfuser", "evidence": "Hemenway" }
    ],
    "antagonists": ["Juglans regia"]
  }
  ```
- [ ] **Vorschläge erweitern** — neben den mechanischen Filtern Empfehlungen aus der
  Companion-Datenbank einblenden, mit Quelle als Beleg
- [ ] **Inkompatibilitäts-Warnung** — z.B. Walnuss-Allelopathie (Juglone hemmt viele Pflanzen)
- [ ] **Pflege-Workflow** für Companion-Daten — wie kommen neue Einträge rein? (PR-Prozess)

**Phase 3 — Visualisierung (verzahnt mit Visuelles Layout)**

- [ ] **Schicht-Diagramm pro Gilde** — Baumkrone → Strauch → Staude → Bodendecker → Wurzel,
  Mitglieder visuell auf ihrer Höhen­ebene
- [ ] **Kompatibilitäts-Matrix** als Heatmap zwischen allen Mitgliedern (Sonne/Wasser/pH/Allelopathie)

**Phase 4 — Strukturierte Suche via Wikidata-SPARQL (Experiment)**

- [ ] **SPARQL-Endpoint anbinden** — `https://query.wikidata.org/sparql` direkt aus dem Browser
  (CORS erlaubt). Beispiel-Query: alle Pflanzen mit Eigenschaft „Stickstoff-fixierend"
  (Wikidata-Property `P3094` oder über Infer-Path via Familie Fabaceae).
- [ ] **Property-Mapping** — welche Wikidata-Properties decken unsere Felder ab? (Höhe = `P2048`,
  Klimazone = ?, Ökosystem-Funktionen oft fehlend). Ein systematisches Mapping aufbauen, Lücken
  dokumentieren.
- [ ] **Filter-Builder im Vorschlags-Panel** — „finde Pflanze mit Sonne=voll, Wasser=trocken,
  Rolle=Bodendecker" → SPARQL generieren, Ergebnisse mit Bestand abgleichen, Importieren.
- **Risiko:** Wikidata-Coverage für ökologische Properties ist dünn; viele wichtige Eigenschaften
  (Allelopathie, Companion-Verträglichkeit) sind nicht modelliert. Nur sinnvoll als Ergänzung,
  nicht als Ersatz für die kuratierten `companions.json` aus Phase 2.

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
| Baumscheibe-PDF lahm + diagonal-streifig in Firefox/pdf.js | ✅ behoben — Firefox-Pfad nutzt nativen Druckdialog (vektoriell), Chrome/Safari weiter Canvas→JPEG→pdf-lib |
| Dark-Mode-Bulk-Substitution leakte `dark:`-Klassen aus Variant-Präfixen heraus und brach View-Toggle-Buttons via `classList.add` mit Space-Strings | ✅ behoben — Regex mit START-Lookbehind/END-Lookahead, JS-Array-Tokens manuell aufgesplittet |
| `svg-template.ts` und `card-svg.ts` — redundant neben Canvas-Renderer | ✅ gelöscht |
| Root-Verzeichnis enthält Build-Artefakte (`index.html`, `sw.js`, `manifest.json`) | ✅ bereinigt |
| PowerShell-Skripte als Legacy markieren, README aktualisieren | ✅ nach `legacy/` verschoben |
| `netlify.toml` in `pwa/` — Proxy-Functions nicht erreichbar | ✅ behoben — `netlify.toml` ins Repo-Root mit `base = "pwa"` |
| Branch `ui` noch nicht auf `main` gemergt | ✅ gemergt (commit 326accf) |
| Reset-Button auf Settings sinnlos | ✅ entfernt |
| Edit-Dialog im Dark Mode weiß | ✅ behoben — `bg-white dark:bg-stone-900` auf `<dialog>` + Inputs |
| Selektierte Listen-Zeilen ohne Dark-Variante | ✅ behoben — `bg-green-50 dark:bg-green-900/30` |
| Netlify-Proxy hat kein Rate-Limiting | offen |
| Netlify-Proxy manchmal nicht erreichbar (keine Suchergebnisse für PFAF/NaturaDB) | offen |
| Service Worker Cache-Version muss manuell erhöht werden | offen — Build-Hash automatisieren |
| Baumscheibe-SVG-Template ist 5 MB (inline Base64-PNGs) | offen — via `svgo` / externe Raster |
| Theme-Toggle im Header überschreibt „Auto" hart, ohne Hinweis | offen — siehe Kurzfristig „Theme-Toggle 3-State" |
