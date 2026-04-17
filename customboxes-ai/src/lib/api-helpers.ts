import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from './constants';

export function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }
  return new Anthropic({ apiKey: key });
}

/** Strip markdown fences, extract the first balanced JSON object/array, and parse. */
export function parseJsonLoose<T = unknown>(raw: string): T {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(stripped) as T;
  } catch {
    // fall through to bracket scan
  }

  const firstBrace = stripped.indexOf('{');
  const firstBracket = stripped.indexOf('[');
  let start = -1;
  let open = '{';
  let close = '}';
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    open = '{';
    close = '}';
  } else if (firstBracket !== -1) {
    start = firstBracket;
    open = '[';
    close = ']';
  }
  if (start === -1) {
    throw new Error('No JSON object/array found in response.');
  }

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        const slice = stripped.slice(start, i + 1);
        return JSON.parse(slice) as T;
      }
    }
  }
  throw new Error('Unbalanced JSON in response.');
}

type ClaudeMessage = Anthropic.Messages.Message;

/** Extract the text content from a Claude messages.create response. */
export function extractText(message: ClaudeMessage): string {
  const block = message.content[0];
  if (!block) return '';
  if (block.type === 'text') return block.text;
  return '';
}

export async function claudeJson<T>(opts: {
  prompt: string;
  maxTokens?: number;
  retrySuffix?: string;
}): Promise<T> {
  const client = getAnthropic();
  const { prompt, maxTokens = 2000, retrySuffix } = opts;

  const firstCall = (await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })) as ClaudeMessage;
  const firstText = extractText(firstCall);
  try {
    return parseJsonLoose<T>(firstText);
  } catch {
    const retryPrompt =
      prompt +
      (retrySuffix ||
        '\n\nReturn ONLY valid JSON. No markdown, no backticks, no explanation — just the JSON object.');
    const second = (await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: retryPrompt }],
    })) as ClaudeMessage;
    const secondText = extractText(second);
    return parseJsonLoose<T>(secondText);
  }
}

export { CLAUDE_MODEL };
