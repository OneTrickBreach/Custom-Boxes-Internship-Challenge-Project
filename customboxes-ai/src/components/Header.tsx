'use client';
import { Package, Sparkles } from 'lucide-react';
import { CUSTOMBOXES_LINKS } from '../lib/constants';

export function Header({ demoMode = false }: { demoMode?: boolean }) {
  return (
    <header className="w-full border-b hairline bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a
          href={CUSTOMBOXES_LINKS.home}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group"
        >
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-md"
            style={{ background: 'var(--accent)' }}
          >
            <Package className="w-4 h-4 text-white" strokeWidth={2.2} />
          </span>
          <span className="font-semibold text-[15px] tracking-tight">
            <span style={{ color: 'var(--accent)' }}>Custom</span>
            <span>Boxes.io</span>
          </span>
          <span className="hidden md:inline text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] border-l hairline pl-3 ml-1">
            AI Packaging Designer
          </span>
          {demoMode && (
            <span
              title="Demo mode: responses are simulated and do not call the Anthropic API."
              className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border"
              style={{
                background: 'var(--accent-light)',
                borderColor: '#e9c6b2',
                color: 'var(--accent-dark)',
              }}
            >
              <Sparkles className="w-3 h-3" />
              Demo Mode
            </span>
          )}
        </a>
        <nav className="flex items-center gap-5 text-[13px] text-[color:var(--text-secondary)]">
          <a
            href={CUSTOMBOXES_LINKS.roi}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[color:var(--text-primary)] transition-colors hidden sm:inline"
          >
            ROI Calculator
          </a>
          <a
            href={CUSTOMBOXES_LINKS.largeOrderQuote}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[color:var(--text-primary)] transition-colors hidden sm:inline"
          >
            Large Orders
          </a>
          <a
            href={CUSTOMBOXES_LINKS.home}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-[12px] font-medium btn-ghost"
          >
            Visit CustomBoxes.io ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
