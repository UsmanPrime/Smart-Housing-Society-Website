import { useState, useEffect, useRef } from 'react'
import safety from '../assets/safety.jpg'
import comms from '../assets/comms.png'
import lady from '../assets/lady.jpg'

const Perk = ({title, img, index, isVisible}) => (
  <div 
    className={`group relative w-80 transition-all duration-700 ease-out
      ${isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-12'}`}
    style={{ transitionDelay: `${index * 200}ms` }}
  >
    <div className="group relative w-80 transition-all duration-300 hover:transform hover:scale-105"> {/* Fixed width w-80 */}
    <div className="rounded-[2rem] overflow-hidden shadow-lg border border-white/10">
      <div className="relative h-56">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
      </div>
      
      <div className="p-4 bg-[#0b1a4a] text-white text-center text-lg min-h-[4rem] flex items-center justify-center">
        {title}
      </div>
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
    <section className="px-6 my-16" ref={sectionRef}>
      <div 
        className={`max-w-7xl mx-auto bg-[#0b1a4a] text-white rounded-3xl p-8 md:p-16 relative overflow-hidden
          transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Title inside the box */}
        <div className="text-center mb-12">
          <h3 className="text-4xl font-normal" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Perks for Residents
          </h3>
        </div>

        {/* Cards container with consistent gap */}
        <div className="flex flex-wrap gap-12 justify-center">
          <Perk title="Safe, secure & easy-to-use platform" img={safety} index={0} isVisible={isVisible}/>
          <Perk title="Transparent communication" img={comms} index={1} isVisible={isVisible}/>
          <Perk title="Faster issue resolution" img={lady} index={2} isVisible={isVisible}/>
        </div>
      </div>
    </section>
  )
}
