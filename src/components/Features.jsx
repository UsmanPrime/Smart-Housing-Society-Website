import { useEffect, useRef, useState } from "react";
import paymentImg from '../assets/payment.jpg'
import complaintImg from '../assets/complaint.jpg'
import bookingImg from '../assets/booking.jpg'
import vendorImg from '../assets/vendor.jpg'

import paymentIcon from '../assets/payment_icon.png'
import complaintIcon from '../assets/Complaint_icon.png'
import bookingIcon from '../assets/Booking_icon.png'
import vendorIcon from '../assets/vendor_icon.png'

const FeatureCard = ({ title, img, icon, alt, index }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`w-full transition-all ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{
        fontFamily: "'Poppins', sans-serif",
        transitionDuration: '0.8s',
        transitionDelay: `${index * 150}ms`
      }}
    >
      <div className="group relative w-full pt-16 card-lift">
        
        {/* Circular icon - positioned above the card */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 z-30">
          <div className={`w-28 h-28 bg-white rounded-full flex items-center justify-center 
            shadow-xl shadow-blue-900/10 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-blue-500/15
            border-4 border-gray-50 ring-4 ring-white/50
            ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
            style={{ transitionDelay: `${index * 150 + 200}ms` }}
          >
            <img src={icon} alt={`${title} icon`} className="w-20 h-20 object-contain" />
          </div>
        </div>

        <div className="relative rounded-2xl shadow-lg shadow-black/10 bg-white overflow-hidden
          ring-1 ring-black/5 group-hover:ring-blue-500/20 transition-all duration-500">
          {/* Image with zoom on hover */}
          <div className="w-full h-60 overflow-hidden rounded-t-2xl">
            <img
              src={img}
              alt={alt || title}
              className="w-full h-full object-cover object-center
                transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a4a]/20 to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Footer with gradient */}
          <div className="p-6 bg-gradient-to-br from-[#0b1a4a] to-[#1a3d6b] text-white text-base md:text-lg
            text-center rounded-b-2xl font-medium h-28 flex items-center justify-center
            transition-all duration-500 group-hover:from-[#0f2e5e] group-hover:to-[#2a5d9b]">
            <span className="leading-relaxed">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Features() {
  const [headingVisible, setHeadingVisible] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    // Preload fonts if not already loaded
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
      ([entry]) => {
        if (entry.isIntersecting) setHeadingVisible(true);
      },
      { threshold: 0.3 }
    );

    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      {/* Section heading with reveal animation */}
      <div ref={headingRef} className="text-center mb-20">
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="inline-block text-sm font-medium tracking-[0.25em] uppercase text-[#2a5d9b] mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            What We Offer
          </span>
          <h3
            className="text-4xl md:text-5xl font-normal text-[#0b1a4a]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Core Features
          </h3>
          <div className={`mx-auto mt-4 h-[2px] bg-gradient-to-r from-transparent via-[#2a5d9b] to-transparent
            transition-all duration-1000 delay-300
            ${headingVisible ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 justify-items-center">
        <FeatureCard title={<>Online<br/>payments & dues</>} img={paymentImg} icon={paymentIcon} index={0} />
        <FeatureCard title={<>Complaint & service<br/>request portal</>} img={complaintImg} icon={complaintIcon} index={1} />
        <FeatureCard title={<>Facility<br/>booking system</>} img={bookingImg} icon={bookingIcon} index={2} />
        <FeatureCard title={<>Vendor<br/>management</>} img={vendorImg} icon={vendorIcon} index={3} />
      </div>
    </section>
  );
}
