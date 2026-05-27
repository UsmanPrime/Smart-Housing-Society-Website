import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback, memo } from 'react'
import logo from '../assets/logo.png'
import { useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for logged-in user
  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    // Listen for storage changes (e.g., login in another tab)
    window.addEventListener('storage', checkUser);
    // Listen for explicit user updates within the same tab
    window.addEventListener('user-updated', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('user-updated', checkUser);
    };
  }, [location]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {}); // Ignore errors, still clear local storage
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('csrfToken');
      setUser(null);
      setShowDropdown(false);
      setMobileOpen(false);
      navigate('/');
    }
  }, [navigate]);

  const handleDashboardClick = useCallback((e) => {
    e.preventDefault();
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'vendor') {
        navigate('/dashboard/vendor');
      } else {
        navigate('/dashboard/resident');
      }
    }
  }, [user, navigate]);

  const handleHomeClick = useCallback((e) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname, navigate])

  const navLinks = [
    { label: 'Home', to: '/', onClick: handleHomeClick },
    ...(user ? [{ label: 'Dashboard', to: '#', onClick: handleDashboardClick }] : []),
    { label: 'Complaints', to: '/complaints' },
    { label: 'Facility Booking', to: '/facility' },
    { label: 'Payments', to: '/payments' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isScrolled
          ? 'glass shadow-lg shadow-black/10'
          : 'bg-transparent shadow-none'
        }`}
      aria-label="Main navigation"
    >
      <nav className="relative max-w-7xl mx-auto px-6 py-3 flex items-center">
        {/* Left: Logo with dynamic size */}
        <div className="flex items-center z-20">
          <Link to="/" onClick={handleHomeClick}>
            <img
              src={logo}
              alt="NEXTGEN Residency logo"
              className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] object-contain
                ${isScrolled ? 'w-20 h-20' : 'w-32 h-32'}`}
            />
          </Link>
        </div>

        {/* Center: Desktop links */}
        <ul className="hidden lg:flex items-center gap-6 text-white text-[15px] font-medium absolute left-1/2 transform -translate-x-1/2 z-10">
          {navLinks.map((link) => (
            <li key={link.label}>
              {link.onClick ? (
                <button
                  onClick={link.onClick}
                  className="nav-link py-2 inline-block text-white/90 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  to={link.to}
                  className="nav-link py-2 inline-block text-white/90 hover:text-white transition-colors duration-300 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Right: Login / User dropdown + Mobile menu button */}
        <div className="ml-auto z-20 flex items-center gap-3">
          {/* User/Login button */}
          {user ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
                className="btn-primary bg-gradient-to-r from-[#0f335b] to-[#1a3d6b] hover:from-[#1a3d6b] hover:to-[#2a5d9b]
                  text-white px-5 py-2.5 rounded-xl text-sm font-medium
                  shadow-md shadow-blue-900/20 flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-56 glass rounded-xl shadow-2xl shadow-black/20 py-1 z-50
                  transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top-right
                  ${showDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-xs text-white/50 uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate mt-0.5">{user.email}</p>
                  <p className="text-xs text-blue-300/70 mt-0.5 capitalize">{user.role}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200"
                  onClick={() => setShowDropdown(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-300/80 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary bg-gradient-to-r from-[#0f335b] to-[#1a3d6b] hover:from-[#1a3d6b] hover:to-[#2a5d9b]
                text-white px-6 py-2.5 rounded-xl text-sm font-medium
                shadow-md shadow-blue-900/20"
            >
              Login / Sign up
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300
              ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`}></span>
            <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 mt-1
              ${mobileOpen ? 'opacity-0 scale-0' : ''}`}></span>
            <span className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-300 mt-1
              ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="glass mx-4 mb-4 rounded-2xl p-4 space-y-1">
          {navLinks.map((link, index) => (
            <div key={link.label} style={{ animationDelay: `${index * 50}ms` }}
              className={mobileOpen ? 'animate-fade-up' : ''}
            >
              {link.onClick ? (
                <button
                  onClick={(e) => { link.onClick(e); setMobileOpen(false); }}
                  className="block w-full text-left text-white/90 hover:text-white hover:bg-white/5
                    px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block text-white/90 hover:text-white hover:bg-white/5
                    px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
      )}
    </header>
  );
}

export default memo(Navbar)
