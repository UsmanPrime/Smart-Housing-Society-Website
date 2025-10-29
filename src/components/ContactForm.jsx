import { useState, useEffect, useRef } from 'react';
import recaptchaIcon from '../assets/RecaptchaLogo.svg.png';
import contactImage from '../assets/contact.jpg';

export default function ContactForm() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Load fonts and set up scroll animation observer
  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins')
      ]);
    };
    loadFonts();

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
    <section className="max-w-7xl mx-auto px-6 my-16" ref={sectionRef}>
      {/* Main container with dark blue background and rounded corners */}
      <div className="bg-[#0b1a4a] rounded-3xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Form with slide-in animation */}
          <div 
            className={`w-full transition-all duration-1000 ease-out
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <h2 className="text-4xl text-white mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Contact Us
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Contact us today to learn more about our services.
            </p>

            <form className="space-y-6">
              {/* Name & Email row */}
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <input
                type="tel"
                placeholder="Phone"
                className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors"
              />

              {/* Message */}
              <textarea
                placeholder="Message"
                rows="6"
                className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors resize-none"
              ></textarea>

              {/* Rectangular reCAPTCHA box with increased size */}
              <div className="flex items-center gap-6 py-3 px-6 bg-white w-fit">
                <div className="w-8 h-8 border-2 border-gray-300 flex items-center justify-center">
                  <input type="checkbox" className="hidden" id="recaptcha"/>
                </div>
                <label htmlFor="recaptcha" className="text-gray-600 text-base cursor-pointer">I'm not a robot</label>
                <img src={recaptchaIcon} alt="reCAPTCHA" className="w-8 h-8 ml-2" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-white text-[#0b1a4a] px-8 py-3 rounded-xl text-lg font-medium 
                         hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
              >
                Submit Now
              </button>
            </form>
          </div>

          {/* Right: Image with slide-in animation */}
          <div 
            className={`relative hidden md:block transition-all duration-1000 ease-out delay-300
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
          >
            <img
              src={contactImage}
              alt="Building exterior"
              className="w-full h-full object-cover rounded-3xl"
            />
            {/* Dark gradient overlay */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a4a]/80 via-transparent to-transparent rounded-3xl"></div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
