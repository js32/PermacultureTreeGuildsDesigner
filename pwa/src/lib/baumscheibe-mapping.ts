import type { PlantData } from './types';

// Maps PlantData fields to inkscape:label values inside baumscheibe-template.svg.
// Multiple labels per field cover both the original code names ("eatable", "phAcid")
// and the renamed Data-field_new variant from baumscheibe3-data-fields.ods
// ("Edible", "PH-acid"). Renderer matches any label in the array.

export const TEXT_FIELDS: Partial<Record<keyof PlantData, string[]>> = {
  latinName:   ['latinName',   'Name-bot'],
  commonName:  ['commonName',  'Name-cmn'],
  heightM:     ['heightM',     'Dim-height'],
  widthM:      ['widthM',      'Dim-diameter'],
  climateZone: ['climateZone'],
};

export const BOOL_FIELDS: Partial<Record<keyof PlantData, string[]>> = {
  // Wachstum
  growSpeedLow:  ['Growth-slow', 'growSpeedLow'],
  growSpeedMid:  ['Growth-mod',  'growSpeedMid'],
  growSpeedHigh: ['Growth-fast', 'growSpeedHigh'],
  // Sonne
  sunFull:       ['Sun-fullsun',   'sunFull'],
  sunMid:        ['Sun-semishade', 'sunMid'],
  sunShadow:     ['Sun-fullshade', 'sunShadow'],
  // Wasser
  waterDry:      ['Water-dry', 'waterDry'],
  waterMid:      ['Water-Mid', 'waterMid'],
  waterWet:      ['Water-Wet', 'waterWet'],
  // pH
  phVeryAcid:     ['PH-Veryacid',    'phVeryAcid'],
  phAcid:         ['phAcid',         'PH-acid'],
  phNeutral:      ['phNeutral',      'PH-neutral'],
  phAlkaline:     ['phAlkaline',     'PH-alkaline'],
  phVeryAlkaline: ['PH-veralkaline', 'phVeryAlkaline'],
  // Nutzung
  eatable:    ['eatable',   'Edible'],
  culinaric:  ['culinaric', 'Culinary'],
  meds:       ['meds',      'Mecidinal'],
  material:   ['material',  'Material'],
  fodder:     ['fodder',    'Fodder'],
  fuel:       ['fuel',      'Fuel'],
  // Funktionen
  nitrogenFix:      ['nitrogenFix',      'NitrogenFix'],
  mineralFix:       ['mineralFix',       'MineralFix'],
  groundCover:      ['groundCover',      'GroundCover'],
  insects:          ['insects',          'Insects'],
  animalProtection: ['animalProtection', 'Animalshelter'],
  windBreaking:     ['windBreaking',     'Windbreak'],
};
