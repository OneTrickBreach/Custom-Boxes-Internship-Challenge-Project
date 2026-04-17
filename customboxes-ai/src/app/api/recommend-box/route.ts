import { NextRequest, NextResponse } from 'next/server';
import { BOX_RECOMMENDATION_PROMPT } from '../../../lib/prompts';
import { claudeJson, describeClaudeError } from '../../../lib/api-helpers';
import { isDemoMode, demoDelay } from '../../../lib/demo-mode';
import { mockBoxRecommendation } from '../../../lib/demo-fixtures';
import { BOX_CATALOG } from '../../../lib/constants';
import type {
  BrandAnalysis,
  SizingAnswers,
  BoxRecommendation,
} from '../../../lib/types';

export const runtime = 'nodejs';

interface ClaudeRecResponse {
  primaryBoxId: string;
  alternateBoxId?: string | null;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
  ectRating: '32 ECT' | 'Heavy Duty';
  boxColor: 'kraft' | 'white';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sizingAnswers: SizingAnswers;
      brandAnalysis: BrandAnalysis;
    };

    if (!body.sizingAnswers || !body.brandAnalysis) {
      return NextResponse.json(
        { error: 'Missing sizing answers or brand analysis.' },
        { status: 400 },
      );
    }

    if (isDemoMode()) {
      await demoDelay(900);
      return NextResponse.json(
        mockBoxRecommendation(body.sizingAnswers, body.brandAnalysis),
      );
    }

    const catalogText = BOX_CATALOG.map(
      (b) =>
        `- ${b.id}: ${b.name} (${b.length}×${b.width}×${b.height} in) [${b.category}] — ${b.commonUse}`,
    ).join('\n');

    const prompt = BOX_RECOMMENDATION_PROMPT({
      sizingAnswers: JSON.stringify(body.sizingAnswers, null, 2),
      brandAnalysis: JSON.stringify(body.brandAnalysis, null, 2),
      boxCatalog: catalogText,
    });

    const rec = await claudeJson<ClaudeRecResponse>({
      prompt,
      maxTokens: 900,
    });

    const primary = BOX_CATALOG.find((b) => b.id === rec.primaryBoxId);
    const alternate = rec.alternateBoxId
      ? BOX_CATALOG.find((b) => b.id === rec.alternateBoxId)
      : undefined;

    if (!primary) {
      return NextResponse.json(
        { error: 'Claude returned an unknown box id. Please try again.' },
        { status: 500 },
      );
    }

    const result: BoxRecommendation = {
      primaryBox: primary,
      alternateBox: alternate,
      confidence: rec.confidence,
      rationale: rec.rationale,
      ectRating: rec.ectRating,
      boxColor: rec.boxColor,
    };

    return NextResponse.json(result);
  } catch (err) {
    const { status, userMessage, code } = describeClaudeError(err);
    console.error('recommend-box failed:', code, userMessage);
    return NextResponse.json({ error: userMessage, code }, { status });
  }
}
