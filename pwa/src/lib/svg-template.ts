import type { PlantData } from './types';

let polyCardTemplate: string | null = null;
let stripeTemplate: string | null = null;

/** Load and cache the SVG template */
async function loadTemplate(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}

/** Convert PlantData to the key-value map the SVG template expects */
function plantToTemplateData(plant: PlantData): Record<string, string | boolean> {
  return {
    // Text fields
    't_latin-name_text': plant.latinName,
    't_common-name_text': plant.commonName,
    't_height_text': plant.heightM != null ? `${plant.heightM}m` : '',
    't_width_text': plant.widthM != null ? `${plant.widthM}m` : '',
    't_climate-zone_text': plant.climateZone,
    't_eatable-score_text': String(plant.eatableScore || ''),
    't_meds-score_text': String(plant.medsScore || ''),
    't_material_score_text': String(plant.materialScore || ''),
    // Boolean fields
    'b_eatable_element': plant.eatable,
    'b_culinaric_element': plant.culinaric,
    'b_meds_element': plant.meds,
    'b_material_element': plant.material,
    'b_fodder_element': plant.fodder,
    'b_fuel_element': plant.fuel,
    'b_nitrogen-fix-element': plant.nitrogenFix,
    'b_mineral-fix-element': plant.mineralFix,
    'b_ground-cover_element': plant.groundCover,
    'b_insects_element': plant.insects,
    'b_pest_element': plant.pest,
    'b_animal-protection_element': plant.animalProtection,
    'b_wind-breaking_element': plant.windBreaking,
    'b_wind-breaking-on-sea_icon': plant.windBreakingOnSea,
    'b_sun-full_element': plant.sunFull,
    'b_sun_mid_element': plant.sunMid,
    'b_sun_shadow_element': plant.sunShadow,
    'b_water-dry_element': plant.waterDry,
    'b_water-mid_element': plant.waterMid,
    'b_water-wet_element': plant.waterWet,
    'b_water-plant_element': plant.waterPlant,
    'b_ph-very-acid_element': plant.phVeryAcid,
    'b_ph-acid_element': plant.phAcid,
    'b_ph-neutral_element': plant.phNeutral,
    'b_ph-alkaline_element': plant.phAlkaline,
    'b_ph-very-alkaline_element': plant.phVeryAlkaline,
    'b_ph-saline_element': plant.phSaline,
    'b_grow-speed-low_icon': plant.growSpeedLow,
    'b_grow-speed-mid_icon': plant.growSpeedMid,
    'b_grow-speed-high_icon': plant.growSpeedHigh,
    // Fruit months
    'b_fruit-0_element': plant.fruitMonths[0],
    'b_fruit-1_element': plant.fruitMonths[1],
    'b_fruit-2_element': plant.fruitMonths[2],
    'b_fruit-3_element': plant.fruitMonths[3],
    'b_fruit-4_element': plant.fruitMonths[4],
    'b_fruit-5_element': plant.fruitMonths[5],
    'b_fruit-6_element': plant.fruitMonths[6],
    'b_fruit-7_element': plant.fruitMonths[7],
    'b_fruit-8_element': plant.fruitMonths[8],
    'b_fruit-9_element': plant.fruitMonths[9],
    'b_fruit-10_element': plant.fruitMonths[10],
    'b_fruit-11_element': plant.fruitMonths[11],
    // Flower months
    'b_flower-0_element': plant.flowerMonths[0],
    'b_flower-1_element': plant.flowerMonths[1],
    'b_flower-2_element': plant.flowerMonths[2],
    'b_flower-3_element': plant.flowerMonths[3],
    'b_flower-4_element': plant.flowerMonths[4],
    'b_flower-5_element': plant.flowerMonths[5],
    'b_flower-6_element': plant.flowerMonths[6],
    'b_flower-7_element': plant.flowerMonths[7],
    'b_flower-8_element': plant.flowerMonths[8],
    'b_flower-9_element': plant.flowerMonths[9],
    'b_flower-10_element': plant.flowerMonths[10],
    'b_flower-11_element': plant.flowerMonths[11],
  };
}

// Growth speed icons that get removed (not just hidden) when inactive
const REMOVABLE_ICONS = [
  'b_grow-speed-high_icon',
  'b_grow-speed-low_icon',
  'b_grow-speed-mid_icon',
];

/**
 * Apply plant data to an SVG template DOM.
 * Mirrors the logic from ConvertTo-TreeCircle.ps1
 */
function applyDataToSvg(svgDoc: Document, data: Record<string, string | boolean>): void {
  // Find all elements with b_ or t_ id prefixes
  const allElements = svgDoc.querySelectorAll('[id]');

  allElements.forEach(element => {
    const id = element.getAttribute('id')!;

    // Boolean elements: toggle visibility
    if (id.startsWith('b_')) {
      const value = data[id];

      if (value === false || value === undefined) {
        if (id.endsWith('_icon') && REMOVABLE_ICONS.includes(id)) {
          // Remove invisible growth speed icons entirely
          element.parentNode?.removeChild(element);
        } else if (id.endsWith('_icon')) {
          // Visible icon but inactive: outline only
          element.setAttribute('style', 'stroke:#004754; stroke-width:0.01; fill:none;');
        } else {
          // Inactive element: make invisible (magenta outline = invisible in print)
          element.setAttribute('style', 'stroke:#FF00FF; stroke-width:0.01; fill:none;');
        }
      }
      // If true, keep the element as-is (the template already has the active styling)
    }

    // Text elements: replace content
    if (id.startsWith('t_')) {
      const value = data[id];
      if (value !== undefined && value !== '') {
        // Replace all tspan content or direct text
        const tspans = element.querySelectorAll('tspan');
        if (tspans.length > 0) {
          tspans.forEach(tspan => { tspan.textContent = String(value); });
        } else {
          element.textContent = String(value);
        }
      }
    }
  });

  // Set the plant image if available
  const imageEl = svgDoc.querySelector('#image1');
  if (imageEl) {
    const href = imageEl.getAttribute('xlink:href') || imageEl.getAttribute('href');
    // Keep original placeholder if no custom image
    // (the template already has a sample image URL)
  }
}

/**
 * Render a polyculture card using the original SVG template.
 * Returns an SVG string.
 */
export async function renderTemplatePolyCard(plant: PlantData): Promise<string> {
  if (!polyCardTemplate) {
    polyCardTemplate = await loadTemplate('/template-polycard.svg');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(polyCardTemplate, 'image/svg+xml');
  const data = plantToTemplateData(plant);
  applyDataToSvg(doc, data);

  // Update the image
  const imageEl = doc.querySelector('#image1');
  if (imageEl && plant.imageUrl) {
    imageEl.setAttribute('href', plant.imageUrl);
    imageEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', plant.imageUrl);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc.documentElement);
}

/**
 * Render a stripe card using the original SVG template.
 */
export async function renderTemplateStripeCard(plant: PlantData): Promise<string> {
  if (!stripeTemplate) {
    stripeTemplate = await loadTemplate('/template-stripe.svg');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(stripeTemplate, 'image/svg+xml');
  const data = plantToTemplateData(plant);
  applyDataToSvg(doc, data);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc.documentElement);
}
