import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ScrollToTop } from './ScrollToTop';
import { ToastContainer } from './Toast';

const FOOTER_COLUMNS: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: 'New to HiSpike?',
    links: [
      { label: 'Find a Vet', href: '/hospital' },
      { label: 'Grooming Services', href: '/grooming' },
      { label: 'Dog Parks Near You', href: '/park' },
      { label: 'Swim & Training', href: '/swimming' },
      { label: 'Shop Pet Supplies', href: '/pet-supplies' },
    ],
  },
  {
    heading: 'About HiSpike',
    links: [
      { label: 'Our Story', href: '#' },
      { label: 'Newsroom', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Give us your Feedback', href: '#' },
    ],
  },
  {
    heading: 'Popular Links',
    links: [
      { label: 'Manage Your Account', href: '/profile' },
      { label: 'New Listings', href: '/dogs' },
      { label: 'Find or Become a Partner', href: '#' },
      { label: 'Adoption Guide', href: '#' },
      { label: 'HiSpike LIVE', href: '#' },
      { label: 'Community Events', href: '#' },
      { label: 'Mobile App', href: '#' },
      { label: 'Newsletter Sign-Up', href: '#' },
    ],
  },
];

function SocialIcon({ label, children, href = '#' }: { label: string; children: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors"
    >
      {children}
    </a>
  );
}

export function Layout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-warm-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_1fr_1fr] gap-10">
            {/* Logo + contact column */}
            <div>
              <img src="/logo.png" alt="HiSpike" className="h-20 w-20 object-contain mb-6" />

              <div className="flex items-center gap-3 mb-6">
                <SocialIcon label="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                </SocialIcon>
                <SocialIcon label="Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.8 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16.1 21 20.5 14.46 20.5 8.79c0-.19 0-.37-.01-.56.85-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </SocialIcon>
                <SocialIcon label="LinkedIn">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </SocialIcon>
                <SocialIcon label="Instagram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
                  </svg>
                </SocialIcon>
                <SocialIcon label="YouTube">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                  </svg>
                </SocialIcon>
              </div>

              <a
                href="#"
                className="text-sm text-primary-700 font-medium underline hover:text-primary-800"
              >
                See all ways to contact us
              </a>
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
          </div>

          {/* Bottom strip */}
          <div className="mt-12 pt-6 border-t border-warm-200 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-warm-500">
            <p>© {new Date().getFullYear()} HiSpike. Connecting dogs with loving families.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-warm-800">Privacy Policy</a>
              <a href="#" className="hover:text-warm-800">Terms of Service</a>
              <a href="#" className="hover:text-warm-800">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating chat button */}
      <button
        type="button"
        onClick={() => setChatOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pl-1.5 pr-4 py-1.5 bg-primary-700 hover:bg-primary-800 text-white rounded-full shadow-lg transition-colors"
      >
        <span className="w-8 h-8 rounded-full bg-accent-400 text-warm-900 flex items-center justify-center text-lg">
          💬
        </span>
        <span className="text-sm font-semibold">Let's Chat</span>
      </button>

      {chatOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-72 bg-white rounded-xl shadow-xl border border-warm-200 p-4 animate-fade-in">
          <p className="text-sm text-warm-800 font-semibold mb-1">Hi! 👋</p>
          <p className="text-xs text-warm-600">Our team usually replies within a few minutes. How can we help?</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
