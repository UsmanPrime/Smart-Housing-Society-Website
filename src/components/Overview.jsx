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
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-6 my-20"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className={`max-w-7xl mx-auto bg-[#0b1a4a] text-white rounded-3xl p-8 md:p-20 relative overflow-hidden
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Title animation */}
        <div className={`text-center mb-10 transform transition-all duration-1000 delay-200 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <h3
            className="text-4xl font-normal tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Overview
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT: Text animation */}
          <div
            className={`space-y-6 pr-4 transition-all duration-1000 ease-out delay-300
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <p className="text-lg text-white/90 leading-relaxed">
              Welcome to <span className="font-semibold text-white">NextGen Residency</span>, a
              modern housing society designed to bring comfort, convenience, and
              innovation to community living.
            </p>

            <p className="text-lg text-white/90 leading-relaxed">
              We provide a secure, transparent, and well-managed environment for
              residents through an advanced digital platform that connects
              homeowners, administrators, and service providers seamlessly.
            </p>

            <button
              className="bg-white text-[#0b1a4a] px-10 py-3 rounded-md text-lg font-semibold shadow-md
                         hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
            >
              Learn More
            </button>
          </div>

          {/* RIGHT: Image area animation */}
          <div
            className={`relative flex items-center justify-center transition-all duration-1000 ease-out delay-500
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-14'}`}
          >

            {/* Decorative strokes */}
            <div className="absolute right-0 top-6 w-40 h-44 pointer-events-none z-10">
              <svg width="100%" height="100%" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 32 V12 H100" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
                <path d="M14 140 C44 140 100 140 118 118" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
              </svg>
            </div>

            {/* frame */}
            <div className="absolute right-6 top-4 rounded-2xl border-2 border-white/10 w-96 md:w-[520px] h-64 md:h-[330px]"></div>

            {/* image card */}
            <div className="relative overflow-hidden shadow-2xl rounded-tr-3xl rounded-br-3xl rounded-l-lg
                            bg-white w-80 md:w-[520px] h-64 md:h-[330px] -translate-y-4">
              <img
                src={overviewImg}
                alt="Modern luxury house"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
