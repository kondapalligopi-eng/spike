import { useState } from 'react';
import { Link } from 'react-router-dom';

type Step = {
  label: string;
  short: string;
  question: string;
  helper: string;
  placeholder: string;
  field: 'name' | 'email' | 'phone';
  icon: string;
};

const STEPS: Step[] = [
  {
    label: 'About you',
    short: 'About',
    question: "What's your name?",
    helper: "We'll use this to personalize your experience.",
    placeholder: 'e.g. Sunitha',
    field: 'name',
    icon: '👤',
  },
  {
    label: 'Contact',
    short: 'Contact',
    question: "What's your email?",
    helper: 'We send confirmations and updates here.',
    placeholder: 'you@example.com',
    field: 'email',
    icon: '✉️',
  },
  {
    label: 'Reach',
    short: 'Reach',
    question: "What's your phone number?",
    helper: 'For quick alerts about your bookings.',
    placeholder: '+91 ...',
    field: 'phone',
    icon: '📞',
  },
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
  const progressPct = done
    ? 100
    : ((stepIndex + (canAdvance ? 0.5 : 0)) / STEPS.length) * 100;

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-0 rounded-3xl overflow-hidden shadow-2xl border-2 border-primary-100 bg-white">
          {/* Left brand banner */}
          <aside className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white p-8 sm:p-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
                backgroundSize: '120px 120px',
              }}
            />
            <div className="relative">
              <span aria-hidden="true" className="text-4xl drop-shadow inline-block mb-5">🐕</span>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-300 uppercase mb-2">
                Quick setup · 3 steps
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight mb-2">
                Let's get to know you
              </h2>
              <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-4" />
              <p className="text-sm text-primary-100/85 mb-8 max-w-xs">
                Just three quick questions and you're done — takes under a minute.
              </p>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-primary-100/70 mb-2">
                  <span>Progress</span>
                  <span className="text-accent-300">{Math.round(progressPct)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-400 to-accent-300 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Vertical step list */}
              <ol className="relative space-y-5">
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-3 bottom-3 w-px bg-white/20"
                />
                {STEPS.map((s, i) => {
                  const completed = done || i < stepIndex;
                  const current = !done && i === stepIndex;
                  return (
                    <li key={s.field} className="relative flex items-start gap-3">
                      <div
                        className={`relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold transition-all duration-300 ring-4 ${
                          completed
                            ? 'bg-accent-400 text-warm-900 ring-accent-400/30'
                            : current
                            ? 'bg-white text-primary-700 ring-white/40 scale-110'
                            : 'bg-white/10 text-white/50 ring-transparent'
                        }`}
                      >
                        {completed ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span aria-hidden="true">{s.icon}</span>
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p
                          className={`text-[10px] font-bold tracking-[0.25em] uppercase ${
                            current ? 'text-accent-300' : completed ? 'text-white/70' : 'text-white/40'
                          }`}
                        >
                          Step {i + 1}
                        </p>
                        <p
                          className={`text-sm font-semibold leading-tight transition-colors ${
                            current ? 'text-white' : completed ? 'text-white/80' : 'text-white/50'
                          }`}
                        >
                          {s.label}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>

          {/* Right form */}
          <div className="p-6 sm:p-10 flex flex-col">
            {done ? (
              <div className="flex-1 flex items-center">
                <div className="w-full text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent-100 ring-4 ring-accent-300/40 flex items-center justify-center text-3xl">
                    ✨
                  </div>
                  <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
                    All done
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 mb-2">
                    You're all set!
                  </h1>
                  <p className="text-sm text-warm-500 mb-8">Here's what you shared:</p>
                  <dl className="text-left max-w-sm mx-auto rounded-2xl border-2 border-primary-100 bg-primary-50/50 divide-y divide-primary-100 overflow-hidden mb-8">
                    {STEPS.map((s) => (
                      <div key={s.field} className="px-5 py-3 flex items-center gap-3">
                        <span aria-hidden="true" className="text-lg shrink-0">{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <dt className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700">
                            {s.label}
                          </dt>
                          <dd className="text-sm font-semibold text-warm-900 truncate">
                            {form[s.field]}
                          </dd>
                        </div>
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
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onNext();
                }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase">
                    Step {stepIndex + 1} of {STEPS.length}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-warm-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                    In progress
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <span
                    aria-hidden="true"
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 ring-1 ring-primary-200 flex items-center justify-center text-xl"
                  >
                    {step.icon}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 leading-tight">
                    {step.question}
                  </h1>
                </div>
                <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-2" />
                <p className="text-sm text-warm-500 mb-8">{step.helper}</p>

                <input
                  type={step.field === 'email' ? 'email' : step.field === 'phone' ? 'tel' : 'text'}
                  autoFocus
                  value={value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [step.field]: e.target.value }))
                  }
                  placeholder={step.placeholder}
                  className="w-full px-5 py-4 text-lg rounded-2xl bg-warm-50 border-2 border-warm-200 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all placeholder:text-warm-400"
                />

                <div className="mt-auto pt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
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
    </div>
  );
}
