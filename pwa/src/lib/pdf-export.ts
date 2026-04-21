import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { renderTemplatePolyCard, renderTemplateStripeCard } from './svg-template';
import { renderPolyCard, renderStripeCard } from './card-svg';
import type { PlantData } from './types';

function svgStringToElement(svgString: string): SVGElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  return doc.documentElement as unknown as SVGElement;
}

/** Render a poly card SVG, preferring the original template with fallback */
async function getPolyCardSvg(plant: PlantData): Promise<string> {
  try {
    return await renderTemplatePolyCard(plant);
  } catch {
    return renderPolyCard(plant);
  }
}

/** Render a stripe card SVG, preferring the original template with fallback */
async function getStripeCardSvg(plant: PlantData): Promise<string> {
  try {
    return await renderTemplateStripeCard(plant);
  } catch {
    return renderStripeCard(plant);
  }
}

export async function exportCardsPDF(plants: PlantData[]): Promise<void> {
  if (plants.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const pageH = 297;
  const cardW = 70;
  const cardH = 120;
  const margin = 5;
  const cols = Math.floor((pageW - margin) / (cardW + margin));

  let col = 0;
  let row = 0;

  for (let i = 0; i < plants.length; i++) {
    if (i > 0 && col === 0 && row === 0) {
      doc.addPage();
    }

    const x = margin + col * (cardW + margin);
    const y = margin + row * (cardH + margin);

    const svgStr = await getPolyCardSvg(plants[i]);
    const svgEl = svgStringToElement(svgStr);

    await doc.svg(svgEl, { x, y, width: cardW, height: cardH });

    col++;
    if (col >= cols) {
      col = 0;
      row++;
      if (margin + (row + 1) * (cardH + margin) > pageH) {
        row = 0;
        if (i < plants.length - 1) {
          doc.addPage();
        }
      }
    }
  }

  // Stripe cards on new page(s)
  if (plants.length > 0) {
    doc.addPage('a4', 'landscape');
    const stripeH = 16;
    const stripeW = 290;
    const sMargin = 3;
    let sy = sMargin;

    for (let i = 0; i < plants.length; i++) {
      if (sy + stripeH > 210 - sMargin) {
        doc.addPage('a4', 'landscape');
        sy = sMargin;
      }
      const svgStr = await getStripeCardSvg(plants[i]);
      const svgEl = svgStringToElement(svgStr);
      await doc.svg(svgEl, { x: sMargin, y: sy, width: stripeW, height: stripeH });
      sy += stripeH + 2;
    }
  }

  doc.save('permaculture-guild-cards.pdf');
}

export async function exportSingleCardPDF(plant: PlantData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [70, 120] });
  const svgStr = await getPolyCardSvg(plant);
  const svgEl = svgStringToElement(svgStr);
  await doc.svg(svgEl, { x: 0, y: 0, width: 70, height: 120 });
  doc.save(`${plant.latinName || 'plant'}-card.pdf`);
}
