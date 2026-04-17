import { DesignElement, PanelKey } from './types';

export interface PanelRect {
  panel: PanelKey;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Given a box L×W×H and a target total viewBox width, compute the 6 panel
 * rectangles arranged in a cross/T layout:
 *
 *        ┌─────────┐
 *        │   TOP   │  (L × W)
 *  ┌─────┼─────────┼─────┬─────────┐
 *  │LEFT │  FRONT  │RIGHT│  BACK   │  (each H tall)
 *  └─────┼─────────┼─────┴─────────┘
 *        │ BOTTOM  │
 *        └─────────┘
 *
 * LEFT = W×H, FRONT = L×H, RIGHT = W×H, BACK = L×H
 */
export function computeLayout(
  L: number,
  W: number,
  H: number,
  scale = 30,
  padding = 40,
): {
  panels: PanelRect[];
  viewBoxWidth: number;
  viewBoxHeight: number;
} {
  const l = L * scale;
  const w = W * scale;
  const h = H * scale;

  // Cross layout: column widths = [W, L, W, L], middle row is height h
  // top/bottom span first 3 columns horizontally above/below the FRONT column
  const rowTopX = padding + w; // TOP starts where LEFT ends (above FRONT)
  const rowTopY = padding;
  const rowMidY = rowTopY + w; // TOP panel has height = W

  const leftX = padding;
  const frontX = padding + w;
  const rightX = frontX + l;
  const backX = rightX + w;

  const bottomX = frontX;
  const bottomY = rowMidY + h;

  const panels: PanelRect[] = [
    { panel: 'top', x: rowTopX, y: rowTopY, w: l, h: w },
    { panel: 'left', x: leftX, y: rowMidY, w: w, h: h },
    { panel: 'front', x: frontX, y: rowMidY, w: l, h: h },
    { panel: 'right', x: rightX, y: rowMidY, w: w, h: h },
    { panel: 'back', x: backX, y: rowMidY, w: l, h: h },
    { panel: 'bottom', x: bottomX, y: bottomY, w: l, h: w },
  ];

  const viewBoxWidth = backX + l + padding;
  const viewBoxHeight = bottomY + w + padding;

  return { panels, viewBoxWidth, viewBoxHeight };
}

export function elementAbsPos(
  el: DesignElement,
  rect: PanelRect,
): { x: number; y: number; w?: number; h?: number } {
  const x = rect.x + (el.x / 100) * rect.w;
  const y = rect.y + (el.y / 100) * rect.h;
  const w = el.width ? (el.width / 100) * rect.w : undefined;
  const h = el.height ? (el.height / 100) * rect.h : undefined;
  return { x, y, w, h };
}

export const INK = '#1A1A1A';
export const KRAFT_BG = '#C4A265';
export const WHITE_BG = '#F5F3EF';
export const FOLD_LINE = 'rgba(26,26,26,0.35)';
export const LABEL_COLOR = 'rgba(26,26,26,0.35)';
