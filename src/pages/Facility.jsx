import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import facilityIllustration from "../assets/facility.png";
import facilityHome from "../assets/facilityHOME.jpeg";
import BookingFormInline from "../components/facility/BookingFormInline"; // added
import calendar from "../assets/calendar.jpg";
import conflict from "../assets/conflict.jpg";
import rules from "../assets/rules.jpg";
import reminders from "../assets/reminders.jpg";
import adminImg from "../assets/admin.jpg";
import book from "../assets/book.jpg";

const cards = [
  { title: "Live", subtitle: "Calendar View", img: calendar },
  { title: "Smart", subtitle: "Conflict Prevention", img: conflict },
  { title: "Tiered", subtitle: "Access Rules", img: rules },
  { title: "Auto-", subtitle: "Reminders", img: reminders },
  { title: "Admin", subtitle: "Overview Dashboard", img: adminImg },
  { title: "Booking", subtitle: "History & Analytics", img: book },
];

export default function FacilityPage() {
  const [visibleCards, setVisibleCards] = useState([]);
  const cardRefs = useRef([]);

  const scrollToFeatures = () => {
    const el = document.getElementById("facility-features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const linkId = "gf-dm-serif";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap";
      document.head.appendChild(link);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute("data-index");
            setVisibleCards((prev) => [...new Set([...prev, Number(index)])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <header
        className="relative bg-center bg-cover h-[650px] md:h-[740px] flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${facilityHome})` }}
      >
        <div className="absolute inset-0 bg-black/55"></div>

        <div className="relative z-10 text-center text-white px-6 mt-20 md:mt-28">
          <h1 className="text-4xl md:text-5xl font-semibold opacity-0 animate-fadeIn mb-0">
            Facility Bookings
          </h1>
          <img
            src={facilityIllustration}
            alt="Facility Booking Illustration"
            className="mx-auto -mt-4 w-72 md:w-[420px] opacity-0 animate-fadeInSlow"
          />
          <button
            onClick={scrollToFeatures}
            className="-mt-6 inline-block bg-[#0f335b] hover:bg-[#173f77] text-white font-semibold px-6 py-2 rounded-md transition-all duration-300 opacity-0 animate-fadeInSlower"
          >
            Learn More
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-[#c3c5ce]">
        <section id="facility-features" className="max-w-none px-4 sm:px-6 py-20">
          <h2
            className="text-center text-4xl md:text-5xl font-normal mb-14 text-[#06164a]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Key Features
          </h2>

          {/* WIDER BOX */}
          <div className="rounded-xl bg-[#06164a] 
              px-6 sm:px-10 md:px-20 lg:px-32 xl:px-48 
              py-12 mx-auto w-full max-w-[1800px]">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-12">
              {cards.map(({ title, subtitle, img }, index) => (
                <div
                  key={index}
                  ref={(el) => (cardRefs.current[index] = el)}
                  data-index={index}
                  className={`rounded-xl overflow-hidden border-[3px] border-white/40 bg-white/5 transform transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-2xl h-[300px]
                    ${
                      visibleCards.includes(index)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                >
                  <img
                    src={img}
                    alt={`${title} ${subtitle}`}
                    className="h-[75%] w-full object-cover transition-all duration-300 hover:brightness-110"
                  />
                  <div className="h-[25%] p-5 text-center text-white flex items-center justify-center">
                    <span className="text-lg font-normal leading-relaxed">
                      {title}
                      <br />
                      {subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inline Booking Form below features */}
          <div className="mt-12 mx-auto max-w-4xl">
            <BookingFormInline />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
