import { useState } from 'react';
import { Link } from 'react-router-dom';

type Step = {
  label: string;
  question: string;
  helper: string;
  placeholder: string;
  field: 'name' | 'email' | 'phone';
  iconPath: string;
};

// SVG icons used in the stepper and summary — crisp at any size, no emoji
// rendering quirks.
const USER_ICON  = 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
const MAIL_ICON  = 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
const PHONE_ICON = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 5z';

const STEPS: Step[] = [
  { label: 'About you', question: "What's your name?",      helper: 'Just so we can address you properly.',  placeholder: 'Type your name…', field: 'name',  iconPath: USER_ICON },
  { label: 'Contact',   question: 'And your email?',        helper: "We'll send confirmations here.",        placeholder: 'you@example.com', field: 'email', iconPath: MAIL_ICON },
  { label: 'Reach',     question: 'Finally — your phone?',  helper: 'For quick alerts about your bookings.', placeholder: '+91 …',           field: 'phone', iconPath: PHONE_ICON },
];

type Form = { name: string; email: string; phone: string };

function StepIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const PAW_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`;

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
    <div className="min-h-[80vh] bg-gradient-to-br from-primary-50 via-white to-accent-50 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-2xl border-2 border-primary-100 overflow-hidden">
          {/* ── Banner ───────────────────────────────────────────────── */}
          <div className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white px-6 sm:px-10 py-8 sm:py-10 overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.10]"
              style={{ backgroundImage: PAW_BG, backgroundSize: '110px 110px' }}
            />
            <div className="relative flex items-center gap-4 sm:gap-5">
              <span aria-hidden="true" className="text-5xl sm:text-6xl drop-shadow-lg">🐕</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-300 uppercase mb-1">
                  HiSpike · Quick setup
                </p>
                <h1 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
                  Let's get to know you
                </h1>
                <div className="mt-1.5 h-0.5 w-12 bg-accent-400 rounded-full" />
                <p className="mt-2 text-sm text-primary-100/85">
                  Three quick questions, under a minute.
                </p>
              </div>
            </div>
          </div>

          {/* ── Horizontal stepper ───────────────────────────────────── */}
          <div className="px-6 sm:px-10 pt-8 pb-2">
            <ol className="flex items-center justify-between relative">
              {/* Track */}
              <span
                aria-hidden="true"
                className="absolute top-5 left-5 right-5 h-0.5 bg-warm-200 -z-0"
              />
              <span
                aria-hidden="true"
                className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-accent-400 to-accent-300 -z-0 transition-all duration-500 ease-out"
                style={{
                  width: `calc(${
                    done ? 100 : (stepIndex / (STEPS.length - 1)) * 100
                  }% - ${
                    done ? 40 : (stepIndex / (STEPS.length - 1)) * 40
                  }px)`,
                }}
              />
              {STEPS.map((s, i) => {
                const completed = done || i < stepIndex;
                const current = !done && i === stepIndex;
                return (
                  <li key={s.field} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ring-4 ${
                        completed
                          ? 'bg-accent-400 text-warm-900 ring-accent-300/30'
                          : current
                          ? 'bg-primary-700 text-white ring-primary-200 scale-110 shadow-lg'
                          : 'bg-white text-warm-400 ring-warm-200'
                      }`}
                    >
                      {completed ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <StepIcon path={s.iconPath} className="w-5 h-5" />
                      )}
                    </div>
                    <p
                      className={`mt-2 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${
                        current
                          ? 'text-primary-700'
                          : completed
                          ? 'text-warm-700'
                          : 'text-warm-400'
                      }`}
                    >
                      {s.label}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ── Form ─────────────────────────────────────────────────── */}
          <div className="px-6 sm:px-10 py-8">
            {done ? (
              <div className="text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-accent-100 ring-8 ring-accent-300/30 text-3xl">
                  ✨
                </div>
                <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
                  All done
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 mb-2">
                  You're all set!
                </h2>
                <p className="text-sm text-warm-500 mb-6">Here's what you shared:</p>
                <dl className="text-left rounded-2xl border-2 border-primary-100 bg-primary-50/40 divide-y divide-primary-100 overflow-hidden mb-6">
                  {STEPS.map((s) => (
                    <div key={s.field} className="px-5 py-3 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                        <StepIcon path={s.iconPath} className="w-4 h-4" />
                      </span>
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
            ) : (
              <form
                key={stepIndex}
                onSubmit={(e) => {
                  e.preventDefault();
                  onNext();
                }}
                className="animate-fade-in"
              >
                <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
                  Step {stepIndex + 1} of {STEPS.length}
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 leading-tight mb-1">
                  {step.question}
                </h2>
                <p className="text-sm text-warm-500 mb-6">{step.helper}</p>

                <input
                  type={step.field === 'email' ? 'email' : step.field === 'phone' ? 'tel' : 'text'}
                  autoFocus
                  value={value}
                  onChange={(e) => setForm((f) => ({ ...f, [step.field]: e.target.value }))}
                  placeholder={step.placeholder}
                  className="w-full px-5 py-4 text-lg rounded-2xl bg-warm-50 border-2 border-warm-200 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all placeholder:text-warm-400"
                />

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
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

        <p className="text-center text-xs text-warm-400 mt-5">
          Quick setup • Under a minute • Your data stays private
        </p>
      </div>
    </div>
  );
}
