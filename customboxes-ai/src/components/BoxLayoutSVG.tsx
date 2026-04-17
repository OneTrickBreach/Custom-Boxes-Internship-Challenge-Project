'use client';
import { forwardRef } from 'react';
import type { DesignElement, DesignLayout, PanelDesign } from '../lib/types';
import {
  computeLayout,
  elementAbsPos,
  INK,
  KRAFT_BG,
  WHITE_BG,
  FOLD_LINE,
  LABEL_COLOR,
  PanelRect,
} from '../lib/svg-templates';

export interface BoxLayoutSVGProps {
  length: number;
  width: number;
  height: number;
  boxColor: 'kraft' | 'white';
  design: DesignLayout | null;
  logoDataUrl: string | null;
  logoScale?: number; // multiplier 0.5–1.5
  showCropMarks?: boolean;
  showFoldLines?: boolean;
  showPanelLabels?: boolean;
  companyName?: string;
  background?: 'color' | 'transparent';
  /** Controls which panels contain the logo. Used by the "logo on sides" toggle. */
  logoSides?: 1 | 2 | 4;
  /** Force SVG width to fit within. */
  className?: string;
  highlightPanel?: string | null;
  onPanelClick?: (p: string) => void;
  /** Override viewBox to crop to a specific region (used by 3D preview). */
  viewBoxOverride?: string;
  preserveAspectRatio?: string;
  /** Per-panel logo scale multipliers. Falls back to logoScale. */
  logoScales?: Partial<Record<string, number>>;
}

function panelLabel(p: string) {
  return p.toUpperCase();
}

function renderTextElement(
  el: DesignElement,
  rect: PanelRect,
  key: string,
) {
  const abs = elementAbsPos(el, rect);
  const fontSize = Math.max(8, (el.fontSize || 14) * 1.2);
  const weight =
    el.fontWeight === 'bold'
      ? 700
      : el.fontWeight === 'light'
        ? 300
        : 500;
  const anchor =
    el.textAlign === 'left'
      ? 'start'
      : el.textAlign === 'right'
        ? 'end'
        : 'middle';
  const transformed =
    el.textTransform === 'uppercase'
      ? (el.content || '').toUpperCase()
      : el.textTransform === 'lowercase'
        ? (el.content || '').toLowerCase()
        : el.content || '';
  return (
    <text
      key={key}
      x={abs.x}
      y={abs.y}
      fill={INK}
      fontFamily={weight >= 700 ? 'var(--font-dm-serif), serif' : 'var(--font-dm-sans), sans-serif'}
      fontSize={fontSize}
      fontWeight={weight}
      fontStyle={el.fontStyle === 'italic' ? 'italic' : 'normal'}
      textAnchor={anchor}
      letterSpacing={el.letterSpacing || 0}
      dominantBaseline="middle"
      style={{ userSelect: 'none' }}
    >
      {transformed}
    </text>
  );
}

function renderLogoElement(
  el: DesignElement,
  rect: PanelRect,
  key: string,
  logoDataUrl: string | null,
  logoScale: number,
  companyName?: string,
) {
  const abs = elementAbsPos(el, rect);
  const wPct = el.width ?? 40;
  const hPct = el.height ?? 20;
  const baseW = (wPct / 100) * rect.w * logoScale;
  const baseH = (hPct / 100) * rect.h * logoScale;
  // Clamp to panel, leave 4% padding.
  const maxW = rect.w * 0.9;
  const maxH = rect.h * 0.9;
  const w = Math.min(baseW, maxW);
  const h = Math.min(baseH, maxH);
  const x = abs.x - w / 2;
  const y = abs.y - h / 2;

  if (logoDataUrl) {
    return (
      <image
        key={key}
        href={logoDataUrl}
        x={x}
        y={y}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: 'url(#ink-filter)' }}
      />
    );
  }
  // Fallback: draw a placeholder "logo mark" with company initials
  const initials = (companyName || 'LOGO')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('');
  return (
    <g key={key}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={INK}
        strokeWidth={1.5}
      />
      <text
        x={abs.x}
        y={abs.y}
        fill={INK}
        fontFamily="var(--font-dm-serif), serif"
        fontSize={Math.min(w, h) * 0.45}
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight={700}
        letterSpacing={2}
      >
        {initials || 'LOGO'}
      </text>
    </g>
  );
}

function renderLineElement(el: DesignElement, rect: PanelRect, key: string) {
  const abs = elementAbsPos(el, rect);
  const w = ((el.width ?? 40) / 100) * rect.w;
  const h = ((el.height ?? 0) / 100) * rect.h;
  const x1 = abs.x - w / 2;
  const x2 = abs.x + w / 2;
  const y1 = abs.y;
  const y2 = abs.y + h;
  return (
    <line
      key={key}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={INK}
      strokeWidth={h === 0 ? 1 : 0.8}
    />
  );
}

function renderBorderElement(el: DesignElement, rect: PanelRect, key: string) {
  const abs = elementAbsPos(el, rect);
  const w = ((el.width ?? 90) / 100) * rect.w;
  const h = ((el.height ?? 90) / 100) * rect.h;
  return (
    <rect
      key={key}
      x={abs.x - w / 2}
      y={abs.y - h / 2}
      width={w}
      height={h}
      fill="none"
      stroke={INK}
      strokeWidth={1}
      strokeDasharray="none"
    />
  );
}

function renderQrPlaceholder(el: DesignElement, rect: PanelRect, key: string) {
  const abs = elementAbsPos(el, rect);
  const w = ((el.width ?? 18) / 100) * rect.w;
  const h = ((el.height ?? 18) / 100) * rect.h;
  const size = Math.min(w, h);
  const x = abs.x - size / 2;
  const y = abs.y - size / 2;
  // A faux QR: 7×7 grid with corner finder boxes
  const cells = 7;
  const cell = size / cells;
  const finder = (fx: number, fy: number) => (
    <g key={`${key}-f-${fx}-${fy}`}>
      <rect
        x={fx}
        y={fy}
        width={cell * 3}
        height={cell * 3}
        fill={INK}
      />
      <rect
        x={fx + cell * 0.5}
        y={fy + cell * 0.5}
        width={cell * 2}
        height={cell * 2}
        fill={rect.panel ? 'transparent' : 'transparent'}
      />
      <rect
        x={fx + cell}
        y={fy + cell}
        width={cell}
        height={cell}
        fill={INK}
      />
    </g>
  );
  // A few data cells
  const dataCells = [];
  const positions = [
    [3, 1],
    [4, 2],
    [5, 3],
    [3, 4],
    [4, 5],
    [5, 5],
    [1, 4],
    [2, 5],
  ];
  for (const [cx, cy] of positions) {
    dataCells.push(
      <rect
        key={`${key}-d-${cx}-${cy}`}
        x={x + cx * cell}
        y={y + cy * cell}
        width={cell}
        height={cell}
        fill={INK}
      />,
    );
  }
  return (
    <g key={key}>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="none"
        stroke={INK}
        strokeWidth={0.5}
      />
      {finder(x, y)}
      {finder(x + size - cell * 3, y)}
      {finder(x, y + size - cell * 3)}
      {/* Mask out inner of finders so they look like frames */}
      <rect x={x + cell * 0.5} y={y + cell * 0.5} width={cell * 2} height={cell * 2} fill="transparent" stroke={INK} strokeWidth={0.4} />
      {dataCells}
    </g>
  );
}

function renderBarcodePlaceholder(
  el: DesignElement,
  rect: PanelRect,
  key: string,
) {
  const abs = elementAbsPos(el, rect);
  const w = ((el.width ?? 30) / 100) * rect.w;
  const h = ((el.height ?? 10) / 100) * rect.h;
  const x = abs.x - w / 2;
  const y = abs.y - h / 2;
  const bars = 22;
  const widths = Array.from(
    { length: bars },
    (_, i) => 0.5 + ((i * 9301 + 49297) % 100) / 100,
  );
  const totalW = widths.reduce((a, b) => a + b, 0);
  const scale = w / totalW;
  let cursor = 0;
  const rects: React.ReactElement[] = [];
  for (let i = 0; i < bars; i++) {
    const bw = widths[i] * scale * 0.7;
    if (i % 2 === 0) {
      rects.push(
        <rect
          key={`${key}-b-${i}`}
          x={x + cursor}
          y={y}
          width={bw}
          height={h}
          fill={INK}
        />,
      );
    }
    cursor += widths[i] * scale;
  }
  return <g key={key}>{rects}</g>;
}

function renderIcon(el: DesignElement, rect: PanelRect, key: string) {
  const abs = elementAbsPos(el, rect);
  const w = ((el.width ?? 10) / 100) * rect.w;
  const h = ((el.height ?? 10) / 100) * rect.h;
  const s = Math.min(w, h);
  const type = (el.content || 'recycle').toLowerCase();
  const x = abs.x;
  const y = abs.y;
  if (type.includes('recycle')) {
    // Simple recycle triangle
    const r = s / 2;
    return (
      <g key={key} stroke={INK} strokeWidth={1.2} fill="none">
        <polygon
          points={`${x},${y - r} ${x + r},${y + r} ${x - r},${y + r}`}
        />
        <polygon
          points={`${x},${y - r * 0.4} ${x + r * 0.55},${y + r * 0.55} ${x - r * 0.55},${y + r * 0.55}`}
        />
      </g>
    );
  }
  if (type.includes('fragile') || type.includes('glass')) {
    const r = s / 2;
    return (
      <g key={key} stroke={INK} strokeWidth={1.2} fill="none">
        <rect x={x - r * 0.5} y={y - r} width={r} height={r * 2} />
        <line x1={x - r * 0.3} y1={y - r * 0.5} x2={x + r * 0.3} y2={y - r * 0.2} />
      </g>
    );
  }
  // Default: circle dot
  return (
    <g key={key} stroke={INK} fill="none" strokeWidth={1}>
      <circle cx={x} cy={y} r={s / 2} />
    </g>
  );
}

function renderElement(
  el: DesignElement,
  rect: PanelRect,
  key: string,
  logoDataUrl: string | null,
  logoScale: number,
  companyName?: string,
) {
  switch (el.type) {
    case 'logo':
      return renderLogoElement(el, rect, key, logoDataUrl, logoScale, companyName);
    case 'text':
      return renderTextElement(el, rect, key);
    case 'line':
      return renderLineElement(el, rect, key);
    case 'border':
      return renderBorderElement(el, rect, key);
    case 'icon':
      return renderIcon(el, rect, key);
    case 'qr-placeholder':
      return renderQrPlaceholder(el, rect, key);
    case 'barcode-placeholder':
      return renderBarcodePlaceholder(el, rect, key);
    default:
      return null;
  }
}

export const BoxLayoutSVG = forwardRef<SVGSVGElement, BoxLayoutSVGProps>(
  function BoxLayoutSVG(
    {
      length,
      width,
      height,
      boxColor,
      design,
      logoDataUrl,
      logoScale = 1,
      showCropMarks = true,
      showFoldLines = true,
      showPanelLabels = true,
      companyName,
      background = 'color',
      logoSides = 1,
      className,
      highlightPanel,
      onPanelClick,
      viewBoxOverride,
      preserveAspectRatio,
      logoScales,
    }: BoxLayoutSVGProps,
    ref,
  ) {
    const { panels, viewBoxWidth, viewBoxHeight } = computeLayout(
      length,
      width,
      height,
    );
    const bg = boxColor === 'kraft' ? KRAFT_BG : WHITE_BG;

    const panelByKey: Record<string, PanelRect> = {};
    panels.forEach((p) => (panelByKey[p.panel] = p));

    const designPanels: PanelDesign[] = design?.panels || [];

    // Determine which vertical panels should have the logo (applies to logoSides toggle)
    const verticalPanels = ['front', 'back', 'left', 'right'] as const;
    const logoPanelKeys = new Set<string>();
    if (logoSides >= 1) logoPanelKeys.add('front');
    if (logoSides >= 2) logoPanelKeys.add('back');
    if (logoSides >= 4) {
      logoPanelKeys.add('left');
      logoPanelKeys.add('right');
    }

    return (
      <svg
        ref={ref}
        viewBox={viewBoxOverride || `0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio={preserveAspectRatio || 'xMidYMid meet'}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="ink-filter">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 1 0"
            />
          </filter>
        </defs>
        {background === 'color' && (
          <rect
            x={0}
            y={0}
            width={viewBoxWidth}
            height={viewBoxHeight}
            fill="#FAFAF8"
          />
        )}

        {/* Panels */}
        {panels.map((p) => {
          const isHover = highlightPanel === p.panel;
          return (
            <g
              key={p.panel}
              onClick={() => onPanelClick?.(p.panel)}
              style={{ cursor: onPanelClick ? 'pointer' : 'default' }}
            >
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                fill={bg}
                stroke={INK}
                strokeWidth={1.2}
              />
              {isHover && (
                <rect
                  x={p.x + 2}
                  y={p.y + 2}
                  width={p.w - 4}
                  height={p.h - 4}
                  fill="none"
                  stroke="#D4622B"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              )}
              {showPanelLabels && (
                <text
                  x={p.x + 8}
                  y={p.y + 14}
                  fill={LABEL_COLOR}
                  fontSize={9}
                  fontFamily="var(--font-dm-sans), sans-serif"
                  letterSpacing={2}
                  style={{ userSelect: 'none' }}
                >
                  {panelLabel(p.panel)}
                </text>
              )}
            </g>
          );
        })}

        {/* Fold lines between panels */}
        {showFoldLines && (
          <g stroke={FOLD_LINE} strokeWidth={0.7} strokeDasharray="4 3">
            {/* Vertical fold lines in the middle strip */}
            {(() => {
              const left = panelByKey.left;
              const front = panelByKey.front;
              const right = panelByKey.right;
              const back = panelByKey.back;
              const top = panelByKey.top;
              const bottom = panelByKey.bottom;
              const lines = [
                // left|front
                <line key="lf" x1={front.x} y1={front.y} x2={front.x} y2={front.y + front.h} />,
                // front|right
                <line key="fr" x1={right.x} y1={right.y} x2={right.x} y2={right.y + right.h} />,
                // right|back
                <line key="rb" x1={back.x} y1={back.y} x2={back.x} y2={back.y + back.h} />,
                // top bottom folds around front
                <line key="tf" x1={front.x} y1={front.y} x2={front.x + front.w} y2={front.y} />,
                <line key="bf" x1={front.x} y1={front.y + front.h} x2={front.x + front.w} y2={front.y + front.h} />,
                // top panel folds (above front)
                <line key="topL" x1={top.x} y1={top.y + top.h} x2={top.x} y2={top.y} />,
                <line key="topR" x1={top.x + top.w} y1={top.y + top.h} x2={top.x + top.w} y2={top.y} />,
                // bottom panel folds
                <line key="botL" x1={bottom.x} y1={bottom.y} x2={bottom.x} y2={bottom.y + bottom.h} />,
                <line key="botR" x1={bottom.x + bottom.w} y1={bottom.y} x2={bottom.x + bottom.w} y2={bottom.y + bottom.h} />,
                // keep reference
                <line key="__" x1={left.x} y1={left.y} x2={left.x} y2={left.y} />,
              ];
              return lines;
            })()}
          </g>
        )}

        {/* Crop marks at outer corners */}
        {showCropMarks && (
          <g stroke={INK} strokeWidth={0.6}>
            {panels.map((p) => (
              <g key={`cm-${p.panel}`}>
                <line x1={p.x - 5} y1={p.y} x2={p.x} y2={p.y} />
                <line x1={p.x} y1={p.y - 5} x2={p.x} y2={p.y} />
                <line x1={p.x + p.w + 5} y1={p.y} x2={p.x + p.w} y2={p.y} />
                <line x1={p.x + p.w} y1={p.y - 5} x2={p.x + p.w} y2={p.y} />
                <line x1={p.x - 5} y1={p.y + p.h} x2={p.x} y2={p.y + p.h} />
                <line x1={p.x} y1={p.y + p.h + 5} x2={p.x} y2={p.y + p.h} />
                <line x1={p.x + p.w + 5} y1={p.y + p.h} x2={p.x + p.w} y2={p.y + p.h} />
                <line x1={p.x + p.w} y1={p.y + p.h + 5} x2={p.x + p.w} y2={p.y + p.h} />
              </g>
            ))}
          </g>
        )}

        {/* Design elements */}
        {designPanels.map((pd) => {
          const rect = panelByKey[pd.panel];
          if (!rect) return null;
          const filteredElements = pd.elements.filter((el) => {
            if (
              el.type === 'logo' &&
              verticalPanels.includes(pd.panel as typeof verticalPanels[number])
            ) {
              return logoPanelKeys.has(pd.panel);
            }
            return true;
          });
          const panelLogoScale =
            (logoScales && logoScales[pd.panel] !== undefined
              ? logoScales[pd.panel]!
              : logoScale) || 1;
          return (
            <g key={pd.panel}>
              {filteredElements.map((el, i) =>
                renderElement(
                  el,
                  rect,
                  `${pd.panel}-${i}`,
                  logoDataUrl,
                  panelLogoScale,
                  companyName,
                ),
              )}
            </g>
          );
        })}
      </svg>
    );
  },
);
