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

export type ViewMode = 'grid' | 'list' | 'cards';
export type CardVariant = 'poly' | 'stripe' | 'baumscheibe';
export type ThemePref = 'auto' | 'light' | 'dark';

export interface AppSettings {
  sources: DataSource[];
  defaultView: ViewMode;
  defaultCardVariant: CardVariant;
}

const STORAGE_KEY = "guild-designer-settings";

const DEFAULT_PREFS: Omit<AppSettings, 'sources'> = {
  defaultView: 'grid',
  defaultCardVariant: 'poly',
};

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
      const saved = JSON.parse(raw) as Partial<AppSettings>;
      const sources = DEFAULT_SOURCES.map((def) => {
        const existing = saved.sources?.find((s) => s.id === def.id);
        return existing ? { ...def, enabled: existing.enabled, apiKey: existing.apiKey } : def;
      });
      return {
        sources,
        defaultView: saved.defaultView ?? DEFAULT_PREFS.defaultView,
        defaultCardVariant: saved.defaultCardVariant ?? DEFAULT_PREFS.defaultCardVariant,
      };
    }
  } catch {}
  return { sources: DEFAULT_SOURCES.map((s) => ({ ...s })), ...DEFAULT_PREFS };
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

// ── Theme: stored under a separate key so the pre-paint inline script in
// Layout.astro stays independent of the JSON-encoded settings blob.
// Values: 'light' | 'dark' | (absent = 'auto', follow OS).

export function getTheme(): ThemePref {
  try {
    const v = localStorage.getItem('theme');
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch { return 'auto'; }
}

export function setTheme(t: ThemePref): void {
  try {
    if (t === 'auto') localStorage.removeItem('theme');
    else localStorage.setItem('theme', t);
  } catch {}
}

export function applyTheme(t: ThemePref): void {
  const isDark = t === 'dark'
    || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

// ── Plausible Analytics opt-out: uses Plausible's official localStorage
// key so the script honors it automatically.

export function isPlausibleOptedOut(): boolean {
  try { return localStorage.getItem('plausible_ignore') === 'true'; } catch { return false; }
}

export function setPlausibleOptOut(v: boolean): void {
  try {
    if (v) localStorage.setItem('plausible_ignore', 'true');
    else localStorage.removeItem('plausible_ignore');
  } catch {}
}
