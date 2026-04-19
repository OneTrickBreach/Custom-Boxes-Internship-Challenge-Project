'use client';
import { useCallback, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { BoxSize, DesignLayout, PanelKey } from '../lib/types';
import { BoxLayoutSVG } from './BoxLayoutSVG';
import { computeLayout } from '../lib/svg-templates';

interface Props {
  box: BoxSize;
  boxColor: 'kraft' | 'white';
  design: DesignLayout | null;
  logoDataUrl: string | null;
  logoScale?: number;
  logoSides?: 1 | 2 | 4;
  companyName?: string;
  panelScales?: Partial<Record<PanelKey, number>>;
  height?: number;
}

const DEFAULT_ROT = { x: -22, y: -32 };

/**
 * 3D box preview. Two interaction modes, both active simultaneously:
 *
 * - **Hover-to-rotate**: move the mouse over the preview and the box tracks the
 *   cursor position (-40° to +40° on each axis). Leave the preview and it
 *   smoothly springs back to the default isometric angle.
 * - **Click-and-drag**: press down and drag for free rotation. Works on
 *   touch/pen via Pointer Events too. Useful when you want a specific angle.
 *
 * Also has a visible "Reset" button in the corner that jumps back to the
 * default angle.
 */
export function Box3DPreview({
  box,
  boxColor,
  design,
  logoDataUrl,
  logoScale = 1,
  logoSides = 1,
  companyName,
  panelScales,
  height = 520,
}: Props) {
  const [rot, setRot] = useState(DEFAULT_ROT);
  const [dragging, setDragging] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{
    x: number;
    y: number;
    rotX: number;
    rotY: number;
  } | null>(null);

  const { panels } = computeLayout(box.length, box.width, box.height);
  const byKey = Object.fromEntries(panels.map((p) => [p.panel, p]));

  // Scale the box so the largest dimension fills the preview area nicely.
  const maxPreviewDim = Math.min(height * 0.72, 540);
  const largestDim = Math.max(box.length, box.width, box.height);
  const PX_PER_UNIT = Math.max(14, Math.min(38, maxPreviewDim / largestDim));
  const l = box.length * PX_PER_UNIT;
  const w = box.width * PX_PER_UNIT;
  const h = box.height * PX_PER_UNIT;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;

      if (dragging && dragStart.current) {
        // Free drag: delta translates 1:1 into degrees.
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const nextY = dragStart.current.rotY + dx * 0.5;
        const nextX = clamp(dragStart.current.rotX - dy * 0.5, -80, 80);
        setRot({ x: nextX, y: nextY });
        return;
      }

      // Hover tracking — only when NOT dragging, so drag takes priority.
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setRot({
        x: DEFAULT_ROT.x + py * -35,
        y: DEFAULT_ROT.y + px * 70,
      });
    },
    [dragging],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Capture so we keep getting events even if pointer leaves during drag.
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rot.x,
      rotY: rot.y,
    };
    setDragging(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    dragStart.current = null;
    setDragging(false);
  };

  const handlePointerEnter = () => setPointerInside(true);
  const handlePointerLeave = () => {
    setPointerInside(false);
    if (!dragging) setRot(DEFAULT_ROT);
  };

  const reset = () => {
    setRot(DEFAULT_ROT);
    dragStart.current = null;
    setDragging(false);
  };

  const renderFace = (panel: PanelKey, faceW: number, faceH: number) => {
    const rect = byKey[panel];
    if (!rect) return null;
    return (
      <div
        style={{
          width: faceW,
          height: faceH,
          overflow: 'hidden',
          background: boxColor === 'kraft' ? '#C4A265' : '#F5F3EF',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.08)',
          // Don't let faces intercept pointer events — we want them all on the
          // container so drag tracking works even over the box surface.
          pointerEvents: 'none',
        }}
      >
        <BoxLayoutSVG
          length={box.length}
          width={box.width}
          height={box.height}
          boxColor={boxColor}
          design={design}
          logoDataUrl={logoDataUrl}
          logoScale={logoScale}
          logoSides={logoSides}
          companyName={companyName}
          panelScales={panelScales}
          showCropMarks={false}
          showFoldLines={false}
          showPanelLabels={false}
          background="transparent"
          viewBoxOverride={`${rect.x} ${rect.y} ${rect.w} ${rect.h}`}
          preserveAspectRatio="none"
          className="block"
        />
      </div>
    );
  };

  // Transition policy:
  // - While dragging or hovering, transitions are disabled so the box tracks
  //   the cursor 1:1.
  // - When pointer leaves and we snap back to default, a brief ease animates
  //   the return.
  const active = dragging || pointerInside;
  const transition = active
    ? 'transform 40ms linear'
    : 'transform 380ms cubic-bezier(0.22,0.7,0.32,1)';

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{
        position: 'relative',
        perspective: 1600,
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: l,
          height: h,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition,
          willChange: 'transform',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', transform: `translateZ(${w / 2}px)` }}>
          {renderFace('front', l, h)}
        </div>
        <div
          style={{
            position: 'absolute',
            transform: `translateZ(${-w / 2}px) rotateY(180deg)`,
          }}
        >
          {renderFace('back', l, h)}
        </div>
        <div
          style={{
            position: 'absolute',
            width: w,
            height: h,
            left: l - w / 2,
            top: 0,
            transform: `translateX(${w / 2}px) rotateY(90deg)`,
          }}
        >
          {renderFace('right', w, h)}
        </div>
        <div
          style={{
            position: 'absolute',
            width: w,
            height: h,
            left: -w / 2,
            top: 0,
            transform: `translateX(${-w / 2}px) rotateY(-90deg)`,
          }}
        >
          {renderFace('left', w, h)}
        </div>
        <div
          style={{
            position: 'absolute',
            width: l,
            height: w,
            left: 0,
            top: -w / 2,
            transform: `translateY(${w / 2}px) rotateX(90deg)`,
          }}
        >
          {renderFace('top', l, w)}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <span
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: 'var(--text-muted)',
          }}
        >
          Hover or drag
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            reset();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Reset rotation"
          title="Reset rotation"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '1px solid var(--border-strong)',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <RotateCcw width={14} height={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
