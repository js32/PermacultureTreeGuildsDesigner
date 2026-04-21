import type { PlantData } from './types';

export interface ValidationResult {
  complete: boolean;
  missing: string[];
}

export function validatePlant(plant: PlantData): ValidationResult {
  const missing: string[] = [];

  if (!plant.latinName) missing.push('Lateinischer Name');
  if (!plant.commonName) missing.push('Deutscher Name');
  if (plant.heightM == null) missing.push('Höhe');
  if (plant.widthM == null) missing.push('Breite');
  if (!plant.climateZone) missing.push('Klimazone');

  // At least one sun preference
  if (!plant.sunFull && !plant.sunMid && !plant.sunShadow) missing.push('Sonne');

  // At least one water preference
  if (!plant.waterDry && !plant.waterMid && !plant.waterWet && !plant.waterPlant) missing.push('Wasser');

  // At least one pH
  if (!plant.phVeryAcid && !plant.phAcid && !plant.phNeutral &&
      !plant.phAlkaline && !plant.phVeryAlkaline && !plant.phSaline) missing.push('pH');

  // Growth speed
  if (!plant.growSpeedLow && !plant.growSpeedMid && !plant.growSpeedHigh) missing.push('Wachstum');

  return { complete: missing.length === 0, missing };
}
