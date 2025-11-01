import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const handleDashboardClick = (e) => {
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
  };

  const handleHomeClick = (e) => {
    e.preventDefault()

    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled
          ? 'bg-[#1a3d6b]/70 backdrop-blur-md shadow-lg'
          : 'bg-transparent shadow-none'
        }`}
      aria-label="Main navigation"
      onClick={() => showDropdown && setShowDropdown(false)}
    >
      <nav className="relative max-w-7xl mx-auto px-6 py-4 flex items-center">
        {/* Left: Logo with dynamic size */}
        <div className="flex items-center z-20">
          <Link to="/" onClick={handleHomeClick}>
            <img
              src={logo}
              alt="NEXTGEN logo"
              className={`transition-all duration-300 object-contain
                ${isScrolled ? 'w-24 h-24' : 'w-36 h-36'}`}
            />
          </Link>
        </div>

        {/* Center: links absolutely centered so they sit over the hero image */}
        <ul className="hidden md:flex items-center gap-8 text-white text-lg font-semibold absolute left-1/2 transform -translate-x-1/2 z-10">
          <li>
            <Link to="/" onClick={handleHomeClick} className="relative group py-2 inline-block">
              <span className="transition-colors duration-250 group-hover:text-[#c7e0ff]">Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#c7e0ff] transition-all duration-250 group-hover:w-full"></span>
            </Link>
          </li>

          {user && (
            <li>
              <button onClick={handleDashboardClick} className="relative group py-2 inline-block">
                <span className="transition-colors duration-250 group-hover:text-[#c7e0ff]">Dashboard</span>
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#c7e0ff] transition-all duration-250 group-hover:w-full"></span>
              </button>
            </li>
          )}

          <li>
            <Link to="/complaints" className="relative group py-2 inline-block whitespace-nowrap">
              <span className="transition-colors duration-250 group-hover:text-[#c7e0ff]">Complaint Management</span>
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#c7e0ff] transition-all duration-250 group-hover:w-full"></span>
            </Link>
          </li>

          <li>
            <Link to="/facility" className="relative group py-2 inline-block whitespace-nowrap">
              <span className="transition-colors duration-250 group-hover:text-[#c7e0ff]">Facility Booking</span>
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#c7e0ff] transition-all duration-250 group-hover:w-full"></span>
            </Link>
          </li>

          <li>
            <Link to="/payments" className="relative group py-2 inline-block">
              <span className="transition-colors duration-250 group-hover:text-[#c7e0ff]">Payments</span>
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#c7e0ff] transition-all duration-250 group-hover:w-full"></span>
            </Link>
          </li>
        </ul>

        {/* Right: Login / Sign up OR User dropdown */}
        <div className="ml-auto z-20 relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-[#0f335b] hover:bg-[#173f77] text-white px-6 py-3 rounded-md text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>{user.name}</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#0f335b] hover:bg-[#173f77] text-white px-6 py-3 rounded-md text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Login / Sign up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
