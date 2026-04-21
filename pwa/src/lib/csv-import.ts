import { createEmptyPlant, type PlantData } from './types';

/** Field mapping from PowerShell override.csv column names to PlantData properties */
const BOOL_MAP: Record<string, keyof PlantData> = {
  'b_eatable_element': 'eatable',
  'b_culinaric_element': 'culinaric',
  'b_meds_element': 'meds',
  'b_material_element': 'material',
  'b_fodder_element': 'fodder',
  'b_fuel_element': 'fuel',
  'b_nitrogen-fix-element': 'nitrogenFix',
  'b_mineral-fix-element': 'mineralFix',
  'b_ground-cover_element': 'groundCover',
  'b_insects_element': 'insects',
  'b_pest_element': 'pest',
  'b_animal-protection_element': 'animalProtection',
  'b_wind-breaking_element': 'windBreaking',
  'b_wind-breaking-on-sea_icon': 'windBreakingOnSea',
  'b_sun-full_element': 'sunFull',
  'b_sun_mid_element': 'sunMid',
  'b_sun_shadow_element': 'sunShadow',
  'b_water-dry_element': 'waterDry',
  'b_water-mid_element': 'waterMid',
  'b_water-wet_element': 'waterWet',
  'b_water-plant_element': 'waterPlant',
  'b_ph-very-acid_element': 'phVeryAcid',
  'b_ph-acid_element': 'phAcid',
  'b_ph-neutral_element': 'phNeutral',
  'b_ph-alkaline_element': 'phAlkaline',
  'b_ph-very-alkaline_element': 'phVeryAlkaline',
  'b_ph-saline_element': 'phSaline',
  'b_grow-speed-low_icon': 'growSpeedLow',
  'b_grow-speed-mid_icon': 'growSpeedMid',
  'b_grow-speed-high_icon': 'growSpeedHigh',
};

// Fruit/flower month mappings
for (let i = 0; i < 12; i++) {
  BOOL_MAP[`b_fruit-${i}_element`] = `fruitMonth_${i}` as any;
  BOOL_MAP[`b_flower-${i}_element`] = `flowerMonth_${i}` as any;
}

function parseBool(val: string): boolean {
  if (!val || val === '???' || val === '') return false;
  const lower = val.trim().toLowerCase();
  return lower === 'true' || lower === '1' || lower === 'visible' || lower === 'yes';
}

function parseCSV(text: string): Record<string, string>[] {
  // Handle both comma and semicolon delimiters (PowerShell's -UseCulture may use ;)
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = parseCSVLine(lines[0], delimiter);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function importFromCSV(text: string): PlantData[] {
  const rows = parseCSV(text);
  return rows.map(row => {
    const plant = createEmptyPlant();

    // Text fields
    if (row['t_latin-name_text']) plant.latinName = row['t_latin-name_text'];
    if (row['t_common-name_text']) plant.commonName = row['t_common-name_text'];
    if (row['t_climate-zone_text']) plant.climateZone = row['t_climate-zone_text'];

    // Height/Width — may be like "1-2m" or just a number
    if (row['t_height_text']) {
      const h = parseFloat(row['t_height_text'].replace(/[^\d.,\-]/g, '').replace(',', '.'));
      if (!isNaN(h)) plant.heightM = h;
    }
    if (row['t_width_text']) {
      const w = parseFloat(row['t_width_text'].replace(/[^\d.,\-]/g, '').replace(',', '.'));
      if (!isNaN(w)) plant.widthM = w;
    }

    // Scores
    if (row['t_eatable-score_text']) {
      const s = parseInt(row['t_eatable-score_text']);
      if (!isNaN(s)) plant.eatableScore = s;
    }
    if (row['t_meds-score_text']) {
      const s = parseInt(row['t_meds-score_text']);
      if (!isNaN(s)) plant.medsScore = s;
    }
    if (row['t_material_score_text']) {
      const s = parseInt(row['t_material_score_text']);
      if (!isNaN(s)) plant.materialScore = s;
    }

    // Boolean fields
    for (const [csvKey, plantKey] of Object.entries(BOOL_MAP)) {
      if (row[csvKey] !== undefined) {
        const val = parseBool(row[csvKey]);
        // Handle fruit/flower month booleans
        if (typeof plantKey === 'string' && plantKey.startsWith('fruitMonth_')) {
          const idx = parseInt(plantKey.split('_')[1]);
          plant.fruitMonths[idx] = val;
        } else if (typeof plantKey === 'string' && plantKey.startsWith('flowerMonth_')) {
          const idx = parseInt(plantKey.split('_')[1]);
          plant.flowerMonths[idx] = val;
        } else {
          (plant as any)[plantKey] = val;
        }
      }
    }

    return plant;
  });
}
