import type { PlantData } from './types';
import { TEXT_FIELDS, BOOL_FIELDS } from './baumscheibe-mapping';

const TEMPLATE_URL = '/baumscheibe-template.svg';
let templatePromise: Promise<SVGSVGElement> | null = null;

async function loadTemplate(): Promise<SVGSVGElement> {
  if (templatePromise) return templatePromise;
  templatePromise = (async () => {
    const res = await fetch(TEMPLATE_URL);
    if (!res.ok) throw new Error(`Baumscheibe-Template fehlt (${res.status})`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('Template-SVG kann nicht geparst werden');
    return doc.documentElement as unknown as SVGSVGElement;
  })();
  return templatePromise;
}

const INK_NS = 'http://www.inkscape.org/namespaces/inkscape';

function findByLabel(root: Element, labels: string[]): Element[] {
  const out: Element[] = [];
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const v = el.getAttributeNS(INK_NS, 'label') ?? el.getAttribute('inkscape:label');
    if (v && labels.includes(v)) out.push(el);
  }
  return out;
}

function setText(el: Element, value: string) {
  const tspan = el.querySelector('tspan');
  (tspan ?? el).textContent = value;
}

function setVisible(el: Element, on: boolean) {
  if (on) el.removeAttribute('display');
  else el.setAttribute('display', 'none');
}

/** Render a plant into the Baumscheibe SVG template; returns serialized SVG markup. */
export async function renderBaumscheibeSvg(plant: PlantData): Promise<string> {
  const tpl = await loadTemplate();
  const svg = tpl.cloneNode(true) as SVGSVGElement;

  for (const [field, labels] of Object.entries(TEXT_FIELDS)) {
    if (!labels) continue;
    const v = (plant as any)[field];
    const text = v == null || v === '' ? '' : String(v);
    for (const el of findByLabel(svg, labels)) setText(el, text);
  }

  for (const [field, labels] of Object.entries(BOOL_FIELDS)) {
    if (!labels) continue;
    const on = !!(plant as any)[field];
    for (const el of findByLabel(svg, labels)) setVisible(el, on);
  }

  // Replace the original "in" units with the viewBox pixel dims so the SVG has
  // an intrinsic size (needed by Firefox when loading via Image for canvas
  // rasterization). HTML embedding scales it via CSS in the wrapper below.
  const vb = svg.getAttribute('viewBox')?.split(/\s+/);
  if (vb && vb.length === 4) {
    svg.setAttribute('width',  vb[2]);
    svg.setAttribute('height', vb[3]);
  } else {
    svg.removeAttribute('width');
    svg.removeAttribute('height');
  }

  return new XMLSerializer().serializeToString(svg);
}

/** Card-shaped wrapper around the rendered SVG, matching the cards-view layout. */
export async function renderBaumscheibeCardHtml(plant: PlantData): Promise<string> {
  let svg = await renderBaumscheibeSvg(plant);
  // Inline-scale the SVG to fill its container without affecting its intrinsic
  // size when used elsewhere (e.g. PDF rasterization).
  svg = svg.replace('<svg', '<svg style="width:100%;height:auto;display:block;"');
  return (
    `<div style="width:480px;background:#fff;border:1px solid #ccc;` +
    `border-radius:4px;overflow:hidden;box-sizing:border-box;">${svg}</div>`
  );
}
