'use client';
import { MutableRefObject, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Send,
  Undo2,
  FileImage,
  Sparkles,
} from 'lucide-react';
import type {
  BoxSize,
  DesignLayout,
  BrandAnalysis,
  BoxRecommendation,
  PanelKey,
} from '../lib/types';
import { BoxLayoutSVG } from './BoxLayoutSVG';
import { Box3DPreview } from './Box3DPreview';
import { ToggleSwitch } from './ui/ToggleSwitch';

interface Props {
  mainSvgRef?: MutableRefObject<SVGSVGElement | null>;
  box: BoxSize;
  brandAnalysis: BrandAnalysis;
  boxRecommendation: BoxRecommendation | null;
  design: DesignLayout | null;
  designHistory: DesignLayout[];
  logoDataUrl: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onRefine: (prompt: string) => void;
  onUndo: () => void;
  onBack: () => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
}

const SUGGESTION_CHIPS = [
  'Make the logo larger',
  'Simplify the layout',
  'Add a sustainability message',
  'Make it more premium',
  'Make it more playful',
  'Reduce clutter on side panels',
  'Add trust signals from website',
  'Move tagline to top panel',
];

export function Step5DesignEditor({
  mainSvgRef,
  box,
  brandAnalysis,
  boxRecommendation,
  design,
  designHistory,
  logoDataUrl,
  isLoading,
  loadingMessage,
  error,
  onRefine,
  onUndo,
  onBack,
  onDownloadSvg,
  onDownloadPng,
}: Props) {
  const [prompt, setPrompt] = useState('');
  const [boxColor, setBoxColor] = useState<'kraft' | 'white'>(
    design?.boxColor || 'kraft',
  );
  const [logoScale, setLogoScale] = useState(1);
  const [logoSides, setLogoSides] = useState<1 | 2 | 4>(1);
  const [perPanelScale, setPerPanelScale] = useState<Record<PanelKey, number>>({
    front: 1,
    back: 1,
    left: 1,
    right: 1,
    top: 1,
    bottom: 1,
  });
  const [showTagline, setShowTagline] = useState(true);
  const [showUrl, setShowUrl] = useState(true);
  const [showQr, setShowQr] = useState(true);

  const submit = () => {
    if (!prompt.trim() || isLoading) return;
    onRefine(prompt.trim());
    setPrompt('');
  };

  const filteredDesign: DesignLayout | null = design
    ? {
        ...design,
        panels: design.panels.map((p) => ({
          ...p,
          elements: p.elements.filter((el) => {
            if (!showTagline) {
              const isTagline =
                el.type === 'text' &&
                el.fontSize !== undefined &&
                el.fontSize <= 14 &&
                (el.fontWeight === 'light' || el.fontWeight === 'normal');
              if (isTagline) return false;
            }
            if (!showUrl) {
              if (
                el.type === 'text' &&
                (el.content || '').match(/\.[a-z]{2,4}(\/|$)|https?:\/\//i)
              ) {
                return false;
              }
            }
            if (!showQr && el.type === 'qr-placeholder') return false;
            return true;
          }),
        })),
      }
    : null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] mb-1">
            Step 5 — Refine &amp; Export
          </div>
          <h2 className="font-display text-3xl md:text-4xl">
            Iterate until it&apos;s right.
          </h2>
          <p className="text-[14px] text-[color:var(--text-secondary)] mt-1 max-w-2xl">
            Describe what you want to change and watch the layout update. Designer-minded prompts work best.
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

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div>
          <div className="panel-card p-4 relative overflow-hidden" style={{ minHeight: 460 }}>
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex gap-1 mb-3">
                    <span className="loading-dot w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                    <span className="loading-dot w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                    <span className="loading-dot w-2 h-2 rounded-full bg-[color:var(--accent)]" />
                  </div>
                  <div className="text-[13px] text-[color:var(--text-primary)] font-medium">
                    {loadingMessage || 'Applying your changes…'}
                  </div>
                </div>
              </div>
            )}
            {filteredDesign && (
              <BoxLayoutSVG
                ref={mainSvgRef}
                isExportTarget
                length={box.length}
                width={box.width}
                height={box.height}
                boxColor={boxColor}
                design={filteredDesign}
                logoDataUrl={logoDataUrl}
                logoScale={logoScale}
                logoSides={logoSides}
                companyName={brandAnalysis.companyName}
                panelScales={perPanelScale}
                className="w-full h-auto"
              />
            )}
          </div>

          {design && (
            <div className="mt-4 panel-card p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-3">
                3D Preview
              </div>
              <Box3DPreview
                box={box}
                boxColor={boxColor}
                design={filteredDesign}
                logoDataUrl={logoDataUrl}
                logoScale={logoScale}
                logoSides={logoSides}
                companyName={brandAnalysis.companyName}
                panelScales={perPanelScale}
              />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <div className="text-[13px] font-medium">AI Refinement</div>
            </div>
            <div className="relative">
              <textarea
                rows={2}
                placeholder="Describe your changes…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
                }}
                className="input-field w-full p-3 pr-11 text-[13px] resize-none"
              />
              <button
                type="button"
                onClick={submit}
                disabled={isLoading || !prompt.trim()}
                className="btn-primary absolute right-2 bottom-2 w-8 h-8 rounded-md flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)] mt-3 mb-1.5">
              Suggestions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTION_CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setPrompt(c);
                  }}
                  className="text-[11px] px-2 py-1 rounded-full chip"
                >
                  {c}
                </button>
              ))}
            </div>

            {designHistory.length > 0 && (
              <button
                type="button"
                onClick={onUndo}
                className="mt-4 btn-ghost w-full h-9 rounded-md text-[12px] flex items-center justify-center gap-2"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo last change ({designHistory.length})
              </button>
            )}

            {error && (
              <div
                className="mt-3 text-[12px] px-3 py-2 rounded-md border"
                style={{ background: '#fff4f2', borderColor: '#f3c9c2', color: 'var(--danger)' }}
              >
                {error}
              </div>
            )}
          </div>

          <div className="panel-card p-5 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Quick Controls
            </div>
            <div>
              <div className="text-[11px] text-[color:var(--text-secondary)] mb-2">
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
                    className={`h-9 rounded-md border text-[12px] ${
                      boxColor === v
                        ? v === 'kraft'
                          ? 'kraft-chip'
                          : 'white-chip'
                        : 'btn-ghost'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[color:var(--text-secondary)] mb-2 flex items-center justify-between">
                <span>Logo size</span>
                <span className="text-[color:var(--text-muted)]">{Math.round(logoScale * 100)}%</span>
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
              <div className="text-[11px] text-[color:var(--text-secondary)] mb-2">Logo on</div>
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
                    className={`h-8 text-[11px] rounded-md border ${
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
            <div className="border-t hairline pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-wider text-[color:var(--text-secondary)]">
                  Per-Panel Content Scale
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPerPanelScale({
                      front: 1,
                      back: 1,
                      left: 1,
                      right: 1,
                      top: 1,
                      bottom: 1,
                    })
                  }
                  className="text-[10px] text-[color:var(--text-muted)] underline"
                >
                  Reset
                </button>
              </div>
              <p className="text-[10px] text-[color:var(--text-muted)] mb-2">
                Scales all elements on that panel — text, logo, QR, everything.
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {(
                  ['front', 'back', 'left', 'right', 'top', 'bottom'] as PanelKey[]
                ).map((p) => (
                  <label key={p} className="flex flex-col gap-1">
                    <span className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[color:var(--text-muted)]">
                      <span>{p}</span>
                      <span>{Math.round(perPanelScale[p] * 100)}%</span>
                    </span>
                    <input
                      type="range"
                      min={0.25}
                      max={2}
                      step={0.05}
                      value={perPanelScale[p]}
                      onChange={(e) =>
                        setPerPanelScale((s) => ({
                          ...s,
                          [p]: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-[color:var(--accent)]"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {(
                [
                  ['Show tagline', showTagline, setShowTagline],
                  ['Show website URL', showUrl, setShowUrl],
                  ['Show QR placeholder', showQr, setShowQr],
                ] as const
              ).map(([label, val, setVal]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-[12px]"
                >
                  <span>{label}</span>
                  <ToggleSwitch
                    checked={val}
                    onChange={setVal}
                    ariaLabel={label}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-3">
              Export
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onDownloadSvg}
                className="btn-ghost w-full h-9 rounded-md text-[12px] flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download SVG
              </button>
              <button
                type="button"
                onClick={onDownloadPng}
                className="btn-ghost w-full h-9 rounded-md text-[12px] flex items-center justify-center gap-2"
              >
                <FileImage className="w-3.5 h-3.5" />
                Download PNG
              </button>
            </div>
            <div className="mt-3 border-t hairline pt-3 text-[11px] text-[color:var(--text-muted)] space-y-0.5">
              <div>Size: {box.length}×{box.width}×{box.height} in</div>
              <div>Material: {boxColor} corrugated</div>
              <div>Ink: Black only</div>
              <div>ECT: {boxRecommendation?.ectRating || '32 ECT'}</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
