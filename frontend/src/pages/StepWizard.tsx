import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Step = {
  label: string;
  question: string;
  placeholder: string;
  field: 'name' | 'email' | 'phone';
};

const STEPS: Step[] = [
  { label: 'About you', question: "Hi there! 👋 What should I call you?",       placeholder: 'Type your name…',  field: 'name' },
  { label: 'Contact',   question: "Nice to meet you! What's your email?",       placeholder: 'you@example.com',  field: 'email' },
  { label: 'Reach',     question: "Last one — what's the best number to reach you?", placeholder: '+91 …',       field: 'phone' },
];

type Form = { name: string; email: string; phone: string };

// One pair of bubbles per completed step + the current question waiting
// for input. Each entry is rendered in order, so the conversation grows
// downward as you go.
type Bubble = { from: 'bot' | 'user'; text: string };

export function StepWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '' });
  const [draft, setDraft] = useState('');
  const [botTyping, setBotTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial typing → reveal first question
  useEffect(() => {
    const t = setTimeout(() => setBotTyping(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll on every conversation change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [stepIndex, botTyping, done]);

  const step = STEPS[stepIndex];
  const canAdvance = draft.trim().length > 0;
  const isLast = stepIndex === STEPS.length - 1;

  // Build the full conversation up to this point:
  // - For each completed step: bot question + user answer
  // - For the current step (if not done): bot question waiting for input
  const bubbles: Bubble[] = [];
  for (let i = 0; i < stepIndex; i++) {
    bubbles.push({ from: 'bot', text: STEPS[i].question });
    bubbles.push({ from: 'user', text: form[STEPS[i].field] });
  }
  if (!done && !botTyping) {
    bubbles.push({ from: 'bot', text: step.question });
  }
  if (done) {
    bubbles.push({ from: 'bot', text: STEPS[STEPS.length - 1].question });
    bubbles.push({ from: 'user', text: form[STEPS[STEPS.length - 1].field] });
    bubbles.push({
      from: 'bot',
      text: "Perfect — you're all set! ✨ Welcome to HiSpike, we'll be in touch.",
    });
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdvance) return;

    // Save the answer
    setForm((f) => ({ ...f, [step.field]: draft.trim() }));
    setDraft('');

    if (isLast) {
      setDone(true);
      return;
    }

    // Move to next step with a brief bot "typing" delay for realism
    setStepIndex((s) => s + 1);
    setBotTyping(true);
    setTimeout(() => setBotTyping(false), 600);
  };

  const reset = () => {
    setForm({ name: '', email: '', phone: '' });
    setStepIndex(0);
    setDraft('');
    setDone(false);
    setBotTyping(true);
    setTimeout(() => setBotTyping(false), 600);
  };

  const progressPct = done ? 100 : ((stepIndex + (canAdvance ? 0.5 : 0)) / STEPS.length) * 100;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary-50 via-warm-50 to-accent-50 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md h-[640px] max-h-[calc(100vh-100px)] flex flex-col rounded-3xl bg-white shadow-2xl border-2 border-primary-100 overflow-hidden">
        {/* Top bar — looks like a messenger header */}
        <div className="relative bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white px-5 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-accent-400 ring-2 ring-white/60 flex items-center justify-center text-2xl shadow">
              🐕
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">HiSpike</p>
            <p className="text-[11px] text-primary-100/90 leading-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online · Quick setup
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-bold tracking-[0.15em] uppercase">
            {done ? '3 / 3' : `${stepIndex + 1} / 3`}
          </span>
        </div>

        {/* Slim progress strip */}
        <div className="h-1 bg-warm-100">
          <div
            className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-accent-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Chat thread */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_60%)]"
        >
          {bubbles.map((b, i) => (
            <Bubble key={i} bubble={b} />
          ))}
          {!done && botTyping && <TypingBubble />}
        </div>

        {/* Input area or completion CTAs */}
        {done ? (
          <div className="px-4 py-4 border-t border-warm-200 bg-warm-50">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex-1 px-4 py-2.5 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-white text-sm font-semibold transition-colors"
              >
                Start over
              </button>
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
              >
                Go home
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="px-3 py-3 border-t border-warm-200 bg-warm-50 flex items-center gap-2"
          >
            <input
              type={step.field === 'email' ? 'email' : step.field === 'phone' ? 'tel' : 'text'}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={botTyping ? 'HiSpike is typing…' : step.placeholder}
              disabled={botTyping}
              className="flex-1 px-4 py-3 rounded-full bg-white border-2 border-warm-200 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all text-sm placeholder:text-warm-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!canAdvance || botTyping}
              aria-label="Send"
              className="shrink-0 w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-warm-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md"
            >
              <svg className="w-5 h-5 -ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Bubble({ bubble }: { bubble: Bubble }) {
  const isBot = bubble.from === 'bot';
  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isBot ? '' : 'justify-end'}`}>
      {isBot && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-accent-400 flex items-center justify-center text-sm">
          🐕
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 text-sm leading-snug shadow-sm ${
          isBot
            ? 'bg-white rounded-2xl rounded-bl-md border border-warm-200 text-warm-800'
            : 'bg-primary-600 text-white rounded-2xl rounded-br-md'
        }`}
      >
        {bubble.text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <div className="shrink-0 w-7 h-7 rounded-full bg-accent-400 flex items-center justify-center text-sm">
        🐕
      </div>
      <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-md border border-warm-200 shadow-sm flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-warm-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-warm-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-warm-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
