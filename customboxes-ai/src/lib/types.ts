export interface BrandAnalysis {
  companyName: string;
  tagline: string;
  valueProposition: string;
  brandTone:
    | 'premium'
    | 'playful'
    | 'rugged'
    | 'clean'
    | 'artisan'
    | 'corporate'
    | 'eco-friendly';
  targetCustomer: string;
  visualStyle: string;
  typographyNotes: string;
  messagingSignals: string[];
  colorPalette: string[];
  recommendedBoxColor: 'kraft' | 'white';
  designDirection: string;
  industryCategory: string;
}

export interface BoxSize {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  category: 'standard' | 'popular_custom' | 'any_size';
  commonUse: string;
  priceEstimate?: string;
}

export interface BoxRecommendation {
  primaryBox: BoxSize;
  alternateBox?: BoxSize;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
  ectRating: '32 ECT' | 'Heavy Duty';
  boxColor: 'kraft' | 'white';
}

export type PanelKey = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right';

export interface DesignElement {
  type:
    | 'logo'
    | 'text'
    | 'line'
    | 'border'
    | 'icon'
    | 'qr-placeholder'
    | 'barcode-placeholder';
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'light';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface PanelDesign {
  panel: PanelKey;
  elements: DesignElement[];
}

export interface DesignLayout {
  panels: PanelDesign[];
  designNotes: string;
  inkColor: 'black';
  boxColor: 'kraft' | 'white';
}

export interface SizingAnswers {
  productDescription: string;
  productWeight: 'under5' | '5to15' | '15to30' | 'over30';
  productDimensions: string;
  quantity: number;
  fragility: 'low' | 'medium' | 'high';
  needsInserts: boolean;
  fitPreference: 'tight' | 'standard' | 'protective';
}

export interface ROIData {
  currentBoxCost: number;
  monthlyVolume: number;
  currentBrandSpend: number;
  estimatedCustomCost: number;
  monthlySavings: number;
  breakEvenMonths: number;
  competitorComparison: string;
}

export interface BrandBusinessInfo {
  monthlyVolume: number;
  currentCostPerBox: number;
  usesBrandedPackaging: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppState {
  currentStep: number;
  url: string;
  additionalNotes: string;
  logoDataUrl: string | null;
  logoFileName: string | null;
  brandAnalysis: BrandAnalysis | null;
  businessInfo: BrandBusinessInfo | null;
  boxSizeKnown: boolean | null;
  selectedBoxSize: BoxSize | null;
  sizingAnswers: SizingAnswers | null;
  boxRecommendation: BoxRecommendation | null;
  designLayout: DesignLayout | null;
  designHistory: DesignLayout[];
  roiData: ROIData | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  chatMessages: ChatMessage[];
}
