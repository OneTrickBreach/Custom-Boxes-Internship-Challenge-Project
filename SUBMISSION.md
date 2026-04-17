# Submission Guide — CustomBoxes.io AI Packaging Designer

Everything you need to submit this challenge, in one place.

**Repo:** https://github.com/OneTrickBreach/Custom-Boxes-Internship-Challenge-Project
**Challenge due:** April 19, 2026 at 11pm Eastern

---

## 1. What to submit (per the challenge spec)

The spec's **Required Deliverables** section says:

1. **Live prototype URL or runnable app** — you have a runnable app. Optional: deploy to Vercel for a live URL (see §5 below).
2. **3–5 minute screen recording (Loom)** — record your screen walking through both flows (see §4).
3. **One example with known box size** — Flow A below.
4. **One example with recommended box size** — Flow B below.
5. **Short summary** including:
   - Tools used → see §6
   - What is real vs mocked → see §7
   - What you would improve next → see §8

So the final submission package is:

- Link to the GitHub repo (above)
- Link to the Loom recording
- A short write-up (you can copy §6–§8 of this doc verbatim or paste them into the Loom description / submission form)
- Optional: the live Vercel URL if you deploy

---

## 2. Repo structure

```
CustomBoxesInternshipProject/        ← the git repo
├── Public - AI Internship Challenge (60 min).md   ← original challenge spec
├── README.md                         ← short project readme
├── SUBMISSION.md                     ← this file
├── plan.md                           ← build plan
├── prompt.md                         ← prompt given to the coding agent
└── customboxes-ai/                   ← the Next.js app
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              ← main wizard orchestrator (useReducer)
    │   │   ├── layout.tsx            ← DM Serif + DM Sans fonts
    │   │   ├── globals.css           ← kraft/ink/accent CSS tokens + utilities
    │   │   └── api/
    │   │       ├── analyze-brand/route.ts   ← URL scrape + Claude brand analysis
    │   │       ├── recommend-box/route.ts   ← Catalog-constrained box pick
    │   │       ├── generate-design/route.ts ← 6-panel design JSON
    │   │       ├── refine-design/route.ts   ← Full-design iterative refinement
    │   │       └── chat/route.ts            ← Context-aware AI assistant
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── StepIndicator.tsx
    │   │   ├── Step1_UrlInput.tsx
    │   │   ├── Step2_BrandAnalysis.tsx
    │   │   ├── Step3_BoxSize.tsx
    │   │   ├── Step4_DesignGen.tsx
    │   │   ├── Step5_DesignEditor.tsx
    │   │   ├── BoxLayoutSVG.tsx      ← flattened 6-panel SVG dieline
    │   │   ├── Box3DPreview.tsx      ← CSS 3D with cropped-viewBox faces
    │   │   ├── ROICalculator.tsx     ← ROI + break-even + comp shop
    │   │   └── AIChat.tsx            ← floating packaging assistant
    │   └── lib/
    │       ├── constants.ts          ← 14-box catalog + CustomBoxes.io links + price tiers + Claude model
    │       ├── types.ts              ← BrandAnalysis, BoxSize, DesignLayout, etc.
    │       ├── prompts.ts            ← 5 Claude prompt templates (brand / recommend / generate / refine / chat)
    │       ├── svg-templates.ts      ← cross-layout math + INK/KRAFT constants
    │       └── api-helpers.ts        ← resilient JSON parser + retry helper
    ├── .env.local.example            ← copy to .env.local and add ANTHROPIC_API_KEY
    └── package.json
```

---

## 3. Local run

### Option A — real Claude calls (production-like)

```bash
git clone https://github.com/OneTrickBreach/Custom-Boxes-Internship-Challenge-Project.git
cd Custom-Boxes-Internship-Challenge-Project/customboxes-ai
cp .env.local.example .env.local
# open .env.local and paste your real ANTHROPIC_API_KEY=sk-ant-...
npm install
npm run dev
```

Open http://localhost:3000.

Requires credits in your Anthropic account (https://console.anthropic.com/settings/billing — a $5 top-up is more than enough for the full demo flow).

### Option B — free demo mode (no API key, no credits)

Every API route ships with a **simulation layer** so you can record the Loom without paying anything for Claude.

```bash
cd customboxes-ai
cp .env.local.example .env.local
# leave ANTHROPIC_API_KEY blank (or delete the line)
# optionally add: DEMO_MODE=true
npm install
npm run dev
```

Demo mode auto-activates when no API key is present. You'll see a small **"Demo Mode"** pill in the header so viewers know responses are simulated, but the app looks and behaves identically to the live version:

- **Brand analysis** returns hand-crafted fixtures for `allbirds.com`, `bombas.com`, `glossier.com`, `yeti.com`; any other URL gets a reasonable generic brand derived from the hostname.
- **Box recommendation** runs a real deterministic algorithm against the catalog using your sizing answers (weight bucket, fragility, dimensions, fit preference, industry from brand analysis) — not a hardcoded answer, a real rule-based fit that differs by input.
- **Design generation** returns a hand-crafted 6-panel layout that interpolates the brand's company name + tagline + trust signal.
- **Design refinement** actually transforms the design based on keywords in your prompt:
  - *"make the logo larger"* → scales all logos up 30%
  - *"simplify / reduce clutter"* → trims side + bottom panels to essentials
  - *"add a sustainability message"* → adds a recycled-material line on the back
  - *"make it more premium"* → uppercase + wider letterspacing
  - *"add a QR code"* / *"add a barcode"* → adds the placeholder
  - *"move tagline to top"* → actually moves the tagline element
  - Plus playful, trust signals, handle-with-care, side-panel simplification — so the demo has plenty of visible, believable transformations.
- **Chat** returns topical answers for ROI, ECT, kraft vs white, side panels, fragility, premium, and large-order pricing questions, plus a useful default.

**Important for the submission write-up:** if you record in demo mode, disclose it clearly — say *"For this recording I'm using the app's built-in simulation layer so I don't burn API credits. The real Claude integration is in the code and switches on the moment I add a key to `.env.local` and restart — the implementation is the same, the code path just branches on `isDemoMode()`."*

You can mix modes too: start in demo to show the happy path, stop the server, paste a real API key in `.env.local`, restart, and show one real end-to-end run.

---

## 4. Demo script for the Loom recording (3–5 min total)

Record your full screen at 1080p. Speak briefly over each step.

### Flow A — Known box size (~90 seconds)

1. **URL entry:** paste `https://allbirds.com` (or click the chip). Optionally upload a logo.
2. Click **Analyze My Brand** — wait ~6–10s. Point out the structured brand analysis: tone, target customer, visual style, messaging signals, recommended box color, etc.
3. Fill in **Monthly Box Volume** (e.g. `800`) + **Current Cost / Box** (e.g. `0.50`) + toggle **Currently Branded?**. Click **Continue to Box Selection**.
4. Click **Yes, I know my size** → switch to the **Standard Sizes** tab → click `10×8×6` → **Continue to Design**.
5. Wait for the flattened 6-panel SVG dieline to render. Show:
   - The cross/T layout with TOP, BOTTOM, LEFT, FRONT, RIGHT, BACK panels
   - Fold lines (dashed) + crop marks at corners
   - Design notes from Claude
   - 3D preview below (hover to rotate)
6. Toggle **kraft ↔ white** background. Drag the **logo size** slider. Click **1 / 2 / 4 sides**.
7. Click **Refine Design →**.
8. Click the suggestion chip **"Make the logo larger"** → send. Point out the SVG updating live.
9. Type `"simplify the side panels and add a sustainability line on the back"` → send.
10. Open **per-panel logo sizing**: scale up FRONT to 130%, shrink TOP to 70%.
11. Click **Download SVG**. Show the downloaded file.

### Flow B — Unknown box size + ROI + AI chat (~90 seconds)

1. Click the **Step 1** pill in the indicator to go back. Enter `https://bombas.com` → analyze.
2. Continue through Step 2.
3. Click **No, help me choose**.
4. Fill: product = *"Four pairs of merino wool socks in mailer sleeves"*, weight = **Under 5 lb**, dimensions = `8×6×2`, fragility = **Not fragile**, inserts = **No**, fit = **Standard** → **Recommend My Box**.
5. Point out the AI recommendation card: confidence badge, rationale, ECT rating, alternate box, and the refund-policy disclaimer.
6. Click **Use this box & design my packaging**.
7. Click the **ROI** pill (bottom-left) → show monthly comparison, break-even months, annual savings, the CustomBoxes.io ROI link, and the volume-quote CTA if you bump the volume to `5500`.
8. Close ROI. Click the **orange chat bubble** (bottom-right).
9. Ask *"What should go on the side panels for an apparel brand?"* → wait for Claude to answer.
10. Close chat. Do one more refinement prompt (*"add a QR code placeholder on the back"*) → download PNG.

### What to narrate

- "This is a real Next.js app. Every analysis/recommendation/design call is a live Claude API call."
- "The box catalog is fixed — the AI cannot invent dimensions."
- "Every design element is rendered as SVG with black ink on kraft or white only."
- "Refinements send the full current design to Claude so panel logic is preserved."

---

## 5. Optional — deploy to Vercel for a live URL

```bash
cd customboxes-ai
npx vercel
# follow the prompts
# when asked about env vars, add ANTHROPIC_API_KEY = <your key>
```

Include the resulting `*.vercel.app` URL in your submission.

---

## 6. Tools used (copy into submission write-up)

- **Next.js 16** (App Router) with TypeScript and Tailwind CSS v4
- **Anthropic Claude** (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk` for brand analysis, box recommendation, design generation, refinement, and chat
- **`lucide-react`** for iconography
- **DM Serif Display** + **DM Sans** from Google Fonts for the industrial-clean aesthetic
- **SVG** as the packaging rendering format (vector, print-ready, no image-gen API dependency)
- **Claude Code** as the coding assistant to scaffold and iterate on the app

---

## 7. What is real vs mocked (copy into submission write-up)

| Feature | Real | Mocked |
|---|---|---|
| URL fetch / HTML scrape | ✅ Real `fetch` of the URL with a browser UA, strips scripts/styles, grabs title, OG, meta, body (≤3000 chars) | |
| Brand analysis | ✅ Real Claude call returning structured JSON | |
| Box catalog | ✅ 14 real boxes covering Standard / Popular Custom / Any Size | |
| Box size recommendation | ✅ Real Claude call, **constrained** to the catalog (by box id), with confidence + rationale + ECT + color | |
| Design generation | ✅ Real Claude call producing a 6-panel JSON layout that SVG renders | |
| Design refinement via AI prompt | ✅ Real Claude call, full-design round trip, preserves panel logic | |
| AI chat assistant | ✅ Real Claude call with brand + box + design as system-prompt context | |
| SVG + PNG export | ✅ Real canvas-based export | |
| ROI / break-even / volume tier pricing | | **Mocked tiers**: $3.50 (100) → $2.90 (250) → $2.50 (500) → $1.80 (1000) → $1.45 (2500) → $1.20 (5000+). Setup cost $300 flat. The real calculator is linked from the drawer. |
| Per-box price estimates on catalog cards | | Mocked range strings |
| PDF export | — | Not implemented (marked `[NICE]` in the build plan) |
| Real CustomBoxes.io pricing API | — | Links out to the real site |
| Demo / simulation mode (optional) | ✅ Real implementation — rule-based fixtures that actually transform the design based on prompt keywords; meant for recording demos without burning API credits. Toggled off when an `ANTHROPIC_API_KEY` is set, unless `DEMO_MODE=true` forces it on. | |

---

## 8. What I would improve next (copy into submission write-up)

- **Real CustomBoxes.io pricing API integration** so ROI numbers reflect current tiers instead of the mocked defaults.
- **Print-spec PDF export** with CMYK-safe black, bleed, and trim marks for direct print-vendor handoff.
- **Multi-page crawl of the source brand** (`/about`, `/sustainability`, `/press`) instead of homepage-only — more signal → better packaging choices.
- **Shopify app integration** so a store can push the design straight into a CustomBoxes.io order from their admin.
- **Template / lookbook library** seeded with real packaging examples from CustomBoxes.io's portfolio, so the AI has concrete references instead of just text prompts.
- **Revision history with visual diff** and named checkpoints so you can compare v1 vs v3 at a glance.
- **WebGL 3D preview** with real corrugated texture mapping and lighting, swap from the current CSS-3D approximation.
- **Preflight / print-readiness score** (min text size, stroke weight, element-to-fold clearance) with a linter-style checklist.
- **Collaborative share links** so a brand can send `customboxes.io/review/abc123` to a teammate for approval.

---

## 9. How the scoring rubric maps to this build (for self-check)

| Rubric area | Points | How this submission addresses it |
|---|---|---|
| Packaging layout quality + ability to make changes | 30 | Panel-aware 6-panel SVG dieline with fold lines, crop marks, proportional dimensions from real L×W×H. Black-ink-only enforced via SVG filters. AI-prompt refinement preserves panel logic. Per-panel logo sizing sliders + 1/2/4-side toggle + global scale. SVG + PNG export. |
| End-to-end working prototype | 20 | Full flow functions: URL → brand → size (known OR unknown) → design → refine → export. Every step calls a real Claude endpoint. No placeholder screens. |
| Brand understanding from URL | 20 | Real HTML scrape with title / OG / meta / body, structured `BrandAnalysis` with tone, tagline, target customer, visual style, typography notes, messaging signals, recommended box color, industry category. User can edit any field inline before proceeding. |
| Box size recommendation quality | 20 | 14-box catalog. AI constrained by box id, cannot invent dimensions. Output includes confidence badge, 2–3 sentence rationale, ECT rating (32 ECT / Heavy Duty), box color, alternate box. Refund-policy disclaimer with link. |
| Tool integration + tech judgment | 5 | Next.js 16 App Router, Tailwind v4, `@anthropic-ai/sdk`, resilient JSON parsing with balanced-brace scan + retry, 5 API routes, useReducer state, inline SVG for true print-readiness. |
| Polish + clarity | 5 | DM Serif Display + DM Sans, CustomBoxes.io orange (#D4622B) as accent, kraft/white box chips, per-step loading states, inline error surfacing, ROI drawer, floating packaging AI assistant, proper footer with all three required CustomBoxes.io links. |

---

## 10. Known limitations / honest caveats

- **Runs locally by default.** To satisfy "live prototype URL", deploy to Vercel (§5).
- **Homepage-only scrape.** A multi-page crawl would improve brand inference but was out of scope for 60 minutes.
- **Claude model is pinned** to `claude-sonnet-4-6`. Upgrade / downgrade by editing `CLAUDE_MODEL` in [customboxes-ai/src/lib/constants.ts](customboxes-ai/src/lib/constants.ts). (Haiku 4.5 = `claude-haiku-4-5-20251001` if you want to cut cost by ~5x at some quality cost on design JSON.)
- **Price estimates are mocked tiers** — the ROI drawer always links out to the real CustomBoxes.io ROI calculator for exact numbers.
- **No PDF export.** The plan marked this `[NICE]` and SVG + PNG covers the print-ready-file requirement adequately.
- **The 3D preview is CSS-3D**, not a real WebGL mockup — hovering rotates it; it shows 5 visible faces (front/back/left/right/top), not bottom.

---

## 11. Troubleshooting — when the app shows a Claude error

The app now surfaces the real Anthropic error message in the UI. The most common ones:

| Message contains | What it means | Fix |
|---|---|---|
| *"credit balance is too low"* / *"billing"* | Your Anthropic account has $0 credits | Go to https://console.anthropic.com/settings/billing → add credits (a $5 top-up is plenty for a demo) |
| *"API key"* / *"authentication"* | `ANTHROPIC_API_KEY` missing or wrong | Check `customboxes-ai/.env.local`, paste a valid key, **restart `npm run dev`** (Next.js only reads env on boot) |
| *"rate limit"* | Too many requests too fast | Wait 10–20s and retry |
| *"model"* + *"not found"* / *"invalid"* / *"deprecated"* | The model string is stale | Edit `CLAUDE_MODEL` in [customboxes-ai/src/lib/constants.ts](customboxes-ai/src/lib/constants.ts) — current default is `claude-sonnet-4-6` |
| Network / fetch failure on the URL analysis step | Target site blocked the scrape | Try a different URL (most major brand sites work: allbirds.com, bombas.com, glossier.com, yeti.com) |

> **Note:** If you edit `.env.local` while the dev server is running, **you must restart it.** Next.js only reads env vars at boot. Stop with Ctrl+C, run `npm run dev` again.

---

## 12. Final pre-submission checklist

- [ ] Cloned the repo fresh and confirmed `npm install && npm run dev` works
- [ ] Set `ANTHROPIC_API_KEY` in `.env.local`
- [ ] Ran Flow A end-to-end with one URL (e.g. allbirds.com) and downloaded at least one file
- [ ] Ran Flow B end-to-end with a different URL (e.g. bombas.com)
- [ ] Recorded Loom (3–5 min) showing both flows
- [ ] (Optional) Deployed to Vercel and added the API key as an env var
- [ ] Submission form filled with: repo URL + Loom URL + summary (paste §6, §7, §8 from this doc) + live URL if deployed

---

## Quick reference — all the CustomBoxes.io links wired into the app

- Home — https://customboxes.io
- ROI / Break-even / Comp Shop — https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators
- Refund Policy — https://customboxes.io/policies/refund-policy
- Large Order Quote — https://customboxes.io/pages/large-order-quote-request-form
- Standard Boxes collection — https://customboxes.io/collections/standard-shipping-boxes
