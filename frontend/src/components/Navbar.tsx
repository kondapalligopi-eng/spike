import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type DrawerItem = { label: string; to: string };

const DRAWER_TOP: DrawerItem[] = [
  { label: 'Hospital', to: '/hospital' },
  { label: 'Park', to: '/park' },
  { label: 'Swimming', to: '/swimming' },
  { label: 'Grooming', to: '/grooming' },
  { label: 'Pet Supplies', to: '/pet-supplies' },
  { label: 'Browse Dogs', to: '/dogs' },
];

const DRAWER_BOTTOM: DrawerItem[] = [
  { label: 'About Us', to: '#' },
  { label: 'Blog', to: '#' },
  { label: 'Contact Us', to: '#' },
];

type SearchEntry = { title: string; subtitle?: string; section: string; to: string };

const SEARCH_INDEX: SearchEntry[] = [
  { section: 'Services', title: 'Hospital', subtitle: 'Vet care across Bangalore', to: '/hospital' },
  { section: 'Services', title: 'Park', subtitle: 'Dog-friendly parks & lakes', to: '/park' },
  { section: 'Services', title: 'Swimming', subtitle: 'Aquatic training', to: '/swimming' },
  { section: 'Services', title: 'Grooming', subtitle: 'Salon & spa', to: '/grooming' },
  { section: 'Services', title: 'Pet Supplies', subtitle: 'Food, treats, accessories', to: '/pet-supplies' },
  { section: 'Services', title: 'Browse Dogs', subtitle: 'Adoption listings', to: '/dogs' },

  { section: 'Hospitals', title: 'SKS Veterinary Hospital', subtitle: 'Indiranagar', to: '/hospital' },
  { section: 'Hospitals', title: 'V-Care Pet Polyclinic', subtitle: 'Koramangala', to: '/hospital' },
  { section: 'Hospitals', title: 'V-Care Pet Polyclinic', subtitle: 'Whitefield', to: '/hospital' },
  { section: 'Hospitals', title: 'Vetic Pet Clinic', subtitle: 'HSR Layout', to: '/hospital' },
  { section: 'Hospitals', title: 'Dr. Doodley Pet Hospital', subtitle: 'Jayanagar', to: '/hospital' },
  { section: 'Hospitals', title: 'Cessna Lifeline Veterinary Hospital', subtitle: 'Domlur', to: '/hospital' },

  { section: 'Parks', title: 'Cubbon Park', subtitle: 'Sampangi Rama Nagar', to: '/park' },
  { section: 'Parks', title: 'Lalbagh Botanical Garden', subtitle: 'Mavalli', to: '/park' },
  { section: 'Parks', title: 'Agara Lake Park', subtitle: 'HSR Layout', to: '/park' },
  { section: 'Parks', title: 'Indiranagar Defence Colony Park', subtitle: 'Indiranagar', to: '/park' },
  { section: 'Parks', title: 'Bellandur Lake Park', subtitle: 'Bellandur', to: '/park' },
  { section: 'Parks', title: 'Whitefield Memorial Park', subtitle: 'Whitefield', to: '/park' },

  { section: 'Brands', title: 'Royal Canin', subtitle: 'Pet Supplies', to: '/pet-supplies' },
  { section: 'Brands', title: 'Royal Canin Veterinary Diet', subtitle: 'Pet Supplies', to: '/pet-supplies' },
  { section: 'Brands', title: 'Pedigree', subtitle: 'Pet Supplies', to: '/pet-supplies' },
  { section: 'Brands', title: 'ACANA', subtitle: 'Pet Supplies', to: '/pet-supplies' },
];

function SocialIcon({ label, children, href = '#' }: { label: string; children: React.ReactNode; href?: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 flex items-center justify-center text-warm-800 hover:text-primary-700 transition-colors"
    >
      {children}
    </a>
  );
}

export function Navbar() {
  const { isAuthenticated, isAdmin, displayName, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // (body scroll intentionally not locked — page should remain interactive while drawer is open)

  // Close drawer / search on ESC
  useEffect(() => {
    if (!drawerOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (drawerOpen) setDrawerOpen(false);
        if (searchOpen) setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, searchOpen]);

  const searchResults = searchQuery.trim()
    ? SEARCH_INDEX.filter((entry) =>
        `${entry.title} ${entry.subtitle ?? ''} ${entry.section}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase()),
      ).slice(0, 30)
    : [];

  const groupedResults = searchResults.reduce<Record<string, SearchEntry[]>>((acc, entry) => {
    (acc[entry.section] ||= []).push(entry);
    return acc;
  }, {});

  const goToResult = (to: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(to);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setDrawerOpen(false);
    navigate('/');
  };

  const closeDrawer = () => setDrawerOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative pb-1.5 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase transition-colors ${
      isActive
        ? 'text-warm-900 after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-accent-400'
        : 'text-warm-600 hover:text-warm-900'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: hamburger + centered logo + right icons */}
          <div className="grid grid-cols-3 items-center h-28 sm:h-44 lg:h-52">
            {/* Left: hamburger */}
            <div className="flex items-center">
              <button
                className="p-2 rounded-lg text-warm-700 hover:bg-warm-100 transition-colors"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center: logo */}
            <div className="flex justify-center">
              <Link to="/" aria-label="HiSpike — Home" className="hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="HiSpike" className="h-20 w-20 sm:h-40 sm:w-40 lg:h-48 lg:w-48 object-contain drop-shadow-sm" />
              </Link>
            </div>

            {/* Right: search + user */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen((o) => !o)}
                className={`p-2 rounded-lg transition-colors ${searchOpen ? 'text-primary-700 bg-primary-50' : 'text-warm-700 hover:bg-warm-100'}`}
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-warm-100 transition-colors"
                    aria-label="Account menu"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-warm-200 py-1 z-20 animate-fade-in">
                        <div className="px-4 py-2 text-xs text-warm-500 border-b border-warm-100 truncate">
                          {displayName}
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                        <Link
                          to="/my-dogs"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          My Dogs
                        </Link>
                        <div className="border-t border-warm-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2 rounded-lg text-warm-700 hover:bg-warm-100 transition-colors"
                  aria-label="Sign in"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Second row: centered nav with active underline, framed by top + bottom rules */}
          <nav className="hidden md:flex items-center justify-center gap-8 pt-2 pb-2 border-t border-warm-200">
            <NavLink to="/hospital" className={navLinkClass}>Hospital</NavLink>
            <NavLink to="/park" className={navLinkClass}>Park</NavLink>
            <NavLink to="/swimming" className={navLinkClass}>Swimming</NavLink>
            <NavLink to="/grooming" className={navLinkClass}>Grooming</NavLink>
            <NavLink to="/pet-supplies" className={navLinkClass}>Pet Supplies</NavLink>
          </nav>
        </div>
      </header>

      {/* Site-wide search panel — slides down from below the sticky header */}
      {searchOpen && (
        <>
          <div
            className="fixed top-[180px] sm:top-[200px] inset-x-0 bottom-0 z-30"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-[180px] sm:top-[200px] inset-x-0 z-40 bg-white border-b border-warm-200 shadow-lg animate-fade-in">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-warm-300 rounded-md bg-white">
                  <svg className="w-5 h-5 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hospitals, parks, brands, services…"
                    className="w-full text-sm outline-none bg-transparent text-warm-800 placeholder:text-warm-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-warm-400 hover:text-warm-700 text-sm"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="p-2 rounded-md text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-colors"
                  aria-label="Close search"
                  title="Close search (Esc)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                {!searchQuery.trim() ? (
                  <p className="text-xs text-warm-500 text-center py-6">
                    Try searching "Indiranagar", "Royal Canin", "Cubbon Park", or "Grooming"
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-warm-500 text-center py-6">
                    No results for "{searchQuery}"
                  </p>
                ) : (
                  <ul className="space-y-5">
                    {Object.entries(groupedResults).map(([section, entries]) => (
                      <li key={section}>
                        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-warm-500 mb-2">
                          {section}
                        </p>
                        <ul className="divide-y divide-warm-100 border border-warm-200 rounded-md overflow-hidden">
                          {entries.map((entry) => (
                            <li key={`${entry.section}-${entry.title}`}>
                              <button
                                onClick={() => goToResult(entry.to)}
                                className="w-full text-left px-3 py-2.5 hover:bg-warm-50 flex items-center justify-between gap-3 transition-colors"
                              >
                                <div>
                                  <p className="text-sm text-warm-900 font-medium">{entry.title}</p>
                                  {entry.subtitle && (
                                    <p className="text-xs text-warm-500 mt-0.5">{entry.subtitle}</p>
                                  )}
                                </div>
                                <span aria-hidden="true" className="text-warm-400 text-sm">→</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Slide-in drawer — sits below the sticky header so the navbar + page stay interactive */}
      {drawerOpen && (
        <>
          <aside
            role="dialog"
            aria-modal="false"
            aria-label="Main menu"
            className="fixed top-[180px] sm:top-[200px] bottom-0 left-0 z-40 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-slide-in-left"
          >
            {/* Close button — NOWNESS-style centered, thin, gold accent */}
            <div className="flex items-center justify-center h-16">
              <button
                onClick={closeDrawer}
                className="p-1 text-accent-400 hover:text-accent-500 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="border-t border-warm-200 mx-0" />
            <div className="h-6" />

            {/* Scrollable links */}
            <div className="flex-1 overflow-y-auto">
              <ul>
                {DRAWER_TOP.map((item) => (
                  <li key={item.to} className="border-b border-warm-200">
                    <NavLink
                      to={item.to}
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        `block px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                          isActive ? 'text-primary-700' : 'text-warm-900 hover:text-primary-700'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}

                {isAuthenticated && (
                  <>
                    <li className="border-b border-warm-200">
                      <NavLink
                        to="/my-dogs"
                        onClick={closeDrawer}
                        className={({ isActive }) =>
                          `block px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                            isActive ? 'text-primary-700' : 'text-warm-900 hover:text-primary-700'
                          }`
                        }
                      >
                        My Listings
                      </NavLink>
                    </li>
                    <li className="border-b border-warm-200">
                      <NavLink
                        to="/adoptions"
                        onClick={closeDrawer}
                        className={({ isActive }) =>
                          `block px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                            isActive ? 'text-primary-700' : 'text-warm-900 hover:text-primary-700'
                          }`
                        }
                      >
                        My Adoptions
                      </NavLink>
                    </li>
                    <li className="border-b border-warm-200">
                      <NavLink
                        to="/profile"
                        onClick={closeDrawer}
                        className={({ isActive }) =>
                          `block px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                            isActive ? 'text-primary-700' : 'text-warm-900 hover:text-primary-700'
                          }`
                        }
                      >
                        Profile
                      </NavLink>
                    </li>
                  </>
                )}

                {isAdmin && (
                  <li className="border-b border-warm-200">
                    <NavLink
                      to="/admin"
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        `block px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                          isActive ? 'text-primary-700' : 'text-warm-900 hover:text-primary-700'
                        }`
                      }
                    >
                      Admin
                    </NavLink>
                  </li>
                )}

                {/* Social icons row */}
                <li className="border-b border-warm-200 px-4 py-3">
                  <div className="grid grid-cols-4 gap-1">
                    <SocialIcon label="Instagram">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="TikTok">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.79a8.16 8.16 0 004.77 1.52V6.89a4.85 4.85 0 01-1.84-.2z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="Facebook">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="Twitter">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.8 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16.1 21 20.5 14.46 20.5 8.79c0-.19 0-.37-.01-.56.85-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="Pinterest">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M9.04 21.54c.96.29 1.93.46 2.96.46a10 10 0 0010-10A10 10 0 0012 2 10 10 0 002 12c0 4.25 2.67 7.9 6.44 9.34-.09-.78-.18-2.07 0-2.96l1.15-4.94s-.29-.58-.29-1.5c0-1.38.86-2.41 1.84-2.41.86 0 1.26.63 1.26 1.44 0 .86-.57 2.09-.86 3.27-.17.98.52 1.84 1.52 1.84 1.78 0 3.16-1.9 3.16-4.58 0-2.4-1.72-4.04-4.19-4.04-2.82 0-4.48 2.1-4.48 4.31 0 .86.28 1.73.74 2.3.09.06.09.14.06.29l-.29 1.09c0 .17-.11.23-.28.11-1.28-.56-2.02-2.38-2.02-3.85 0-3.16 2.24-6.03 6.56-6.03 3.44 0 6.12 2.47 6.12 5.75 0 3.44-2.13 6.2-5.18 6.2-.97 0-1.92-.52-2.26-1.13l-.67 2.37c-.23.86-.86 2.01-1.29 2.7v-.03z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="YouTube">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="LinkedIn">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="WhatsApp">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-4-3.75-4.12-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.42l.69 1.69c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.25.26-.11.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.11.39.1.54-.04.16-.17.62-.73.78-.98.15-.25.31-.2.52-.13l1.47.71M12 2a10 10 0 0110 10 10 10 0 01-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 012 12 10 10 0 0112 2m0 2a8 8 0 00-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0012 20a8 8 0 008-8 8 8 0 00-8-8z" />
                      </svg>
                    </SocialIcon>
                  </div>
                </li>

                {DRAWER_BOTTOM.map((item) => (
                  <li key={item.label} className="border-b border-warm-200">
                    <Link
                      to={item.to}
                      onClick={closeDrawer}
                      className="block px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-warm-900 hover:text-primary-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                {/* Auth actions */}
                <li className="border-b border-warm-200">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-red-600 hover:text-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeDrawer}
                      className="block px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-warm-900 hover:text-primary-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
