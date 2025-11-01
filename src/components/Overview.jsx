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
      className="px-8 my-20"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className={`w-full mx-auto bg-[#0b1a4a] text-white rounded-3xl p-8 md:p-16 relative overflow-hidden
        transform transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Title animation - Centered */}
        <div className={`text-center mb-12 transform transition-all duration-1000 delay-200 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <h3
            className="text-4xl md:text-5xl font-normal tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Overview
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-7xl mx-auto">
          {/* LEFT: Text animation - Better alignment */}
          <div
            className={`space-y-5 transition-all duration-1000 ease-out delay-300
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <p className="text-base md:text-lg text-white/95 leading-relaxed text-left">
              Welcome to NextGen Residency, a modern housing society designed to bring comfort, convenience, and innovation to community living. Our vision is to create a society where residents enjoy not just a home, but a smarter and more connected lifestyle.
            </p>

            <p className="text-base md:text-lg text-white/95 leading-relaxed text-left">
              At NextGen Residency, we are committed to providing a secure, transparent, and well-managed environment for all our residents. To achieve this, we have introduced a dedicated digital platform that ensures seamless interaction between residents, administrators, and service providers.
            </p>

            <button
              className="bg-white text-[#0b1a4a] px-8 py-3 rounded-lg text-base font-semibold shadow-lg
                         hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 mt-2"
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
