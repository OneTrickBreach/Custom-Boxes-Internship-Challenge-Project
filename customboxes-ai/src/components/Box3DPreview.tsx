'use client';
import { useEffect, useRef, useState } from 'react';
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
  logoScales?: Partial<Record<PanelKey, number>>;
}

/**
 * Simple 3D preview: renders 5 visible faces (front, back, left, right, top),
 * each using the shared BoxLayoutSVG with a cropped viewBox so that only the
 * relevant panel's content shows on that face.
 */
export function Box3DPreview({
  box,
  boxColor,
  design,
  logoDataUrl,
  logoScale = 1,
  logoSides = 1,
  companyName,
  logoScales,
}: Props) {
  const [hovering, setHovering] = useState(false);
  const [rot, setRot] = useState({ x: -18, y: -28 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { panels } = computeLayout(box.length, box.width, box.height);
  const byKey = Object.fromEntries(panels.map((p) => [p.panel, p]));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setRot({ x: -18 + py * -12, y: -28 + px * 40 });
    };
    if (hovering) el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, [hovering]);

  const PX_PER_UNIT = 12;
  const l = box.length * PX_PER_UNIT;
  const w = box.width * PX_PER_UNIT;
  const h = box.height * PX_PER_UNIT;

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
          logoScales={logoScales}
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

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setRot({ x: -18, y: -28 });
      }}
      style={{
        perspective: 1400,
        width: '100%',
        height: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: l,
          height: h,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition: hovering
            ? 'none'
            : 'transform 300ms cubic-bezier(0.22,0.7,0.32,1)',
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
    </div>
  );
}
