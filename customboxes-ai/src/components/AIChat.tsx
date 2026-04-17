'use client';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import type {
  BrandAnalysis,
  BoxRecommendation,
  BoxSize,
  ChatMessage,
  DesignLayout,
} from '../lib/types';

interface Props {
  brandAnalysis: BrandAnalysis | null;
  boxRecommendation: BoxRecommendation | null;
  selectedBoxSize: BoxSize | null;
  design: DesignLayout | null;
}

const STARTERS = [
  'What should go on the side panels?',
  'Is custom packaging worth it for my volume?',
  'What is 32 ECT and when do I need Heavy Duty?',
  'How do I make my box feel more premium?',
];

export function AIChat({
  brandAnalysis,
  boxRecommendation,
  selectedBoxSize,
  design,
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          brandAnalysis,
          boxSelection: {
            box: selectedBoxSize || boxRecommendation?.primaryBox,
            ectRating: boxRecommendation?.ectRating,
            boxColor: boxRecommendation?.boxColor,
          },
          currentDesign: design,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { role: 'assistant', content: `Sorry, ${data.error}` }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || '' }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Something went wrong. Try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 btn-primary w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open AI chat"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-full max-w-sm h-full bg-white border-l hairline flex flex-col">
            <div className="border-b hairline px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent)' }}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-[13px] font-medium leading-tight">CustomBoxes.io AI</div>
                  <div className="text-[11px] text-[color:var(--text-muted)] leading-tight">
                    Packaging assistant
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-md btn-ghost flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="text-[13px] text-[color:var(--text-secondary)]">
                    Hi! I&apos;m your packaging assistant. Ask me about branding, ROI,
                    design choices, or anything about corrugated shipping boxes.
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-[12px] px-3 py-2 rounded-md chip"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] text-[13px] rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[color:var(--ink-black)] text-white'
                        : 'bg-[color:var(--bg)] border hairline'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-3 py-2 bg-[color:var(--bg)] border hairline">
                    <span className="inline-flex gap-1">
                      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t hairline p-3">
              <div className="relative">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Ask anything about your packaging…"
                  className="input-field w-full p-2.5 pr-10 text-[13px] resize-none"
                />
                <button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  className="btn-primary absolute right-2 bottom-2 w-7 h-7 rounded-md flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
