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
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary-600'
        : 'text-warm-600 hover:text-warm-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-warm-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-xl text-warm-900 hover:text-primary-600 transition-colors"
          >
            <img src="/logo.png" alt="Cuddly Friend" className="h-10 w-10 object-contain" />
            <span>Cuddly Friend</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/dogs" className={navLinkClass}>
              Browse Dogs
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/my-dogs" className={navLinkClass}>
                  My Listings
                </NavLink>
                <NavLink to="/adoptions" className={navLinkClass}>
                  My Adoptions
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-4 py-2 bg-warm-100 hover:bg-warm-200 rounded-xl transition-colors text-sm font-medium text-warm-800"
                >
                  <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <svg
                    className={`w-4 h-4 text-warm-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-warm-200 py-1 z-20 animate-fade-in">
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
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-warm-700 hover:text-warm-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-warm-600 hover:bg-warm-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle mobile menu"
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
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white animate-fade-in">
          <nav className="px-4 py-4 flex flex-col gap-1">
            <NavLink
              to="/dogs"
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-700 hover:bg-warm-50'}`
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
                    `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-700 hover:bg-warm-50'}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  My Listings
                </NavLink>
                <NavLink
                  to="/adoptions"
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-700 hover:bg-warm-50'}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  My Adoptions
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-700 hover:bg-warm-50'}`
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
                  `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'text-warm-700 hover:bg-warm-50'}`
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
