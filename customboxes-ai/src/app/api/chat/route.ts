import { NextRequest, NextResponse } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { CHAT_AGENT_PROMPT } from '../../../lib/prompts';
import {
  getAnthropic,
  extractText,
  CLAUDE_MODEL,
  describeClaudeError,
} from '../../../lib/api-helpers';
import { isDemoMode, demoDelay } from '../../../lib/demo-mode';
import { mockChatReply } from '../../../lib/demo-fixtures';
import type { ChatMessage } from '../../../lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: ChatMessage[];
      brandAnalysis?: unknown;
      boxSelection?: unknown;
      currentDesign?: unknown;
    };

    const system = CHAT_AGENT_PROMPT({
      brandAnalysis: JSON.stringify(body.brandAnalysis ?? {}, null, 2),
      boxSelection: JSON.stringify(body.boxSelection ?? {}, null, 2),
      currentDesign: JSON.stringify(body.currentDesign ?? {}, null, 2),
    });

    const messages = (body.messages || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    if (!messages.length) {
      return NextResponse.json(
        { error: 'No messages provided.' },
        { status: 400 },
      );
    }

    if (isDemoMode()) {
      await demoDelay(800);
      const last = messages[messages.length - 1];
      return NextResponse.json({ reply: mockChatReply(last.content) });
    }

    const client = getAnthropic();
    const response = (await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 700,
      system,
      messages,
    })) as Anthropic.Messages.Message;

    const text = extractText(response);
    return NextResponse.json({ reply: text });
  } catch (err) {
    const { status, userMessage, code } = describeClaudeError(err);
    console.error('chat failed:', code, userMessage);
    if (code === 'credits' || code === 'auth' || code === 'rate_limit') {
      try {
        const body = await req.clone().json().catch(() => null);
        const msgs = (body?.messages || []) as { role: string; content: string }[];
        const last = msgs[msgs.length - 1];
        if (last) {
          return NextResponse.json({
            reply: mockChatReply(last.content),
            __demo: true,
            __demoReason: code,
          });
        }
      } catch {
        /* fall through */
      }
    }
    return NextResponse.json({ error: userMessage, code }, { status });
  }
}
