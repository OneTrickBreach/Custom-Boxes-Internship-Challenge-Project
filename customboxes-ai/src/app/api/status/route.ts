import { NextResponse } from 'next/server';
import { isDemoMode } from '../../../lib/demo-mode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    {
      demoMode: isDemoMode(),
      hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    },
  );
}
