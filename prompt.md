# PROMPT FOR CLAUDE CODE

You are building a production-quality working prototype of an **AI Packaging Designer** for **CustomBoxes.io**. This is an internship challenge submission that will be screen-recorded as a Loom demo. The attached `plan.md` is your complete blueprint — follow it phase by phase, in order, completing each phase fully before moving to the next.

---

## PROJECT CONTEXT

CustomBoxes.io sells custom-printed corrugated shipping boxes to small businesses. The tool you're building takes a company's website URL, analyzes their brand, recommends a box size from a predefined catalog, and generates a black-ink-only shipping box design layout that the user can refine through AI prompts and simple controls. This is NOT a toy demo — it should feel like an internal tool a real packaging company would use.

---

## EXECUTION RULES

1. **Follow `plan.md` phase by phase (Phase 1 → Phase 9).** Do not skip ahead. Do not refactor early phases while building later ones. Get each phase working before moving on.

2. **Prioritize items marked [MUST] over [NICE].** If you're running long on a phase, skip [NICE] items and come back to them only after all [MUST] items across ALL phases are complete.

3. **Every API route must be fully functional.** The brand analysis, box recommendation, design generation, and design refinement API routes are the backbone — they must work end-to-end with real Claude API calls. Use model `claude-sonnet-4-20250514` for all calls.

4. **The SVG box layout is the most important visual output.** It must render a flattened dieline (cross/T-shape) with all 6 panels (top, bottom, front, back, left, right) proportionally sized to the actual box dimensions. All design elements must be black ink only on kraft (#C4A265) or white (#F5F3EF) background. Spend extra care here — this is 30% of the grading rubric.

5. **Design iteration MUST work.** The user must be able to type a natural language prompt (e.g., "make the logo larger", "simplify the side panels", "add a sustainability message") and see the SVG layout update in response. This is a core requirement, not a nice-to-have.

6. **JSON parsing must be resilient.** Claude sometimes wraps JSON in markdown backticks or adds preamble text. Always strip ```json and ``` fences, trim whitespace, and wrap parsing in try/catch with a retry mechanism. Never let a JSON parse failure crash the app.

7. **Use the exact prompt templates from `plan.md`.** The prompts in `lib/prompts.ts` have been carefully designed to produce structured JSON output. Copy them exactly, only modifying the interpolation variables.

8. **All CustomBoxes.io links must be real and clickable.** The ROI calculator link, refund policy link, large order quote link, and homepage link must all point to their real URLs as specified in the constants.

9. **Do not invent box sizes.** The box catalog in `constants.ts` is the ONLY set of sizes the tool may recommend. Never generate arbitrary dimensions.

10. **Keep the UI polished but not over-engineered.** Use Tailwind utility classes. Follow the aesthetic direction in the plan: industrial-clean, lots of whitespace, kraft/cardboard texture accents, DM Serif Display + DM Sans fonts, CustomBoxes.io orange (#D4622B) as accent color. No generic purple gradients, no Inter font, no cookie-cutter AI look.

---

## TECH STACK (do not deviate)

- **Next.js 14+ with App Router** (TypeScript)
- **Tailwind CSS** for styling
- **@anthropic-ai/sdk** for Claude API calls in API routes
- **lucide-react** for icons
- **framer-motion** for transitions (optional, only if time permits)
- **Google Fonts**: DM Serif Display (headings) + DM Sans (body)

Setup command:
```bash
npx create-next-app@latest customboxes-ai --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd customboxes-ai
npm install @anthropic-ai/sdk lucide-react framer-motion
```

Create `.env.local` with:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## FILE STRUCTURE (create exactly this)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── analyze-brand/route.ts
│       ├── recommend-box/route.ts
│       ├── generate-design/route.ts
│       └── refine-design/route.ts
├── components/
│   ├── Header.tsx
│   ├── StepIndicator.tsx
│   ├── Step1_UrlInput.tsx
│   ├── Step2_BrandAnalysis.tsx
│   ├── Step3_BoxSize.tsx
│   ├── Step4_DesignGen.tsx
│   ├── Step5_DesignEditor.tsx
│   ├── BoxLayoutSVG.tsx
│   ├── Box3DPreview.tsx
│   ├── ROICalculator.tsx
│   └── AIChat.tsx
├── lib/
│   ├── constants.ts
│   ├── types.ts
│   ├── prompts.ts
│   └── svg-templates.ts
```

---

## CRITICAL REQUIREMENTS CHECKLIST

Before considering the build complete, verify ALL of these work:

### Flow
- [ ] User can enter a URL and click "Analyze My Brand"
- [ ] Brand analysis results display with company name, tone, target customer, design direction, messaging signals, and recommended box color
- [ ] User can choose "I know my size" and pick from the catalog (3 tabs: Standard, Popular Custom, Any Size)
- [ ] User can choose "Help me choose" and answer the sizing questionnaire
- [ ] AI recommends a box from the catalog with confidence level and rationale
- [ ] Box size disclaimer with refund policy link is visible
- [ ] Packaging design generates as a flattened SVG with all 6 labeled panels
- [ ] Design uses BLACK INK ONLY on kraft or white background
- [ ] User can type AI prompts to refine the design and see it update
- [ ] Quick controls work: logo size slider, logo on 1/2/4 sides toggle
- [ ] SVG can be downloaded

### Branding & Links
- [ ] CustomBoxes.io branding (orange accent, "Powered by CustomBoxes.io")
- [ ] ROI calculator accessible from step 2+ with link to https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators
- [ ] Refund policy link: https://customboxes.io/policies/refund-policy
- [ ] Large order quote link (for 5000+ volume): https://customboxes.io/pages/large-order-quote-request-form
- [ ] AI Chat agent accessible as floating button, can discuss branding/financials/design/FAQs

### Quality
- [ ] Loading states shown during every API call
- [ ] Error states handled gracefully (bad URL, API failures)
- [ ] No console errors in normal flow
- [ ] App looks polished — not a wireframe, not a class project
- [ ] Logo upload works and logo appears in the SVG layout

---

## WHAT TO DO IF SOMETHING BREAKS

- **Claude returns invalid JSON**: Strip markdown fences, try parsing. If still fails, retry the API call once with an additional line in the prompt: "Return ONLY valid JSON. No markdown, no backticks, no explanation — just the JSON object."
- **URL fetch fails in brand analysis**: Return a helpful error to the user ("We couldn't access that URL. Please check it's correct and publicly accessible."). Don't crash.
- **SVG doesn't render correctly**: Check that panel dimensions are calculated correctly from box L×W×H. Front/Back = L×H, Left/Right = W×H, Top/Bottom = L×W. Use a fixed viewBox width (e.g., 900) and calculate everything relative to it.
- **Design refinement doesn't preserve structure**: Make sure you send the ENTIRE current design JSON to Claude in the refine prompt, not just the changed parts. Claude must return the complete updated design.

---

## AFTER BUILD IS COMPLETE

1. Run `npm run build` to verify no build errors
2. Run `npm run dev` and test both flows:
   - **Flow A (known size)**: URL → brand analysis → "I know my size" → pick box → generate design → refine → download
   - **Flow B (unknown size)**: URL → brand analysis → "Help me choose" → answer questions → get recommendation → generate design → use AI chat → refine → download
3. Test with at least 2 different URLs (e.g., allbirds.com and bombas.com)
4. Verify all external links open correctly
5. Check the SVG output looks like a real packaging dieline, not random art

---

## FINAL REMINDER

The scoring rubric is:
- **30 points**: Packaging layout quality and print-ready design (and ability to make changes)
- **20 points**: End-to-end working prototype
- **20 points**: Brand understanding from URL
- **20 points**: Box size recommendation quality
- **5 points**: Tool integration and technical judgment
- **5 points**: Polish and clarity

The SVG design output and the ability to refine it are worth the MOST points. Invest your best effort there. The end-to-end flow working without crashes is the next priority. Everything else supports these two pillars.

Now begin. Start with Phase 1 from `plan.md`.
