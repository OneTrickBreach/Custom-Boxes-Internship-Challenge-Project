import { NextResponse } from 'next/server';
import { isDemoMode } from '../../../lib/demo-mode';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    demoMode: isDemoMode(),
    hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
