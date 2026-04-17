'use client';
import { useState } from 'react';
import {
  ArrowRight,
  Edit3,
  Check,
  X,
  Sparkles,
  Target,
  Palette,
  Type,
  Package as PackageIcon,
  DollarSign,
  Boxes,
  ArrowLeft,
} from 'lucide-react';
import type { BrandAnalysis, BrandBusinessInfo } from '../lib/types';
import { CUSTOMBOXES_LINKS } from '../lib/constants';

interface Props {
  url: string;
  brandAnalysis: BrandAnalysis;
  businessInfo: BrandBusinessInfo | null;
  onUpdateAnalysis: (update: Partial<BrandAnalysis>) => void;
  onUpdateBusiness: (info: BrandBusinessInfo) => void;
  onBack: () => void;
  onContinue: () => void;
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  icon?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    onChange(draft);
    setEditing(false);
  };

  return (
    <div className="panel-card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          {icon}
          {label}
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="text-[12px] text-[color:var(--text-muted)] hover:text-[color:var(--accent)] flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={save}
              className="p-1 rounded-md text-[color:var(--success)] hover:bg-[color:var(--bg)]"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="p-1 rounded-md text-[color:var(--text-secondary)] hover:bg-[color:var(--bg)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {editing ? (
        multiline ? (
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="input-field w-full p-2 text-[14px] resize-none"
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="input-field w-full p-2 text-[14px]"
          />
        )
      ) : (
        <p className="text-[14px] leading-snug text-[color:var(--text-primary)]">
          {value || <span className="text-[color:var(--text-muted)]">—</span>}
        </p>
      )}
    </div>
  );
}

export function Step2BrandAnalysis({
  url,
  brandAnalysis,
  businessInfo,
  onUpdateAnalysis,
  onUpdateBusiness,
  onBack,
  onContinue,
}: Props) {
  const [volume, setVolume] = useState<string>(
    businessInfo ? String(businessInfo.monthlyVolume) : '',
  );
  const [cost, setCost] = useState<string>(
    businessInfo ? String(businessInfo.currentCostPerBox) : '0.50',
  );
  const [branded, setBranded] = useState<boolean>(
    businessInfo?.usesBrandedPackaging ?? false,
  );

  const vol = parseInt(volume) || 0;

  const handleContinue = () => {
    onUpdateBusiness({
      monthlyVolume: vol,
      currentCostPerBox: parseFloat(cost) || 0.5,
      usesBrandedPackaging: branded,
    });
    onContinue();
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] mb-1">
            Step 2 — Brand Analysis
          </div>
          <h2 className="font-display text-3xl md:text-4xl">
            {brandAnalysis.companyName || 'Your Brand'}
          </h2>
          {brandAnalysis.tagline && (
            <p className="text-[15px] text-[color:var(--text-secondary)] italic mt-1 max-w-2xl">
              “{brandAnalysis.tagline}”
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}>
              {brandAnalysis.brandTone}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[color:var(--text-secondary)]">
              {brandAnalysis.industryCategory}
            </span>
            <span className="text-[12px] text-[color:var(--text-muted)]">
              from <span className="underline">{url.replace(/^https?:\/\//, '')}</span>
            </span>
          </div>
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

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Field
          label="Value Proposition"
          value={brandAnalysis.valueProposition}
          onChange={(v) => onUpdateAnalysis({ valueProposition: v })}
          multiline
          icon={<Sparkles className="w-3 h-3" />}
        />
        <Field
          label="Target Customer"
          value={brandAnalysis.targetCustomer}
          onChange={(v) => onUpdateAnalysis({ targetCustomer: v })}
          icon={<Target className="w-3 h-3" />}
        />
        <Field
          label="Visual Style"
          value={brandAnalysis.visualStyle}
          onChange={(v) => onUpdateAnalysis({ visualStyle: v })}
          icon={<Palette className="w-3 h-3" />}
        />
        <Field
          label="Typography Notes"
          value={brandAnalysis.typographyNotes}
          onChange={(v) => onUpdateAnalysis({ typographyNotes: v })}
          icon={<Type className="w-3 h-3" />}
        />
        <div className="md:col-span-2">
          <Field
            label="Design Direction"
            value={brandAnalysis.designDirection}
            onChange={(v) => onUpdateAnalysis({ designDirection: v })}
            multiline
            icon={<PackageIcon className="w-3 h-3" />}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="panel-card p-5 md:col-span-2">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-3">
            Messaging Signals
          </div>
          <div className="flex flex-wrap gap-2">
            {brandAnalysis.messagingSignals?.length ? (
              brandAnalysis.messagingSignals.map((m, i) => (
                <span
                  key={i}
                  className="text-[12px] px-2.5 py-1 rounded-full bg-[color:var(--bg)] border hairline"
                >
                  {m}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-[color:var(--text-muted)]">No signals extracted.</span>
            )}
          </div>
        </div>
        <div className="panel-card p-5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-3">
            Recommended Box
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-md border flex items-center justify-center ${
                brandAnalysis.recommendedBoxColor === 'kraft'
                  ? 'kraft-chip'
                  : 'white-chip'
              }`}
            >
              <PackageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[13px] font-medium capitalize">
                {brandAnalysis.recommendedBoxColor} corrugated
              </div>
              <div className="text-[11px] text-[color:var(--text-muted)]">
                Black ink only
              </div>
              <div className="mt-2 flex gap-1.5">
                {(['kraft', 'white'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateAnalysis({ recommendedBoxColor: c })}
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      brandAnalysis.recommendedBoxColor === c
                        ? 'bg-[color:var(--ink-black)] text-white border-[color:var(--ink-black)]'
                        : 'btn-ghost'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-display text-xl">Business Snapshot</h3>
          <span className="text-[11px] text-[color:var(--text-muted)]">
            (Helps us tailor ROI + pricing later)
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Monthly Box Volume
            </span>
            <div className="relative">
              <Boxes className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input
                type="number"
                min={0}
                placeholder="500"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="input-field w-full h-10 pl-9 pr-3 text-[14px]"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Current Cost / Box
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] text-[13px]">$</span>
              <input
                type="number"
                step="0.01"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="input-field w-full h-10 pl-7 pr-3 text-[14px]"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Currently Branded?
            </span>
            <div className="flex gap-2 h-10 items-center">
              {(
                [
                  ['Yes', true],
                  ['No', false],
                ] as const
              ).map(([label, val]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setBranded(val)}
                  className={`flex-1 h-10 rounded-md border text-[13px] ${
                    branded === val
                      ? 'bg-[color:var(--ink-black)] text-white border-[color:var(--ink-black)]'
                      : 'btn-ghost'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </label>
        </div>
        {vol >= 5000 && (
          <div
            className="mt-4 text-[13px] px-3 py-2 rounded-md border flex items-center justify-between"
            style={{ background: 'var(--accent-light)', borderColor: '#e9c6b2' }}
          >
            <span>
              <strong>You qualify for volume pricing.</strong> Let&apos;s get you a custom quote.
            </span>
            <a
              href={CUSTOMBOXES_LINKS.largeOrderQuote}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] underline font-medium"
              style={{ color: 'var(--accent-dark)' }}
            >
              Request a quote →
            </a>
          </div>
        )}
        <p className="text-[12px] text-[color:var(--text-muted)] mt-3">
          Shipping 5,000+ boxes / month?{' '}
          <a
            href={CUSTOMBOXES_LINKS.largeOrderQuote}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Get a custom quote →
          </a>
        </p>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary h-11 px-5 rounded-[10px] text-[14px] font-medium flex items-center gap-2"
        >
          Continue to Box Selection
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
