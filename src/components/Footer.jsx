import { useEffect, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

function Footer() {
  const year = new Date().getFullYear()
  const [isVisible, setIsVisible] = useState(false)

  // inject Font Awesome stylesheet so <i class="fa-..."> icons render
  useEffect(() => {
    const id = 'fa-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      link.defer = true;
      document.head.appendChild(link);
    }

    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const socialLinks = [
    { label: 'Facebook', icon: 'fa-brands fa-facebook-f', href: 'https://facebook.com' },
    { label: 'Instagram', icon: 'fa-brands fa-instagram', href: 'https://instagram.com' },
    { label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', href: 'https://linkedin.com' },
    { label: 'Twitter', icon: 'fa-brands fa-x-twitter', href: 'https://twitter.com' },
  ];

  const footerLinks = [
    { label: 'Home', to: '/' },
    { label: 'Complaint Management', to: '/complaints' },
    { label: 'Facility Booking', to: '/facility' },
    { label: 'Payments', to: '/payments' },
  ];

  return (
    <footer className="relative mt-10 overflow-hidden">
      {/* Gradient top border */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#2a5d9b] to-transparent"></div>

      <div className="bg-gradient-to-b from-[#0b1a4a] to-[#060e2e] relative">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 py-14 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">

            {/* Left: Logo + Text */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <img src={logo} alt="NextGen Residency logo" className="w-28 h-28 md:w-32 md:h-32 mb-3 drop-shadow-lg" />
              <p className="text-sm md:text-base font-medium text-white/70 leading-relaxed">
                Copyright © {year} NextGen Residency<br className="hidden md:inline" />
                Smart Housing Society Management.
              </p>
            </div>

            {/* Center: Links */}
            <div className="flex flex-col justify-center text-center md:text-left gap-3">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-blue-300/50 mb-2">
                Quick Links
              </p>
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-base font-medium text-white/70 hover:text-white
                    transition-all duration-300 hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right: Social Links */}
            <div className="flex flex-col items-center md:items-end gap-4">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-blue-300/50">
                Connect With Us
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    aria-label={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/70
                      hover:bg-gradient-to-br hover:from-[#1a3d6b] hover:to-[#2a5d9b] hover:text-white
                      hover:shadow-lg hover:shadow-blue-500/15 hover:scale-110
                      transition-all duration-300 ring-1 ring-white/10 hover:ring-blue-500/30"
                  >
                    <i className={`${social.icon} text-sm`} aria-hidden="true"></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/30">
              Built with care for smart housing communities. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer)
