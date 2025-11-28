import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth";
import paymentIllustration from "../assets/payment.webp";
import paymentHome from "../assets/register.jpg";
import calendar from "../assets/calendar.jpg";
import conflict from "../assets/conflict.jpg";
import rules from "../assets/rules.jpg";
import reminders from "../assets/reminders.jpg";
import adminImg from "../assets/admin.jpg";
import book from "../assets/book.jpg";
import PaymentDuesTable from "../components/Payment/PaymentDuesTable";
import PaymentHistory from "../components/Payment/PaymentHistory";

const cards = [
  { title: "Multi-Channel", subtitle: "Payment Proof", img: calendar },
  { title: "Smart", subtitle: "Auto Matching", img: conflict },
  { title: "Real-Time", subtitle: "Status Tracking", img: rules },
  { title: "Secure", subtitle: "File Storage", img: reminders },
  { title: "Payment History", subtitle: "with Attachments", img: adminImg },
  { title: "Exportable", subtitle: "Reports", img: book },
];

export default function PaymentsPage() {
  const [visibleCards, setVisibleCards] = useState([]);
  const cardRefs = useRef([]);
  const observerRef = useRef(null);
  
  // Use the auth hook
  const { isResident } = useAuth();
  
  // Payment form state
  const [formData, setFormData] = useState({
    charge: "",
    amountPaid: "",
    transactionDate: "",
    transactionTime: "",
    receiptImage: null,
    remarks: "",
  });
  const [receiptFileName, setReceiptFileName] = useState("No file chosen");

  // Status message
  const [status, setStatus] = useState({ type: null, message: "" });
  const [tab, setTab] = useState("dues");

  const scrollToFeatures = () => {
    const el = document.getElementById("payment-features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, receiptImage: file }));
      setReceiptFileName(file.name);
    } else {
      setFormData((prev) => ({ ...prev, receiptImage: null }));
      setReceiptFileName("No file chosen");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    try {
      // ...submit to API or your handler...
      console.log("Form submitted:", formData);

      // Simulate success
      setStatus({
        type: "success",
        message: "Payment receipt submitted successfully!",
      });

      // Optional: reset form
      setFormData({
        charge: "",
        amountPaid: "",
        transactionDate: "",
        transactionTime: "",
        receiptImage: null,
        remarks: "",
      });
      setReceiptFileName("No file chosen");
    } catch (err) {
      setStatus({
        type: "error",
        message: "There was an error submitting your receipt. Please try again.",
      });
    }
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

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleCards((prev) => {
              if (!prev.includes(index)) {
                return [...prev, index];
              }
              return prev;
            });
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) observerRef.current?.observe(card);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <header
        className="relative bg-center bg-cover h-[650px] md:h-[740px] flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${paymentHome})` }}
      >
        <div className="absolute inset-0 bg-black/55"></div>

        <div className="relative z-10 text-center text-white px-6 mt-20 md:mt-32">
          <h1 className="text-4xl md:text-5xl font-semibold opacity-0 animate-fadeIn mb-6">
            Payment Management
          </h1>
          <img
            src={paymentIllustration}
            alt="Payment Management Illustration"
            className="mx-auto w-60 md:w-[420px] opacity-0 animate-fadeInSlow"
          />
          <button
            onClick={scrollToFeatures}
            className="mt-6 inline-block bg-[#0f335b] hover:bg-[#173f77] text-white font-semibold px-6 py-2 rounded-md transition-all duration-300 opacity-0 animate-fadeInSlower"
          >
            Learn More
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-[#c3c5ce]">
        <section id="payment-features" className="max-w-none px-4 sm:px-6 py-20">
          <h2
            className="text-center text-4xl md:text-5xl font-normal mb-14 text-[#06164a]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Key Features
          </h2>

          <div className="rounded-xl bg-[#06164a] 
              px-6 sm:px-10 md:px-20 lg:px-32 xl:px-48 
              py-12 mx-auto w-full max-w-[1800px]">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-12">
              {cards.map(({ title, subtitle, img }, index) => (
                <div
                  key={index}
                  ref={(el) => (cardRefs.current[index] = el)}
                  data-index={index}
                  className={`rounded-xl overflow-hidden border-[3px] border-white/40 bg-white/5 transform transition-all duration-500 ease-out hover:scale-105 hover:bg-white/10 hover:shadow-2xl h-[300px] will-change-transform
                    ${
                      visibleCards.includes(index)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                  style={{
                    transitionDelay: visibleCards.includes(index) ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <img
                    src={img}
                    alt={`${title} ${subtitle}`}
                    className="h-[75%] w-full object-cover transition-all duration-300 hover:brightness-110"
                    loading="lazy"
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
        </section>

        {/* Payment Form Section - Only visible to logged-in residents */}
        {isResident && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
            <h2
              className="text-center text-4xl md:text-5xl font-normal mb-8 text-[#06164a]"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Payment Management
            </h2>

            <div className="flex gap-3 justify-center mb-10">
              <button 
                onClick={() => setTab("dues")} 
                className={tab === "dues" ? "px-4 py-2 rounded-md bg-[#06164a] text-white" : "px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"}
              >
                Pending Dues
              </button>
              <button 
                onClick={() => setTab("payment")} 
                className={tab === "payment" ? "px-4 py-2 rounded-md bg-[#06164a] text-white" : "px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"}
              >
                Make Payment
              </button>
              <button 
                onClick={() => setTab("history")} 
                className={tab === "history" ? "px-4 py-2 rounded-md bg-[#06164a] text-white" : "px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"}
              >
                Payment History
              </button>
            </div>

            {tab === "dues" && <PaymentDuesTable onPayNow={() => setTab("payment")} />}
            
            {tab === "payment" && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-semibold text-[#06164a] mb-6">Upload Payment Receipt</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Charge Selection */}
                  <div>
                    <label htmlFor="charge" className="block text-base font-medium text-[#06164a] mb-2">
                      Charge
                    </label>
                    <select
                      id="charge"
                      name="charge"
                      value={formData.charge}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#06164a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#06164a] transition-all"
                    >
                      <option value="">Select Charge</option>
                      <option value="maintenance">Maintenance Fee</option>
                      <option value="parking">Parking Fee</option>
                      <option value="utility">Utility Bill</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Amount Paid */}
                  <div>
                    <label htmlFor="amountPaid" className="block text-base font-medium text-[#06164a] mb-2">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      id="amountPaid"
                      name="amountPaid"
                      value={formData.amountPaid}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#06164a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#06164a] transition-all placeholder-white/60"
                      placeholder="Enter amount"
                    />
                  </div>

                  {/* Transaction Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="transactionDate" className="block text-base font-medium text-[#06164a] mb-2">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        id="transactionDate"
                        name="transactionDate"
                        value={formData.transactionDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-[#06164a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#06164a] transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="transactionTime" className="block text-base font-medium text-[#06164a] mb-2">
                        Transaction Time
                      </label>
                      <input
                        type="time"
                        id="transactionTime"
                        name="transactionTime"
                        value={formData.transactionTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-[#06164a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#06164a] transition-all"
                      />
                    </div>
                  </div>

                  {/* Upload Receipt Image */}
                  <div>
                    <label className="block text-base font-medium text-[#06164a] mb-2">
                      Upload Receipt Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="receiptImage"
                        className="px-6 py-3 bg-[#06164a] text-white rounded-md cursor-pointer hover:bg-[#0f335b] transition-all font-medium"
                      >
                        Choose File
                      </label>
                      <span className="text-[#06164a] text-sm">{receiptFileName}</span>
                      <input
                        type="file"
                        id="receiptImage"
                        name="receiptImage"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label htmlFor="remarks" className="block text-base font-medium text-[#06164a] mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-[#06164a] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#06164a] transition-all resize-none placeholder-white/60"
                      placeholder="Any additional details"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#06164a] text-white font-semibold rounded-md hover:bg-[#0f335b] transition-all duration-300"
                    >
                      Submit Receipt
                    </button>
                  </div>

                  {/* Status message box (success/error) */}
                  {status.type && (
                    <div
                      className={
                        status.type === "success"
                          ? "mt-4 rounded-md border border-green-400 bg-green-100 text-green-800 px-4 py-3"
                          : "mt-4 rounded-md border border-red-400 bg-red-100 text-red-800 px-4 py-3"
                      }
                    >
                      {status.message}
                    </div>
                  )}
                </form>
              </div>
            )}
            
            {tab === "history" && <PaymentHistory />}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}