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
      className="opacity-0 translate-y-10 transition-all duration-700 ease-out"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="group relative w-full transition-transform transform hover:-translate-y-3 hover:scale-[1.03]">
        <div className="relative rounded-2xl shadow-lg bg-white mt-12"> {/* increased mt-10 to mt-12 */}

          {/* Circular icon */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-30"> {/* adjusted from -top-10 to -top-12 */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
              <img src={icon} alt={`${title} icon`} className="w-12 h-12 object-contain" />
            </div>
          </div>

          {/* Image */}
          <div className="w-full h-56 overflow-hidden rounded-t-2xl"> {/* increased from h-48 to h-56 */}
            <img
              src={img}
              alt={alt || title}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Footer */}
          <div className="p-5 bg-[#0b1a4a] text-white text-lg text-center rounded-b-2xl"> {/* increased padding and text size */}
            {title}
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
    <section className="max-w-7xl mx-auto px-6 my-20"> {/* increased vertical margin */}
      <h3 
        className="text-3xl md:text-4xl font-normal mb-16 text-[#0b1a4a] text-center" 
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Core Features
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"> {/* increased gap from 8 to 10 */}
        <FeatureCard title="Online payments & dues" img={paymentImg} icon={paymentIcon} />
        <FeatureCard title="Complaint managemnt" img={complaintImg} icon={complaintIcon} />
        <FeatureCard title="Facility booking system" img={bookingImg} icon={bookingIcon} />
        <FeatureCard title="Vendor management" img={vendorImg} icon={vendorIcon} />
      </div>
    </section>
  );
}
