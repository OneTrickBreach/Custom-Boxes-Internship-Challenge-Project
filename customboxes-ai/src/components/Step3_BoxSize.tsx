'use client';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Package,
  CheckCircle2,
  Ruler,
  Box,
  Info,
} from 'lucide-react';
import { BOX_CATALOG, CUSTOMBOXES_LINKS } from '../lib/constants';
import type {
  BoxSize,
  BoxRecommendation,
  SizingAnswers,
  BrandAnalysis,
} from '../lib/types';

interface Props {
  brandAnalysis: BrandAnalysis;
  boxSizeKnown: boolean | null;
  selectedBoxSize: BoxSize | null;
  sizingAnswers: SizingAnswers | null;
  boxRecommendation: BoxRecommendation | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onSetBoxSizeKnown: (known: boolean) => void;
  onSelectBoxSize: (box: BoxSize) => void;
  onSizingAnswers: (answers: SizingAnswers) => void;
  onBack: () => void;
  onContinue: () => void;
  onRequestRecommendation: (answers: SizingAnswers) => void;
}

const CATEGORIES: {
  key: 'standard' | 'popular_custom' | 'any_size';
  label: string;
}[] = [
  { key: 'standard', label: 'Standard Sizes' },
  { key: 'popular_custom', label: 'Popular Custom' },
  { key: 'any_size', label: 'Any Size' },
];

function MiniBox({ box, color = 'kraft' }: { box: BoxSize; color?: 'kraft' | 'white' }) {
  const ratio = Math.max(box.length, box.width, box.height);
  const scale = 50 / ratio;
  const l = box.length * scale;
  const w = box.width * scale;
  const h = box.height * scale;
  const bg = color === 'kraft' ? '#C4A265' : '#F5F3EF';
  const side = color === 'kraft' ? '#8B7240' : '#D8D2C5';
  const top = color === 'kraft' ? '#D3B37B' : '#FFFFFF';
  return (
    <div
      className="inline-block"
      style={{ perspective: 260, width: 80, height: 72 }}
    >
      <div
        style={{
          position: 'relative',
          width: l,
          height: h,
          margin: '12px auto',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-22deg) rotateY(-28deg)',
        }}
      >
        {/* Front */}
        <div
          style={{
            position: 'absolute',
            width: l,
            height: h,
            background: bg,
            border: '1px solid rgba(0,0,0,0.2)',
            transform: `translateZ(${w / 2}px)`,
          }}
        />
        {/* Back */}
        <div
          style={{
            position: 'absolute',
            width: l,
            height: h,
            background: side,
            border: '1px solid rgba(0,0,0,0.2)',
            transform: `translateZ(${-w / 2}px) rotateY(180deg)`,
          }}
        />
        {/* Right */}
        <div
          style={{
            position: 'absolute',
            width: w,
            height: h,
            left: l - w / 2,
            top: 0,
            background: side,
            border: '1px solid rgba(0,0,0,0.2)',
            transform: `translateX(${w / 2}px) rotateY(90deg)`,
          }}
        />
        {/* Left */}
        <div
          style={{
            position: 'absolute',
            width: w,
            height: h,
            left: -w / 2,
            top: 0,
            background: side,
            border: '1px solid rgba(0,0,0,0.2)',
            transform: `translateX(${-w / 2}px) rotateY(-90deg)`,
          }}
        />
        {/* Top */}
        <div
          style={{
            position: 'absolute',
            width: l,
            height: w,
            left: 0,
            top: -w / 2,
            background: top,
            border: '1px solid rgba(0,0,0,0.2)',
            transform: `translateY(${w / 2}px) rotateX(90deg)`,
          }}
        />
      </div>
    </div>
  );
}

function BoxCatalogGrid({
  boxColor,
  selected,
  onSelect,
}: {
  boxColor: 'kraft' | 'white';
  selected: BoxSize | null;
  onSelect: (b: BoxSize) => void;
}) {
  const [activeCat, setActiveCat] = useState<
    'standard' | 'popular_custom' | 'any_size'
  >('standard');
  const boxes = BOX_CATALOG.filter((b) => b.category === activeCat);
  return (
    <div>
      <div className="flex gap-1 p-1 rounded-[10px] bg-[color:var(--bg)] border hairline inline-flex mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCat(c.key)}
            className={`text-[13px] px-3 py-1.5 rounded-md transition-colors ${
              activeCat === c.key
                ? 'bg-white shadow-sm font-medium'
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {boxes.map((b) => {
          const isSel = selected?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b)}
              className={`panel-card p-4 text-left transition-all hover:border-[color:var(--accent)] ${
                isSel
                  ? 'ring-2 ring-offset-0'
                  : ''
              }`}
              style={
                isSel
                  ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px rgba(212,98,43,0.15)' }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-xl leading-none">
                    {b.name}
                  </div>
                  <div className="text-[11px] text-[color:var(--text-muted)] mt-0.5 uppercase tracking-wider">
                    inches (L×W×H)
                  </div>
                </div>
                <MiniBox box={b} color={boxColor} />
              </div>
              <p className="text-[12px] text-[color:var(--text-secondary)] leading-snug mt-2">
                {b.commonUse}
              </p>
              {b.priceEstimate && (
                <p className="text-[11px] text-[color:var(--text-muted)] mt-1.5">
                  {b.priceEstimate}
                </p>
              )}
              {isSel && (
                <div
                  className="mt-2 text-[11px] flex items-center gap-1 uppercase tracking-wider"
                  style={{ color: 'var(--accent-dark)' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SizingWizard({
  defaults,
  onSubmit,
  disabled,
}: {
  defaults: SizingAnswers | null;
  onSubmit: (a: SizingAnswers) => void;
  disabled: boolean;
}) {
  const [a, setA] = useState<SizingAnswers>(
    defaults || {
      productDescription: '',
      productWeight: 'under5',
      productDimensions: '',
      quantity: 250,
      fragility: 'low',
      needsInserts: false,
      fitPreference: 'standard',
    },
  );

  const update = (patch: Partial<SizingAnswers>) =>
    setA((prev) => ({ ...prev, ...patch }));

  return (
    <div className="panel-card p-6">
      <h3 className="font-display text-xl mb-1">Let&apos;s find your size</h3>
      <p className="text-[13px] text-[color:var(--text-secondary)] mb-6">
        Answer a few questions and we&apos;ll recommend a box from the CustomBoxes.io catalog.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        <label className="md:col-span-2 flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            What are you shipping?
          </span>
          <input
            placeholder="e.g. Two pairs of wool running shoes"
            value={a.productDescription}
            onChange={(e) => update({ productDescription: e.target.value })}
            className="input-field w-full h-10 px-3 text-[14px]"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Product weight
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                ['under5', 'Under 5 lb'],
                ['5to15', '5–15 lb'],
                ['15to30', '15–30 lb'],
                ['over30', 'Over 30 lb'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => update({ productWeight: v })}
                className={`h-9 text-[12px] rounded-md border ${
                  a.productWeight === v
                    ? 'bg-[color:var(--ink-black)] text-white border-[color:var(--ink-black)]'
                    : 'btn-ghost'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Product dimensions
          </span>
          <input
            placeholder="L×W×H in inches, or 'not sure'"
            value={a.productDimensions}
            onChange={(e) => update({ productDimensions: e.target.value })}
            className="input-field w-full h-10 px-3 text-[14px]"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Fragility
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                ['low', 'Not fragile'],
                ['medium', 'Somewhat'],
                ['high', 'Very fragile'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => update({ fragility: v })}
                className={`h-9 text-[12px] rounded-md border ${
                  a.fragility === v
                    ? 'bg-[color:var(--ink-black)] text-white border-[color:var(--ink-black)]'
                    : 'btn-ghost'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Need inserts / void fill?
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                [true, 'Yes'],
                [false, 'No'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => update({ needsInserts: v })}
                className={`h-9 text-[12px] rounded-md border ${
                  a.needsInserts === v
                    ? 'bg-[color:var(--ink-black)] text-white border-[color:var(--ink-black)]'
                    : 'btn-ghost'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            How should the product fit?
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                ['tight', 'Tight (minimal space)'],
                ['standard', 'Standard (room to breathe)'],
                ['protective', 'Protective (extra padding)'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => update({ fitPreference: v })}
                className={`h-9 text-[12px] rounded-md border ${
                  a.fitPreference === v
                    ? 'bg-[color:var(--ink-black)] text-white border-[color:var(--ink-black)]'
                    : 'btn-ghost'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          disabled={disabled || !a.productDescription.trim()}
          onClick={() => onSubmit(a)}
          className="btn-primary h-10 px-4 rounded-md text-[13px] font-medium flex items-center gap-1.5"
        >
          {disabled ? 'Finding your box…' : 'Recommend My Box'}
          {!disabled && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  onUse,
}: {
  rec: BoxRecommendation;
  onUse: () => void;
}) {
  const colorStyle: Record<string, string> = {
    high: 'var(--success)',
    medium: 'var(--warn)',
    low: 'var(--danger)',
  };
  return (
    <div className="panel-card p-6 mt-6">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
            Our Recommendation
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-display text-3xl">{rec.primaryBox.name}</span>
            <span className="text-[13px] text-[color:var(--text-secondary)]">
              {rec.primaryBox.length}×{rec.primaryBox.width}×{rec.primaryBox.height} in
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
            style={{ background: colorStyle[rec.confidence] }}
          >
            {rec.confidence} confidence
          </span>
          <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full border hairline bg-white">
            {rec.ectRating}
          </span>
          <span
            className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              rec.boxColor === 'kraft' ? 'kraft-chip' : 'white-chip'
            }`}
          >
            {rec.boxColor}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
        <MiniBox box={rec.primaryBox} color={rec.boxColor} />
        <p className="text-[14px] leading-relaxed text-[color:var(--text-primary)]">
          {rec.rationale}
        </p>
      </div>

      {rec.alternateBox && (
        <div className="mt-4 border-t hairline pt-4 text-[13px] text-[color:var(--text-secondary)]">
          <span className="font-medium text-[color:var(--text-primary)]">Alternate:</span>{' '}
          {rec.alternateBox.name} — {rec.alternateBox.commonUse}
        </div>
      )}

      <div
        className="mt-5 rounded-md p-3 text-[12px] flex items-start gap-2"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        <Info className="w-4 h-4 mt-0.5 text-[color:var(--text-secondary)]" />
        <span className="text-[color:var(--text-secondary)]">
          You are ultimately responsible for selecting the correct box size for your products.{' '}
          <a
            href={CUSTOMBOXES_LINKS.refundPolicy}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[color:var(--text-primary)]"
          >
            View our return policy →
          </a>
        </span>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onUse}
          className="btn-primary h-11 px-5 rounded-[10px] text-[14px] font-medium flex items-center gap-2"
        >
          Use this box &amp; design my packaging
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Step3BoxSize({
  brandAnalysis,
  boxSizeKnown,
  selectedBoxSize,
  sizingAnswers,
  boxRecommendation,
  isLoading,
  loadingMessage,
  error,
  onSetBoxSizeKnown,
  onSelectBoxSize,
  onSizingAnswers,
  onBack,
  onContinue,
  onRequestRecommendation,
}: Props) {
  const boxColor = brandAnalysis.recommendedBoxColor;

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] mb-1">
            Step 3 — Box Size
          </div>
          <h2 className="font-display text-3xl md:text-4xl">Pick your box.</h2>
          <p className="text-[14px] text-[color:var(--text-secondary)] max-w-2xl mt-1">
            All CustomBoxes.io sizes are pre-engineered for corrugated shipping. You can&apos;t break the catalog — we&apos;ll make sure you get a stock size we actually produce.
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

      {boxSizeKnown === null && (
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSetBoxSizeKnown(true)}
            className="panel-card p-8 text-left hover:border-[color:var(--accent)] transition-colors"
          >
            <Ruler className="w-6 h-6 mb-3" style={{ color: 'var(--accent)' }} />
            <div className="font-display text-2xl mb-1">Yes, I know my size</div>
            <p className="text-[13px] text-[color:var(--text-secondary)]">
              Browse our standard and popular custom sizes and pick one.
            </p>
          </button>
          <button
            type="button"
            onClick={() => onSetBoxSizeKnown(false)}
            className="panel-card p-8 text-left hover:border-[color:var(--accent)] transition-colors"
          >
            <Package className="w-6 h-6 mb-3" style={{ color: 'var(--accent)' }} />
            <div className="font-display text-2xl mb-1">No, help me choose</div>
            <p className="text-[13px] text-[color:var(--text-secondary)]">
              Answer a few questions. We&apos;ll suggest the right size from the catalog.
            </p>
          </button>
        </div>
      )}

      {boxSizeKnown === true && (
        <div>
          <BoxCatalogGrid
            boxColor={boxColor}
            selected={selectedBoxSize}
            onSelect={onSelectBoxSize}
          />
          <div className="mt-5 text-[12px] text-[color:var(--text-muted)] flex items-center gap-2">
            <Box className="w-3.5 h-3.5" />
            Need a size not listed?{' '}
            <a
              href={CUSTOMBOXES_LINKS.home}
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1 text-[color:var(--text-secondary)]"
            >
              Browse all sizes on CustomBoxes.io →
            </a>
          </div>

          <div
            className="mt-4 rounded-md p-3 text-[12px] flex items-start gap-2"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <Info className="w-4 h-4 mt-0.5 text-[color:var(--text-secondary)]" />
            <span className="text-[color:var(--text-secondary)]">
              You are ultimately responsible for selecting the correct box size for your products.{' '}
              <a
                href={CUSTOMBOXES_LINKS.refundPolicy}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[color:var(--text-primary)]"
              >
                View our return policy →
              </a>
            </span>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => onSetBoxSizeKnown(false)}
              className="text-[13px] text-[color:var(--text-secondary)] underline"
            >
              Not sure? Help me choose instead
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={!selectedBoxSize}
              className="btn-primary h-11 px-5 rounded-[10px] text-[14px] font-medium flex items-center gap-2"
            >
              Continue to Design
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {boxSizeKnown === false && (
        <div>
          <SizingWizard
            defaults={sizingAnswers}
            disabled={isLoading}
            onSubmit={(a) => {
              onSizingAnswers(a);
              onRequestRecommendation(a);
            }}
          />

          {isLoading && loadingMessage && (
            <div className="mt-4 text-[13px] text-[color:var(--text-secondary)] flex items-center gap-2">
              <span className="inline-flex gap-1">
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              </span>
              {loadingMessage}
            </div>
          )}

          {error && (
            <div
              className="mt-4 text-[13px] px-3 py-2 rounded-md border"
              style={{ background: '#fff4f2', borderColor: '#f3c9c2', color: 'var(--danger)' }}
            >
              {error}
            </div>
          )}

          {boxRecommendation && (
            <RecommendationCard rec={boxRecommendation} onUse={onContinue} />
          )}

          <div className="mt-6 text-[13px] text-[color:var(--text-secondary)]">
            Already know your size?{' '}
            <button
              onClick={() => onSetBoxSizeKnown(true)}
              className="underline text-[color:var(--text-primary)]"
            >
              Pick from the catalog instead.
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
