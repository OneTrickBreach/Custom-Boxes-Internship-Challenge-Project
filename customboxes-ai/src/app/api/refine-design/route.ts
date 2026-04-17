import { NextRequest, NextResponse } from 'next/server';
import { DESIGN_REFINE_PROMPT } from '../../../lib/prompts';
import { claudeJson } from '../../../lib/api-helpers';
import type {
  BrandAnalysis,
  BoxSize,
  DesignLayout,
  PanelDesign,
  PanelKey,
} from '../../../lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface RawResponse {
  panels: PanelDesign[];
  designNotes?: string;
}

const REQUIRED_PANELS: PanelKey[] = [
  'front',
  'back',
  'top',
  'bottom',
  'left',
  'right',
];

function ensureAllPanels(
  panels: PanelDesign[],
  fallback: PanelDesign[],
): PanelDesign[] {
  const byKey: Record<string, PanelDesign> = {};
  for (const p of panels) {
    if (p?.panel) byKey[p.panel] = p;
  }
  const fbByKey: Record<string, PanelDesign> = {};
  for (const p of fallback) {
    if (p?.panel) fbByKey[p.panel] = p;
  }
  return REQUIRED_PANELS.map(
    (k) => byKey[k] || fbByKey[k] || { panel: k, elements: [] },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      brandAnalysis: BrandAnalysis;
      box: BoxSize;
      boxColor: 'kraft' | 'white';
      currentDesign: DesignLayout;
      userPrompt: string;
    };

    if (
      !body.brandAnalysis ||
      !body.box ||
      !body.currentDesign ||
      !body.userPrompt
    ) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 },
      );
    }

    const prompt = DESIGN_REFINE_PROMPT({
      brandAnalysis: JSON.stringify(body.brandAnalysis, null, 2),
      boxSize: `${body.box.name} (${body.box.length}×${body.box.width}×${body.box.height} in)`,
      boxColor: body.boxColor,
      currentDesign: JSON.stringify(body.currentDesign, null, 2),
      userPrompt: body.userPrompt,
    });

    const raw = await claudeJson<RawResponse>({
      prompt,
      maxTokens: 3500,
    });

    const layout: DesignLayout = {
      panels: ensureAllPanels(raw.panels || [], body.currentDesign.panels),
      designNotes: raw.designNotes || body.currentDesign.designNotes,
      inkColor: 'black',
      boxColor: body.boxColor,
    };

    return NextResponse.json(layout);
  } catch (err) {
    console.error('refine-design fatal', err);
    return NextResponse.json(
      { error: 'Unexpected error refining design.' },
      { status: 500 },
    );
  }
}
