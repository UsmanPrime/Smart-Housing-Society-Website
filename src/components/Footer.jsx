import { useEffect } from 'react'
import logo from '../assets/logo.png'

export default function Footer(){
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
    <footer className="bg-ng-light mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6 items-center">
        <div>
          <img src={logo} alt="logo" className="w-36 h-36 md:w-40 md:h-40 mb-2"/> {/* increased logo size */}
          <p className="text-sm text-gray-600">Copyright © 2025 NextGen Residency | Smart Housing Society Management.</p>
        </div>
        <div className="flex flex-col gap-2">
          <a className="text-sm text-[#0b1a4a]" href="/">Home</a>
          <a className="text-sm text-[#0b1a4a]" href="/complaints">Complaint Management</a>
          <a className="text-sm text-[#0b1a4a]" href="/facility">Facility Booking</a>
          <a className="text-sm text-[#0b1a4a]" href="/payments">Payments</a>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Social Links</p>

          {/* social icons row */}
          <div className="mt-4 flex justify-end gap-3">
            <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noreferrer"
               className="w-9 h-9 bg-white/95 rounded-md flex items-center justify-center text-[#0b1a4a] hover:scale-105 transition-transform text-2xl">
              <i className="fa-brands fa-square-facebook" aria-hidden="true"></i>
            </a>

            <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noreferrer"
               className="w-9 h-9 bg-white/95 rounded-md flex items-center justify-center text-[#0b1a4a] hover:scale-105 transition-transform text-2xl">
              <i className="fa-brands fa-instagram" aria-hidden="true"></i>
            </a>

            <a aria-label="LinkedIn" href="https://linkedin.com" target="_blank" rel="noreferrer"
               className="w-9 h-9 bg-white/95 rounded-md flex items-center justify-center text-[#0b1a4a] hover:scale-105 transition-transform text-2xl">
              <i className="fa-brands fa-linkedin" aria-hidden="true"></i>
            </a>

            <a aria-label="Twitter" href="https://twitter.com" target="_blank" rel="noreferrer"
               className="w-9 h-9 bg-white/95 rounded-md flex items-center justify-center text-[#0b1a4a] hover:scale-105 transition-transform text-2xl">
              <i className="fa-brands fa-x-twitter" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
