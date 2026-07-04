import { useState } from 'react';
import { toast } from '@/store/toastStore';
import { createSubmission } from '@/api/submissions';

const TOPICS = [
  'General feedback',
  'Bug or technical issue',
  'Service provider concern',
  'Suggest a feature',
  'Partnership enquiry',
];

export function Feedback() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  });

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.topic || !form.message.trim()) {
      toast.error('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      await createSubmission('feedback', {
        Name: form.name.trim(),
        Email: form.email.trim(),
        Topic: form.topic,
        Message: form.message.trim(),
      });
      setForm({ name: '', email: '', topic: '', message: '' });
      toast.success('Thanks! Your feedback has been received.');
    } catch {
      toast.error('Could not submit right now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '120px 120px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">💬</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Talk to us · HiSpike
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Give us your Feedback
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Spotted a bug, have a suggestion, or want to flag a service provider? We read everything that comes in.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl border-2 border-primary-100 bg-white p-6 sm:p-8 shadow-sm">
            <form onSubmit={submitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Your name <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Email <span className="text-red-500">*</span></span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Topic <span className="text-red-500">*</span></span>
                <select
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className={`w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors bg-white ${
                    form.topic ? 'text-warm-900' : 'text-warm-400'
                  }`}
                >
                  <option value="" disabled>Choose a topic</option>
                  {TOPICS.map((t) => (
                    <option key={t} value={t} className="text-warm-900">{t}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Your message <span className="text-red-500">*</span></span>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind…"
                  className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors resize-y"
                />
              </label>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-60 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
                >
                  {submitting ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </form>
          </div>

          {/* Office address */}
          <div className="mt-6 rounded-2xl border-2 border-primary-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 shrink-0" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-warm-900">Our office</p>
                <address className="not-italic text-sm text-warm-600 leading-relaxed mt-1">
                  WeWork Salarpuria Magnificia, Tin Factory,<br />
                  78 Old Madras Road, Mahadevapura,<br />
                  next to KR Puram, Bangalore, Karnataka 560016
                </address>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=WeWork%20Salarpuria%20Magnificia%2C%20Mahadevapura%2C%20Bangalore%20560016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline mt-2"
                >
                  Get directions
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-warm-500 mt-6 text-center">
            Prefer email? Write to <a className="text-primary-700 hover:underline" href="mailto:support@hispike.in">support@hispike.in</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
