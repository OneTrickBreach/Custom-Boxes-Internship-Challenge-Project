'use client';
import { useMemo, useState } from 'react';
import { DollarSign, X, Calculator, TrendingUp } from 'lucide-react';
import { CUSTOMBOXES_LINKS, estimateCustomBoxPrice } from '../lib/constants';
import type { BrandAnalysis, BrandBusinessInfo } from '../lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  businessInfo: BrandBusinessInfo | null;
  brandAnalysis: BrandAnalysis | null;
}

function currency(n: number) {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
function currency2(n: number) {
  return `$${n.toFixed(2)}`;
}

export function ROICalculator({
  open,
  onClose,
  businessInfo,
  brandAnalysis,
}: Props) {
  const [volume, setVolume] = useState<number>(
    businessInfo?.monthlyVolume || 500,
  );
  const [plainCost, setPlainCost] = useState<number>(
    businessInfo?.currentCostPerBox || 0.5,
  );
  const [brandSpend, setBrandSpend] = useState<number>(
    businessInfo?.usesBrandedPackaging ? 150 : 0,
  );

  const stats = useMemo(() => {
    const customPrice = estimateCustomBoxPrice(volume);
    const plainMonthly = volume * plainCost + brandSpend;
    const customMonthly = volume * customPrice;
    const monthlyDiff = plainMonthly - customMonthly;
    const setupCost = 300; // plate / setup fee estimate
    const breakEvenMonths =
      monthlyDiff > 0 ? Math.ceil(setupCost / monthlyDiff) : 0;
    const annualCustomCost = customMonthly * 12;
    const annualSavings = monthlyDiff * 12;
    return {
      customPrice,
      plainMonthly,
      customMonthly,
      monthlyDiff,
      breakEvenMonths,
      annualCustomCost,
      annualSavings,
    };
  }, [volume, plainCost, brandSpend]);

  if (!open) return null;

  const competitor =
    brandAnalysis?.industryCategory?.toLowerCase().includes('apparel')
      ? 'Allbirds'
      : brandAnalysis?.industryCategory?.toLowerCase().includes('cosmetic')
        ? 'Glossier'
        : brandAnalysis?.industryCategory?.toLowerCase().includes('food')
          ? 'Magic Spoon'
          : 'industry leaders like Bombas';

  const maxBar = Math.max(stats.plainMonthly, stats.customMonthly, 1);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ml-auto w-full max-w-md h-full bg-white border-l hairline overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 bg-white border-b hairline px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator
              className="w-4 h-4"
              style={{ color: 'var(--accent)' }}
            />
            <span className="font-display text-lg">ROI Calculator</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md btn-ghost flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="panel-card p-4 space-y-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                Monthly Box Volume
              </span>
              <input
                type="number"
                min={0}
                value={volume}
                onChange={(e) =>
                  setVolume(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="input-field h-9 px-3 text-[13px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                Current Plain Cost / Box
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] text-[13px]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={plainCost}
                  onChange={(e) => setPlainCost(parseFloat(e.target.value) || 0)}
                  className="input-field h-9 pl-6 pr-3 text-[13px]"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                Monthly Brand Materials Spend (tape, inserts, stickers)
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] text-[13px]">$</span>
                <input
                  type="number"
                  min={0}
                  value={brandSpend}
                  onChange={(e) => setBrandSpend(parseFloat(e.target.value) || 0)}
                  className="input-field h-9 pl-6 pr-3 text-[13px]"
                />
              </div>
            </label>
          </div>

          <div className="panel-card p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-3">
              Monthly Comparison
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="text-[color:var(--text-secondary)]">
                    Plain box + brand materials
                  </span>
                  <span className="font-medium">
                    {currency(stats.plainMonthly)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--bg)] overflow-hidden">
                  <div
                    style={{
                      width: `${(stats.plainMonthly / maxBar) * 100}%`,
                      background: 'var(--border-strong)',
                    }}
                    className="h-2"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="text-[color:var(--text-secondary)]">
                    Custom branded box (CustomBoxes.io)
                  </span>
                  <span className="font-medium">
                    {currency(stats.customMonthly)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--bg)] overflow-hidden">
                  <div
                    style={{
                      width: `${(stats.customMonthly / maxBar) * 100}%`,
                      background: 'var(--accent)',
                    }}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t hairline pt-3">
              <div>
                <div className="text-[11px] text-[color:var(--text-secondary)]">
                  Price / box at this volume
                </div>
                <div className="font-display text-xl">
                  {currency2(stats.customPrice)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[color:var(--text-secondary)]">
                  Break-even
                </div>
                <div className="font-display text-xl">
                  {stats.breakEvenMonths > 0
                    ? `${stats.breakEvenMonths} mo`
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[color:var(--text-secondary)]">
                  Annual spend (custom)
                </div>
                <div className="font-display text-xl">
                  {currency(stats.annualCustomCost)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[color:var(--text-secondary)]">
                  Annual savings vs plain
                </div>
                <div
                  className="font-display text-xl"
                  style={{
                    color:
                      stats.annualSavings >= 0 ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {stats.annualSavings >= 0
                    ? currency(stats.annualSavings)
                    : `-${currency(Math.abs(stats.annualSavings))}`}
                </div>
              </div>
            </div>
          </div>

          <div
            className="panel-card p-4"
            style={{ background: 'var(--accent-light)', borderColor: '#e9c6b2' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-dark)' }} />
              <div className="text-[13px] font-medium">Comp Shop</div>
            </div>
            <p className="text-[12px] leading-relaxed">
              Brands similar to yours — like{' '}
              <strong>{competitor}</strong> — invest in custom packaging to drive
              unboxing share, repeat purchase, and retention. Even without the
              brand lift, volume tiers often pay for themselves within a few
              months.
            </p>
          </div>

          {volume >= 5000 ? (
            <a
              href={CUSTOMBOXES_LINKS.largeOrderQuote}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full h-10 rounded-md text-[13px] font-medium flex items-center justify-center gap-2"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Request a Volume Quote
            </a>
          ) : (
            <a
              href={CUSTOMBOXES_LINKS.roi}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full h-10 rounded-md text-[13px] font-medium flex items-center justify-center gap-2"
            >
              Open Full ROI Calculator on CustomBoxes.io →
            </a>
          )}

          <p className="text-[11px] text-[color:var(--text-muted)] text-center pb-6">
            Volume tier pricing is an estimate. Get exact pricing on customboxes.io.
          </p>
        </div>
      </div>
    </div>
  );
}
