import { useEffect, useRef } from "react";
import paymentImg from '../assets/payment.jpg'
import complaintImg from '../assets/complaint.jpg'
import bookingImg from '../assets/booking.jpg'
import vendorImg from '../assets/vendor.jpg'

import paymentIcon from '../assets/payment_icon.png'
import complaintIcon from '../assets/Complaint_icon.png'
import bookingIcon from '../assets/Booking_icon.png'
import vendorIcon from '../assets/vendor_icon.png'

const FeatureCard = ({ title, img, icon, alt }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-show");
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="opacity-0 translate-y-10 transition-all duration-700 ease-out w-full"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="group relative w-full transition-transform transform hover:-translate-y-2 hover:scale-105 duration-300 pt-16">
        
        {/* Circular icon - positioned above the card */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 z-30">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 border-4 border-gray-50">
            <img src={icon} alt={`${title} icon`} className="w-20 h-20 object-contain" />
          </div>
        </div>

        <div className="relative rounded-2xl shadow-xl bg-white overflow-hidden">
          {/* Image */}
          <div className="w-full h-60 overflow-hidden rounded-t-2xl">
            <img
              src={img}
              alt={alt || title}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* Footer */}
          <div className="p-6 bg-[#0b1a4a]/90 backdrop-blur-sm text-white text-base md:text-lg text-center rounded-b-2xl font-medium h-28 flex items-center justify-center">
            <span className="leading-relaxed">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Features() {
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
  }, []);

  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      <h3 
        className="text-4xl md:text-5xl font-normal mb-20 text-[#0b1a4a] text-center" 
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Core Features
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 justify-items-center">
        <FeatureCard title={<>Online<br/>payments & dues</>} img={paymentImg} icon={paymentIcon} />
        <FeatureCard title={<>Complaint & service<br/>request portal</>} img={complaintImg} icon={complaintIcon} />
        <FeatureCard title={<>Facility<br/>booking system</>} img={bookingImg} icon={bookingIcon} />
        <FeatureCard title={<>Vendor<br/>management</>} img={vendorImg} icon={vendorIcon} />
      </div>
    </section>
  );
}
