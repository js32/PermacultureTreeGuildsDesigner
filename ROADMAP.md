# Roadmap — Permaculture Tree Guilds Designer

## Aktueller Stand

Die PWA (`pwa/`) ist der aktive Entwicklungszweig und ersetzt die älteren PowerShell-Skripte. Sie läuft im Browser, speichert Daten lokal (IndexedDB) und kann ohne Installation offline genutzt werden.

### Implementiert

- **Pflanzenverwaltung** — Erstellen, Bearbeiten, Löschen von Pflanzen mit ~50 Attributen (Nutzung, Ökosystemfunktionen, Sonne/Wasser/pH, Wachstum, Blüte-/Fruchtmonate)
- **Pflanzendaten-Import** — Suche via Wikidata-API, Anreicherung via PFAF & NaturaDB (Netlify-Proxy)
- **CSV- & JSON-Import/Export**
- **Kartenvorschau** — Live-Vorschau der Pflanzenkarten im Browser (Canvas-Renderer)
- **PDF-Export** — Polykarten (70×120 mm) und Streifenkarten (290×17 mm) via pdf-lib
- **Einstellungsseite** — Datenquellen aktivieren/deaktivieren
- **PWA / Offline** — Service Worker, installierbar auf Desktop & Mobil

---

## Kurzfristig

### PDF-Rendering (in Arbeit)
- [ ] LibreWolf-Kompatibilität sicherstellen (SMask-Problem mit pdf.js)
- [ ] Qualitäts-Check: Karten in mehreren Viewern testen (Chrome, Firefox, Evince, Okular)
- [ ] Druckränder und Schnittmarken als Option

### Feldprovenenz (Datenquellen pro Datenpunkt)

Da Pflanzendaten aus mehreren Quellen aggregiert werden (Wikidata → PFAF → NaturaDB → manuell), muss die Herkunft **pro Feld** gespeichert und angezeigt werden — nicht nur pro Pflanze.

- [ ] **Datenmodell erweitern** — `PlantData` bekommt ein optionales `_sources: Partial<Record<keyof PlantData, 'wikidata' | 'pfaf' | 'naturadb' | 'manual' | 'csv'>>` Feld; wird beim Import befüllt, bei manueller Bearbeitung auf `'manual'` gesetzt
- [ ] **Import-Pipeline anpassen** — `importPlantFromSearch()` und `fetchProxyData()` protokollieren, welches Feld aus welcher Quelle stammt
- [ ] **Edit-Dialog** — Jedes Eingabefeld zeigt ein kleines farbiges Quell-Badge (W / P / N / M); Tooltip mit vollem Quellnamen; bei manueller Änderung wechselt Badge zu „M"
- [ ] **Kartenvorschau & PDF** — Kompakte Darstellung: z.B. farbige Unterstreichung oder Punkt-Cluster in der Infozeile der Karte, die zeigen, welche Quellen beteiligt sind (nicht jedes Feld einzeln — zu kleinteilig für 70×120 mm)
- [ ] **Listenansicht** — Spalte oder Tooltip zeigt Quellen-Mix der Pflanze (z.B. „W + P")

### Karten-Design
- [ ] QR-Code pro Karte (Link zur Wikidata-Seite oder eigener Pflanzendatensatz)
- [ ] Konfigurierbare Farbthemen (Hell/Dunkel, Farbenblindheits-Modus)
- [ ] Bild-Fallback wenn kein Foto verfügbar (z.B. Silhouette nach Pflanzentyp)

### Pflanzenliste & Bulk-Operationen
- [ ] **Listenansicht-Toggle** — Button in der Pflanzen-Übersicht zum Umschalten zwischen Kachel- und Tabellenansicht
- [ ] **Bulk-Selektion** — Checkboxen in der Listenansicht, „Alle auswählen"-Button
- [ ] **Bulk-Aktionen** — Ausgewählte Pflanzen zusammen löschen, exportieren (JSON/CSV) oder direkt als PDF drucken
- [ ] **Spalten-Sortierung** in der Tabellenansicht (Name, Höhe, Nutzung …)

### Vordefinierte Pflanzendatenbank (Golden Master)
- [ ] **Eingebettete JSON-Datenbank** — `pwa/public/plants-db.json` mit kuratierten Stammdaten; wird bei der Suche priorisiert vor Live-API-Abfragen
- [ ] **Suchlogik anpassen** — lokale DB zuerst durchsuchen, dann Wikidata/Proxy als Fallback
- [ ] **Nutzerseitig editierbar** — Änderungen an Golden-Master-Pflanzen landen in der IndexedDB (Override-Schicht), Original bleibt unverändert
- [ ] **Pflege-Workflow** — Wie kommen neue kuratierte Pflanzen in die DB? (Pull-Request-Prozess definieren)

### Daten
- [ ] **Import-Template zum Download** — `pflanzendaten-vorlage.csv` (und `.json`) mit allen Feldern, Spalten-Beschriftung auf Deutsch, Beispielzeile; direkt aus der App herunterladen
- [ ] **Pflanzenbild-Upload** — Bild lokal speichern (als Base64 in IndexedDB oder als File in OPFS), nicht nur externe URL
- [ ] **Bild-Bearbeitung im Edit-Dialog** — Vorschau des aktuellen Bilds, Möglichkeit es zu ersetzen oder zu löschen
- [ ] Fehlende Felder ergänzen: Boden-Typ, Ausbreitungsart (Samen/Ableger/Wurzel), Wurzeltiefe
- [ ] Validierung verbessern: Warnungen bei unvollständigen Datensätzen

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

### Mehrsprachigkeit
- [ ] UI auf Englisch lokalisieren (i18n-Infrastruktur aufsetzen)
- [ ] Pflanzennamen mehrsprachig speichern (de/en/la)

### Zusammenarbeit
- [ ] Export-Format für den Austausch mit anderen Nutzern (standardisiertes JSON-Schema)
- [ ] Optionaler Cloud-Sync (z.B. via eigenen Server oder CRDTs für Peer-to-Peer)

### Migration PowerShell → PWA
- [ ] PowerShell-Skripte (`ConvertFrom-PlantList.ps1` etc.) als Legacy markieren
- [ ] Migrationshilfe: Import bestehender `.psd1`-Datensätze in die PWA
- [ ] README aktualisieren (PWA als primären Einstieg dokumentieren)

---

## Bekannte Probleme / Tech Debt

| Problem | Status |
|---|---|
| PDF-Streifen in LibreWolf (SMask/pdf.js) | in Arbeit |
| `svg-template.ts` und `card-svg.ts` — redundant neben Canvas-Renderer | aufräumen |
| Root-Verzeichnis enthält Build-Artefakte (`index.html`, `sw.js`, `manifest.json`) | bereinigen |
| Netlify-Proxy hat kein Rate-Limiting | sichern |
| Netlify-Proxy manchmal deployed nicht erreichbar (keine Suchergebnisse für PFAF/NaturaDB) | diagnostizieren |
| Service Worker Cache-Version muss manuell erhöht werden | automatisieren (Build-Hash) |
