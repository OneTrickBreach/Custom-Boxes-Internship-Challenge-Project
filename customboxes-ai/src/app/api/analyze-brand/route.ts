import { NextRequest, NextResponse } from 'next/server';
import { BRAND_ANALYSIS_PROMPT } from '../../../lib/prompts';
import { claudeJson, describeClaudeError } from '../../../lib/api-helpers';
import { isDemoMode, demoDelay } from '../../../lib/demo-mode';
import { mockBrandAnalysis } from '../../../lib/demo-fixtures';
import type { BrandAnalysis } from '../../../lib/types';

export const runtime = 'nodejs';

async function scrapeUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    const html = await res.text();

    // Grab title + meta
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const metaDescMatch = html.match(
      /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
    );
    const ogDescMatch = html.match(
      /<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
    );
    const ogTitleMatch = html.match(
      /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    );
    const metaDesc = metaDescMatch ? metaDescMatch[1] : '';
    const ogDesc = ogDescMatch ? ogDescMatch[1] : '';
    const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';

    const stripped = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    const header = [
      title && `TITLE: ${title}`,
      ogTitle && `OG_TITLE: ${ogTitle}`,
      metaDesc && `META_DESC: ${metaDesc}`,
      ogDesc && `OG_DESC: ${ogDesc}`,
    ]
      .filter(Boolean)
      .join('\n');

    const body = stripped.slice(0, 2800);
    return `${header}\n\nBODY:\n${body}`.trim();
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      url?: string;
      additionalNotes?: string;
    };
    const rawUrl = (body.url || '').trim();
    if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) {
      return NextResponse.json(
        { error: 'Please provide a valid URL starting with http:// or https://.' },
        { status: 400 },
      );
    }

    if (isDemoMode()) {
      await demoDelay(1200);
      return NextResponse.json(
        mockBrandAnalysis(rawUrl, body.additionalNotes),
      );
    }

    let scraped: string;
    try {
      scraped = await scrapeUrl(rawUrl);
    } catch {
      return NextResponse.json(
        {
          error:
            "We couldn't access that URL. Please check it's correct and publicly accessible.",
        },
        { status: 502 },
      );
    }

    if (body.additionalNotes && body.additionalNotes.trim()) {
      scraped += `\n\nADDITIONAL NOTES FROM USER:\n${body.additionalNotes.trim()}`;
    }

    const prompt = BRAND_ANALYSIS_PROMPT(scraped);

    try {
      const analysis = await claudeJson<BrandAnalysis>({
        prompt,
        maxTokens: 1500,
      });
      return NextResponse.json(analysis);
    } catch (err) {
      const { status, userMessage, code } = describeClaudeError(err);
      console.error('analyze-brand failed:', code, userMessage);
      return NextResponse.json({ error: userMessage, code }, { status });
    }
  } catch (err) {
    const { status, userMessage, code } = describeClaudeError(err);
    console.error('analyze-brand fatal:', code, userMessage);
    return NextResponse.json({ error: userMessage, code }, { status });
  }
}
