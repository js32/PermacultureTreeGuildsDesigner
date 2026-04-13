import { createEmptyPlant, type PlantData } from './types';

export interface SearchResult {
  latinName: string;
  commonName: string;
  wikidataId?: string;
  description?: string;
}

/** Active request controller — cancelled when a newer search starts */
let activeController: AbortController | null = null;

/**
 * Search for plants via Wikidata MediaWiki API (CirrusSearch).
 * Uses haswbstatement:P225 to filter for taxa (items with a taxon name).
 * Much faster than SPARQL for live autocomplete.
 */
export async function searchPlants(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  // Cancel any in-flight request
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const signal = activeController.signal;

  // Step 1: Fast search via MediaWiki CirrusSearch, filtered to items with taxon name (P225)
  const searchUrl = new URL('https://www.wikidata.org/w/api.php');
  searchUrl.searchParams.set('action', 'query');
  searchUrl.searchParams.set('list', 'search');
  searchUrl.searchParams.set('srsearch', `haswbstatement:P225 ${query}`);
  searchUrl.searchParams.set('srnamespace', '0');
  searchUrl.searchParams.set('srlimit', '15');
  searchUrl.searchParams.set('format', 'json');
  searchUrl.searchParams.set('origin', '*');

  const res = await fetch(searchUrl.toString(), { signal });
  if (!res.ok) throw new Error(`Wikidata search failed: ${res.status}`);
  const data = await res.json();

  const items = data.query?.search;
  if (!items || items.length === 0) return [];

  // Step 2: Fetch labels + taxon names for the found items
  const ids = items.map((s: any) => s.title).join('|');
  const detailUrl = new URL('https://www.wikidata.org/w/api.php');
  detailUrl.searchParams.set('action', 'wbgetentities');
  detailUrl.searchParams.set('ids', ids);
  detailUrl.searchParams.set('props', 'labels|descriptions|claims');
  detailUrl.searchParams.set('languages', 'de|en|la');
  detailUrl.searchParams.set('format', 'json');
  detailUrl.searchParams.set('origin', '*');

  const detailRes = await fetch(detailUrl.toString(), { signal });
  if (!detailRes.ok) throw new Error(`Wikidata detail fetch failed: ${detailRes.status}`);
  const detailData = await detailRes.json();

  const results: SearchResult[] = [];
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

  return results;
}

/**
 * Fetch detailed plant data from Wikidata for a specific entity.
 * Uses the REST API (wbgetentities) instead of SPARQL for speed.
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

  // P18 = image (value is a filename on Wikimedia Commons)
  const imageName = claim('P18');
  if (imageName) {
    const encoded = encodeURIComponent(imageName.replace(/ /g, '_'));
    result.imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=400`;
  }

  // P2044 = elevation/height, P2048 = height (for organisms)
  const height = claim('P2048') || claim('P2044');
  if (height?.amount) result.heightM = parseFloat(height.amount);

  // P2043 = length/width
  const width = claim('P2043');
  if (width?.amount) result.widthM = parseFloat(width.amount);

  // P1088 = USDA hardiness zone
  const hardiness = claim('P1088');
  if (hardiness) result.climateZone = typeof hardiness === 'string' ? hardiness : String(hardiness);

  return result;
}

/**
 * Search + fetch: find a plant and create a pre-filled PlantData object.
 */
export async function importPlantFromSearch(result: SearchResult): Promise<PlantData> {
  const plant = createEmptyPlant();
  plant.latinName = result.latinName;
  plant.commonName = result.commonName;

  if (result.wikidataId) {
    const details = await fetchPlantDetails(result.wikidataId);
    Object.assign(plant, details);
    // Keep the generated ID
    plant.id = crypto.randomUUID();
  }

  return plant;
}

