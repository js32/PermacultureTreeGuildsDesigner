export interface PlantData {
  id: string;
  latinName: string;
  commonName: string;
  // Dimensions
  heightM: number | null;
  widthM: number | null;
  // Scores (0-5)
  eatableScore: number;
  medsScore: number;
  materialScore: number;
  // Human usages (boolean)
  eatable: boolean;
  culinaric: boolean;
  meds: boolean;
  material: boolean;
  fodder: boolean;
  fuel: boolean;
  // Ecosystem functions
  nitrogenFix: boolean;
  mineralFix: boolean;
  groundCover: boolean;
  insects: boolean;
  pest: boolean;
  animalProtection: boolean;
  windBreaking: boolean;
  windBreakingOnSea: boolean;
  // Sun preference
  sunFull: boolean;
  sunMid: boolean;
  sunShadow: boolean;
  // Water preference
  waterDry: boolean;
  waterMid: boolean;
  waterWet: boolean;
  waterPlant: boolean;
  // Soil pH
  phVeryAcid: boolean;
  phAcid: boolean;
  phNeutral: boolean;
  phAlkaline: boolean;
  phVeryAlkaline: boolean;
  phSaline: boolean;
  // Growth speed
  growSpeedLow: boolean;
  growSpeedMid: boolean;
  growSpeedHigh: boolean;
  // Climate
  climateZone: string;
  // Phenology - months 0-11
  fruitMonths: boolean[];
  flowerMonths: boolean[];
  // Image
  imageUrl: string;
}

export function createEmptyPlant(): PlantData {
  return {
    id: crypto.randomUUID(),
    latinName: '',
    commonName: '',
    heightM: null,
    widthM: null,
    eatableScore: 0,
    medsScore: 0,
    materialScore: 0,
    eatable: false,
    culinaric: false,
    meds: false,
    material: false,
    fodder: false,
    fuel: false,
    nitrogenFix: false,
    mineralFix: false,
    groundCover: false,
    insects: false,
    pest: false,
    animalProtection: false,
    windBreaking: false,
    windBreakingOnSea: false,
    sunFull: false,
    sunMid: false,
    sunShadow: false,
    waterDry: false,
    waterMid: false,
    waterWet: false,
    waterPlant: false,
    phVeryAcid: false,
    phAcid: false,
    phNeutral: false,
    phAlkaline: false,
    phVeryAlkaline: false,
    phSaline: false,
    growSpeedLow: false,
    growSpeedMid: false,
    growSpeedHigh: false,
    climateZone: '',
    fruitMonths: Array(12).fill(false),
    flowerMonths: Array(12).fill(false),
    imageUrl: '',
  };
}
