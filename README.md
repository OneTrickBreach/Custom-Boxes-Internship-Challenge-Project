# CustomBoxes.io — AI Packaging Designer

Submission for the CustomBoxes.io 60-minute AI Internship Challenge.

> **Submitting?** Read [`SUBMISSION.md`](./SUBMISSION.md) — it has the demo script, Loom checklist, tools-used / real-vs-mocked / what-to-improve-next write-ups, the scoring-rubric self-check, and the final pre-submission checklist.

A working prototype that:
- Takes a company URL
- Analyzes the brand via Claude (`claude-sonnet-4-20250514`)
- Recommends a shipping box from a predefined catalog (no invented dimensions)
- Generates a panel-aware, black-ink-only SVG layout on kraft or white corrugated
- Lets the user iterate with natural-language prompts + per-panel quick controls
- Includes an ROI / break-even drawer and a floating packaging AI assistant

Live app lives in [`customboxes-ai/`](customboxes-ai/).

## Run locally

```bash
cd customboxes-ai
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm install
npm run dev
```

Then open http://localhost:3000.

## Files

- `Public - AI Internship Challenge (60 min).md` — the original challenge spec
- `plan.md` / `prompt.md` — the build plan handed to the coding agent
- `customboxes-ai/` — the Next.js 16 + TypeScript + Tailwind v4 app

## Stack

Next.js 16 App Router · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk` · `lucide-react` · DM Serif Display + DM Sans · SVG for all packaging output.

## API routes

| Route | What it does |
| --- | --- |
| `POST /api/analyze-brand` | Scrapes the URL, extracts title/OG/meta/body text, sends to Claude, returns a structured `BrandAnalysis` |
| `POST /api/recommend-box` | Takes brand + sizing answers, returns a catalog-constrained box recommendation |
| `POST /api/generate-design` | Returns a 6-panel `DesignLayout` with black-ink-only elements |
| `POST /api/refine-design` | Applies a user prompt against the full current design and returns an updated 6-panel layout |
| `POST /api/chat` | Context-aware packaging assistant |

All Claude responses are parsed with a forgiving JSON extractor (strips markdown fences, does balanced-brace scanning) and retry once on failure.
