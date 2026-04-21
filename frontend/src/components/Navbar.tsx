import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { isAuthenticated, isAdmin, displayName, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative pb-1.5 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase transition-colors ${
      isActive
        ? 'text-warm-900 after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-accent-400'
        : 'text-warm-600 hover:text-warm-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: hamburger | centered logo | right icons */}
        <div className="grid grid-cols-3 items-center h-40 sm:h-48">
          {/* Left: hamburger */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-lg text-warm-700 hover:bg-warm-100 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Center: logo */}
          <div className="flex justify-center">
            <Link to="/" aria-label="Cuddly Friend — Home" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Cuddly Friend" className="h-32 w-32 sm:h-40 sm:w-40 object-contain" />
            </Link>
          </div>

          {/* Right: search + user */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              className="p-2 rounded-lg text-warm-700 hover:bg-warm-100 transition-colors"
              aria-label="Search"
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

        {/* Second row: centered nav with active underline */}
        <nav className="hidden md:flex items-center justify-center gap-8 pb-4">
          <NavLink to="/hospital" className={navLinkClass}>Hospital</NavLink>
          <NavLink to="/park" className={navLinkClass}>Park</NavLink>
          <NavLink to="/swimming" className={navLinkClass}>Swimming</NavLink>
          <NavLink to="/grooming" className={navLinkClass}>Grooming</NavLink>
          <NavLink to="/pet-supplies" className={navLinkClass}>Pet Supplies</NavLink>
        </nav>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white animate-fade-in">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {[
              { to: '/hospital', label: 'Hospital' },
              { to: '/park', label: 'Park' },
              { to: '/swimming', label: 'Swimming' },
              { to: '/grooming', label: 'Grooming' },
              { to: '/pet-supplies', label: 'Pet Supplies' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-medium tracking-wider uppercase ${isActive ? 'bg-accent-100 text-warm-900' : 'text-warm-700 hover:bg-warm-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </NavLink>
            ))}

            <div className="border-t border-warm-100 my-2" />

            <NavLink
              to="/dogs"
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-sm font-medium tracking-wider uppercase ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-600 hover:bg-warm-50'}`
              }
              onClick={() => setMobileOpen(false)}
            >
              Browse Dogs
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/my-dogs"
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium tracking-wider uppercase ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-600 hover:bg-warm-50'}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  My Listings
                </NavLink>
                <NavLink
                  to="/adoptions"
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium tracking-wider uppercase ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-600 hover:bg-warm-50'}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  My Adoptions
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium tracking-wider uppercase ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-600 hover:bg-warm-50'}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-medium tracking-wider uppercase ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-600 hover:bg-warm-50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                Admin
              </NavLink>
            )}

            <div className="mt-3 pt-3 border-t border-warm-100">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-50 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium text-center hover:bg-primary-600 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
