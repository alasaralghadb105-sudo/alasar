import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { QUICK_PROMPTS, answerCustomer } from '../lib/customerAI';

type Msg = { id: number; role: 'bot' | 'user'; text: string };

let seq = 1;

export default function CustomerAIChat() {
  const { settings, products, payMethods, currency } = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: seq++,
      role: 'bot',
      text: `مرحباً! أنا مساعد ${settings.storeName} الذكي 🤖\nأجاوب على استفساراتك عن المنتجات، الأسعار، الدفع اليمني، والتحميل بعد التأكيد — اسألني بأي صيغة.`,
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, msgs, typing]);

  const reply = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { id: seq++, role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    const delay = 450 + Math.min(900, q.length * 12);
    window.setTimeout(() => {
      const ans = answerCustomer(q, {
        settings,
        products,
        payMethods,
        currency,
      });
      setMsgs((m) => [...m, { id: seq++, role: 'bot', text: ans }]);
      setTyping(false);
    }, delay);
  };

  return (
    <>
      {/* زر عائم */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed z-[90] bottom-5 left-5 sm:bottom-6 sm:left-6 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all ${
          open
            ? 'bg-navy text-white rotate-0'
            : 'bg-navy text-gold hover:scale-105'
        }`}
        aria-label={open ? 'إغلاق المساعد' : 'فتح المساعد الذكي'}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div
          className="fixed z-[90] bottom-24 left-4 right-4 sm:right-auto sm:left-6 sm:w-[380px] max-h-[min(70vh,560px)] flex flex-col rounded-2xl border border-navy/10 bg-white shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="المساعد الذكي"
        >
          <header className="bg-navy text-white px-4 py-3 flex items-center gap-3 shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold">
              <Bot className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm flex items-center gap-1">
                مساعد {settings.storeName}
                <Sparkles className="w-3.5 h-3.5 text-gold" />
              </p>
              <p className="text-[11px] text-white/60">يرد فوراً على استفسارات العملاء</p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-cream/40">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-navy text-white rounded-br-md'
                      : 'bg-white border border-navy/10 text-ink rounded-bl-md shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-end">
                <div className="bg-white border border-navy/10 rounded-2xl rounded-bl-md px-4 py-3 text-muted text-xs">
                  يكتب…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-3 pt-2 flex flex-wrap gap-1.5 shrink-0 border-t border-navy/5 bg-white">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={typing}
                onClick={() => reply(p)}
                className="text-[11px] font-semibold rounded-full border border-navy/12 bg-cream px-2.5 py-1 text-navy hover:bg-navy hover:text-white transition-colors disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            className="p-3 flex gap-2 shrink-0 bg-white border-t border-navy/5"
            onSubmit={(e) => {
              e.preventDefault();
              reply(input);
            }}
          >
            <input
              ref={inputRef}
              className="field flex-1 py-2.5 text-sm"
              placeholder="اكتب سؤالك هنا…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={typing}
            />
            <button
              type="submit"
              disabled={typing || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-navy disabled:opacity-40 shrink-0"
              aria-label="إرسال"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
