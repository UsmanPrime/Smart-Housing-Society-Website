import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logo from '../assets/logo.png'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled
          ? 'bg-[#1a3d6b]/70 backdrop-blur-md shadow-lg'
          : 'bg-transparent shadow-none'
        }`}
      aria-label="Main navigation"
    >
      <nav className="relative max-w-7xl mx-auto px-6 py-4 flex items-center">
        {/* Left: Logo with dynamic size */}
        <div className="flex items-center z-20">
          <Link to="/">
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
            <Link to="/" className="relative group py-2 inline-block">
              <span className="transition-colors duration-250 group-hover:text-[#c7e0ff]">Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#c7e0ff] transition-all duration-250 group-hover:w-full"></span>
            </Link>
          </li>

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

        {/* Right: Login / Sign up */}
        <div className="ml-auto z-20">
          <Link
            to="/login"
            className="bg-[#0f335b] hover:bg-[#173f77] text-white px-6 py-3 rounded-md text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Login / Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
