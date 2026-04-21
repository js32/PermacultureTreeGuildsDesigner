import { PDFDocument, PDFPage, PDFRef, degrees, drawImage as pdfDrawImage } from 'pdf-lib';
import { renderPolyCardToCanvas, renderStripeCardToCanvas } from './card-canvas';
import type { PlantData } from './types';

// Card dimensions in mm
const POLY_MM   = { w: 70,  h: 120 };
const STRIPE_MM = { w: 290, h: 17  };

// mm → PDF points (1 pt = 1/72 inch)
const pt = (mm: number) => mm * 72 / 25.4;

// ── Image embedding (RGB, no alpha, no SMask) ────────────────────────────────
// pdf-lib always creates an SMask for RGBA PNG images. LibreWolf's pdf.js has
// a rendering bug with SMask. Workaround: embed raw RGB pixel data directly as
// a /FlateDecode image stream without alpha channel.

function canvasToRgbBytes(canvas: HTMLCanvasElement): Uint8Array {
  const { width, height } = canvas;
  const src = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
  const rgb = new Uint8Array(width * height * 3);
  let di = 0;
  for (let i = 0; i < src.length; i += 4) {
    rgb[di++] = src[i];
    rgb[di++] = src[i + 1];
    rgb[di++] = src[i + 2];
  }
  return rgb;
}

function embedCanvasRgb(pdfDoc: PDFDocument, canvas: HTMLCanvasElement): PDFRef {
  const ctx = pdfDoc.context as any;
  const stream = ctx.flateStream(canvasToRgbBytes(canvas), {
    Type:             'XObject',
    Subtype:          'Image',
    BitsPerComponent: 8,
    Width:            canvas.width,
    Height:           canvas.height,
    ColorSpace:       'DeviceRGB',
  });
  return ctx.register(stream);
}

function drawCanvasOnPage(
  page: PDFPage,
  imageRef: PDFRef,
  x: number, y: number,
  drawW: number, drawH: number,
) {
  const name = page.node.newXObject('Img', imageRef);
  page.pushOperators(
    ...pdfDrawImage(name, {
      x, y,
      width:  drawW,
      height: drawH,
      rotate: degrees(0),
      xSkew:  degrees(0),
      ySkew:  degrees(0),
    }),
  );
}

// ── Wikimedia / image fetch helpers ─────────────────────────────────────────

async function resolveWikimediaUrl(url: string): Promise<string> {
  const match = url.match(/Special:FilePath\/([^?]+)/);
  if (!match) return url;
  const filename = decodeURIComponent(match[1]);
  const apiUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`;
  try {
    const res  = await fetch(apiUrl);
    const data = await res.json();
    const pages = data.query?.pages;
    const page: any = Object.values(pages as object)[0];
    return page?.imageinfo?.[0]?.thumburl || url;
  } catch { return url; }
}

async function imageUrlToDataUrl(url: string): Promise<string | null> {
  const resolved = await resolveWikimediaUrl(url);
  try {
    const res = await fetch(resolved, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch { /* fall through */ }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width  = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      try { resolve(c.toDataURL('image/jpeg', 0.85)); } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = resolved;
  });
}

async function plantImageDataUrl(plant: PlantData): Promise<string | undefined> {
  if (!plant.imageUrl) return undefined;
  return (await imageUrlToDataUrl(plant.imageUrl)) ?? undefined;
}

// ── Download helper ──────────────────────────────────────────────────────────

function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ── Exports ──────────────────────────────────────────────────────────────────

export async function exportCardsPDF(plants: PlantData[]): Promise<void> {
  if (plants.length === 0) return;

  const pdfDoc = await PDFDocument.create();

  // Portrait A4 – poly cards
  const pageW = pt(210), pageH = pt(297), margin = pt(5);
  const cardW = pt(POLY_MM.w), cardH = pt(POLY_MM.h);
  const cols  = Math.floor((pageW - margin) / (cardW + margin));

  let page = pdfDoc.addPage([pageW, pageH]);
  let col = 0, row = 0;

  for (let i = 0; i < plants.length; i++) {
    const x        = margin + col * (cardW + margin);
    const yFromTop = margin + row * (cardH + margin);

    const imgDataUrl = await plantImageDataUrl(plants[i]);
    const canvas     = await renderPolyCardToCanvas(plants[i], imgDataUrl);
    const imageRef   = embedCanvasRgb(pdfDoc, canvas);
    drawCanvasOnPage(page, imageRef, x, pageH - yFromTop - cardH, cardW, cardH);

    col++;
    if (col >= cols) {
      col = 0; row++;
      if (margin + (row + 1) * (cardH + margin) > pageH) {
        row = 0;
        if (i < plants.length - 1) page = pdfDoc.addPage([pageW, pageH]);
      }
    }
  }

  // Landscape A4 – stripe cards
  const sPageW = pt(297), sPageH = pt(210), sMargin = pt(3);
  const sCardW = pt(STRIPE_MM.w), sCardH = pt(STRIPE_MM.h);

  let sPage = pdfDoc.addPage([sPageW, sPageH]);
  let sy = sMargin;

  for (const plant of plants) {
    if (sy + sCardH > sPageH - sMargin) {
      sPage = pdfDoc.addPage([sPageW, sPageH]);
      sy = sMargin;
    }
    const imgDataUrl = await plantImageDataUrl(plant);
    const canvas     = await renderStripeCardToCanvas(plant, imgDataUrl);
    const imageRef   = embedCanvasRgb(pdfDoc, canvas);
    drawCanvasOnPage(sPage, imageRef, sMargin, sPageH - sy - sCardH, sCardW, sCardH);
    sy += sCardH + pt(2);
  }

  downloadPdf(await pdfDoc.save(), 'permaculture-guild-cards.pdf');
}

export async function exportSingleCardPDF(plant: PlantData): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const cardW  = pt(POLY_MM.w), cardH = pt(POLY_MM.h);
  const page   = pdfDoc.addPage([cardW, cardH]);

  const imgDataUrl = await plantImageDataUrl(plant);
  const canvas     = await renderPolyCardToCanvas(plant, imgDataUrl);
  const imageRef   = embedCanvasRgb(pdfDoc, canvas);
  drawCanvasOnPage(page, imageRef, 0, 0, cardW, cardH);

  downloadPdf(await pdfDoc.save(), `${plant.latinName || 'plant'}-card.pdf`);
}
