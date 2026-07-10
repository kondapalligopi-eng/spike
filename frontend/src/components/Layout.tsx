import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ScrollToTop } from './ScrollToTop';
import { ToastContainer } from './Toast';
import { VisitTracker } from './VisitTracker';

const FOOTER_COLUMNS: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: 'New to HiSpike?',
    links: [
      { label: 'Find a Vet', href: '/hospital' },
      { label: 'Grooming Services', href: '/grooming' },
      { label: 'Dog Parks Near You', href: '/park' },
      { label: 'Swim & Training', href: '/swimming' },
      { label: 'Shop Pet Supplies', href: '/pet-supplies' },
      { label: 'Create a Pet Story', href: '/pet-stories' },
    ],
  },
  {
    heading: 'About HiSpike',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Newsroom', href: '/newsroom' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Give us your Feedback', href: '/feedback' },
    ],
  },
];

function SocialIcon({ label, children, href }: { label: string; children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors"
    >
      {children}
    </a>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <ScrollToTop />
      <VisitTracker />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_1fr_1fr] gap-10">
            {/* Logo + contact column */}
            <div>
              <img src="/logo.png?v=2" alt="HiSpike" className="h-20 w-20 object-contain mb-6" />

              <div className="flex items-center gap-3 mb-6">
                <SocialIcon label="HiSpike on Instagram" href={SOCIAL.instagram}>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
                  </svg>
                </SocialIcon>
                <SocialIcon label="HiSpike on Facebook" href={SOCIAL.facebook}>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                </SocialIcon>
                <SocialIcon label="HiSpike on YouTube" href={SOCIAL.youtube}>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                  </svg>
                </SocialIcon>
              </div>

              <p className="text-[11px] font-semibold tracking-[0.25em] text-accent-600 uppercase mb-1.5">
                Got a question?
              </p>
              <a
                href="mailto:support@hispike.in"
                className="inline-flex items-center gap-2 text-sm text-primary-700 font-semibold hover:text-primary-800 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@hispike.in
              </a>
              <p className="text-xs text-warm-500 mt-1">We usually reply within a day.</p>
            </div>

            {/* Link columns */}
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="text-base font-bold text-warm-900 mb-5">{col.heading}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-primary-700 hover:text-primary-800 hover:underline inline-flex items-center gap-1"
                      >
                        {link.label}
                        {link.external && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Spike polaroid in the 4th footer column — same handwritten
                tag as the About page hero, just smaller. Links to /about so
                "who is Spike?" is one click away from anywhere on the site. */}
            <div className="flex items-center justify-center md:justify-end">
              <a
                href="/about"
                aria-label="Meet Spike — read our story"
                className="group relative -rotate-2 hover:rotate-0 transition-transform duration-300 bg-white pt-3 px-3 pb-12 rounded-md ring-1 ring-warm-200"
                style={{
                  boxShadow:
                    '0 18px 36px -12px rgba(0,0,0,0.32), 0 8px 18px -8px rgba(0,0,0,0.22)',
                }}
              >
                <img
                  src="/spike/spike.jpg"
                  alt="Spike — a black Labrador"
                  loading="lazy"
                  className="block w-44 sm:w-52 h-auto aspect-[4/3] object-cover"
                />
                <p
                  className="absolute bottom-2 left-0 right-0 text-center text-warm-900 leading-none"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '1.85rem',
                    fontWeight: 700,
                  }}
                >
                  Spike <span aria-hidden="true" className="text-accent-500">🐾</span>
                </p>
              </a>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-12 pt-6 border-t border-warm-200 text-xs text-warm-500">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <p suppressHydrationWarning>© {new Date().getFullYear()} HiSpike. All-in-one pet care for dogs.</p>
              <div className="flex gap-4">
                <a href="/privacy" className="hover:text-warm-800">Privacy Policy</a>
                <a href="/terms" className="hover:text-warm-800">Terms of Service</a>
              </div>
            </div>
            <p className="mt-3 text-warm-400 text-center md:text-left">
              HiSpike · Proprietorship · GSTIN 29EHWPS8826R1ZK · Bengaluru
            </p>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}
