import type { Context } from "@netlify/functions";

const MONTH_NAMES_DE: Record<string, number> = {
  januar: 0, februar: 1, märz: 2, april: 3, mai: 4, juni: 5,
  juli: 6, august: 7, september: 8, oktober: 9, november: 10, dezember: 11,
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

interface PlantResult {
  latinName: string;
  commonName: string;
  heightM: number | null;
  widthM: number | null;
  climateZone: string;
  eatableScore: number | null;
  medsScore: number | null;
  materialScore: number | null;
  eatable: boolean;
  meds: boolean;
  material: boolean;
  culinaric: boolean;
  fodder: boolean;
  fuel: boolean;
  nitrogenFix: boolean;
  mineralFix: boolean;
  groundCover: boolean;
  insects: boolean;
  pest: boolean;
  animalProtection: boolean;
  windBreaking: boolean;
  windBreakingOnSea: boolean;
  sunFull: boolean;
  sunMid: boolean;
  sunShadow: boolean;
  waterDry: boolean;
  waterMid: boolean;
  waterWet: boolean;
  waterPlant: boolean;
  growSpeedLow: boolean;
  growSpeedMid: boolean;
  growSpeedHigh: boolean;
  phVeryAcid: boolean;
  phAcid: boolean;
  phNeutral: boolean;
  phAlkaline: boolean;
  phVeryAlkaline: boolean;
  phSaline: boolean;
  fruitMonths: boolean[];
  flowerMonths: boolean[];
  source: string;
}

function emptyResult(latinName: string): PlantResult {
  return {
    latinName,
    commonName: "",
    heightM: null, widthM: null,
    climateZone: "",
    eatableScore: null, medsScore: null, materialScore: null,
    eatable: false, meds: false, material: false, culinaric: false,
    fodder: false, fuel: false,
    nitrogenFix: false, mineralFix: false, groundCover: false,
    insects: false, pest: false, animalProtection: false,
    windBreaking: false, windBreakingOnSea: false,
    sunFull: false, sunMid: false, sunShadow: false,
    waterDry: false, waterMid: false, waterWet: false, waterPlant: false,
    growSpeedLow: false, growSpeedMid: false, growSpeedHigh: false,
    phVeryAcid: false, phAcid: false, phNeutral: false,
    phAlkaline: false, phVeryAlkaline: false, phSaline: false,
    fruitMonths: Array(12).fill(false),
    flowerMonths: Array(12).fill(false),
    source: "",
  };
}

// --- PFAF parsing ---

function parsePfafScore(text: string): number | null {
  const m = text.match(/\((\d) of \d\)/);
  return m ? parseInt(m[1]) : null;
}

function parsePfafDimension(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(m|cm)/);
  if (!m) return null;
  const val = parseFloat(m[1]);
  return m[2] === "cm" ? val / 100 : val;
}

async function fetchPfaf(name: string): Promise<Partial<PlantResult>> {
  const url = `https://pfaf.org/user/Plant.aspx?LatinName=${encodeURIComponent(name.replace(/ /g, "+"))}`;
  let html: string;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "PermacultureGuildDesigner/1.0" } });
    if (!res.ok) return {};
    html = await res.text();
  } catch { return {}; }

  const result: Partial<PlantResult> = { source: "pfaf" };

  // Common name
  const commonMatch = html.match(/Common Name[^<]*<\/td>\s*<td[^>]*>([^<]+)/i);
  if (commonMatch) result.commonName = commonMatch[1].split(",")[0].trim();

  // Scores
  const edibleMatch = html.match(/Edibility Rating[^<]*<\/td>\s*<td[^>]*>([^<]+)/i);
  if (edibleMatch) {
    result.eatableScore = parsePfafScore(edibleMatch[1]);
    result.eatable = (result.eatableScore || 0) > 2;
  }

  const medsMatch = html.match(/Medicinal Rating[^<]*<\/td>\s*<td[^>]*>([^<]+)/i);
  if (medsMatch) {
    result.medsScore = parsePfafScore(medsMatch[1]);
    result.meds = (result.medsScore || 0) > 2;
  }

  const otherMatch = html.match(/Other Uses[^<]*<\/td>\s*<td[^>]*>([^<]+)/i);
  if (otherMatch) {
    result.materialScore = parsePfafScore(otherMatch[1]);
    result.material = (result.materialScore || 0) > 2;
  }

  // USDA hardiness
  const zoneMatch = html.match(/USDA hardiness[^<]*<\/td>\s*<td[^>]*>([^<]+)/i);
  if (zoneMatch) result.climateZone = zoneMatch[1].trim();

  // Physical description block
  const physMatch = html.match(/lblPhystatment[^>]*>([^<]+(?:<[^>]+>[^<]*)*)/i);
  const phys = physMatch ? physMatch[1].replace(/<[^>]+>/g, "") : "";

  // Height & width from physical description
  const heightMatch = phys.match(/growing to (\d+(?:\.\d+)?)\s*(m|cm)/i);
  if (heightMatch) result.heightM = parsePfafDimension(heightMatch[0]);

  const widthMatch = phys.match(/by (\d+(?:\.\d+)?)\s*(m|cm)/i);
  if (widthMatch) result.widthM = parsePfafDimension(widthMatch[0]);

  // Growth speed
  result.growSpeedHigh = /at a fast rate/i.test(phys);
  result.growSpeedMid = /at a medium rate/i.test(phys);
  result.growSpeedLow = /at a slow rate/i.test(phys);

  // pH
  result.phVeryAcid = /pH:.*very acid.*soils\./i.test(phys);
  result.phAcid = /pH:.*mildly acid.*soils\./i.test(phys);
  result.phNeutral = /pH:.*neutral.*soils\./i.test(phys);
  result.phAlkaline = /pH:.*mildly alkaline.*soils\./i.test(phys);
  result.phVeryAlkaline = /pH:.*very alkaline.*soils\./i.test(phys);
  result.phSaline = /pH:.*saline.*soils\./i.test(phys);

  // Maritime wind
  result.windBreakingOnSea = /tolerate maritime exposure/i.test(phys);

  // Sun/Water/Soil icons
  result.sunFull = html.includes("sun.jpg");
  result.sunMid = html.includes("partsun.jpg");
  result.sunShadow = html.includes("fullsun.jpg");
  result.waterDry = html.includes("water1.jpg");
  result.waterMid = html.includes("water2.jpg");
  result.waterWet = html.includes("water3.jpg");
  result.waterPlant = html.includes("water4.jpg");

  // Field uses (from boots* links)
  const fieldSection = html.match(/boots[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)?.join(" ") || "";
  result.nitrogenFix = /Nitrogen Fixer/i.test(fieldSection);
  result.groundCover = /Ground Cover/i.test(fieldSection);
  result.insects = /Attracts Wildlife/i.test(fieldSection);
  result.windBreaking = /Windbreak/i.test(fieldSection);
  result.fuel = /\bFuel\b/i.test(fieldSection);
  result.fodder = /\bFodder\b/i.test(fieldSection);
  result.pest = /\bRepellent\b/i.test(fieldSection);
  result.animalProtection = /Living trellis/i.test(fieldSection);
  result.mineralFix = /Dynamic accumulator/i.test(fieldSection);
  result.culinaric = /\bCondiment\b/i.test(fieldSection);

  return result;
}

// --- NaturaDB parsing ---

async function fetchNaturaDb(name: string): Promise<Partial<PlantResult>> {
  const slug = name.toLowerCase().replace(/ /g, "-");
  const url = `https://www.naturadb.de/pflanzen/${slug}/`;
  let html: string;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "PermacultureGuildDesigner/1.0" } });
    if (!res.ok) return {};
    html = await res.text();
  } catch { return {}; }

  const result: Partial<PlantResult> = { source: "naturadb" };

  // Common name from <h1>
  const h1Match = html.match(/<h1[^>]*>([^<]+)/i);
  if (h1Match) result.commonName = h1Match[1].trim();

  // Parse table rows: key-value pairs in <tr><td>Key</td><td>Value</td></tr>
  function getTableValue(key: string): string {
    const re = new RegExp(`<td[^>]*>\\s*${key}:?\\s*</td>\\s*<td[^>]*>([\\s\\S]*?)</td>`, "i");
    const m = html.match(re);
    return m ? m[1] : "";
  }

  // Height
  const heightStr = getTableValue("Höhe");
  const hMatch = heightStr.match(/([\d,]+)\s*(?:-\s*([\d,]+))?\s*(m|cm)/);
  if (hMatch) {
    const val = parseFloat(hMatch[2] || hMatch[1]);
    result.heightM = hMatch[3] === "cm" ? val / 100 : val;
  }

  // Width
  const widthStr = getTableValue("Breite");
  const wMatch = widthStr.match(/([\d,]+)\s*(?:-\s*([\d,]+))?\s*(m|cm)/);
  if (wMatch) {
    const val = parseFloat(wMatch[2] || wMatch[1]);
    result.widthM = wMatch[3] === "cm" ? val / 100 : val;
  }

  // Sun
  const licht = getTableValue("Licht");
  result.sunFull = licht.includes("sun_0") || licht.includes("Sonne");
  result.sunMid = licht.includes("sun_1") || licht.includes("Halbschatten");
  result.sunShadow = licht.includes("sun_2") || licht.includes("Schatten");

  // Water
  const wasser = getTableValue("Wasser");
  result.waterDry = wasser.includes("water_0") || /trocken/i.test(wasser);
  result.waterMid = wasser.includes("water_1") || /frisch|feucht/i.test(wasser);
  result.waterWet = wasser.includes("water_2") || /nass/i.test(wasser);
  result.waterPlant = /wasserpflanze/i.test(wasser);

  // Fruit months — look for month-indicator elements with data-active
  const fruchtSection = getTableValue("Fruchtreife");
  result.fruitMonths = parseMonthIndicators(fruchtSection);

  // Flower months
  const blueteSection = getTableValue("Blühzeit");
  result.flowerMonths = parseMonthIndicators(blueteSection);

  return result;
}

function parseMonthIndicators(html: string): boolean[] {
  const months = Array(12).fill(false);
  // Pattern: month-indicator elements with data-active attribute
  const indicators = html.match(/month-indicator[^>]*>/gi) || [];
  indicators.forEach((indicator, i) => {
    if (i < 12) {
      months[i] = /data-active/i.test(indicator);
    }
  });
  return months;
}

// --- Main handler ---

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const name = url.searchParams.get("name");

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Missing ?name= parameter" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = emptyResult(name);

  // Fetch both sources in parallel
  const [pfaf, naturaDb] = await Promise.all([
    fetchPfaf(name),
    fetchNaturaDb(name),
  ]);

  // PFAF is primary (like the PowerShell script), NaturaDB fills gaps
  const sources: string[] = [];

  // Apply PFAF data first
  if (Object.keys(pfaf).length > 1) {
    sources.push("pfaf");
    for (const [key, value] of Object.entries(pfaf)) {
      if (key === "source") continue;
      if (value !== null && value !== undefined && value !== "" && value !== false) {
        (result as any)[key] = value;
      }
    }
  }

  // Fill empty fields from NaturaDB
  if (Object.keys(naturaDb).length > 1) {
    sources.push("naturadb");
    for (const [key, value] of Object.entries(naturaDb)) {
      if (key === "source") continue;
      const current = (result as any)[key];
      const isEmpty = current === null || current === undefined || current === "" || current === false ||
        (Array.isArray(current) && current.every((v: boolean) => !v));
      if (isEmpty && value !== null && value !== undefined && value !== "") {
        (result as any)[key] = value;
      }
    }
  }

  result.source = sources.join("+");

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: CORS_HEADERS,
  });
};

export const config = {
  path: ["/api/plant-proxy", "/.netlify/functions/plant-proxy"],
};
