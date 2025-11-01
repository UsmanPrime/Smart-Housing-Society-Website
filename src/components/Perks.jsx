import { useState, useEffect, useRef } from 'react'
import safety from '../assets/safety.jpg'
import comms from '../assets/comms.png'
import lady from '../assets/lady.jpg'

const Perk = ({title, img, index, isVisible}) => (
  <div 
    className={`group relative w-full max-w-sm transition-all duration-700 ease-out
      ${isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-12'}`}
    style={{ transitionDelay: `${index * 200}ms` }}
  >
    <div className="rounded-[2rem] overflow-hidden shadow-lg border-[3px] border-white/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      <div className="p-5 bg-[#0a1942]/80 backdrop-blur-sm text-white text-center text-lg font-normal min-h-[5.5rem] flex items-center justify-center rounded-b-[2rem]">
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-8 py-16" ref={sectionRef}>
      <div 
        className={`w-full mx-auto bg-[#020E4B] text-white rounded-[30px] p-12 md:p-20 relative overflow-hidden
          transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Title inside the box - Centered */}
        <div className="text-center mb-14">
          <h3 className="text-4xl md:text-5xl font-normal" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Perks for Residents
          </h3>
        </div>

        {/* Cards container with consistent gap and centering */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center max-w-7xl mx-auto">
          <Perk title={<>Safe, secure<br/>& easy-to-use platform</>} img={safety} index={0} isVisible={isVisible}/>
          <Perk title={<>Transparent<br/>communication</>} img={comms} index={1} isVisible={isVisible}/>
          <Perk title={<>Faster issue<br/>resolution</>} img={lady} index={2} isVisible={isVisible}/>
        </div>
      </div>
    </section>
  )
}
