import { useState } from 'react';
import { Link } from 'react-router-dom';

type Step = {
  label: string;
  question: string;
  placeholder: string;
  field: 'name' | 'email' | 'phone';
};

const STEPS: Step[] = [
  { label: 'About you',  question: "What's your name?",         placeholder: 'e.g. Sunitha',         field: 'name' },
  { label: 'Contact',    question: "What's your email?",        placeholder: 'you@example.com',      field: 'email' },
  { label: 'Reach',      question: "What's your phone number?", placeholder: '+91 ...',              field: 'phone' },
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
    <div className="min-h-[80vh] bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Stepper */}
        <ol className="flex items-center justify-between mb-10 relative">
          <span
            aria-hidden="true"
            className="absolute top-4 left-4 right-4 h-0.5 bg-warm-200 -z-0"
          />
          <span
            aria-hidden="true"
            className="absolute top-4 left-4 h-0.5 bg-accent-400 -z-0 transition-all duration-500"
            style={{
              width: `calc(${(stepIndex / (STEPS.length - 1)) * 100}% - ${
                (stepIndex / (STEPS.length - 1)) * 32
              }px)`,
            }}
          />
          {STEPS.map((s, i) => {
            const reached = i <= stepIndex && !done ? true : done ? true : false;
            const isCurrent = !done && i === stepIndex;
            return (
              <li key={s.label} className="flex flex-col items-center z-10">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold transition-all duration-300 ${
                    reached
                      ? 'bg-accent-400 text-warm-900 ring-2 ring-accent-300/50 shadow-md'
                      : 'bg-white text-warm-400 ring-2 ring-warm-200'
                  } ${isCurrent ? 'scale-110' : ''}`}
                >
                  {done || i < stepIndex ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                    isCurrent ? 'text-primary-700' : reached ? 'text-warm-700' : 'text-warm-400'
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Card */}
        <div className="rounded-3xl border-2 border-primary-100 bg-white/90 backdrop-blur shadow-xl p-6 sm:p-10">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent-100 ring-4 ring-accent-300/40 flex items-center justify-center text-3xl">
                ✨
              </div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
                All done
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 mb-2">
                You're all set!
              </h1>
              <p className="text-sm text-warm-500 mb-8">
                Here's what you shared:
              </p>
              <dl className="text-left max-w-sm mx-auto rounded-2xl border-2 border-primary-100 bg-primary-50/50 divide-y divide-primary-100 overflow-hidden mb-8">
                {STEPS.map((s) => (
                  <div key={s.field} className="px-5 py-3 flex items-center justify-between gap-4">
                    <dt className="text-xs font-bold tracking-[0.2em] uppercase text-primary-700">
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
                  className="px-5 py-2.5 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors"
                >
                  Start over
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
                >
                  Go home
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onNext();
              }}
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 leading-tight mb-1">
                {step.question}
              </h1>
              <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-8" />

              <input
                type={step.field === 'email' ? 'email' : step.field === 'phone' ? 'tel' : 'text'}
                autoFocus
                value={value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [step.field]: e.target.value }))
                }
                placeholder={step.placeholder}
                className="w-full px-5 py-4 text-lg rounded-2xl bg-warm-50 border-2 border-warm-200 outline-none focus:border-primary-500 focus:bg-white transition-all placeholder:text-warm-400"
              />

              <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={stepIndex === 0}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border-2 border-warm-300 text-warm-700 text-sm font-semibold hover:bg-warm-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!canAdvance}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-40 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
                >
                  {isLast ? 'Finish' : 'Continue'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
