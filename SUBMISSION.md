# CustomBoxes.io — AI Internship Challenge Submission

**Submitted by:** Ishan Biswas · `biswas.is@northeastern.edu`
**Submitted for:** CustomBoxes.io AI Internship Challenge — Step 2 (60-minute AI Packaging Designer Build)
**Repository:** https://github.com/OneTrickBreach/Custom-Boxes-Internship-Challenge-Project
**Demo recording:** [`customboxes-ai-demo.mkv`](./customboxes-ai-demo.mkv) (in repo root)

---

## Deliverables checklist

The challenge spec lists five required deliverables. Here's how this submission covers each:

| # | Deliverable | Where it lives |
|---|---|---|
| 1 | Live prototype URL **or** runnable app | Runnable app: [`customboxes-ai/`](./customboxes-ai/). Run with `npm install && npm run dev`. Also works in a zero-cost demo mode (no API key required). |
| 2 | 3–5 minute screen recording | [`customboxes-ai-demo.mkv`](./customboxes-ai-demo.mkv) in the repo root. |
| 3 | Example with **known** box size | Shown in the recording. |
| 4 | Example with **recommended** box size | Shown in the recording. |
| 5 | Short written summary | §3 (Tools used), §4 (Real vs mocked), §5 (What I'd improve next) of this document. |

---

## 1. TL;DR

A production-quality working prototype of an AI Packaging Designer for CustomBoxes.io. The user pastes a company URL; the tool scrapes the site, analyzes the brand with Claude, asks the sizing questions if needed, recommends a box from a fixed catalog (no invented dimensions), and generates a black-ink-only 6-panel SVG dieline on kraft or white corrugated. The user iterates with natural-language prompts and per-panel controls, and exports SVG or PNG. All CustomBoxes.io links (ROI calculator, refund policy, large-order quote) are wired in, plus a floating ROI drawer and a contextual packaging assistant chat.

Built with Next.js 16 App Router, TypeScript, Tailwind v4, and the Anthropic Claude API (`claude-sonnet-4-6`). Five real Claude-backed API routes; resilient JSON parsing with balanced-brace extraction and retry; automatic fallback to a deterministic rule-based demo mode when credits are out so the UI never breaks; SVG rendering throughout so every output is genuinely print-ready.

---

## 2. How to run it

### Quick start (demo mode, free)

```bash
git clone https://github.com/OneTrickBreach/Custom-Boxes-Internship-Challenge-Project.git
cd Custom-Boxes-Internship-Challenge-Project/customboxes-ai
cp .env.local.example .env.local   # leave ANTHROPIC_API_KEY blank
npm install
npm run dev
```

Open http://localhost:3000. A small **"Demo Mode"** pill in the header indicates responses are simulated — the full flow works end-to-end with no API credits burned.

### Production mode (real Claude calls)

Same steps, but paste a valid `ANTHROPIC_API_KEY=sk-ant-...` into `.env.local` (get one at https://console.anthropic.com/settings/keys, add credits at `/settings/billing`). A $5 top-up is plenty — a full run is pennies.

The app also **auto-falls-back** to demo fixtures if Claude returns a billing / auth / rate-limit error, so the flow never breaks mid-session.

### Environment variables

| Var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Real Claude calls. Leave blank to auto-activate demo mode. |
| `DEMO_MODE` | Force demo mode even if a key is set. `true` / `1` / `yes`. |

---

## 3. Tools used

- **Next.js 16** (App Router) with TypeScript — API routes + React frontend in one project, keeps the API key server-side.
- **Anthropic Claude** (`claude-sonnet-4-6`) via `@anthropic-ai/sdk` — brand analysis, box recommendation, design generation, design refinement, chat.
- **Tailwind CSS v4** — design tokens through CSS custom properties (`--kraft`, `--ink-black`, `--accent`, etc.) so the styling stays on-brand.
- **SVG** — the packaging dieline is pure SVG so it's genuinely print-ready. No image-generation API, no raster.
- **`lucide-react`** for iconography.
- **DM Serif Display** + **DM Sans** from Google Fonts — industrial-clean editorial feel, not generic AI.
- **Claude Code** was my primary coding assistant for scaffolding and iterating under the time constraint.

---

## 4. What is real vs mocked

| Feature | Status |
|---|---|
| URL fetch + HTML scrape (title, OG, meta, body to 3k chars) | **Real** — `fetch` with a desktop Chrome UA, strips scripts/styles/SVGs. |
| Brand analysis | **Real** Claude call returning structured JSON. |
| Box catalog (14 sizes across Standard / Popular Custom / Any Size) | **Real** — pulled from the plan. |
| Box recommendation — catalog-constrained, with confidence + rationale + ECT + color + alternate | **Real** Claude call. The AI cannot invent dimensions; it must pick a catalog `id`. |
| Design generation — 6-panel JSON layout | **Real** Claude call → SVG. |
| Design refinement via AI prompt | **Real** — full current design sent round-trip so panel logic is preserved. |
| Contextual packaging chat assistant | **Real** — brand + box + design injected as system-prompt context. |
| SVG + PNG export | **Real** — inline serialize + canvas render. |
| Demo / simulation mode | **Real fallback implementation** — hand-crafted brand fixtures, a deterministic box-fit algorithm against the catalog, a hand-crafted 6-panel template, and keyword-driven refinement transformations. Activates when no API key is set, when `DEMO_MODE=true`, or when Claude returns a billing / auth / rate-limit error. |
| ROI / break-even / volume tier pricing | **Mocked tiers** ($3.50 at 100 qty → $1.20 at 5000+). Setup cost $300 flat. Drawer always links out to the real CustomBoxes.io ROI calculator for exact numbers. |
| Per-box price estimates on catalog cards | **Mocked** range strings. |
| PDF export | **Not implemented** (marked `[NICE]` in the plan). SVG + PNG cover the print-ready requirement. |
| Real CustomBoxes.io pricing API | **Not integrated** — links out to the real site. |

---

## 5. What I'd improve next

- **Real CustomBoxes.io pricing API integration** so the ROI numbers reflect current tiers instead of mocked defaults.
- **Print-spec PDF export** with CMYK-safe black, bleed, and trim marks for direct print-vendor handoff.
- **Multi-page crawl of the source brand** (`/about`, `/sustainability`, `/press`) instead of homepage-only — more signal → better packaging choices.
- **Shopify app integration** so a store owner can push the finalized design straight into a CustomBoxes.io order from their admin.
- **Template / lookbook library** seeded with real CustomBoxes.io packaging examples, so the AI has concrete visual references instead of text-only prompts.
- **Revision history with visual diff** and named checkpoints, so a brand can compare v1 vs v3 at a glance.
- **WebGL 3D preview** with real corrugated texture mapping and lighting, swap from the CSS-3D approximation.
- **Preflight / print-readiness score** (min text size, stroke weight, element-to-fold clearance) with a linter-style checklist.
- **Collaborative share links** so a brand can send `customboxes.io/review/abc123` to a teammate for approval.

---

## 6. How the scoring rubric maps to this build

| Rubric area | Points | How it's addressed |
|---|---|---|
| Packaging layout quality + ability to make changes | 30 | Panel-aware 6-panel SVG dieline with dashed fold lines, corner crop marks, proportional dimensions from real `L×W×H`, black-ink-only enforced via an SVG filter on logo images. AI-prompt refinement preserves panel logic. Per-panel content scale sliders for all six faces, global logo size, 1 / 2 / 4-side logo placement toggle. SVG + PNG export. |
| End-to-end working prototype | 20 | URL → brand → size (known **or** unknown) → design → refine → export. Every step is a real API call. No placeholder screens or dead buttons. |
| Brand understanding from URL | 20 | Real HTML scrape pulling title, OG tags, meta description, visible body text. Structured `BrandAnalysis` with tone, tagline, target customer, visual style, typography notes, messaging signals, recommended box color, industry. Every field is editable inline before continuing. |
| Box size recommendation quality | 20 | 14-box catalog. AI is constrained by `id`, cannot invent dimensions. Output: confidence badge (high / medium / low), 2–3 sentence rationale, ECT rating (`32 ECT` / `Heavy Duty`), box color, alternate option. Refund-policy disclaimer inline. |
| Tool integration + technical judgment | 5 | Next.js 16 App Router, Tailwind v4, `@anthropic-ai/sdk`, resilient JSON parsing with balanced-brace scan + retry, six API routes, `useReducer` state, inline SVG for genuine print-readiness, rule-based demo mode so the app never blocks on billing. |
| Polish + clarity | 5 | DM Serif Display + DM Sans, CustomBoxes.io orange (`#D4622B`) accent, kraft / white box chip swatches, loading states on every API call, inline error surfacing with actionable messages, floating ROI drawer, floating packaging AI assistant, footer with all three required CustomBoxes.io links. |

---

## 7. Known limitations / honest caveats

- **Runs locally by default.** No live Vercel URL in this submission; evaluator can clone and `npm run dev`. Demo mode means no API key is required to see the full flow.
- **Homepage-only scrape.** A multi-page crawl (`/about`, `/sustainability`) would lift brand inference quality; cut for scope.
- **Claude model is pinned** to `claude-sonnet-4-6` in [`customboxes-ai/src/lib/constants.ts`](customboxes-ai/src/lib/constants.ts). Change the constant to swap models.
- **Price estimates are mocked tiers.** The real calculator is linked from the ROI drawer.
- **No PDF export.** SVG + PNG cover the print-ready requirement; PDF was marked `[NICE]` in the plan.
- **3D preview is CSS-3D**, not WebGL — shows 5 faces (front / back / left / right / top), rotates on hover and on click-and-drag, with a reset button.
- **Demo mode is deliberately visible** — a pill in the header says "Demo Mode" so evaluators always know whether a given response came from Claude or from the fallback layer. This is an honesty feature, not a bug.

---

## 8. Repo layout

```
Custom-Boxes-Internship-Challenge-Project/
├── README.md                                            overview + run instructions
├── SUBMISSION.md                                        this document
├── customboxes-ai-demo.mkv                              demo recording (42MB)
├── Public - AI Internship Challenge (60 min).md         original challenge spec
├── plan.md                                              build plan
├── prompt.md                                            prompt handed to the coding agent
└── customboxes-ai/                                      the Next.js app
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                                 useReducer wizard orchestrator
    │   │   ├── layout.tsx                               DM Serif + DM Sans fonts
    │   │   ├── globals.css                              kraft / ink / accent tokens
    │   │   └── api/
    │   │       ├── analyze-brand/route.ts               URL scrape + Claude brand analysis
    │   │       ├── recommend-box/route.ts               catalog-constrained box pick
    │   │       ├── generate-design/route.ts             6-panel design JSON
    │   │       ├── refine-design/route.ts               full-design iterative refinement
    │   │       ├── chat/route.ts                        context-aware packaging assistant
    │   │       └── status/route.ts                      demo-mode detection endpoint
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── StepIndicator.tsx
    │   │   ├── Step1_UrlInput.tsx
    │   │   ├── Step2_BrandAnalysis.tsx
    │   │   ├── Step3_BoxSize.tsx
    │   │   ├── Step4_DesignGen.tsx
    │   │   ├── Step5_DesignEditor.tsx
    │   │   ├── BoxLayoutSVG.tsx                         flattened 6-panel SVG dieline
    │   │   ├── Box3DPreview.tsx                         CSS 3D with cropped viewBox faces
    │   │   ├── ROICalculator.tsx                        ROI + break-even + comp shop
    │   │   ├── AIChat.tsx                               floating packaging assistant
    │   │   └── ui/ToggleSwitch.tsx
    │   └── lib/
    │       ├── constants.ts                             14-box catalog + links + Claude model
    │       ├── types.ts                                 BrandAnalysis, BoxSize, DesignLayout, …
    │       ├── prompts.ts                               5 Claude prompt templates
    │       ├── svg-templates.ts                         cross-layout math + ink constants
    │       ├── api-helpers.ts                           JSON parser + retry + error mapper
    │       ├── demo-mode.ts                             isDemoMode() + demoDelay()
    │       └── demo-fixtures.ts                         brand / box / design / chat fixtures
    ├── .env.local.example                               copy to .env.local
    └── package.json
```

---

## 9. CustomBoxes.io links wired into the app

- Home → https://customboxes.io
- ROI / Break-even / Comp Shop → https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators
- Refund Policy → https://customboxes.io/policies/refund-policy
- Large Order Quote (5000+ boxes / mo) → https://customboxes.io/pages/large-order-quote-request-form
- Standard Boxes collection → https://customboxes.io/collections/standard-shipping-boxes

---

## 10. Troubleshooting

If Claude returns an error, the app now surfaces the real message instead of a generic "try again" prompt. Common ones:

| Message contains | What it means | Fix |
|---|---|---|
| *"credit balance is too low"* | Anthropic account has $0 credits | Top up at https://console.anthropic.com/settings/billing — the app will also auto-fall-back to demo mode so the flow still completes. |
| *"API key"* / *"authentication"* | `ANTHROPIC_API_KEY` missing or wrong | Check `customboxes-ai/.env.local`, paste a valid key, **restart the dev server** (Next.js only reads env at boot). |
| *"rate limit"* | Too many requests in a short window | Wait ~20s and retry. |
| Network / fetch failure on the URL step | Target site blocked the scrape | Try a different URL (allbirds.com, bombas.com, glossier.com, yeti.com all work). |

---

*Thanks for reviewing. Happy to walk through any part of the code or design decisions on a call.*
