'use client';
import { useReducer, useRef, useState, useCallback } from 'react';
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
  // Clone and inline minimal font info
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  // Add simple style for exported font family fallbacks
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent =
    'text{font-family:"DM Sans",Arial,sans-serif;}text[font-family*="serif"]{font-family:"DM Serif Display","Times New Roman",serif;}';
  clone.insertBefore(style, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}

function downloadSvgFile(svg: SVGSVGElement, filename: string) {
  const str = serializeSvg(svg);
  const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function downloadPngFile(svg: SVGSVGElement, filename: string, scale = 2) {
  const str = serializeSvg(svg);
  const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const viewBox = svg.viewBox.baseVal;
  const w = (viewBox.width || svg.clientWidth) * scale;
  const h = (viewBox.height || svg.clientHeight) * scale;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('png render failed'));
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  canvas.toBlob((b) => {
    if (!b) return;
    const pngUrl = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(pngUrl), 500);
  }, 'image/png');
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [roiOpen, setRoiOpen] = useState(false);
  const [step4LogoScale, setStep4LogoScale] = useState(1);
  const [step4LogoSides, setStep4LogoSides] = useState<1 | 2 | 4>(1);

  // Refs for SVGs to enable export. The latest rendered SVG node is found via queryselector.
  const rootRef = useRef<HTMLDivElement>(null);

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
      dispatch({ type: 'SET_BRAND', brand: data as BrandAnalysis });
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ type: 'SET_STEP', step: 2 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed.';
      dispatch({ type: 'SET_ERROR', error: message });
    }
  }, [state.url, state.additionalNotes]);

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
        dispatch({ type: 'SET_RECOMMENDATION', rec: data as BoxRecommendation });
        dispatch({ type: 'SET_LOADING', loading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Recommendation failed.';
        dispatch({ type: 'SET_ERROR', error: message });
      }
    },
    [state.brandAnalysis],
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
    ],
  );

  const handleDownloadSvg = () => {
    // find first visible inline svg in the main design area
    const container = rootRef.current;
    if (!container) return;
    const svg = container.querySelector<SVGSVGElement>(
      'section svg[viewBox]',
    );
    if (!svg) return;
    const box = state.selectedBoxSize;
    const name = box
      ? `customboxes-${box.name.replace(/×/g, 'x')}.svg`
      : 'customboxes-design.svg';
    downloadSvgFile(svg, name);
  };

  const handleDownloadPng = () => {
    const container = rootRef.current;
    if (!container) return;
    const svg = container.querySelector<SVGSVGElement>('section svg[viewBox]');
    if (!svg) return;
    const box = state.selectedBoxSize;
    const name = box
      ? `customboxes-${box.name.replace(/×/g, 'x')}.png`
      : 'customboxes-design.png';
    downloadPngFile(svg, name);
  };

  return (
    <div className="flex-1 flex flex-col" ref={rootRef}>
      <Header />
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
          className="fixed bottom-5 left-5 z-40 h-10 px-3 rounded-full btn-ghost bg-white shadow-sm text-[12px] font-medium flex items-center gap-1.5"
        >
          <Calculator className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          ROI
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
