# Reviewer's Guide — CustomBoxes.io AI Packaging Designer

**Live app:** https://custom-boxes-internship-challenge-p.vercel.app
**Demo video (unlisted):** https://youtu.be/fdCf-wcJiR8
**GitHub repo:** https://github.com/OneTrickBreach/Custom-Boxes-Internship-Challenge-Project

Sorry the first pass was local-only — everything is now live and reviewable in under 2 minutes. No setup on your end; just click the live app link above.

---

## What it does

The user pastes a company URL. The tool analyzes the brand, asks about their box size (or helps them figure it out from a short questionnaire), recommends a box from the real CustomBoxes.io catalog, and generates a black-ink-only printable packaging layout on kraft or white corrugated. The user can then refine the design with plain-English prompts ("make the logo larger", "simplify the side panels", "add a sustainability message") and download a print-ready SVG or PNG.

## What's real vs mocked

For the live demo, brand analysis uses pre-written profiles for four URLs (allbirds.com, bombas.com, glossier.com, yeti.com) so it works instantly with no API keys or cost. Everything else — the 14-box catalog, the box-fit algorithm, the 6-panel SVG dieline rendering, the natural-language refinement transformations, the PNG/SVG export — is the real production code, identical to what runs with a live Anthropic Claude key.

You'll see a small **"Demo Mode"** pill in the top header. That's intentional disclosure, not a bug.

## Guided tour (~2 minutes)

1. **Paste `allbirds.com`** (or click the suggestion chip) → click **Analyze My Brand**. A structured brand read appears — tone, target customer, visual style, recommended box color, messaging signals.
2. **Click through Step 2 and Step 3** → pick **Yes, I know my size** → select `10×8×6` from the Standard Sizes tab → **Continue to Design**. The flattened 6-panel dieline renders with fold lines and crop marks. Hover or drag the 3D preview below to rotate the box.
3. **Click Refine Design** → click the **"Make the logo larger"** suggestion chip → hit send. The layout updates live. Try the per-panel sliders and the show-tagline / show-URL / show-QR toggles. Click **Download SVG** to save a real print-ready file.

## Seeing it in real-Claude mode

With a live Anthropic API key, brand analysis runs against **any** URL (not just the four demo ones) and design refinements become open-ended Claude outputs instead of keyword-driven transformations.

If your team has a Claude / Anthropic API key handy and wants to see that version, the easiest path is a **one-click Vercel deploy under your own account**:

👉 **[Deploy your own copy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOneTrickBreach%2FCustom-Boxes-Internship-Challenge-Project&root-directory=customboxes-ai&env=ANTHROPIC_API_KEY)**

The link prompts you for your `ANTHROPIC_API_KEY` during setup, deploys to your own Vercel URL in ~2 minutes, and runs on your Anthropic account (no cost to me). No terminal, no manual setup.

If you'd rather run locally instead:

```bash
git clone https://github.com/OneTrickBreach/Custom-Boxes-Internship-Challenge-Project.git
cd Custom-Boxes-Internship-Challenge-Project/customboxes-ai
cp .env.local.example .env.local
# edit .env.local — paste ANTHROPIC_API_KEY=sk-ant-... (your key)
npm install
npm run dev
```

Open `http://localhost:3000`. The "Demo Mode" pill disappears and every call is a real Claude call against your account.

## Notes

- Works on desktop and mobile. Total core flow takes under 90 seconds.
- The full technical submission document is [`SUBMISSION.md`](./SUBMISSION.md) in the repo.
- Happy to walk through any part of the code or design decisions on a call.

— Ishan Biswas · `biswas.is@northeastern.edu`
