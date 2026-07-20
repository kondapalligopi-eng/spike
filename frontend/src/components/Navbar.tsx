import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { SOCIAL } from '@/lib/social';
import { listHospitals } from '@/api/hospitals';
import { listParks } from '@/api/parks';
import { listSwimSchools } from '@/api/swimSchools';
import { listGroomingSalons } from '@/api/groomingSalons';
import { listPetFoods } from '@/api/petFoods';
import { AuthTransitionOverlay } from './AuthTransitionOverlay';
import { HelpfulButton } from './HelpfulButton';

type DrawerItem = { label: string; to: string };

const DRAWER_TOP: DrawerItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Hospital', to: '/hospital' },
  { label: 'Park', to: '/park' },
  { label: 'Swimming', to: '/swimming' },
  { label: 'Grooming', to: '/grooming' },
  { label: 'Pet Supplies', to: '/pet-supplies' },
  { label: 'Pet Shops', to: '/petshops' },
  { label: 'Pet Stories', to: '/pet-stories' },
  { label: 'Pet Games', to: '/pet-games' },
];

const DRAWER_BOTTOM: DrawerItem[] = [
  { label: 'About Us', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact Us', to: '/feedback' },
];

type SearchEntry = { title: string; subtitle?: string; section: string; to: string; q?: string };

// Category shortcuts always shown. The actual hospital/park/etc. entries are
// built dynamically from live data (see searchIndex below) so search finds
// every current listing, not a hardcoded sample.
const STATIC_SERVICES: SearchEntry[] = [
  { section: 'Services', title: 'Hospital', subtitle: 'Vet care across Bangalore', to: '/hospital' },
  { section: 'Services', title: 'Park', subtitle: 'Dog-friendly parks & lakes', to: '/park' },
  { section: 'Services', title: 'Swimming', subtitle: 'Aquatic training', to: '/swimming' },
  { section: 'Services', title: 'Grooming', subtitle: 'Salon & spa', to: '/grooming' },
  { section: 'Services', title: 'Pet Supplies', subtitle: 'Food, treats, accessories', to: '/pet-supplies' },
  { section: 'Services', title: 'Pet Shops', subtitle: 'Local shops & their products', to: '/petshops' },
  { section: 'Services', title: 'Pet Stories', subtitle: 'A shareable page for your pet', to: '/pet-stories' },
  { section: 'Services', title: 'Pet Games', subtitle: 'Treat Hunt — play with your dog', to: '/pet-games' },
];

function SocialIcon({ label, children, href }: { label: string; children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
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

  // Live directory data — fetched only once the search panel is opened. Shares
  // react-query's cache with the category pages, so it's usually instant.
  const enabled = searchOpen;
  const hospitalsQ = useQuery({ queryKey: ['hospitals'], queryFn: listHospitals, enabled, staleTime: 60_000 });
  const parksQ = useQuery({ queryKey: ['parks'], queryFn: listParks, enabled, staleTime: 60_000 });
  const swimQ = useQuery({ queryKey: ['swim-schools'], queryFn: listSwimSchools, enabled, staleTime: 60_000 });
  const groomingQ = useQuery({ queryKey: ['grooming-salons'], queryFn: listGroomingSalons, enabled, staleTime: 60_000 });
  const petFoodsQ = useQuery({ queryKey: ['pet-foods'], queryFn: listPetFoods, enabled, staleTime: 60_000 });

  const searchIndex = useMemo<SearchEntry[]>(() => {
    const idx: SearchEntry[] = [...STATIC_SERVICES];
    (hospitalsQ.data ?? []).forEach((h) =>
      idx.push({ section: 'Hospitals', title: h.name, subtitle: h.locality, to: '/hospital', q: h.name }));
    (parksQ.data ?? []).forEach((p) =>
      idx.push({ section: 'Parks', title: p.name, subtitle: p.locality, to: '/park', q: p.name }));
    (swimQ.data ?? []).forEach((s) =>
      idx.push({ section: 'Swimming', title: s.name, subtitle: s.locality, to: '/swimming', q: s.name }));
    (groomingQ.data ?? []).forEach((g) =>
      idx.push({ section: 'Grooming', title: g.name, subtitle: [g.area, g.city].filter(Boolean).join(', '), to: '/grooming', q: g.name }));
    const brands = new Set<string>();
    (petFoodsQ.data ?? []).forEach((f) => { if (f.brand) brands.add(f.brand); });
    brands.forEach((b) => idx.push({ section: 'Pet Supplies', title: b, subtitle: 'Brand', to: '/pet-supplies', q: b }));
    return idx;
  }, [hospitalsQ.data, parksQ.data, swimQ.data, groomingQ.data, petFoodsQ.data]);

  const searchResults = searchQuery.trim()
    ? searchIndex.filter((entry) =>
        `${entry.title} ${entry.subtitle ?? ''} ${entry.section}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase()),
      ).slice(0, 40)
    : [];

  const groupedResults = searchResults.reduce<Record<string, SearchEntry[]>>((acc, entry) => {
    (acc[entry.section] ||= []).push(entry);
    return acc;
  }, {});

  // Category entries carry a `q` — navigate with ?q= so the target page opens
  // pre-filtered to that listing.
  const goToResult = (entry: SearchEntry) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(entry.q ? `${entry.to}?q=${encodeURIComponent(entry.q)}` : entry.to);
  };

  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = () => {
    // Logout is essentially instant (just clears localStorage), but without
    // any visual cue users tap "Sign Out" twice or wonder if it worked.
    // Hold the overlay briefly so the spinner registers before the route
    // change, then navigate home.
    setSigningOut(true);
    setUserMenuOpen(false);
    setDrawerOpen(false);
    window.setTimeout(() => {
      logout();
      navigate('/');
      // Give the home route a beat to render before clearing the overlay,
      // otherwise the user sees a flash of the authenticated navbar state.
      window.setTimeout(() => setSigningOut(false), 200);
    }, 400);
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
      {signingOut && <AuthTransitionOverlay message="Signing you out…" />}
      <header className="sticky top-0 z-50 bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: hamburger + centered logo + right icons */}
          <div className="grid grid-cols-3 items-center h-16 sm:h-20 lg:h-24">
            {/* Left: hamburger + home */}
            <div className="flex items-center gap-1 sm:gap-2">
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
              <Link
                to="/"
                aria-label="Home"
                title="Home"
                className="p-2 rounded-lg text-warm-700 hover:text-primary-700 hover:bg-warm-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12 11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                </svg>
              </Link>
            </div>

            {/* Center: logo */}
            <div className="flex justify-center">
              <Link to="/" aria-label="HiSpike — Home" className="hover:opacity-80 transition-opacity">
                <img src="/logo.png?v=2" alt="HiSpike" className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 object-contain drop-shadow-sm transition-transform hover:scale-110" />
              </Link>
            </div>

            {/* Right: helpful + search + user */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <HelpfulButton />
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

        </div>

        {/* Second row: service nav strip — visible at every breakpoint so
            mobile users can jump between services without opening the
            drawer. Horizontally scrollable on narrow screens. */}
        <nav className="bg-primary-50 border-t border-warm-200">
          <div className="max-w-7xl mx-auto overflow-x-auto">
            <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 px-4 sm:px-6 lg:px-8 py-3 min-w-max">
              <NavLink to="/hospital" className={navLinkClass}>Hospital</NavLink>
              <NavLink to="/park" className={navLinkClass}>Park</NavLink>
              <NavLink to="/swimming" className={navLinkClass}>Swimming</NavLink>
              <NavLink to="/grooming" className={navLinkClass}>Grooming</NavLink>
              <NavLink to="/pet-supplies" className={navLinkClass}>Pet Supplies</NavLink>
              <NavLink to="/petshops" className={navLinkClass}>Pet Shops</NavLink>
              <NavLink to="/pet-stories" className={navLinkClass}>Pet Stories</NavLink>
              <NavLink to="/pet-games" className={navLinkClass}>Pet Games</NavLink>
            </div>
          </div>
        </nav>
      </header>

      {/* Site-wide search panel — slides down from below the sticky header */}
      {searchOpen && (
        <>
          <div
            className="fixed top-[106px] sm:top-[122px] lg:top-[138px] inset-x-0 bottom-0 z-30"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-[106px] sm:top-[122px] lg:top-[138px] inset-x-0 z-40 bg-white border-b border-warm-200 shadow-lg animate-fade-in">
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
                                onClick={() => goToResult(entry)}
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
            className="fixed top-[106px] sm:top-[122px] lg:top-[138px] bottom-0 left-0 z-40 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-slide-in-left"
          >
            {/* Close button — top-right, prominent so it's an obvious target */}
            <div className="flex items-center justify-end h-14 px-4">
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" />
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
                      end={item.to === '/'}
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

                {/* Social icons row — only accounts we actually have */}
                <li className="border-b border-warm-200 px-4 py-3">
                  <div className="grid grid-cols-4 gap-1">
                    <SocialIcon label="HiSpike on Instagram" href={SOCIAL.instagram}>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="HiSpike on Facebook" href={SOCIAL.facebook}>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="HiSpike on LinkedIn" href={SOCIAL.linkedin}>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </SocialIcon>
                    <SocialIcon label="HiSpike on YouTube" href={SOCIAL.youtube}>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
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
