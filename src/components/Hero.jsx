import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import house from '../assets/house.png'

export default function Hero() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loaded, setLoaded] = useState(false)
  const [parallaxY, setParallaxY] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)

    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        if (rect.bottom > 0) {
          setParallaxY(window.scrollY * 0.35)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      return
    }
    
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section
      ref={heroRef}
      className="relative h-[calc(100vh+80px)] w-full overflow-hidden -mt-20"
      id="hero"
    >
      {/* Parallax background image */}
      <div className="absolute inset-0" style={{ transform: `translateY(${parallaxY}px)` }}>
        <img
          src={house}
          alt="Modern luxury house at NextGen Residency"
          className={`w-full h-[120%] object-cover object-center block transition-transform duration-[2s] ease-out
            ${loaded ? 'scale-100' : 'scale-110'}`}
        />
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060e2e]/70 via-black/45 to-[#060e2e]/80"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1a4a]/30 via-transparent to-[#0b1a4a]/30"></div>

      {/* Floating gradient orbs */}
      <div className="orb orb-1 top-[10%] left-[5%]"></div>
      <div className="orb orb-2 top-[60%] right-[10%]"></div>
      <div className="orb orb-3 bottom-[20%] left-[40%]"></div>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      ></div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-5xl mx-auto">
        {/* Accent line */}
        <div className={`w-16 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-8
          transition-all duration-1000 delay-200 ${loaded ? 'opacity-100 w-24' : 'opacity-0 w-0'}`}></div>

        {/* Main heading with text reveal */}
        <h1 className={`text-4xl md:text-5xl lg:text-7xl text-white font-bold mb-6 tracking-tight leading-tight
          ${loaded ? 'animate-text-reveal' : 'opacity-0'}`}
          style={{ fontFamily: "'DM Serif Display', serif", perspective: '600px' }}
        >
          Welcome To <span className="gradient-text">NEXTGEN</span> Residency
        </h1>

        {/* Tagline */}
        <p className={`text-xl md:text-2xl lg:text-3xl text-blue-200/90 font-light mb-6 tracking-wide
          ${loaded ? 'animate-text-reveal-delay-1' : 'opacity-0'}`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Next-Generation Comfort & Security
        </p>

        {/* Description */}
        <p className={`text-base md:text-lg text-white/75 max-w-3xl leading-relaxed mb-12
          ${loaded ? 'animate-text-reveal-delay-2' : 'opacity-0'}`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          NextGen Residency offers a smart, secure and eco-friendly living experience,
          blending modern technology with community convenience for residents, administrators
          and service providers in one connected platform.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4
          ${loaded ? 'animate-text-reveal-delay-3' : 'opacity-0'}`}
        >
          <button
            onClick={() => scrollToSection('features')}
            className="btn-primary bg-gradient-to-r from-[#1a3d6b] to-[#2a5d9b] hover:from-[#2a5d9b] hover:to-[#3b82f6]
              text-white px-10 py-4 rounded-xl font-medium text-lg
              shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-700/30
              transition-all duration-500"
          >
            Explore More
          </button>

          <button
            onClick={() => scrollToSection('contact')}
            className="btn-primary bg-transparent border-2 border-white/25 hover:border-white/50
              hover:bg-white/10 text-white px-10 py-4 rounded-xl font-medium text-lg
              transition-all duration-500 backdrop-blur-sm"
          >
            Contact Us
          </button>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2
          transition-all duration-1000 delay-[1.2s]
          ${loaded ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/50 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Scroll
            </span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/50 to-transparent animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  )
}