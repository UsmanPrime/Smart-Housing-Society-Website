import { useEffect } from 'react'
import logo from '../assets/logo.png'

export default function Footer() {
  // inject Font Awesome stylesheet so <i class="fa-..."> icons render
  useEffect(() => {
    const id = 'fa-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <footer className="bg-[#c3c5ce] mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-10">

        {/* Left: Logo + Text */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img src={logo} alt="logo" className="w-32 h-32 md:w-36 md:h-36 mb-2" />
          <p className="text-sm md:text-base font-medium text-[#0b1a4a]">
            Copyright © 2025 NextGen Residency |<br className="hidden md:inline" />
            Smart Housing Society Management.
          </p>
        </div>

        {/* Center: Links */}
        <div className="flex flex-col justify-center text-center md:text-left gap-5">
          <a className="text-lg font-medium text-[#0b1a4a]" href="/">Home</a>
          <a className="text-lg font-medium text-[#0b1a4a]" href="/complaints">Complaint Management</a>
          <a className="text-lg font-medium text-[#0b1a4a]" href="/facility">Facility Booking</a>
          <a className="text-lg font-medium text-[#0b1a4a]" href="/payments">Payments</a>
        </div>

        {/* Right: Social Links */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <p className="text-lg font-medium text-[#0b1a4a]">Social Links</p>
          <div className="flex gap-3">
            <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noreferrer"
              className="w-8 h-8 bg-[#0b1a4a] rounded-sm flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <i className="fa-brands fa-facebook-f text-sm" aria-hidden="true"></i>
            </a>

            <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noreferrer"
              className="w-8 h-8 bg-[#0b1a4a] rounded-sm flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <i className="fa-brands fa-instagram text-sm" aria-hidden="true"></i>
            </a>

            <a aria-label="LinkedIn" href="https://linkedin.com" target="_blank" rel="noreferrer"
              className="w-8 h-8 bg-[#0b1a4a] rounded-sm flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <i className="fa-brands fa-linkedin-in text-sm" aria-hidden="true"></i>
            </a>

            <a aria-label="Twitter" href="https://twitter.com" target="_blank" rel="noreferrer"
              className="w-8 h-8 bg-[#0b1a4a] rounded-sm flex items-center justify-center text-white hover:opacity-80 transition-opacity">
              <i className="fa-brands fa-x-twitter text-sm" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
