import { useState, useEffect, useRef } from 'react'
import overviewImg from '../assets/overview.jpg'

export default function Overview(){
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Preload modern fonts once
    const loadFont = (id, href) => {
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    };

    loadFont('gf-dm-serif', 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
    loadFont('gf-poppins', 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-6 md:px-8 my-20"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className={`w-full mx-auto bg-gradient-to-br from-[#0b1a4a] via-[#0f2451] to-[#060e2e] text-white
          rounded-3xl p-8 md:p-16 relative overflow-hidden
          transform transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        {/* Decorative orbs */}
        <div className="orb orb-1 -top-[20%] -right-[10%]"></div>
        <div className="orb orb-2 -bottom-[20%] -left-[10%]"></div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        ></div>

        {/* Title animation - Centered */}
        <div className={`text-center mb-14 transform transition-all duration-1000 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <span className="inline-block text-sm font-medium tracking-[0.25em] uppercase text-blue-300/70 mb-3">
            About Us
          </span>
          <h3
            className="text-4xl md:text-5xl font-normal tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Overview
          </h3>
          <div className={`mx-auto mt-4 h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent
            transition-all duration-1000 delay-500
            ${isVisible ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-7xl mx-auto relative z-10">
          {/* LEFT: Text animation */}
          <div
            className={`space-y-6 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] delay-300
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <p className="text-base md:text-lg text-white/85 leading-relaxed text-left">
              Welcome to NextGen Residency, a modern housing society designed to bring comfort, convenience, and innovation to community living. Our vision is to create a society where residents enjoy not just a home, but a smarter and more connected lifestyle.
            </p>

            <p className="text-base md:text-lg text-white/85 leading-relaxed text-left">
              At NextGen Residency, we are committed to providing a secure, transparent, and well-managed environment for all our residents. To achieve this, we have introduced a dedicated digital platform that ensures seamless interaction between residents, administrators, and service providers.
            </p>

            <button
              className="btn-primary bg-white text-[#0b1a4a] px-8 py-3.5 rounded-xl text-base font-semibold
                shadow-lg shadow-black/10 mt-4
                hover:bg-blue-50 transition-all duration-500"
            >
              Learn More
            </button>
          </div>

          {/* RIGHT: Image area animation */}
          <div
            className={`relative flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] delay-500
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-14'}`}
          >
            {/* Decorative strokes */}
            <div className="absolute right-0 top-6 w-40 h-44 pointer-events-none z-10">
              <svg width="100%" height="100%" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 32 V12 H100" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <path d="M14 140 C44 140 100 140 118 118" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Frame with animated border */}
            <div className={`absolute right-6 top-4 rounded-2xl border border-white/10 w-96 md:w-[520px] h-64 md:h-[330px]
              transition-all duration-1000 delay-700
              ${isVisible ? 'opacity-100 animated-border' : 'opacity-0'}`}></div>

            {/* Image card with hover effect */}
            <div className="relative overflow-hidden shadow-2xl shadow-black/30 rounded-2xl
                            bg-white w-80 md:w-[520px] h-64 md:h-[330px] -translate-y-4
                            ring-1 ring-white/10 group">
              <img
                src={overviewImg}
                alt="Modern luxury house at NextGen Residency"
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                  group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a4a]/20 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
