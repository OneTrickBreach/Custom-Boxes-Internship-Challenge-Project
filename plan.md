# AI Packaging Designer — Full Build Plan for Claude Code

## CONTEXT FOR CLAUDE CODE

You are building a **working prototype** of an AI Packaging Designer for **CustomBoxes.io**, an internship challenge submission. The tool takes a company URL, analyzes the brand, recommends a shipping box from predefined sizes, and generates a black-ink-only box design concept. The user will record a Loom demo of the final product.

**Time constraint**: This must be buildable in ~60 minutes. Prioritize working end-to-end flow over polish. Every feature listed as [MUST] is non-negotiable. Features listed as [NICE] are stretch goals.

---

## TECH STACK

- **Framework**: Next.js 14+ (App Router) — gives us API routes (to hide API keys) + React frontend in one project
- **Styling**: Tailwind CSS
- **AI Backend**: Anthropic Claude API (claude-sonnet-4-20250514) via `/api/` routes
- **Design Rendering**: SVG-based panel layouts (vector = actually print-ready, no image generation API needed)
- **State Management**: React useState/useReducer (no external state lib needed)
- **Deployment**: Run locally with `npm run dev` for the Loom recording. Optionally deploy to Vercel.

---

## PROJECT SETUP

```bash
npx create-next-app@latest customboxes-ai --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd customboxes-ai
npm install ai @anthropic-ai/sdk lucide-react framer-motion
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## FILE STRUCTURE

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts + global styles
│   ├── page.tsx                # Main app — single-page wizard flow
│   ├── globals.css             # Tailwind + custom CSS variables
│   └── api/
│       ├── analyze-brand/
│       │   └── route.ts        # POST: scrape URL + Claude brand analysis
│       ├── recommend-box/
│       │   └── route.ts        # POST: Claude box size recommendation
│       ├── generate-design/
│       │   └── route.ts        # POST: Claude generates SVG layout data
│       └── refine-design/
│           └── route.ts        # POST: Claude refines design from prompt
├── components/
│   ├── Header.tsx              # CustomBoxes.io branded header
│   ├── StepIndicator.tsx       # Progress steps bar
│   ├── Step1_UrlInput.tsx      # URL entry + logo upload
│   ├── Step2_BrandAnalysis.tsx # Brand analysis display + ROI questions
│   ├── Step3_BoxSize.tsx       # Known/unknown branching + recommendation
│   ├── Step4_DesignGen.tsx     # SVG box layout generation + preview
│   ├── Step5_DesignEditor.tsx  # Refinement chat + controls
│   ├── BoxLayoutSVG.tsx        # The SVG renderer for flattened box layout
│   ├── Box3DPreview.tsx        # Simple CSS 3D mockup of the box
│   ├── ROICalculator.tsx       # ROI / break-even / comp shop widget
│   └── AIChat.tsx              # Floating AI agent chat panel
├── lib/
│   ├── constants.ts            # Box catalog, size data, ECT rules
│   ├── types.ts                # TypeScript interfaces
│   ├── prompts.ts              # All Claude prompt templates
│   └── svg-templates.ts        # SVG generation helper functions
```

---

## STEP-BY-STEP BUILD ORDER

Execute these in order. Complete each fully before moving on.

---

### PHASE 1: Foundation (10 min)

#### 1.1 — Constants & Types (`src/lib/constants.ts` and `src/lib/types.ts`)

**types.ts** — Define all interfaces:

```typescript
export interface BrandAnalysis {
  companyName: string;
  tagline: string;
  valueProposition: string;
  brandTone: 'premium' | 'playful' | 'rugged' | 'clean' | 'artisan' | 'corporate' | 'eco-friendly';
  targetCustomer: string;
  visualStyle: string;
  typographyNotes: string;
  messagingSignals: string[];
  colorPalette: string[]; // extracted from site (informational only, design is B&W)
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
  priceEstimate?: string; // e.g. "$2.50-4.00/box at 250 qty"
}

export interface BoxRecommendation {
  primaryBox: BoxSize;
  alternateBox?: BoxSize;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
  ectRating: '32 ECT' | 'Heavy Duty';
  boxColor: 'kraft' | 'white';
}

export interface DesignLayout {
  panels: PanelDesign[];
  designNotes: string;
  inkColor: 'black';
  boxColor: 'kraft' | 'white';
}

export interface PanelDesign {
  panel: 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right';
  elements: DesignElement[];
}

export interface DesignElement {
  type: 'logo' | 'text' | 'line' | 'border' | 'icon' | 'qr-placeholder' | 'barcode-placeholder';
  content?: string;
  x: number;        // percentage 0-100
  y: number;        // percentage 0-100
  width?: number;   // percentage
  height?: number;  // percentage
  fontSize?: number; // in pt
  fontWeight?: 'normal' | 'bold' | 'light';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface AppState {
  currentStep: number;
  url: string;
  logoFile: File | null;
  logoDataUrl: string | null;
  brandAnalysis: BrandAnalysis | null;
  boxSizeKnown: boolean | null;
  selectedBoxSize: BoxSize | null;
  boxRecommendation: BoxRecommendation | null;
  designLayout: DesignLayout | null;
  sizingAnswers: SizingAnswers | null;
  roiData: ROIData | null;
  isLoading: boolean;
  chatMessages: ChatMessage[];
}

export interface SizingAnswers {
  productDescription: string;
  productWeight: 'under5' | '5to15' | '15to30' | 'over30';
  productDimensions: string; // approx "LxWxH"
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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

**constants.ts** — Box catalog (use real CustomBoxes.io sizes):

```typescript
import { BoxSize } from './types';

export const BOX_CATALOG: BoxSize[] = [
  // STANDARD SIZES
  { id: 'std-1', name: '6×4×4', length: 6, width: 4, height: 4, category: 'standard', commonUse: 'Small items, cosmetics, candles, small electronics' },
  { id: 'std-2', name: '8×6×4', length: 8, width: 6, height: 4, category: 'standard', commonUse: 'Books, small apparel, subscription boxes' },
  { id: 'std-3', name: '10×8×6', length: 10, width: 8, height: 6, category: 'standard', commonUse: 'Medium products, shoes, kits, bundled items' },
  { id: 'std-4', name: '12×10×4', length: 12, width: 10, height: 4, category: 'standard', commonUse: 'Flat items, apparel, documents, framed items' },
  { id: 'std-5', name: '12×12×8', length: 12, width: 12, height: 8, category: 'standard', commonUse: 'Medium to large items, small appliances, gift sets' },
  { id: 'std-6', name: '14×10×6', length: 14, width: 10, height: 6, category: 'standard', commonUse: 'Electronics, tools, medium fragile items' },

  // POPULAR CUSTOM SIZES
  { id: 'pop-1', name: '9×6×3', length: 9, width: 6, height: 3, category: 'popular_custom', commonUse: 'Apparel, flat products, light subscriptions' },
  { id: 'pop-2', name: '11×8×5', length: 11, width: 8, height: 5, category: 'popular_custom', commonUse: 'Meal kits, beauty boxes, bundled products' },
  { id: 'pop-3', name: '16×12×6', length: 16, width: 12, height: 6, category: 'popular_custom', commonUse: 'Larger kits, multi-item shipments, wholesale' },
  { id: 'pop-4', name: '18×12×8', length: 18, width: 12, height: 8, category: 'popular_custom', commonUse: 'Bulk items, heavy products, industrial goods' },

  // ANY SIZE (additional variety)
  { id: 'any-1', name: '7×5×3', length: 7, width: 5, height: 3, category: 'any_size', commonUse: 'Jewelry, small accessories, samples' },
  { id: 'any-2', name: '10×10×10', length: 10, width: 10, height: 10, category: 'any_size', commonUse: 'Cube-shaped items, ceramics, round products' },
  { id: 'any-3', name: '20×14×10', length: 20, width: 14, height: 10, category: 'any_size', commonUse: 'Large items, multipacks, equipment' },
  { id: 'any-4', name: '24×18×6', length: 24, width: 18, height: 6, category: 'any_size', commonUse: 'Large flat items, posters in tubes, artwork' },
];

export const CUSTOMBOXES_LINKS = {
  home: 'https://customboxes.io',
  roi: 'https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators',
  refundPolicy: 'https://customboxes.io/policies/refund-policy',
  largeOrderQuote: 'https://customboxes.io/pages/large-order-quote-request-form',
  standardBoxes: 'https://customboxes.io/collections/standard-shipping-boxes',
};

export const STEPS = [
  { id: 1, label: 'Enter URL' },
  { id: 2, label: 'Brand Analysis' },
  { id: 3, label: 'Box Size' },
  { id: 4, label: 'Design' },
  { id: 5, label: 'Refine & Export' },
];
```

#### 1.2 — Root Layout & Global Styles

**layout.tsx**: Import a distinctive Google Font pair. Use `DM Serif Display` for headings and `DM Sans` for body (packaging/industrial feel). Set page metadata for CustomBoxes.io AI Designer.

**globals.css**: Define CSS variables:
```css
:root {
  --kraft: #C4A265;
  --kraft-dark: #8B7240;
  --white-box: #F5F3EF;
  --ink-black: #1A1A1A;
  --accent: #D4622B; /* CustomBoxes.io orange from their site */
  --accent-light: #F0DDD0;
  --bg: #FAFAF8;
  --panel-bg: #FFFFFF;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --border: #E5E2DC;
  --success: #2D7D46;
}
```

**Aesthetic direction**: Industrial-clean. Think packaging design studio. Lots of whitespace, kraft/cardboard texture accents, sharp typography, orange accent from CustomBoxes.io branding. The page should feel like a professional packaging tool, not a toy.

#### 1.3 — Header Component

[MUST] Show CustomBoxes.io logo (text-based: "CustomBoxes.io" in brand orange with a small box icon from lucide-react). Include tagline "AI Packaging Designer". Keep it minimal — thin bar at top.

---

### PHASE 2: Step 1 — URL Input & Logo Upload (8 min)

**Step1_UrlInput.tsx**

[MUST] Features:
- Large centered input field for company URL (placeholder: "Enter your company website URL")
- URL validation (must start with http:// or https://)
- File upload button for logo (accept: .png, .jpg, .svg). Show thumbnail preview when uploaded.
- Optional: textarea for "Additional brand notes" (2-3 lines max)
- Big "Analyze My Brand" CTA button
- Below the input, show 3-4 example URLs as clickable chips for quick demo: e.g. "Try: allbirds.com, glossier.com, yeti.com, bombas.com"

**Design**: Center-stage layout. The URL input should be prominent. Use a subtle kraft-paper texture background or border to hint at packaging.

---

### PHASE 3: Step 2 — Brand Analysis (12 min)

#### 3.1 — API Route: `/api/analyze-brand/route.ts`

[MUST] This route:
1. Receives `{ url: string }` in POST body
2. Fetches the target URL's HTML content (use `fetch()` with a timeout). Strip to text content — grab `<title>`, meta description, OG tags, visible text from `<main>`, `<h1>`-`<h6>`, `<p>`, `<about>` sections. Limit to ~3000 chars.
3. Sends extracted text to Claude with this prompt (defined in `prompts.ts`):

```typescript
export const BRAND_ANALYSIS_PROMPT = `You are a packaging design consultant analyzing a company's website to make shipping box design decisions.

Given the website content below, extract the following as JSON (no markdown, no backticks, just raw JSON):

{
  "companyName": "string",
  "tagline": "string — the main tagline or value prop headline",
  "valueProposition": "string — 1-2 sentence summary of what they sell and why",
  "brandTone": "one of: premium, playful, rugged, clean, artisan, corporate, eco-friendly",
  "targetCustomer": "string — who buys from them",
  "visualStyle": "string — describe their visual aesthetic in 1 sentence",
  "typographyNotes": "string — what type of typography would suit their brand on a box",
  "messagingSignals": ["array of 3-5 short phrases/taglines from the site that could appear on packaging"],
  "colorPalette": ["array of 2-4 hex colors detected or inferred from the brand"],
  "recommendedBoxColor": "kraft or white — kraft for rugged/eco/artisan brands, white for premium/clean/medical/food",
  "designDirection": "string — 2-3 sentence recommendation for their box design approach",
  "industryCategory": "string — e.g. apparel, food, cosmetics, electronics, home goods, etc."
}

Website content:
---
{websiteContent}
---

Be specific to THIS brand. Do not give generic advice. Pull real signals from the site content.`;
```

4. Parse Claude's JSON response. Return to frontend.

**Error handling**: If URL fetch fails, return a graceful error telling user to check URL. If Claude returns invalid JSON, retry once with a stricter prompt.

#### 3.2 — Brand Analysis Display (`Step2_BrandAnalysis.tsx`)

[MUST] Show the analysis results in a clean card layout:
- Company name + tagline prominently at top
- Grid of analysis cards: Brand Tone, Target Customer, Visual Style, Design Direction
- Messaging signals as pill/tag elements
- Recommended box color shown as a visual swatch (kraft brown or white)
- "Edit" capability — user can override any field before proceeding

[MUST] Below analysis, show **ROI / Business Questions** section:
- "How many boxes do you ship per month?" (number input)
- "What do you currently pay per box?" (number input, default $0.50)
- "Do you currently use branded packaging?" (yes/no toggle)
- These feed into the ROI calculator later
- Show note: "Over 5,000 boxes/month? [Get a custom quote →](https://customboxes.io/pages/large-order-quote-request-form)"

[MUST] "Continue to Box Selection →" button

---

### PHASE 4: Step 3 — Box Size Selection (10 min)

#### 4.1 — Box Size Branching (`Step3_BoxSize.tsx`)

[MUST] First, ask: **"Do you already know your box size?"**

Two clear buttons: **"Yes, I know my size"** | **"No, help me choose"**

**If YES (known size)**:
- Show the full `BOX_CATALOG` as a filterable grid
- Three tabs: "Standard Sizes" | "Popular Custom" | "Any Size"
- Each box card shows: dimensions (L×W×H), common use description
- User clicks to select
- Show visual representation of selected box (simple 3D-ish CSS box or SVG)
- Include note + link: "Need a size not listed? [Browse all sizes on CustomBoxes.io →](https://customboxes.io)"

**If NO (unknown size)** — Show sizing questionnaire:

[MUST] Ask these questions in a conversational card-by-card flow (one at a time or as a short form):

1. **What are you shipping?** (text input — product description)
2. **Approximate product weight?**
   - Under 5 lbs
   - 5–15 lbs
   - 15–30 lbs
   - Over 30 lbs
3. **Approximate product dimensions?** (L×W×H text input, or "I'm not sure")
4. **How fragile is your product?**
   - Not fragile
   - Somewhat fragile
   - Very fragile
5. **Will you need inserts or void fill?** (Yes / No / Not sure)
6. **How should the product fit?**
   - Tight fit (minimal space)
   - Standard (some breathing room)
   - Protective (extra padding space)

#### 4.2 — API Route: `/api/recommend-box/route.ts`

[MUST] Send sizing answers + brand analysis to Claude:

```typescript
export const BOX_RECOMMENDATION_PROMPT = `You are a packaging operations expert at CustomBoxes.io.

Given the customer's product details and our available box catalog, recommend the best box.

RULES:
- You MUST pick from the provided catalog. Do NOT invent custom dimensions.
- Weight under 30 lbs = 32 ECT. Weight over 30 lbs = Heavy Duty.
- Add 1-2 inches of padding per dimension for "standard" fit, 2-3 inches for "protective" fit.
- Fragile items need more room for inserts/void fill.
- Food, pharmaceuticals, cosmetics → recommend white boxes.
- Eco brands, rugged goods, general shipping → kraft is fine.
- Pick the SMALLEST box that fits comfortably. Don't over-box.

Customer details:
{sizingAnswers}

Brand info:
{brandAnalysis}

Available box catalog:
{boxCatalog}

Return JSON only (no markdown):
{
  "primaryBoxId": "string — id from catalog",
  "alternateBoxId": "string or null — backup option",
  "confidence": "high, medium, or low",
  "rationale": "string — 2-3 sentence explanation of why this box",
  "ectRating": "32 ECT or Heavy Duty",
  "boxColor": "kraft or white"
}`;
```

#### 4.3 — Recommendation Display

[MUST] Show:
- Recommended box with dimensions, visual, and rationale
- Confidence badge (green=high, yellow=medium, red=low)
- ECT rating explanation
- Alternate box option (if provided)
- **Disclaimer**: "You are ultimately responsible for selecting the correct box size for your products. [View our return policy →](https://customboxes.io/policies/refund-policy)"
- "Use this box & design my packaging →" button

---

### PHASE 5: Step 4 — Design Generation (15 min) ⭐ CORE FEATURE

#### 5.1 — SVG Box Layout Renderer (`BoxLayoutSVG.tsx`)

[MUST] Build a reusable SVG component that renders a **flattened (unfolded) box layout** showing all 6 panels arranged in a cross/T-shape:

```
        ┌─────────┐
        │   TOP   │
  ┌─────┼─────────┼─────┬─────────┐
  │LEFT │  FRONT  │RIGHT│  BACK   │
  └─────┼─────────┼─────┴─────────┘
        │ BOTTOM  │
        └─────────┘
```

The SVG should:
- Scale panels proportionally based on actual box dimensions (L×W×H)
- Draw panel borders with dashed fold lines
- Label each panel ("TOP", "FRONT", etc.) in light gray
- Render design elements (text, logo placeholder, lines, borders) in BLACK INK ONLY
- Background = kraft color (#C4A265) or white (#F5F3EF) based on recommendation
- Include crop marks / registration marks at corners for print-readiness feel
- If user uploaded a logo, render it as an `<image>` element in the SVG at specified positions

**Panel dimension mapping** (for a box L×W×H):
- Front/Back panels: width=L, height=H
- Left/Right panels: width=W, height=H
- Top/Bottom panels: width=L, height=W

**SVG helper functions** (`svg-templates.ts`):
- `renderTextElement(element, panelX, panelY, panelW, panelH)` — positions text within a panel
- `renderLogoPlaceholder(x, y, w, h)` — draws a logo box or the actual uploaded logo
- `renderLine(x1, y1, x2, y2)` — decorative rule lines
- `renderBorder(x, y, w, h, style)` — panel border treatments

#### 5.2 — API Route: `/api/generate-design/route.ts`

[MUST] Send brand analysis + box size to Claude to get design element placement:

```typescript
export const DESIGN_GENERATION_PROMPT = `You are an expert corrugated shipping box designer. You design black-ink-only layouts for kraft and white corrugated shipping boxes.

DESIGN RULES:
- BLACK INK ONLY. No colors, no gradients, no fills other than black strokes/text.
- This is a SHIPPING box, not retail packaging. Keep it clean and professional.
- Prioritize: logo, company name, tagline, 1-2 trust signals, website URL.
- Front panel: Primary branding (logo large + company name + tagline)
- Top panel: Logo (centered, medium size) + "HANDLE WITH CARE" if fragile
- Side panels (left/right): Website URL, social handle or value prop. Keep minimal.
- Back panel: Secondary info — return address placeholder, sustainability message, or QR placeholder
- Bottom panel: Minimal — box size reference, "Printed on recycled material" or leave mostly blank
- Use RESTRAINT. White space is good. Less is more on corrugated.
- Think like a real packaging operator, not a graphic designer.
- Text hierarchy: Company name largest, tagline medium, everything else small.
- Include 1-2 thin rule lines for visual structure if appropriate.

Brand Analysis:
{brandAnalysis}

Box: {boxSize} ({boxColor} corrugated, {ectRating})

User's logo: {hasLogo ? "User uploaded a logo. Place it prominently on front and optionally top." : "No logo uploaded. Use company name as primary visual."}

Return JSON only — an array of panel designs:
{
  "panels": [
    {
      "panel": "front",
      "elements": [
        {
          "type": "logo",
          "x": 50, "y": 25,
          "width": 60, "height": 25
        },
        {
          "type": "text",
          "content": "Company Name",
          "x": 50, "y": 55,
          "fontSize": 28,
          "fontWeight": "bold",
          "textAlign": "center",
          "textTransform": "uppercase",
          "letterSpacing": 3
        },
        {
          "type": "text",
          "content": "Tagline here",
          "x": 50, "y": 68,
          "fontSize": 12,
          "fontWeight": "light",
          "textAlign": "center",
          "letterSpacing": 1
        },
        {
          "type": "line",
          "x": 20, "y": 62,
          "width": 60, "height": 0
        }
      ]
    }
    // ... all 6 panels
  ],
  "designNotes": "string — brief explanation of design rationale"
}

IMPORTANT: x, y positions are PERCENTAGES (0-100) relative to each panel. 50,50 = center.
All 6 panels must be included: front, back, top, bottom, left, right.`;
```

#### 5.3 — Design Preview (`Step4_DesignGen.tsx`)

[MUST] Show:
- The full flattened SVG layout (main view — large)
- Design notes from Claude
- Individual panel zoom — click any panel to see it enlarged
- Toggle between kraft and white background
- Quick controls row:
  - Logo size slider (scale 50%–150%)
  - Logo placement: "1 side / 2 sides / 4 sides" toggle (front only, front+back, all four vertical panels)
- "Refine Design →" button to proceed to editor
- "Download SVG" button — use `<a download>` to save the SVG

[NICE] Simple 3D preview (`Box3DPreview.tsx`):
- CSS 3D transforms to show the box from an angle
- Map each panel face from the SVG onto the 3D box faces
- Use `transform-style: preserve-3d` and `perspective`

---

### PHASE 6: Step 5 — Design Editor & Refinement (10 min)

#### 6.1 — API Route: `/api/refine-design/route.ts`

[MUST] Takes the current design JSON + a user prompt and returns updated design JSON:

```typescript
export const DESIGN_REFINE_PROMPT = `You are refining a shipping box design based on the user's feedback.

Current design:
{currentDesign}

Brand context:
{brandAnalysis}

Box: {boxSize} ({boxColor})

User's revision request: "{userPrompt}"

RULES:
- Maintain BLACK INK ONLY constraint
- Maintain panel logic (don't put too much on side panels, keep hierarchy)
- Preserve elements the user didn't mention changing
- Keep it production-aware and print-ready
- Apply the user's changes thoughtfully

Return the COMPLETE updated design JSON in the same format (all 6 panels), not just the changed parts.`;
```

#### 6.2 — Design Editor UI (`Step5_DesignEditor.tsx`)

[MUST] Split layout:
- **Left (60%)**: Live SVG preview (re-renders on every design update)
- **Right (40%)**: Refinement controls

Refinement panel includes:

1. **AI Prompt Bar** (most important):
   - Text input: "Describe your changes..."
   - Pre-built suggestion chips:
     - "Make the logo larger"
     - "Simplify the layout"
     - "Add a sustainability message"
     - "Make it more premium"
     - "Make it more playful"
     - "Reduce clutter on side panels"
     - "Add trust signals from website"
     - "Move tagline to top panel"
   - Send button → calls `/api/refine-design` → updates SVG

2. **Quick Controls** [MUST]:
   - Logo size slider (per-panel or global)
   - Logo on: 1 / 2 / 4 sides selector
   - Toggle: show/hide tagline
   - Toggle: show/hide website URL
   - Toggle: show/hide QR placeholder

3. **Revision History** [NICE]:
   - Show list of prompts sent
   - Allow "undo" to previous version

4. **Export Section** [MUST]:
   - "Download SVG" button
   - "Download PNG" button (render SVG to canvas → export)
   - "Download PDF" button [NICE] (use jsPDF or similar)
   - Print specs summary: box dimensions, ink color, box material

---

### PHASE 7: ROI Calculator & AI Chat Agent (8 min)

#### 7.1 — ROI Calculator (`ROICalculator.tsx`)

[MUST] A collapsible/modal panel accessible from Step 2 onward. Shows:

**Inputs** (pre-filled from Step 2 questions if answered):
- Monthly box volume
- Current cost per box (plain)
- Custom branded box cost estimate (calculate based on volume: use tiers like $3.50 at 100qty, $2.50 at 500qty, $1.80 at 1000qty, $1.20 at 5000+)
- Current monthly spend on brand materials (stickers, tape, inserts)

**Outputs**:
- Monthly cost comparison: plain vs custom
- Break-even point (months)
- Annual savings/cost
- Comp shop: "Similar brands like [competitor] use custom packaging"
- Link: "Calculate exact pricing on [CustomBoxes.io ROI Calculator →](https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators)"
- If volume > 5000: prominent CTA "You qualify for volume pricing! [Request a quote →](https://customboxes.io/pages/large-order-quote-request-form)"

Present as a clean mini-dashboard with numbers + a simple bar chart comparison.

#### 7.2 — AI Chat Agent (`AIChat.tsx`)

[MUST] Floating chat button (bottom-right corner) that opens a slide-out chat panel.

This agent can discuss:
- Branding questions ("What tone should my packaging have?")
- Financial questions ("Is custom packaging worth it for my volume?")
- Design questions ("What should go on the side panels?")
- General CustomBoxes.io FAQs ("What's 32 ECT?", "What's the minimum order?")
- Acts as the "Design Agent" — an alternative way to request design changes

**Implementation**: 
- Maintain a chat message history in state
- Send to Claude with a system prompt that includes the current brand analysis, box selection, and design state
- Stream responses if possible (nice to have), otherwise show loading → response

```typescript
export const CHAT_AGENT_PROMPT = `You are the CustomBoxes.io AI Packaging Assistant. You help small businesses with packaging decisions.

You have context about this customer:
Brand: {brandAnalysis}
Box: {boxSelection}
Current Design: {currentDesign}

You can help with:
1. BRANDING: Discuss brand tone, packaging strategy, what signals to put on boxes
2. FINANCIAL: ROI analysis, break-even calculations, volume pricing guidance
   - Reference: https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators
   - Over 5000/month → https://customboxes.io/pages/large-order-quote-request-form
3. DESIGN: Suggest changes to the current packaging layout, explain design choices
4. FAQ: Answer questions about corrugated packaging, ECT ratings, kraft vs white, print processes
5. GENERAL: Help guide the user through the CustomBoxes.io workflow

Be practical, concise, and helpful. You are a packaging expert, not a generic chatbot.
When discussing costs, always link to CustomBoxes.io for exact pricing.
Keep responses under 150 words unless the user asks for detail.`;
```

---

### PHASE 8: Main Page Orchestration & Polish (7 min)

#### 8.1 — Main Page (`page.tsx`)

[MUST] Orchestrate the wizard flow:
- Hold all state in a single `useReducer` with `AppState`
- Render `StepIndicator` at top showing progress
- Conditionally render Step components based on `currentStep`
- Allow navigating back to previous steps (clicking step indicators)
- Show `AIChat` floating button on all steps
- Show `ROICalculator` as accessible from step 2 onward (floating button or sidebar tab)

#### 8.2 — StepIndicator.tsx

[MUST] Horizontal progress bar with 5 steps. Current step highlighted in accent orange. Completed steps have a checkmark. Clickable to navigate back.

#### 8.3 — Loading States

[MUST] Every API call should show a meaningful loading state:
- Brand analysis: "Analyzing {url}... Scanning brand signals..."
- Box recommendation: "Finding your perfect box size..."
- Design generation: "Designing your packaging layout..."
- Design refinement: "Applying your changes..."

Use skeleton loaders or animated spinners with the loading text. Keep users informed.

#### 8.4 — Error Handling

[MUST] Handle:
- Invalid URL → show inline error on input
- API failures → show retry button with error message
- Claude returning bad JSON → retry with stricter prompt, fallback to defaults

---

### PHASE 9: Final Polish & Demo Prep (5 min)

#### 9.1 — CustomBoxes.io Branding

[MUST] Throughout the app:
- Use CustomBoxes.io brand orange (#D4622B) as accent
- Include "Powered by CustomBoxes.io" in footer
- Link to customboxes.io wherever relevant (ROI page, refund policy, large orders)
- Use packaging/box iconography from lucide-react (Package, Box, Truck, etc.)

#### 9.2 — Responsive Basics

[NICE] Make it usable on desktop (primary) and not broken on tablet. Mobile is not required.

#### 9.3 — Demo Script (for Loom recording)

The recording should show TWO flows:

**Flow 1 — Known box size**:
1. Enter URL: e.g., `https://allbirds.com`
2. Show brand analysis results
3. Select "I know my box size"
4. Pick a box from catalog (e.g., 10×8×6)
5. Generate design
6. Make 1-2 refinements ("make logo larger", "add sustainability message")
7. Download result

**Flow 2 — Unknown box size**:
1. Enter URL: e.g., `https://bombas.com`
2. Show brand analysis
3. Select "Help me choose"
4. Answer sizing questions
5. Show recommendation with rationale
6. Generate design
7. Show ROI calculator
8. Use AI chat for a design question
9. Download result

---

## API ROUTE IMPLEMENTATION NOTES

All routes follow this pattern:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // ... build prompt from body data ...
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
```

For URL scraping in the brand analysis route, use a simple fetch:
```typescript
async function scrapeUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CustomBoxesAI/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    // Strip to meaningful text: remove scripts, styles, get text content
    const stripped = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
    return stripped;
  } catch {
    throw new Error('Could not fetch the URL. Please check it and try again.');
  }
}
```

---

## CRITICAL IMPLEMENTATION REMINDERS

1. **SVG is the hero**: The flattened box layout SVG is the most important visual. Make it clean, proportional, and realistic. Use thin strokes, proper typography, and real panel proportions.

2. **JSON parsing resilience**: Claude sometimes wraps JSON in markdown backticks. Always strip ` ```json ` and ` ``` ` before parsing. Have a retry mechanism.

3. **Black ink only**: In the SVG, ALL design elements must be `stroke="#1A1A1A"` or `fill="#1A1A1A"`. No other colors for design elements. Background is kraft or white only.

4. **Logo handling**: If user uploads a logo, convert to base64 dataURL on the client and pass it through to the SVG as `<image href={dataUrl}>`. Render at the positions Claude specifies.

5. **The disclaimer is required**: Box size recommendation must include: "You are ultimately responsible for selecting the correct box size. [View our return policy](https://customboxes.io/policies/refund-policy)"

6. **Links are required**: ROI calculator page, large order quote form, and refund policy must be linked where specified.

7. **Don't over-build**: This is a prototype. Mocking some backend logic (like price calculations) is fine. The end-to-end FLOW matters more than every calculation being perfect.

8. **Design iteration MUST work**: The user must be able to type a prompt and see the design update. This is core to the challenge.

---

## SUMMARY OF WHAT'S REAL VS MOCKED

| Feature | Status |
|---------|--------|
| URL input + brand analysis via Claude | Real |
| Logo upload + display on box | Real |
| Box catalog with real sizes | Real |
| Sizing questionnaire + AI recommendation | Real |
| SVG panel-aware box layout generation | Real |
| AI-powered design refinement | Real |
| AI chat agent | Real |
| ROI calculator | Partially mocked (price tiers are estimates) |
| 3D box preview | Simplified CSS (nice-to-have) |
| PDF export | Nice-to-have |
| Actual CustomBoxes.io pricing API | Mocked (links to real site) |

---

## WHAT TO IMPROVE NEXT (for summary deliverable)

- Connect to real CustomBoxes.io product/pricing API
- Add actual print-spec PDF export (CMYK black, bleed, trim marks)
- Shopify integration for direct ordering
- Template library / lookbook of example designs
- Multi-revision history with visual diff
- Collaborative review flow (share design link with team)
- Real 3D WebGL mockup with texture mapping
- Integration with print vendor preflight checks
