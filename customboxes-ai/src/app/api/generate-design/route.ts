import { NextRequest, NextResponse } from 'next/server';
import { DESIGN_GENERATION_PROMPT } from '../../../lib/prompts';
import { claudeJson, describeClaudeError } from '../../../lib/api-helpers';
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
): PanelDesign[] {
  const byKey: Record<string, PanelDesign> = {};
  for (const p of panels) {
    if (p?.panel) byKey[p.panel] = p;
  }
  return REQUIRED_PANELS.map(
    (k) => byKey[k] || { panel: k, elements: [] },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      brandAnalysis: BrandAnalysis;
      box: BoxSize;
      boxColor: 'kraft' | 'white';
      ectRating: '32 ECT' | 'Heavy Duty';
      hasLogo: boolean;
    };

    if (!body.brandAnalysis || !body.box) {
      return NextResponse.json(
        { error: 'Missing brand analysis or box.' },
        { status: 400 },
      );
    }

    const prompt = DESIGN_GENERATION_PROMPT({
      brandAnalysis: JSON.stringify(body.brandAnalysis, null, 2),
      boxSize: `${body.box.name} (${body.box.length}×${body.box.width}×${body.box.height} in)`,
      boxColor: body.boxColor,
      ectRating: body.ectRating,
      hasLogo: Boolean(body.hasLogo),
    });

    const raw = await claudeJson<RawResponse>({
      prompt,
      maxTokens: 3000,
    });

    const layout: DesignLayout = {
      panels: ensureAllPanels(raw.panels || []),
      designNotes: raw.designNotes || '',
      inkColor: 'black',
      boxColor: body.boxColor,
    };

    return NextResponse.json(layout);
  } catch (err) {
    const { status, userMessage, code } = describeClaudeError(err);
    console.error('generate-design failed:', code, userMessage);
    return NextResponse.json({ error: userMessage, code }, { status });
  }
}
