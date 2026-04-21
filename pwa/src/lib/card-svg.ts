import type { PlantData } from './types';

const MONTH_LABELS = ['J','F','M','A','M','J','J','A','S','O','N','D'];

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// --- Original color palette from the SVG templates ---
const COLORS = {
  fruit: '#ff0000',
  flower: '#ff00cc',
  eatable: '#8bc34a',
  culinaric: '#e1b2d3',
  meds: '#f44336',
  material: '#7b6a58',
  fodder: '#79c197',
  fuel: '#fbec53',
  nitrogenFix: '#95c11f',
  mineralFix: '#1d71b8',
  groundCover: '#f39200',
  insects: '#dedc00',
  pest: '#c8db85',
  animalProtection: '#b17f4a',
  windBreaking: '#de87cd',
  sunFull: '#ffdd00',
  sunMid: '#ffee66',
  sunShadow: '#b0bec5',
  waterDry: '#e8d5b7',
  waterMid: '#81d4fa',
  waterWet: '#1565c0',
  waterPlant: '#006064',
  phVeryAcid: '#ff5555',
  phAcid: '#ffd42a',
  phNeutral: '#00d400',
  phAlkaline: '#2ca089',
  phVeryAlkaline: '#0066ff',
  phSaline: '#7f2aff',
  growLow: '#a5d6a7',
  growMid: '#66bb6a',
  growHigh: '#2e7d32',
  inactive: '#e8e8e8',
  border: '#1a1a1a',
};

/** Large square badge matching the original card style */
function iconBadge(x: number, y: number, size: number, active: boolean, color: string, label: string, score?: number): string {
  const fill = active ? color : COLORS.inactive;
  const textColor = active ? '#000' : '#aaa';
  let svg = `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" stroke="${COLORS.border}" stroke-width="0.15"/>`;
  svg += `<text x="${x + size / 2}" y="${y + size * 0.65}" font-size="${size * 0.4}" font-family="Arial" text-anchor="middle" fill="${textColor}" font-weight="bold">${esc(label)}</text>`;
  if (score !== undefined && active && score > 0) {
    svg += `<text x="${x + size / 2}" y="${y + size * 0.92}" font-size="${size * 0.28}" font-family="Arial" text-anchor="middle" fill="${textColor}">${score}</text>`;
  }
  return svg;
}

/** Month calendar row — 12 small colored boxes */
function monthRow(x: number, y: number, months: boolean[], color: string, boxW: number, boxH: number): string {
  let svg = '';
  const gap = 0.15;
  for (let i = 0; i < 12; i++) {
    const fill = months[i] ? color : COLORS.inactive;
    svg += `<rect x="${x + i * (boxW + gap)}" y="${y}" width="${boxW}" height="${boxH}" fill="${fill}" stroke="${COLORS.border}" stroke-width="0.08"/>`;
  }
  return svg;
}

/** Month labels */
function monthLabels(x: number, y: number, boxW: number): string {
  let svg = '';
  const gap = 0.15;
  for (let i = 0; i < 12; i++) {
    svg += `<text x="${x + i * (boxW + gap) + boxW / 2}" y="${y}" font-size="1.6" font-family="Arial" text-anchor="middle" fill="#666">${MONTH_LABELS[i]}</text>`;
  }
  return svg;
}

/** pH vertical bar */
function phBar(x: number, y: number, w: number, plant: PlantData): string {
  const segments: [boolean, string][] = [
    [plant.phVeryAcid, COLORS.phVeryAcid],
    [plant.phAcid, COLORS.phAcid],
    [plant.phNeutral, COLORS.phNeutral],
    [plant.phAlkaline, COLORS.phAlkaline],
    [plant.phVeryAlkaline, COLORS.phVeryAlkaline],
    [plant.phSaline, COLORS.phSaline],
  ];
  let svg = `<text x="${x}" y="${y - 0.5}" font-size="1.8" font-family="Arial" font-weight="bold" fill="#000">pH</text>`;
  const segH = 2.5;
  for (let i = 0; i < segments.length; i++) {
    const [active, color] = segments[i];
    const opacity = active ? '1' : '0.2';
    svg += `<rect x="${x}" y="${y + i * segH}" width="${w}" height="${segH}" fill="${color}" opacity="${opacity}" stroke="${COLORS.border}" stroke-width="0.08"/>`;
  }
  return svg;
}

export function renderPolyCard(plant: PlantData): string {
  const W = 70;
  const H = 120;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`;

  // Card outline with rounded corners
  svg += `<rect width="${W}" height="${H}" rx="4" fill="#fff" stroke="none"/>`;
  svg += `<rect width="${W}" height="${H}" rx="4" fill="none" stroke="#333" stroke-width="0.2"/>`;

  // ---- IMAGE (top ~55mm, matching original) ----
  const imgH = 55;
  if (plant.imageUrl) {
    svg += `<clipPath id="imgClip"><rect width="${W}" height="${imgH}" rx="4"/></clipPath>`;
    svg += `<image href="${esc(plant.imageUrl)}" x="0" y="0" width="${W}" height="${imgH}" preserveAspectRatio="xMidYMin slice" clip-path="url(#imgClip)"/>`;
  } else {
    svg += `<rect x="0" y="0" width="${W}" height="${imgH}" rx="4" fill="#c8e6c9"/>`;
    svg += `<text x="${W / 2}" y="${imgH / 2 + 2}" font-size="5" font-family="Arial" text-anchor="middle" fill="#81c784">${esc(plant.latinName || 'Pflanze')}</text>`;
  }

  // ---- NAMES ----
  const nameY = 58;
  svg += `<text x="${W / 2}" y="${nameY}" font-size="3.5" font-family="Arial" font-weight="bold" text-anchor="middle" fill="#000">${esc(plant.commonName || '—')}</text>`;
  svg += `<text x="${W / 2}" y="${nameY + 3.5}" font-size="2.8" font-family="Arial" font-style="italic" text-anchor="middle" fill="#444">${esc(plant.latinName || '—')}</text>`;

  // ---- HUMAN USAGES — row of colored squares (right side, matching original layout) ----
  const uY = 63.5;
  const uSize = 7.5;
  const uGap = 0.3;
  // 6 badges across the top-right area — eatable, culinaric, meds, material, fodder, fuel
  // Positioned from right edge inward (matching the original right-aligned usage badges)
  const usages: [boolean, string, string, number?][] = [
    [plant.fuel, COLORS.fuel, 'Brn'],
    [plant.fodder, COLORS.fodder, 'Fut'],
    [plant.material, COLORS.material, 'Mat', plant.materialScore],
    [plant.culinaric, COLORS.culinaric, 'Kul'],
    [plant.meds, COLORS.meds, 'Med', plant.medsScore],
    [plant.eatable, COLORS.eatable, 'Ess', plant.eatableScore],
  ];
  const uStartX = W - 1 - usages.length * (uSize + uGap);
  for (let i = 0; i < usages.length; i++) {
    const [active, color, label, score] = usages[i];
    svg += iconBadge(uStartX + i * (uSize + uGap), uY, uSize, active, color, label, score);
  }

  // ---- ECOSYSTEM — row below usages ----
  const eY = uY + uSize + 1;
  const eSize = 6;
  const eGap = 0.25;
  const eco: [boolean, string, string][] = [
    [plant.insects, COLORS.insects, 'Ins'],
    [plant.pest, COLORS.pest, 'Sch'],
    [plant.groundCover, COLORS.groundCover, 'Bod'],
    [plant.animalProtection, COLORS.animalProtection, 'Tie'],
    [plant.windBreaking, COLORS.windBreaking, 'Wnd'],
  ];
  for (let i = 0; i < eco.length; i++) {
    svg += iconBadge(1 + i * (eSize + eGap), eY, eSize, eco[i][0], eco[i][1], eco[i][2]);
  }

  // Nitrogen + Mineral fix (separate group)
  const nX = 1 + eco.length * (eSize + eGap) + 1;
  svg += iconBadge(nX, eY, eSize, plant.nitrogenFix, COLORS.nitrogenFix, 'N+');
  svg += iconBadge(nX + eSize + eGap, eY, eSize, plant.mineralFix, COLORS.mineralFix, 'DA');

  // ---- SUN / WATER / GROWTH — below ecosystem ----
  const sY = eY + eSize + 1;
  const sSize = 5.5;
  const sGap = 0.2;

  // Sun
  const suns: [boolean, string, string][] = [
    [plant.sunFull, COLORS.sunFull, '☀'],
    [plant.sunMid, COLORS.sunMid, '◑'],
    [plant.sunShadow, COLORS.sunShadow, '●'],
  ];
  for (let i = 0; i < suns.length; i++) {
    svg += iconBadge(1 + i * (sSize + sGap), sY, sSize, suns[i][0], suns[i][1], suns[i][2]);
  }

  // Water
  const wX = 1 + 3 * (sSize + sGap) + 1;
  const waters: [boolean, string, string][] = [
    [plant.waterDry, COLORS.waterDry, 'Tro'],
    [plant.waterMid, COLORS.waterMid, 'Mit'],
    [plant.waterWet, COLORS.waterWet, 'Nas'],
    [plant.waterPlant, COLORS.waterPlant, '~'],
  ];
  for (let i = 0; i < waters.length; i++) {
    svg += iconBadge(wX + i * (sSize + sGap), sY, sSize, waters[i][0], waters[i][1], waters[i][2]);
  }

  // Growth speed
  const gX = wX + 4 * (sSize + sGap) + 1;
  const speeds: [boolean, string, string][] = [
    [plant.growSpeedLow, COLORS.growLow, '▽'],
    [plant.growSpeedMid, COLORS.growMid, '△'],
    [plant.growSpeedHigh, COLORS.growHigh, '▲'],
  ];
  for (let i = 0; i < speeds.length; i++) {
    svg += iconBadge(gX + i * (sSize + sGap), sY, sSize, speeds[i][0], speeds[i][1], speeds[i][2]);
  }

  // ---- CLIMATE ZONE ----
  const czY = sY - 0.5;
  svg += `<text x="${W - 1}" y="${czY}" font-size="2" font-family="Arial" text-anchor="end" fill="#666">Zone</text>`;
  svg += `<text x="${W - 1}" y="${czY + 3.5}" font-size="3.2" font-family="Arial" text-anchor="end" font-weight="bold" fill="#000">${esc(plant.climateZone || '—')}</text>`;

  // ---- FRUIT & FLOWER MONTHS ----
  const mY = sY + sSize + 2;
  const boxW = 4.2;
  const boxH = 3.5;
  const mX = 6;

  svg += monthLabels(mX, mY, boxW);
  // Fruit icon + row
  svg += `<text x="1" y="${mY + boxH + 0.5}" font-size="2.5" font-family="Arial" fill="#000">Fr</text>`;
  svg += monthRow(mX, mY + 0.5, plant.fruitMonths, COLORS.fruit, boxW, boxH);
  // Flower icon + row
  svg += `<text x="1" y="${mY + boxH * 2 + 1.5}" font-size="2.5" font-family="Arial" fill="#000">Bl</text>`;
  svg += monthRow(mX, mY + boxH + 1, plant.flowerMonths, COLORS.flower, boxW, boxH);

  // ---- pH BAR (right side, next to months) ----
  svg += phBar(W - 7, mY - 1, 5.5, plant);

  // ---- HEIGHT / WIDTH (bottom) ----
  const bY = H - 3;
  svg += `<text x="3" y="${bY}" font-size="3" font-family="Arial" fill="#000">↕ ${plant.heightM != null ? plant.heightM + 'm' : '—'}</text>`;
  svg += `<text x="28" y="${bY}" font-size="3" font-family="Arial" fill="#000">↔ ${plant.widthM != null ? plant.widthM + 'm' : '—'}</text>`;

  svg += '</svg>';
  return svg;
}

export function renderStripeCard(plant: PlantData): string {
  const W = 290;
  const H = 16;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`;
  svg += `<rect width="${W}" height="${H}" rx="1" fill="#fff" stroke="${COLORS.border}" stroke-width="0.15"/>`;

  // Name block
  svg += `<text x="2" y="5.5" font-size="3.2" font-family="Arial" font-weight="bold" fill="#000">${esc(plant.commonName || '—')}</text>`;
  svg += `<text x="2" y="9.5" font-size="2.3" font-family="Arial" font-style="italic" fill="#444">${esc(plant.latinName || '—')}</text>`;

  // Dimensions
  svg += `<text x="52" y="5.5" font-size="2.3" font-family="Arial" fill="#333">↕ ${plant.heightM ?? '—'}m</text>`;
  svg += `<text x="52" y="9.5" font-size="2.3" font-family="Arial" fill="#333">↔ ${plant.widthM ?? '—'}m</text>`;

  // Fruit months
  const mBoxW = 3;
  const mGap = 0.15;
  for (let i = 0; i < 12; i++) {
    const fill = plant.fruitMonths[i] ? COLORS.fruit : COLORS.inactive;
    svg += `<rect x="${68 + i * (mBoxW + mGap)}" y="1.5" width="${mBoxW}" height="5.5" fill="${fill}" stroke="${COLORS.border}" stroke-width="0.08"/>`;
    svg += `<text x="${68 + i * (mBoxW + mGap) + mBoxW / 2}" y="5" font-size="1.6" font-family="Arial" text-anchor="middle" fill="#666">${MONTH_LABELS[i]}</text>`;
  }

  // Flower months
  for (let i = 0; i < 12; i++) {
    const fill = plant.flowerMonths[i] ? COLORS.flower : COLORS.inactive;
    svg += `<rect x="${68 + i * (mBoxW + mGap)}" y="8.5" width="${mBoxW}" height="5.5" fill="${fill}" stroke="${COLORS.border}" stroke-width="0.08"/>`;
  }

  // Usage badges (compact)
  const bSize = 4.5;
  const bGap = 0.3;
  const bX = 108;
  const compactBadges: [boolean, string, string][] = [
    [plant.eatable, COLORS.eatable, 'E'],
    [plant.meds, COLORS.meds, 'M'],
    [plant.material, COLORS.material, 'W'],
    [plant.nitrogenFix, COLORS.nitrogenFix, 'N'],
    [plant.groundCover, COLORS.groundCover, 'B'],
    [plant.insects, COLORS.insects, 'I'],
    [plant.windBreaking, COLORS.windBreaking, 'Wi'],
  ];
  for (let i = 0; i < compactBadges.length; i++) {
    const [active, color, label] = compactBadges[i];
    svg += iconBadge(bX + i * (bSize + bGap), 2, bSize, active, color, label);
  }

  // Sun/Water
  const envX = bX + compactBadges.length * (bSize + bGap) + 2;
  const env: [boolean, string, string][] = [
    [plant.sunFull, COLORS.sunFull, '☀'],
    [plant.sunMid, COLORS.sunMid, '◑'],
    [plant.sunShadow, COLORS.sunShadow, '●'],
    [plant.waterDry, COLORS.waterDry, 'T'],
    [plant.waterMid, COLORS.waterMid, 'M'],
    [plant.waterWet, COLORS.waterWet, 'N'],
  ];
  for (let i = 0; i < env.length; i++) {
    const [active, color, label] = env[i];
    svg += iconBadge(envX + i * (bSize + bGap), 2, bSize, active, color, label);
  }

  // Zone + pH + growth
  const infoX = envX + env.length * (bSize + bGap) + 2;
  svg += `<text x="${infoX}" y="6" font-size="2.5" font-family="Arial" fill="#000">Zone ${esc(plant.climateZone || '—')}</text>`;

  // pH compact bar
  const phColors: [boolean, string][] = [
    [plant.phVeryAcid, COLORS.phVeryAcid],
    [plant.phAcid, COLORS.phAcid],
    [plant.phNeutral, COLORS.phNeutral],
    [plant.phAlkaline, COLORS.phAlkaline],
    [plant.phVeryAlkaline, COLORS.phVeryAlkaline],
    [plant.phSaline, COLORS.phSaline],
  ];
  for (let i = 0; i < phColors.length; i++) {
    const opacity = phColors[i][0] ? '1' : '0.15';
    svg += `<rect x="${infoX + i * 4}" y="8" width="3.5" height="4" fill="${phColors[i][1]}" opacity="${opacity}" stroke="${COLORS.border}" stroke-width="0.06"/>`;
  }

  // Growth speed
  const gs = plant.growSpeedHigh ? '▲' : plant.growSpeedMid ? '△' : plant.growSpeedLow ? '▽' : '—';
  svg += `<text x="${infoX + 28}" y="12" font-size="3" font-family="Arial" fill="#333">${gs}</text>`;

  svg += '</svg>';
  return svg;
}
