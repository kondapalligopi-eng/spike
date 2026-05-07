type Role = {
  team: string;
  title: string;
  location: string;
  type: string;
};

const ROLES: Role[] = [
  {
    team: 'Engineering',
    title: 'Senior Frontend Engineer (React + TypeScript)',
    location: 'Bengaluru / Remote',
    type: 'Full-time',
  },
  {
    team: 'Engineering',
    title: 'Backend Engineer (Node.js + PostgreSQL)',
    location: 'Bengaluru / Remote',
    type: 'Full-time',
  },
  {
    team: 'Operations',
    title: 'Provider Verification Lead',
    location: 'Bengaluru',
    type: 'Full-time',
  },
  {
    team: 'Marketing',
    title: 'Content Strategist — Pet Care',
    location: 'Bengaluru / Remote',
    type: 'Contract',
  },
  {
    team: 'Design',
    title: 'Product Designer (UI / UX)',
    location: 'Bengaluru',
    type: 'Full-time',
  },
];

const PERKS = [
  { emoji: '🐶', title: 'Dog-friendly office', body: 'Bring your dog to work. We have water bowls, treat jars, and a fenced play yard.' },
  { emoji: '🩺', title: 'Pet insurance', body: 'Subsidised insurance for one pet of every employee, with no waiting period.' },
  { emoji: '🏖', title: 'Generous leave', body: '24 days paid leave + 5 paw-ternity days for new pet adoptions.' },
  { emoji: '🎓', title: 'Learning stipend', body: '₹40,000 per year for courses, conferences, and books that grow your craft.' },
];

export function Careers() {
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
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">💼</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Join Us · Bangalore
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Careers at HiSpike
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Help us build the most trusted pet-care platform in India. Engineers, designers, and operators welcome.
            </p>
          </div>
          <a
            href="mailto:careers@hispike.in"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
          >
            Email Careers
          </a>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
              Why HiSpike
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-warm-900">Perks for the people who build it</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map(({ emoji, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border-2 border-primary-100 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl mb-3">
                  {emoji}
                </div>
                <h3 className="text-base font-bold text-warm-900 mb-1">{title}</h3>
                <p className="text-sm text-warm-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl sm:text-2xl font-bold text-warm-900 mb-6">Open roles</h2>
          <ul className="space-y-3">
            {ROLES.map((role) => (
              <li
                key={role.title}
                className="rounded-2xl border-2 border-primary-100 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary-700 mb-1">
                    {role.team}
                  </p>
                  <h3 className="text-base font-bold text-warm-900">{role.title}</h3>
                  <p className="text-xs text-warm-500 mt-1">
                    📍 {role.location} · {role.type}
                  </p>
                </div>
                <a
                  href={`mailto:careers@hispike.in?subject=Application: ${encodeURIComponent(role.title)}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full border-2 border-warm-300 bg-white text-warm-700 text-sm font-semibold hover:border-primary-500 hover:text-primary-700 transition-colors self-start sm:self-auto"
                >
                  Apply
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-warm-500 mt-6 text-center">
            Don&apos;t see a fit? Email <a className="text-primary-700 hover:underline" href="mailto:careers@hispike.in">careers@hispike.in</a> with what you&apos;d like to work on.
          </p>
        </div>
      </section>
    </div>
  );
}
