import { useState } from 'react';
import { Link } from 'react-router-dom';

type Step = {
  label: string;
  question: string;
  helper: string;
  placeholder: string;
  field: 'name' | 'email' | 'phone';
};

const STEPS: Step[] = [
  { label: 'About you', question: "What's your name?",      helper: 'Just so we can address you properly.',  placeholder: 'Type your name…', field: 'name' },
  { label: 'Contact',   question: "And your email?",        helper: "We'll send confirmations here.",        placeholder: 'you@example.com', field: 'email' },
  { label: 'Reach',     question: "Finally — your phone?",  helper: 'For quick alerts about your bookings.', placeholder: '+91 …',           field: 'phone' },
];

type Form = { name: string; email: string; phone: string };

export function StepWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '' });

  const step = STEPS[stepIndex];
  const value = form[step.field];
  const canAdvance = value.trim().length > 0;
  const isLast = stepIndex === STEPS.length - 1;
  const progressPct = done ? 100 : ((stepIndex + (canAdvance ? 0.5 : 0)) / STEPS.length) * 100;

  const onNext = () => {
    if (!canAdvance) return;
    if (isLast) {
      setDone(true);
      return;
    }
    setStepIndex((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const onBack = () => {
    if (done) {
      setDone(false);
      return;
    }
    setStepIndex((s) => Math.max(0, s - 1));
  };

  const reset = () => {
    setForm({ name: '', email: '', phone: '' });
    setStepIndex(0);
    setDone(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative bg-gradient-to-br from-warm-50 via-white to-primary-50 overflow-hidden">
      {/* Decorative blur orbs — soft modern aesthetic */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary-300/40 blur-3xl"
      />

      {/* Step counter pills (top-right) */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
        {STEPS.map((_, i) => {
          const completed = done || i < stepIndex;
          const current = !done && i === stepIndex;
          return (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current ? 'w-8 bg-primary-700' : completed ? 'w-4 bg-primary-400' : 'w-4 bg-warm-300'
              }`}
            />
          );
        })}
        <span className="ml-2 text-[11px] font-bold tracking-[0.25em] uppercase text-warm-700">
          {done ? '3 / 3' : `${stepIndex + 1} / ${STEPS.length}`}
        </span>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)] flex flex-col justify-center py-20">
        {done ? (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-accent-100 ring-8 ring-accent-300/30 text-4xl">
              ✨
            </div>
            <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
              All done
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-warm-900 mb-3">
              You're all set!
            </h1>
            <p className="text-base text-warm-500 mb-10">Here's what you shared:</p>
            <dl className="text-left max-w-md mx-auto rounded-3xl border-2 border-primary-100 bg-white shadow-sm divide-y divide-primary-100 overflow-hidden mb-10">
              {STEPS.map((s) => (
                <div key={s.field} className="px-6 py-4 flex items-center justify-between gap-4">
                  <dt className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700">
                    {s.label}
                  </dt>
                  <dd className="text-sm font-semibold text-warm-900 truncate">
                    {form[s.field]}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="px-6 py-3 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors"
              >
                Start over
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
              >
                Go home
              </Link>
            </div>
          </div>
        ) : (
          <form
            key={stepIndex}
            onSubmit={(e) => {
              e.preventDefault();
              onNext();
            }}
            className="animate-fade-in"
          >
            <p className="text-[11px] font-semibold tracking-[0.4em] text-accent-600 uppercase mb-4">
              {step.label}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-warm-900 leading-[1.05] mb-3">
              {step.question}
            </h1>
            <p className="text-base sm:text-lg text-warm-500 mb-10 max-w-xl">{step.helper}</p>

            <div className="relative max-w-2xl">
              <input
                type={step.field === 'email' ? 'email' : step.field === 'phone' ? 'tel' : 'text'}
                autoFocus
                value={value}
                onChange={(e) => setForm((f) => ({ ...f, [step.field]: e.target.value }))}
                placeholder={step.placeholder}
                className="w-full pl-1 pr-32 py-4 text-3xl sm:text-4xl font-bold bg-transparent border-0 border-b-2 border-warm-300 outline-none focus:border-primary-600 transition-colors placeholder:text-warm-300 placeholder:font-normal"
              />
              <button
                type="submit"
                disabled={!canAdvance}
                className="absolute right-0 bottom-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary-700 hover:bg-primary-800 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold tracking-wider uppercase transition-all shadow-md"
              >
                {isLast ? 'Finish' : 'OK'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-xs text-warm-400">
              press <kbd className="px-1.5 py-0.5 rounded bg-warm-200 text-warm-700 font-mono text-[10px]">Enter ↵</kbd> to continue
            </p>

            {stepIndex > 0 && (
              <button
                type="button"
                onClick={onBack}
                className="mt-12 inline-flex items-center gap-1.5 text-sm font-semibold text-warm-500 hover:text-warm-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </form>
        )}
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-warm-200">
        <div
          className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-accent-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
