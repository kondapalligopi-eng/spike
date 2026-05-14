import { useState } from 'react';
import { Link } from 'react-router-dom';

type Step = {
  label: string;
  question: string;
  helper: string;
  placeholder: string;
  field: 'name' | 'email' | 'phone';
  emoji: string;
  benefit: string;
  bannerFrom: string;
  bannerTo: string;
};

const STEPS: Step[] = [
  {
    label: 'About you',
    question: "What's your name?",
    helper: "Just so we can address you properly.",
    placeholder: 'Type your name…',
    field: 'name',
    emoji: '🐕',
    benefit: 'Personalised greetings • Tailored picks',
    bannerFrom: 'from-rose-400',
    bannerTo: 'to-amber-300',
  },
  {
    label: 'Contact',
    question: "And your email?",
    helper: "We'll send confirmations and updates here.",
    placeholder: 'you@example.com',
    field: 'email',
    emoji: '✉️',
    benefit: 'Booking confirmations • Weekly digest',
    bannerFrom: 'from-sky-500',
    bannerTo: 'to-primary-400',
  },
  {
    label: 'Reach',
    question: "Finally — your phone?",
    helper: 'For quick alerts about your bookings.',
    placeholder: '+91 …',
    field: 'phone',
    emoji: '📞',
    benefit: 'Real-time alerts • Vet emergencies',
    bannerFrom: 'from-emerald-400',
    bannerTo: 'to-teal-500',
  },
];

type Form = { name: string; email: string; phone: string };

const PAW_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`;

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
    <div className="min-h-[80vh] bg-gradient-to-br from-primary-50 via-white to-accent-50 py-10 sm:py-14">
      <div className="max-w-xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-2xl border-2 border-primary-100 overflow-hidden">
          {/* Top banner — changes per step */}
          <div
            className={`relative h-44 sm:h-52 bg-gradient-to-br ${step.bannerFrom} ${step.bannerTo} overflow-hidden`}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.18]"
              style={{ backgroundImage: PAW_BG, backgroundSize: '90px 90px' }}
            />
            {/* Top row: step pills + counter */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => {
                  const completed = done || i < stepIndex;
                  const current = !done && i === stepIndex;
                  return (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        current ? 'w-8 bg-white' : completed ? 'w-4 bg-white/80' : 'w-4 bg-white/30'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                {done ? '3 / 3' : `${stepIndex + 1} / 3`}
              </span>
            </div>

            {/* Centered emoji + step label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
              <span
                key={stepIndex + (done ? '-d' : '')}
                aria-hidden="true"
                className="text-6xl sm:text-7xl drop-shadow-lg animate-fade-in"
              >
                {done ? '✨' : step.emoji}
              </span>
              <p className="mt-2 text-[11px] font-bold tracking-[0.3em] uppercase text-white/90">
                {done ? 'All done' : step.label}
              </p>
            </div>

            {/* Bottom benefit strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/15 backdrop-blur-sm px-4 py-1.5">
              <p className="text-[11px] text-center font-medium text-white/95 tracking-wide truncate">
                {done ? 'Welcome to HiSpike — your dog will thank you 🐾' : step.benefit}
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="p-6 sm:p-8">
            {done ? (
              <div className="text-center animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 mb-2">
                  You're all set!
                </h1>
                <p className="text-sm text-warm-500 mb-6">Here's what you shared:</p>
                <dl className="text-left rounded-2xl border-2 border-primary-100 bg-primary-50/40 divide-y divide-primary-100 overflow-hidden mb-6">
                  {STEPS.map((s) => (
                    <div key={s.field} className="px-5 py-3 flex items-center gap-3">
                      <span aria-hidden="true" className="text-xl shrink-0">{s.emoji}</span>
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
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900 leading-tight mb-1">
                  {step.question}
                </h1>
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

          {/* Bottom slim progress strip */}
          <div className="h-1 bg-warm-100">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-accent-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <p className="text-center text-xs text-warm-400 mt-5">
          Quick setup • Takes under a minute • Your data stays private
        </p>
      </div>
    </div>
  );
}
