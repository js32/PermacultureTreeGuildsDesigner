import { createEmptyPlant, type PlantData } from './types';
import { isSourceEnabled } from './settings';

export interface SearchResult {
  latinName: string;
  commonName: string;
  wikidataId?: string;
  description?: string;
}

/** Active request controller — cancelled when a newer search starts */
let activeController: AbortController | null = null;

/**
 * Search for plants. Strategy depends on enabled sources:
 * - Wikidata enabled: autocomplete search via MediaWiki CirrusSearch
 * - Only PFAF/NaturaDB: direct lookup by Latin name via proxy
 * - All enabled: Wikidata autocomplete + proxy enrichment on import
 */
export async function searchPlants(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  // Cancel any in-flight request
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const signal = activeController.signal;

  const wikidataEnabled = isSourceEnabled('wikidata');
  const proxyEnabled = isSourceEnabled('pfaf') || isSourceEnabled('naturadb');

  const results: SearchResult[] = [];

  // Wikidata autocomplete search
  if (wikidataEnabled) {
    try {
      const searchUrl = new URL('https://www.wikidata.org/w/api.php');
      searchUrl.searchParams.set('action', 'query');
      searchUrl.searchParams.set('list', 'search');
      searchUrl.searchParams.set('srsearch', `haswbstatement:P225 ${query}`);
      searchUrl.searchParams.set('srnamespace', '0');
      searchUrl.searchParams.set('srlimit', '15');
      searchUrl.searchParams.set('format', 'json');
      searchUrl.searchParams.set('origin', '*');

      const res = await fetch(searchUrl.toString(), { signal });
      if (res.ok) {
        const data = await res.json();
        const items = data.query?.search;
        if (items?.length) {
          const ids = items.map((s: any) => s.title).join('|');
          const detailUrl = new URL('https://www.wikidata.org/w/api.php');
          detailUrl.searchParams.set('action', 'wbgetentities');
          detailUrl.searchParams.set('ids', ids);
          detailUrl.searchParams.set('props', 'labels|descriptions|claims');
          detailUrl.searchParams.set('languages', 'de|en|la');
          detailUrl.searchParams.set('format', 'json');
          detailUrl.searchParams.set('origin', '*');

          const detailRes = await fetch(detailUrl.toString(), { signal });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            for (const item of items) {
              const entity = detailData.entities?.[item.title];
              if (!entity) continue;
              const taxonClaim = entity.claims?.P225?.[0]?.mainsnak?.datavalue?.value;
              const labelDe = entity.labels?.de?.value;
              const labelEn = entity.labels?.en?.value;
              const descDe = entity.descriptions?.de?.value;
              const descEn = entity.descriptions?.en?.value;
              results.push({
                latinName: taxonClaim || '',
                commonName: labelDe || labelEn || taxonClaim || '',
                wikidataId: item.title,
                description: descDe || descEn || '',
              });
            }
          }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') throw e;
      // Wikidata failed, continue with proxy if available
    }
  }

  // Direct proxy lookup if no Wikidata results or Wikidata disabled
  if (results.length === 0 && proxyEnabled && query.length >= 3) {
    try {
      const proxyUrl = `/api/plant-proxy?name=${encodeURIComponent(query)}`;
      const res = await fetch(proxyUrl, { signal });
      if (res.ok) {
        const data = await res.json();
        if (data.source && (data.commonName || data.latinName)) {
          results.push({
            latinName: data.latinName || query,
            commonName: data.commonName || '',
            description: `Quelle: ${data.source.toUpperCase()}`,
          });
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') throw e;
    }
  }

  return results;
}

/**
 * Fetch detailed plant data from Wikidata for a specific entity.
 */
export async function fetchPlantDetails(wikidataId: string): Promise<Partial<PlantData>> {
  const url = new URL('https://www.wikidata.org/w/api.php');
  url.searchParams.set('action', 'wbgetentities');
  url.searchParams.set('ids', wikidataId);
  url.searchParams.set('props', 'labels|claims');
  url.searchParams.set('languages', 'de|en|la');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const res = await fetch(url.toString());
  if (!res.ok) return {};

  const data = await res.json();
  const entity = data.entities?.[wikidataId];
  if (!entity) return {};

  const claim = (prop: string) => entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;

  const result: Partial<PlantData> = {};

  const taxon = claim('P225');
  if (taxon) result.latinName = taxon;

  const labelDe = entity.labels?.de?.value;
  const labelEn = entity.labels?.en?.value;
  if (labelDe) result.commonName = labelDe;
  else if (labelEn) result.commonName = labelEn;

  const imageName = claim('P18');
  if (imageName) {
    const encoded = encodeURIComponent(imageName.replace(/ /g, '_'));
    result.imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=400`;
  }

  const height = claim('P2048') || claim('P2044');
  if (height?.amount) result.heightM = parseFloat(height.amount);

  const width = claim('P2043');
  if (width?.amount) result.widthM = parseFloat(width.amount);

  const hardiness = claim('P1088');
  if (hardiness) result.climateZone = typeof hardiness === 'string' ? hardiness : String(hardiness);

  return result;
}

/**
 * Fetch enrichment data from PFAF + NaturaDB via the Netlify proxy function.
 * Returns partial PlantData with all the fields that the proxy could parse.
 */
export async function fetchProxyData(latinName: string): Promise<Partial<PlantData>> {
  const enabledPfaf = isSourceEnabled('pfaf');
  const enabledNatura = isSourceEnabled('naturadb');
  if (!enabledPfaf && !enabledNatura) return {};

  const proxyUrl = `/api/plant-proxy?name=${encodeURIComponent(latinName)}`;
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) return {};
    const data = await res.json();

    const result: Partial<PlantData> = {};
    // Map proxy response fields to PlantData
    const directFields = [
      'commonName', 'heightM', 'widthM', 'climateZone',
      'eatableScore', 'medsScore', 'materialScore',
      'eatable', 'culinaric', 'meds', 'material', 'fodder', 'fuel',
      'nitrogenFix', 'mineralFix', 'groundCover', 'insects', 'pest',
      'animalProtection', 'windBreaking', 'windBreakingOnSea',
      'sunFull', 'sunMid', 'sunShadow',
      'waterDry', 'waterMid', 'waterWet', 'waterPlant',
      'growSpeedLow', 'growSpeedMid', 'growSpeedHigh',
      'phVeryAcid', 'phAcid', 'phNeutral',
      'phAlkaline', 'phVeryAlkaline', 'phSaline',
    ] as const;

    for (const f of directFields) {
      if (data[f] !== null && data[f] !== undefined && data[f] !== '' && data[f] !== false) {
        (result as any)[f] = data[f];
      }
    }

    if (data.fruitMonths?.some((v: boolean) => v)) result.fruitMonths = data.fruitMonths;
    if (data.flowerMonths?.some((v: boolean) => v)) result.flowerMonths = data.flowerMonths;

    return result;
  } catch {
    return {};
  }
}

/**
 * Import a plant from search: Wikidata first, then enrich with PFAF/NaturaDB proxy.
 */
export async function importPlantFromSearch(result: SearchResult): Promise<PlantData> {
  const plant = createEmptyPlant();
  plant.latinName = result.latinName;
  plant.commonName = result.commonName;

  // Wikidata details (image, dimensions)
  if (result.wikidataId && isSourceEnabled('wikidata')) {
    const details = await fetchPlantDetails(result.wikidataId);
    Object.assign(plant, details);
  }

  // PFAF + NaturaDB enrichment via proxy
  if (plant.latinName && (isSourceEnabled('pfaf') || isSourceEnabled('naturadb'))) {
    const proxyData = await fetchProxyData(plant.latinName);
    // Only fill empty fields — don't overwrite Wikidata data
    for (const [key, value] of Object.entries(proxyData)) {
      const current = (plant as any)[key];
      const isEmpty = current === null || current === undefined || current === '' || current === false ||
        (Array.isArray(current) && current.every((v: boolean) => !v));
      if (isEmpty) {
        (plant as any)[key] = value;
      }
    }
  }

  plant.id = crypto.randomUUID();
  return plant;
}
