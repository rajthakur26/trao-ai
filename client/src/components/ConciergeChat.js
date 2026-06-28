'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, CheckCircle2 } from 'lucide-react';

const SUGGESTIONS = [
  'Make day 2 more adventurous',
  'Add a fancy dinner on the last day',
  'Remove the museum visits',
  'Add a day trip with nature',
];

/**
 * The AI Concierge — a conversational editor. The user types a natural-language
 * request; the backend agent returns a reply plus a list of applied operations,
 * and the parent refreshes the itinerary.
 */
export default function ConciergeChat({ onSend, busy }) {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      text: "Hi! I'm your trip concierge. Ask me to tweak any day — add or remove activities, or regenerate a day. Try one of the suggestions below.",
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: message }]);
    try {
      const { reply, applied } = await onSend(message);
      setMessages((m) => [...m, { role: 'agent', text: reply, applied }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'agent', text: `Sorry — ${err.message}` }]);
    }
  };

  return (
    <div className="card flex h-[32rem] flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-sky-500 px-5 py-3 text-white">
        <Sparkles className="h-5 w-5" />
        <div>
          <h3 className="font-semibold leading-tight">AI Concierge</h3>
          <p className="text-xs text-brand-100">Edit your trip by chatting</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'rounded-br-sm bg-brand-600 text-white'
                  : 'rounded-bl-sm bg-slate-100 text-slate-700'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.applied?.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-slate-200 pt-2">
                  {m.applied.map((a, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="chip border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-slate-100 p-3"
      >
        <input
          className="input"
          placeholder="Ask the concierge to change your trip…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary shrink-0 px-3">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
