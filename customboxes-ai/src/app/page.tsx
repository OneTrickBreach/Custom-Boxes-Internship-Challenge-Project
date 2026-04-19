'use client';
import { useReducer, useRef, useState, useCallback, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Header } from '../components/Header';
import { StepIndicator } from '../components/StepIndicator';
import { Step1UrlInput } from '../components/Step1_UrlInput';
import { Step2BrandAnalysis } from '../components/Step2_BrandAnalysis';
import { Step3BoxSize } from '../components/Step3_BoxSize';
import { Step4DesignGen } from '../components/Step4_DesignGen';
import { Step5DesignEditor } from '../components/Step5_DesignEditor';
import { ROICalculator } from '../components/ROICalculator';
import { AIChat } from '../components/AIChat';
import { CUSTOMBOXES_LINKS } from '../lib/constants';
import type {
  AppState,
  BrandAnalysis,
  BoxRecommendation,
  BoxSize,
  DesignLayout,
  SizingAnswers,
  BrandBusinessInfo,
} from '../lib/types';

type Action =
  | { type: 'SET_URL'; url: string }
  | { type: 'SET_NOTES'; notes: string }
  | { type: 'SET_LOGO'; dataUrl: string | null; fileName: string | null }
  | { type: 'SET_LOADING'; loading: boolean; message?: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_BRAND'; brand: BrandAnalysis }
  | { type: 'UPDATE_BRAND'; patch: Partial<BrandAnalysis> }
  | { type: 'SET_BUSINESS'; info: BrandBusinessInfo }
  | { type: 'SET_BOX_KNOWN'; known: boolean | null }
  | { type: 'SET_SELECTED_BOX'; box: BoxSize | null }
  | { type: 'SET_SIZING'; answers: SizingAnswers }
  | { type: 'SET_RECOMMENDATION'; rec: BoxRecommendation }
  | { type: 'SET_DESIGN'; design: DesignLayout; pushHistory?: boolean }
  | { type: 'UNDO_DESIGN' };

const initialState: AppState = {
  currentStep: 1,
  url: '',
  additionalNotes: '',
  logoDataUrl: null,
  logoFileName: null,
  brandAnalysis: null,
  businessInfo: null,
  boxSizeKnown: null,
  selectedBoxSize: null,
  sizingAnswers: null,
  boxRecommendation: null,
  designLayout: null,
  designHistory: [],
  roiData: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
  chatMessages: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_URL':
      return { ...state, url: action.url };
    case 'SET_NOTES':
      return { ...state, additionalNotes: action.notes };
    case 'SET_LOGO':
      return { ...state, logoDataUrl: action.dataUrl, logoFileName: action.fileName };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
        loadingMessage: action.message || '',
        error: action.loading ? null : state.error,
      };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false, loadingMessage: '' };
    case 'SET_STEP':
      return { ...state, currentStep: action.step, error: null };
    case 'SET_BRAND':
      return { ...state, brandAnalysis: action.brand };
    case 'UPDATE_BRAND':
      return {
        ...state,
        brandAnalysis: state.brandAnalysis
          ? { ...state.brandAnalysis, ...action.patch }
          : null,
      };
    case 'SET_BUSINESS':
      return { ...state, businessInfo: action.info };
    case 'SET_BOX_KNOWN':
      return {
        ...state,
        boxSizeKnown: action.known,
        selectedBoxSize:
          action.known === false ? null : state.selectedBoxSize,
        boxRecommendation:
          action.known === true ? null : state.boxRecommendation,
      };
    case 'SET_SELECTED_BOX':
      return { ...state, selectedBoxSize: action.box };
    case 'SET_SIZING':
      return { ...state, sizingAnswers: action.answers };
    case 'SET_RECOMMENDATION':
      return {
        ...state,
        boxRecommendation: action.rec,
        selectedBoxSize: action.rec.primaryBox,
      };
    case 'SET_DESIGN': {
      const history = action.pushHistory && state.designLayout
        ? [...state.designHistory, state.designLayout]
        : state.designHistory;
      return { ...state, designLayout: action.design, designHistory: history };
    }
    case 'UNDO_DESIGN': {
      if (state.designHistory.length === 0) return state;
      const prev = state.designHistory[state.designHistory.length - 1];
      return {
        ...state,
        designLayout: prev,
        designHistory: state.designHistory.slice(0, -1),
      };
    }
    default:
      return state;
  }
}

function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  // Ensure viewBox is set (for img rendering compatibility).
  if (!clone.getAttribute('viewBox')) {
    const vb = svg.viewBox.baseVal;
    if (vb && vb.width && vb.height) {
      clone.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
    }
  }
  // Inline a background rect so exported SVG isn't transparent.
  const vb = svg.viewBox.baseVal;
  if (vb) {
    // The SVG already paints its own background rect as the first <rect>,
    // but add an explicit bgcolor too for PDF renderers.
    clone.setAttribute('style', 'background:#FAFAF8;');
  }
  // Rewrite any CSS-variable font-family on <text> nodes to static names so
  // the file renders outside the app.
  const texts = clone.querySelectorAll('text');
  texts.forEach((t) => {
    const ff = t.getAttribute('font-family') || '';
    if (ff.includes('--font-dm-serif')) {
      t.setAttribute('font-family', '"DM Serif Display", "Times New Roman", serif');
    } else if (ff.includes('--font-dm-sans') || ff.startsWith('var(')) {
      t.setAttribute('font-family', '"DM Sans", Arial, sans-serif');
    }
  });
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent =
    'text{font-family:"DM Sans",Arial,sans-serif;}text[font-family*="serif" i]{font-family:"DM Serif Display","Times New Roman",serif;}';
  clone.insertBefore(styleEl, clone.firstChild);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1500);
}

function downloadSvgFile(svg: SVGSVGElement, filename: string) {
  const str = serializeSvg(svg);
  const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}

async function downloadPngFile(svg: SVGSVGElement, filename: string, scale = 2) {
  const str = serializeSvg(svg);
  // Use a data URL instead of blob URL — works around cross-origin tainting
  // in some browsers when the SVG embeds data: images (like the user logo).
  const dataUrl =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(str);
  const img = new Image();
  const vb = svg.viewBox.baseVal;
  const w = Math.max(100, (vb?.width || svg.clientWidth || 900) * scale);
  const h = Math.max(100, (vb?.height || svg.clientHeight || 600) * scale);
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    });
  } catch (err) {
    console.error('PNG export: image failed to load', err);
    alert(
      'PNG export failed — your browser may have blocked the embedded image. Try the SVG download instead.',
    );
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    alert('PNG export failed — canvas is unavailable.');
    return;
  }
  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    );
    if (!blob) {
      alert('PNG export failed — canvas could not produce an image.');
      return;
    }
    const pngUrl = URL.createObjectURL(blob);
    triggerDownload(pngUrl, filename);
  } catch (err) {
    console.error('PNG export: toBlob failed', err);
    alert(
      'PNG export failed. This can happen if the SVG embeds an external image. Try the SVG download instead.',
    );
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [roiOpen, setRoiOpen] = useState(false);
  const [step4LogoScale, setStep4LogoScale] = useState(1);
  const [step4LogoSides, setStep4LogoSides] = useState<1 | 2 | 4>(1);
  const [demoMode, setDemoMode] = useState(false);

  // The main flattened-layout SVG ref. Forwarded down into Step4/Step5 so
  // downloads always grab the right element regardless of DOM shape.
  const mainSvgRef = useRef<SVGSVGElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Initial demo mode check + keep refreshing if any response flips it.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setDemoMode(Boolean(d?.demoMode));
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, []);

  const noteFallback = useCallback((data: unknown) => {
    if (
      data &&
      typeof data === 'object' &&
      (data as { __demo?: boolean }).__demo === true
    ) {
      setDemoMode(true);
    }
  }, []);

  const analyzeBrand = useCallback(async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || state.url;
    dispatch({ type: 'SET_LOADING', loading: true, message: `Analyzing ${targetUrl}… Scanning brand signals…` });
    try {
      const res = await fetch('/api/analyze-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          additionalNotes: state.additionalNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Analysis failed.');
      }
      noteFallback(data);
      dispatch({ type: 'SET_BRAND', brand: data as BrandAnalysis });
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ type: 'SET_STEP', step: 2 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed.';
      dispatch({ type: 'SET_ERROR', error: message });
    }
  }, [state.url, state.additionalNotes, noteFallback]);

  const requestRecommendation = useCallback(
    async (answers: SizingAnswers) => {
      if (!state.brandAnalysis) return;
      dispatch({ type: 'SET_LOADING', loading: true, message: 'Finding your perfect box size…' });
      try {
        const res = await fetch('/api/recommend-box', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sizingAnswers: answers,
            brandAnalysis: state.brandAnalysis,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Recommendation failed.');
        noteFallback(data);
        dispatch({ type: 'SET_RECOMMENDATION', rec: data as BoxRecommendation });
        dispatch({ type: 'SET_LOADING', loading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Recommendation failed.';
        dispatch({ type: 'SET_ERROR', error: message });
      }
    },
    [state.brandAnalysis, noteFallback],
  );

  const generateDesign = useCallback(
    async (overrideBoxColor?: 'kraft' | 'white') => {
      const box = state.selectedBoxSize || state.boxRecommendation?.primaryBox;
      if (!box || !state.brandAnalysis) return;
      const boxColor =
        overrideBoxColor ||
        state.boxRecommendation?.boxColor ||
        state.brandAnalysis.recommendedBoxColor;
      const ectRating = state.boxRecommendation?.ectRating || '32 ECT';
      dispatch({ type: 'SET_LOADING', loading: true, message: 'Designing your packaging layout…' });
      try {
        const res = await fetch('/api/generate-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandAnalysis: state.brandAnalysis,
            box,
            boxColor,
            ectRating,
            hasLogo: !!state.logoDataUrl,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Design failed.');
        noteFallback(data);
        dispatch({ type: 'SET_DESIGN', design: data as DesignLayout });
        dispatch({ type: 'SET_LOADING', loading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Design failed.';
        dispatch({ type: 'SET_ERROR', error: message });
      }
    },
    [
      state.selectedBoxSize,
      state.boxRecommendation,
      state.brandAnalysis,
      state.logoDataUrl,
      noteFallback,
    ],
  );

  const refineDesign = useCallback(
    async (userPrompt: string) => {
      const box = state.selectedBoxSize || state.boxRecommendation?.primaryBox;
      if (!box || !state.brandAnalysis || !state.designLayout) return;
      dispatch({ type: 'SET_LOADING', loading: true, message: 'Applying your changes…' });
      try {
        const res = await fetch('/api/refine-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandAnalysis: state.brandAnalysis,
            box,
            boxColor: state.designLayout.boxColor,
            currentDesign: state.designLayout,
            userPrompt,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Refine failed.');
        noteFallback(data);
        dispatch({ type: 'SET_DESIGN', design: data as DesignLayout, pushHistory: true });
        dispatch({ type: 'SET_LOADING', loading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Refine failed.';
        dispatch({ type: 'SET_ERROR', error: message });
      }
    },
    [
      state.selectedBoxSize,
      state.boxRecommendation,
      state.brandAnalysis,
      state.designLayout,
      noteFallback,
    ],
  );

  const findExportSvg = (): SVGSVGElement | null => {
    // 1) Prefer the tagged main SVG via data attribute — reliable regardless of DOM shape.
    const byAttr = document.querySelector<SVGSVGElement>(
      'svg[data-export-target="main"]',
    );
    if (byAttr) return byAttr;
    // 2) Fallback to the ref.
    if (mainSvgRef.current) return mainSvgRef.current;
    // 3) Last resort: first viewBox svg in the current step's section.
    return (
      rootRef.current?.querySelector<SVGSVGElement>('section svg[viewBox]') ||
      null
    );
  };

  const handleDownloadSvg = () => {
    const svg = findExportSvg();
    if (!svg) {
      alert('No design to download yet — please generate one first.');
      return;
    }
    const box = state.selectedBoxSize;
    const name = box
      ? `customboxes-${box.name.replace(/×/g, 'x')}.svg`
      : 'customboxes-design.svg';
    try {
      downloadSvgFile(svg, name);
    } catch (err) {
      console.error('SVG download failed', err);
      alert('SVG download failed. Check the browser console for details.');
    }
  };

  const handleDownloadPng = async () => {
    const svg = findExportSvg();
    if (!svg) {
      alert('No design to download yet — please generate one first.');
      return;
    }
    const box = state.selectedBoxSize;
    const name = box
      ? `customboxes-${box.name.replace(/×/g, 'x')}.png`
      : 'customboxes-design.png';
    await downloadPngFile(svg, name);
  };

  return (
    <div className="flex-1 flex flex-col" ref={rootRef}>
      <Header demoMode={demoMode} />
      {state.currentStep > 1 && (
        <StepIndicator
          currentStep={state.currentStep}
          onStepClick={(step) => dispatch({ type: 'SET_STEP', step })}
        />
      )}

      <main className="flex-1">
        {state.currentStep === 1 && (
          <Step1UrlInput
            url={state.url}
            additionalNotes={state.additionalNotes}
            logoDataUrl={state.logoDataUrl}
            logoFileName={state.logoFileName}
            isLoading={state.isLoading}
            loadingMessage={state.loadingMessage}
            error={state.error}
            onChangeUrl={(v) => dispatch({ type: 'SET_URL', url: v })}
            onChangeNotes={(v) => dispatch({ type: 'SET_NOTES', notes: v })}
            onLogoChange={(dataUrl, fileName) =>
              dispatch({ type: 'SET_LOGO', dataUrl, fileName })
            }
            onSubmit={analyzeBrand}
          />
        )}

        {state.currentStep === 2 && state.brandAnalysis && (
          <Step2BrandAnalysis
            url={state.url}
            brandAnalysis={state.brandAnalysis}
            businessInfo={state.businessInfo}
            onUpdateAnalysis={(patch) => dispatch({ type: 'UPDATE_BRAND', patch })}
            onUpdateBusiness={(info) => dispatch({ type: 'SET_BUSINESS', info })}
            onBack={() => dispatch({ type: 'SET_STEP', step: 1 })}
            onContinue={() => dispatch({ type: 'SET_STEP', step: 3 })}
          />
        )}

        {state.currentStep === 3 && state.brandAnalysis && (
          <Step3BoxSize
            brandAnalysis={state.brandAnalysis}
            boxSizeKnown={state.boxSizeKnown}
            selectedBoxSize={state.selectedBoxSize}
            sizingAnswers={state.sizingAnswers}
            boxRecommendation={state.boxRecommendation}
            isLoading={state.isLoading}
            loadingMessage={state.loadingMessage}
            error={state.error}
            onSetBoxSizeKnown={(known) =>
              dispatch({ type: 'SET_BOX_KNOWN', known })
            }
            onSelectBoxSize={(b) =>
              dispatch({ type: 'SET_SELECTED_BOX', box: b })
            }
            onSizingAnswers={(a) => dispatch({ type: 'SET_SIZING', answers: a })}
            onBack={() => {
              if (state.boxSizeKnown !== null) {
                dispatch({ type: 'SET_BOX_KNOWN', known: null });
              } else {
                dispatch({ type: 'SET_STEP', step: 2 });
              }
            }}
            onContinue={() => {
              if (state.selectedBoxSize) {
                dispatch({ type: 'SET_STEP', step: 4 });
              }
            }}
            onRequestRecommendation={requestRecommendation}
          />
        )}

        {state.currentStep === 4 &&
          state.brandAnalysis &&
          state.selectedBoxSize && (
            <Step4DesignGen
              mainSvgRef={mainSvgRef}
              box={state.selectedBoxSize}
              brandAnalysis={state.brandAnalysis}
              boxRecommendation={state.boxRecommendation}
              design={state.designLayout}
              logoDataUrl={state.logoDataUrl}
              isLoading={state.isLoading}
              loadingMessage={state.loadingMessage}
              error={state.error}
              onGenerate={generateDesign}
              onBack={() => dispatch({ type: 'SET_STEP', step: 3 })}
              onContinue={() => dispatch({ type: 'SET_STEP', step: 5 })}
              onDownloadSvg={handleDownloadSvg}
              onDownloadPng={handleDownloadPng}
              initialLogoScale={step4LogoScale}
              initialLogoSides={step4LogoSides}
              onChangeLogoScale={setStep4LogoScale}
              onChangeLogoSides={setStep4LogoSides}
            />
          )}

        {state.currentStep === 5 &&
          state.brandAnalysis &&
          state.selectedBoxSize && (
            <Step5DesignEditor
              mainSvgRef={mainSvgRef}
              box={state.selectedBoxSize}
              brandAnalysis={state.brandAnalysis}
              boxRecommendation={state.boxRecommendation}
              design={state.designLayout}
              designHistory={state.designHistory}
              logoDataUrl={state.logoDataUrl}
              isLoading={state.isLoading}
              loadingMessage={state.loadingMessage}
              error={state.error}
              onRefine={refineDesign}
              onUndo={() => dispatch({ type: 'UNDO_DESIGN' })}
              onBack={() => dispatch({ type: 'SET_STEP', step: 4 })}
              onDownloadSvg={handleDownloadSvg}
              onDownloadPng={handleDownloadPng}
            />
          )}
      </main>

      <footer className="border-t hairline bg-white mt-6">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[color:var(--text-secondary)]">
          <div>
            Powered by{' '}
            <a
              href={CUSTOMBOXES_LINKS.home}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              CustomBoxes.io
            </a>{' '}
            — custom shipping boxes for small businesses.
          </div>
          <div className="flex gap-4">
            <a
              href={CUSTOMBOXES_LINKS.roi}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--text-primary)]"
            >
              ROI Calculator
            </a>
            <a
              href={CUSTOMBOXES_LINKS.refundPolicy}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--text-primary)]"
            >
              Refund Policy
            </a>
            <a
              href={CUSTOMBOXES_LINKS.largeOrderQuote}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--text-primary)]"
            >
              Large Orders
            </a>
          </div>
        </div>
      </footer>

      {state.currentStep >= 2 && (
        <button
          type="button"
          onClick={() => setRoiOpen(true)}
          aria-label="Open ROI calculator"
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 40,
            height: 40,
            paddingLeft: 14,
            paddingRight: 16,
            borderRadius: 9999,
            background: '#FFFFFF',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 12,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          <Calculator
            width={16}
            height={16}
            strokeWidth={2}
            style={{ color: 'var(--accent)', flex: '0 0 auto' }}
          />
          <span>ROI</span>
        </button>
      )}

      <ROICalculator
        open={roiOpen}
        onClose={() => setRoiOpen(false)}
        businessInfo={state.businessInfo}
        brandAnalysis={state.brandAnalysis}
      />

      <AIChat
        brandAnalysis={state.brandAnalysis}
        boxRecommendation={state.boxRecommendation}
        selectedBoxSize={state.selectedBoxSize}
        design={state.designLayout}
      />
    </div>
  );
}
