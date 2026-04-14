/** Data source configuration — persisted in localStorage */

export interface DataSource {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  needsApiKey: boolean;
  apiKey: string;
  url: string;
}

export interface AppSettings {
  sources: DataSource[];
}

const STORAGE_KEY = "guild-designer-settings";

export const DEFAULT_SOURCES: DataSource[] = [
  {
    id: "wikidata",
    name: "Wikidata",
    description: "Freie Wissensdatenbank — Taxon-Namen, Bilder, Grunddaten. CORS-frei, kein Proxy nötig.",
    enabled: true,
    needsApiKey: false,
    apiKey: "",
    url: "https://www.wikidata.org/w/api.php",
  },
  {
    id: "pfaf",
    name: "PFAF (Plants For A Future)",
    description: "Essbarkeit, Medizin, Material-Scores, pH, Sonne, Wasser, Wachstum. Läuft über Proxy.",
    enabled: true,
    needsApiKey: false,
    apiKey: "",
    url: "https://pfaf.org",
  },
  {
    id: "naturadb",
    name: "NaturaDB",
    description: "Deutsche Namen, Höhe/Breite, Frucht-/Blütemonate, Licht, Wasser. Läuft über Proxy.",
    enabled: true,
    needsApiKey: false,
    apiKey: "",
    url: "https://www.naturadb.de",
  },
];

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as AppSettings;
      // Merge with defaults to pick up new sources
      const merged = DEFAULT_SOURCES.map((def) => {
        const existing = saved.sources.find((s) => s.id === def.id);
        return existing ? { ...def, enabled: existing.enabled, apiKey: existing.apiKey } : def;
      });
      return { sources: merged };
    }
  } catch {}
  return { sources: DEFAULT_SOURCES.map((s) => ({ ...s })) };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function isSourceEnabled(id: string): boolean {
  return loadSettings().sources.find((s) => s.id === id)?.enabled ?? false;
}

export function getApiKey(id: string): string {
  return loadSettings().sources.find((s) => s.id === id)?.apiKey ?? "";
}
