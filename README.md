# CustomBoxes.io — AI Packaging Designer

Official submission for the **CustomBoxes.io AI Internship Challenge — Step 2** (60-minute AI Packaging Designer Build).

> **For evaluators:** the live site is at **https://custom-boxes-internship-challenge-p.vercel.app**. The unlisted demo recording is on YouTube: **https://youtu.be/fdCf-wcJiR8**. The 2-minute guided tour is in [`REVIEWER_NOTE.md`](./REVIEWER_NOTE.md). The full submission document is [`SUBMISSION.md`](./SUBMISSION.md). The raw recording file is also at [`customboxes-ai-demo.mkv`](./customboxes-ai-demo.mkv) in this repo's root.

A working prototype that:
- Takes a company URL and uploads a logo.
- Analyzes the brand with Claude (`claude-sonnet-4-6`) — tone, tagline, target customer, visual style, messaging signals, recommended box color.
- Asks whether the user knows their box size; if not, runs a sizing questionnaire and recommends from a fixed 14-box catalog (no invented dimensions).
- Generates a panel-aware, black-ink-only **SVG dieline** on kraft or white corrugated, with fold lines and crop marks.
- Lets the user iterate with **natural-language prompts** plus per-panel content-scale sliders, 1 / 2 / 4-side logo placement, kraft / white toggle, and element-visibility toggles.
- Exports the final layout as **SVG or PNG**.
- Surfaces ROI / break-even / volume-tier pricing in a drawer, and a floating packaging assistant chat.

All CustomBoxes.io links (ROI calculator, refund policy, large-order quote, home) are wired in where the spec requires.

The Next.js app lives in [`customboxes-ai/`](customboxes-ai/).

## Run locally

```bash
cd customboxes-ai
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

Two modes, both fully functional:

- **Real mode** — paste `ANTHROPIC_API_KEY=sk-ant-...` into `.env.local`. Requires credits (https://console.anthropic.com/settings/billing — a $5 top-up covers the demo flow many times over).
- **Demo mode** — leave the key blank, or set `DEMO_MODE=true`. The app runs end-to-end with rule-based fixtures and a "Demo Mode" pill in the header so it's honest about what's simulated. Refinements actually transform the design based on prompt keywords. The app also **auto-falls-back** to demo mode if Claude returns a billing / auth / rate-limit error, so the flow never gets stuck mid-session.

See [`SUBMISSION.md`](./SUBMISSION.md) for the full write-up: deliverables, tools, real-vs-mocked, what I'd improve next, scoring-rubric mapping, and troubleshooting.

## See it in real-Claude mode (with your own key)

The public live site at [`custom-boxes-internship-challenge-p.vercel.app`](https://custom-boxes-internship-challenge-p.vercel.app) runs in **demo mode** (free, simulated). If you have your own Anthropic API key and want to see the real-Claude version (brand analysis against any URL, open-ended AI refinements), the easiest path is a **one-click Vercel deploy under your own account**:

👉 **[Deploy your own copy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOneTrickBreach%2FCustom-Boxes-Internship-Challenge-Project&root-directory=customboxes-ai&env=ANTHROPIC_API_KEY)**

Vercel will prompt you for your `ANTHROPIC_API_KEY` during setup, deploy to your own URL in ~2 minutes, and run on your Anthropic account. No terminal, no manual env setup. (Running locally with `npm run dev` and your key in `.env.local` also works.)

## Files

| | |
|---|---|
| [`SUBMISSION.md`](./SUBMISSION.md) | Official submission document (deliverables, tools, rubric mapping, caveats) |
| [`customboxes-ai-demo.mkv`](./customboxes-ai-demo.mkv) | Demo recording showing both flows |
| [`customboxes-ai/`](./customboxes-ai/) | The Next.js 16 + TypeScript + Tailwind v4 app |
| `Public - AI Internship Challenge (60 min).md` | Original challenge spec, kept for reference |
| `plan.md` · `prompt.md` | Build plan + prompt handed to the coding agent |

## Stack

Next.js 16 App Router · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk` · `lucide-react` · DM Serif Display + DM Sans · pure SVG for all packaging output.

## API routes

| Route | What it does |
| --- | --- |
| `POST /api/analyze-brand` | Scrapes the URL (title / OG / meta / body → 3k chars), sends to Claude, returns structured `BrandAnalysis`. |
| `POST /api/recommend-box` | Takes brand + sizing answers, returns a catalog-constrained box recommendation with confidence + rationale + ECT + alternate. |
| `POST /api/generate-design` | Returns a 6-panel `DesignLayout` with black-ink-only elements. |
| `POST /api/refine-design` | Applies a user prompt against the full current design and returns an updated 6-panel layout, preserving panel logic. |
| `POST /api/chat` | Context-aware packaging assistant with brand / box / design injected as system prompt. |
| `GET /api/status` | Reports whether the app is in demo mode (used by the header pill). |

All Claude responses are parsed with a forgiving JSON extractor (strips markdown fences, does balanced-brace scanning) and retry once on failure. All five Claude-backed routes have a deterministic demo-mode fallback.

---

*Submitted by Ishan Biswas · `biswas.is@northeastern.edu`*
