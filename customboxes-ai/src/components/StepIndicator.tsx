'use client';
import { Check } from 'lucide-react';
import { STEPS } from '../lib/constants';

export function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="w-full border-b hairline bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <ol className="flex items-center gap-2 md:gap-4">
          {STEPS.map((s, i) => {
            const isCompleted = currentStep > s.id;
            const isActive = currentStep === s.id;
            const isReachable = s.id <= currentStep;
            return (
              <li key={s.id} className="flex items-center gap-2 md:gap-4">
                <button
                  type="button"
                  disabled={!isReachable}
                  onClick={() => isReachable && onStepClick(s.id)}
                  className={`flex items-center gap-2 text-[13px] transition-colors ${
                    isReachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium border ${
                      isActive
                        ? 'border-transparent text-white'
                        : isCompleted
                          ? 'border-transparent text-white bg-[color:var(--ink-black)]'
                          : 'border-[color:var(--border-strong)] text-[color:var(--text-secondary)] bg-white'
                    }`}
                    style={
                      isActive ? { background: 'var(--accent)' } : undefined
                    }
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </span>
                  <span
                    className={`hidden sm:inline ${
                      isActive
                        ? 'text-[color:var(--text-primary)] font-medium'
                        : 'text-[color:var(--text-secondary)]'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span
                    className={`w-6 md:w-12 h-px ${
                      isCompleted
                        ? 'bg-[color:var(--ink-black)]'
                        : 'bg-[color:var(--border-strong)]'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
