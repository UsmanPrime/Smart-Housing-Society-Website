import { useState, useEffect, useRef } from 'react'
import safety from '../assets/safety.jpg'
import comms from '../assets/comms.png'
import lady from '../assets/lady.jpg'

const Perk = ({title, img, index, isVisible}) => (
  <div 
    className={`group relative w-full max-w-sm transition-all ease-[cubic-bezier(0.22,1,0.36,1)]
      ${isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-16'}`}
    style={{ transitionDuration: '0.8s', transitionDelay: `${index * 200}ms` }}
  >
    <div className="rounded-[2rem] overflow-hidden shadow-lg shadow-black/20
      ring-1 ring-white/10 card-lift">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a4a]/30 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <div className="p-5 bg-gradient-to-br from-[#0a1942]/90 to-[#0f2e5e]/90 backdrop-blur-sm
        text-white text-center text-lg font-normal min-h-[5.5rem] flex items-center justify-center
        rounded-b-[2rem] transition-all duration-500
        group-hover:from-[#0f2e5e]/95 group-hover:to-[#1a3d6b]/95">
        <span className="leading-relaxed">{title}</span>
      </div>
    </div>
  </div>
)

export default function Perks(){
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Font loading
    const linkId = 'gf-poppins'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap'
      document.head.appendChild(link)
    }

    // Scroll animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-6 md:px-8 py-16" ref={sectionRef}>
      <div 
        className={`w-full mx-auto bg-gradient-to-br from-[#020E4B] via-[#0b1a4a] to-[#060e2e]
          text-white rounded-[30px] p-12 md:p-20 relative overflow-hidden
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        {/* Decorative orbs */}
        <div className="orb orb-2 top-[10%] right-[5%]"></div>
        <div className="orb orb-3 bottom-[10%] left-[5%]"></div>

        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        ></div>

        {/* Title inside the box - Centered */}
        <div className={`text-center mb-16 relative z-10
          transition-all duration-700 delay-200
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="inline-block text-sm font-medium tracking-[0.25em] uppercase text-blue-300/60 mb-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            Why Choose Us
          </span>
          <h3 className="text-4xl md:text-5xl font-normal" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Perks for Residents
          </h3>
          <div className={`mx-auto mt-4 h-[2px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent
            transition-all duration-1000 delay-500
            ${isVisible ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}></div>
        </div>

        {/* Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center max-w-7xl mx-auto relative z-10">
          <Perk title={<>Safe, secure<br/>& easy-to-use platform</>} img={safety} index={0} isVisible={isVisible}/>
          <Perk title={<>Transparent<br/>communication</>} img={comms} index={1} isVisible={isVisible}/>
          <Perk title={<>Faster issue<br/>resolution</>} img={lady} index={2} isVisible={isVisible}/>
        </div>
      </div>
    </section>
  )
}
