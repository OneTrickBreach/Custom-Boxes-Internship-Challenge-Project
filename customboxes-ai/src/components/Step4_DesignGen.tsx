'use client';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Download,
  FileImage,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type {
  BoxSize,
  DesignLayout,
  BrandAnalysis,
  BoxRecommendation,
} from '../lib/types';
import { BoxLayoutSVG } from './BoxLayoutSVG';
import { Box3DPreview } from './Box3DPreview';

interface Props {
  mainSvgRef?: MutableRefObject<SVGSVGElement | null>;
  box: BoxSize;
  brandAnalysis: BrandAnalysis;
  boxRecommendation: BoxRecommendation | null;
  design: DesignLayout | null;
  logoDataUrl: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onGenerate: (boxColor: 'kraft' | 'white') => void;
  onBack: () => void;
  onContinue: () => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
  initialLogoScale?: number;
  initialLogoSides?: 1 | 2 | 4;
  onChangeLogoScale?: (v: number) => void;
  onChangeLogoSides?: (v: 1 | 2 | 4) => void;
}

export function Step4DesignGen({
  mainSvgRef,
  box,
  brandAnalysis,
  boxRecommendation,
  design,
  logoDataUrl,
  isLoading,
  loadingMessage,
  error,
  onGenerate,
  onBack,
  onContinue,
  onDownloadSvg,
  onDownloadPng,
  initialLogoScale = 1,
  initialLogoSides = 1,
  onChangeLogoScale,
  onChangeLogoSides,
}: Props) {
  const [boxColor, setBoxColor] = useState<'kraft' | 'white'>(
    boxRecommendation?.boxColor || brandAnalysis.recommendedBoxColor,
  );
  const [logoScale, setLogoScale] = useState<number>(initialLogoScale);
  const [logoSides, setLogoSides] = useState<1 | 2 | 4>(initialLogoSides);
  const [zoomPanel, setZoomPanel] = useState<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current && !design) {
      firstRender.current = false;
      onGenerate(boxColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onChangeLogoScale?.(logoScale);
  }, [logoScale, onChangeLogoScale]);

  useEffect(() => {
    onChangeLogoSides?.(logoSides);
  }, [logoSides, onChangeLogoSides]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] mb-1">
            Step 4 — Design
          </div>
          <h2 className="font-display text-3xl md:text-4xl">
            Your packaging layout.
          </h2>
          <p className="text-[14px] text-[color:var(--text-secondary)] mt-1 max-w-2xl">
            Black ink on {boxColor} corrugated. All 6 panels positioned as a
            flattened dieline. Click a panel to zoom in.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost h-9 px-3 rounded-md text-[13px] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div
            className="panel-card p-4 relative overflow-hidden"
            style={{ minHeight: 420 }}
          >
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex gap-1 mb-3">
                    <span className="loading-dot w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                    <span className="loading-dot w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                    <span className="loading-dot w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                  </div>
                  <div className="text-[13px] text-[color:var(--text-primary)] font-medium">
                    {loadingMessage || 'Designing your packaging layout…'}
                  </div>
                  <div className="text-[11px] text-[color:var(--text-muted)] mt-1">
                    Analyzing brand signals • Positioning elements • Respecting whitespace
                  </div>
                </div>
              </div>
            )}
            {!design && !isLoading && (
              <div className="h-[420px] flex items-center justify-center text-[13px] text-[color:var(--text-muted)]">
                No design yet. Click &quot;Regenerate&quot; to get started.
              </div>
            )}
            {design && (
              <BoxLayoutSVG
                ref={mainSvgRef}
                isExportTarget
                length={box.length}
                width={box.width}
                height={box.height}
                boxColor={boxColor}
                design={design}
                logoDataUrl={logoDataUrl}
                logoScale={logoScale}
                logoSides={logoSides}
                companyName={brandAnalysis.companyName}
                className="w-full h-auto"
                highlightPanel={zoomPanel}
                onPanelClick={(p) => setZoomPanel(zoomPanel === p ? null : p)}
              />
            )}
          </div>

          {error && (
            <div
              className="mt-3 text-[13px] px-3 py-2 rounded-md border"
              style={{ background: '#fff4f2', borderColor: '#f3c9c2', color: 'var(--danger)' }}
            >
              {error}
            </div>
          )}

          {design?.designNotes && (
            <div className="mt-4 panel-card p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                Design Notes
              </div>
              <p className="text-[13px] leading-relaxed text-[color:var(--text-primary)]">
                {design.designNotes}
              </p>
            </div>
          )}

          {design && (
            <div className="mt-4 panel-card p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-3">
                3D Preview
              </div>
              <Box3DPreview
                box={box}
                boxColor={boxColor}
                design={design}
                logoDataUrl={logoDataUrl}
                logoScale={logoScale}
                logoSides={logoSides}
                companyName={brandAnalysis.companyName}
              />
              <div className="text-[11px] text-[color:var(--text-muted)] text-center mt-2">
                Hover to rotate
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel-card p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-3">
              Print Specs
            </div>
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-[color:var(--text-secondary)]">Size</dt>
                <dd className="font-medium">
                  {box.length}×{box.width}×{box.height} in
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[color:var(--text-secondary)]">Material</dt>
                <dd className="font-medium capitalize">{boxColor} corrugated</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[color:var(--text-secondary)]">Ink</dt>
                <dd className="font-medium">Black only</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[color:var(--text-secondary)]">ECT</dt>
                <dd className="font-medium">
                  {boxRecommendation?.ectRating || '32 ECT'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="panel-card p-5 space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-2">
                Background
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['kraft', 'Kraft'],
                    ['white', 'White'],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setBoxColor(v)}
                    className={`h-10 rounded-md border text-[13px] ${
                      boxColor === v
                        ? v === 'kraft'
                          ? 'kraft-chip'
                          : 'white-chip'
                        : 'btn-ghost'
                    } ${boxColor === v ? 'ring-2' : ''}`}
                    style={
                      boxColor === v ? { boxShadow: '0 0 0 2px var(--accent)' } : undefined
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-2 flex items-center justify-between">
                <span>Logo Size</span>
                <span className="font-normal text-[color:var(--text-muted)]">
                  {Math.round(logoScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.05}
                value={logoScale}
                onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
              />
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-2">
                Logo on
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    [1, '1 side'],
                    [2, '2 sides'],
                    [4, '4 sides'],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setLogoSides(v)}
                    className={`h-9 text-[12px] rounded-md border ${
                      logoSides === v
                        ? 'bg-[color:var(--ink-black)] text-white border-[color:var(--ink-black)]'
                        : 'btn-ghost'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onGenerate(boxColor)}
              disabled={isLoading}
              className="btn-ghost w-full h-10 rounded-md text-[13px] font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>

          <div className="panel-card p-5 space-y-2">
            <button
              type="button"
              onClick={onDownloadSvg}
              disabled={!design}
              className="btn-ghost w-full h-10 rounded-md text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Download SVG
            </button>
            <button
              type="button"
              onClick={onDownloadPng}
              disabled={!design}
              className="btn-ghost w-full h-10 rounded-md text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileImage className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={!design}
              className="btn-primary w-full h-10 rounded-md text-[13px] font-medium flex items-center justify-center gap-2"
            >
              Refine Design
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
