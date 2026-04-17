'use client';
import { useRef, useState } from 'react';
import { Upload, ArrowRight, X, Sparkles, Link2 } from 'lucide-react';
import { EXAMPLE_URLS } from '../lib/constants';

interface Props {
  url: string;
  additionalNotes: string;
  logoDataUrl: string | null;
  logoFileName: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onChangeUrl: (v: string) => void;
  onChangeNotes: (v: string) => void;
  onLogoChange: (dataUrl: string | null, name: string | null) => void;
  onSubmit: (url: string) => void;
}

export function Step1UrlInput({
  url,
  additionalNotes,
  logoDataUrl,
  logoFileName,
  isLoading,
  loadingMessage,
  error,
  onChangeUrl,
  onChangeNotes,
  onLogoChange,
  onSubmit,
}: Props) {
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.match(/(png|jpeg|jpg|svg\+xml)/)) {
      setLocalError('Please upload a .png, .jpg, or .svg file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onLogoChange(reader.result as string, file.name);
      setLocalError(null);
    };
    reader.readAsDataURL(file);
  };

  const normalizeUrl = (v: string) => {
    const t = v.trim();
    if (!t) return '';
    if (/^https?:\/\//i.test(t)) return t;
    return `https://${t}`;
  };

  const handleSubmit = () => {
    const normalized = normalizeUrl(url);
    if (!/^https?:\/\/.+\..+/.test(normalized)) {
      setLocalError('Please enter a valid company URL (e.g. https://yourcompany.com).');
      return;
    }
    setLocalError(null);
    onChangeUrl(normalized);
    onSubmit(normalized);
  };

  const combinedError = localError || error;

  return (
    <section className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] mb-4">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          AI-Powered Packaging Design
        </div>
        <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">
          Design a shipping box that looks like your brand.
        </h1>
        <p className="text-[15px] text-[color:var(--text-secondary)] max-w-xl mx-auto">
          Paste your company URL. We&apos;ll analyze your brand, recommend a box size, and generate a print-ready black-ink design on kraft or white corrugated.
        </p>
      </div>

      <div className="panel-card p-6 md:p-8">
        <label className="block text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-2">
          Company Website
        </label>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 relative">
            <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Enter your company website URL"
              className="input-field w-full h-12 pl-9 pr-3 text-[15px]"
              value={url}
              onChange={(e) => onChangeUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !url.trim()}
            className="btn-primary h-12 px-5 rounded-[10px] text-[14px] font-medium flex items-center gap-2 whitespace-nowrap"
          >
            {isLoading ? 'Analyzing…' : 'Analyze My Brand'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[12px] text-[color:var(--text-muted)]">Try:</span>
          {EXAMPLE_URLS.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onChangeUrl(u)}
              className="text-[12px] px-2.5 py-1 rounded-full chip"
            >
              {u.replace('https://', '')}
            </button>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-2">
              Upload Your Logo <span className="text-[color:var(--text-muted)] normal-case tracking-normal">(optional)</span>
            </label>
            {logoDataUrl ? (
              <div className="border hairline rounded-[10px] p-3 flex items-center gap-3 bg-white">
                <div className="w-14 h-14 rounded-md bg-[color:var(--bg)] flex items-center justify-center overflow-hidden border hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoDataUrl}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{logoFileName}</div>
                  <div className="text-[11px] text-[color:var(--text-muted)]">Logo ready</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogoChange(null, null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="w-7 h-7 rounded-md btn-ghost flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed rounded-[10px] px-4 py-5 text-[13px] text-[color:var(--text-secondary)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-light)] transition-colors flex items-center gap-3 justify-center"
                style={{ borderColor: 'var(--border-strong)' }}
              >
                <Upload className="w-4 h-4" />
                Upload .png, .jpg, or .svg
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-[color:var(--text-secondary)] mb-2">
              Additional Brand Notes <span className="text-[color:var(--text-muted)] normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="E.g. we just rebranded, please emphasize sustainability."
              className="input-field w-full p-3 text-[13px] resize-none"
              value={additionalNotes}
              onChange={(e) => onChangeNotes(e.target.value)}
            />
          </div>
        </div>

        {combinedError && (
          <div className="mt-5 text-[13px] px-3 py-2 rounded-md border" style={{ background: '#fff4f2', borderColor: '#f3c9c2', color: 'var(--danger)' }}>
            {combinedError}
          </div>
        )}

        {isLoading && loadingMessage && (
          <div className="mt-5 text-[13px] text-[color:var(--text-secondary)] flex items-center gap-2">
            <span className="inline-flex gap-1">
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
            </span>
            {loadingMessage}
          </div>
        )}
      </div>

      <p className="text-center text-[12px] text-[color:var(--text-muted)] mt-6">
        Your URL is analyzed once — we don&apos;t store it. All designs are black-ink only, ready for corrugated print.
      </p>
    </section>
  );
}
