import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import recaptchaIcon from '../assets/RecaptchaLogo.svg.png';
import contactImage from '../assets/contact.jpg';

export default function ContactForm() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isRobotChecked, setIsRobotChecked] = useState(false);

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate reCAPTCHA
    if (!isRobotChecked) {
      setSubmitStatus({
        type: 'error',
        message: 'Please verify that you are not a robot'
      });
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Prefer configurable API base URL; fall back to same-origin with dev proxy
      const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || '').trim();
      const url = `${API_BASE}/api/contact`;
      const response = await axios.post(url, formData);
      
      if (response.data.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully.'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setIsRobotChecked(false);
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="px-6 my-16 scroll-mt-28" ref={sectionRef}>
      {/* Main container with dark blue background and rounded corners */} 
      <div className="max-w-7xl mx-auto bg-[#0b1a4a] text-white rounded-3xl p-8 md:p-16 relative overflow-hidden">
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

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name & Email row */}
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors"
              />

              {/* Message */}
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                rows="6"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#162b5e] text-white placeholder:text-white/70 border border-white/10 focus:border-white/30 outline-none transition-colors resize-none"
              ></textarea>

              {/* Rectangular reCAPTCHA box with increased size */}
              <div className="flex items-center gap-6 py-3 px-6 bg-white w-fit">
                <div className="w-8 h-8 border-2 border-gray-300 flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={isRobotChecked}
                    onChange={(e) => setIsRobotChecked(e.target.checked)}
                    className="w-4 h-4 cursor-pointer" 
                    id="recaptcha"
                  />
                </div>
                <label htmlFor="recaptcha" className="text-gray-600 text-base cursor-pointer">I'm not a robot</label>
                <img src={recaptchaIcon} alt="reCAPTCHA" className="w-8 h-8 ml-2" />
              </div>

              {/* Status Message */}
              {submitStatus.message && (
                <div className={`p-4 rounded-xl ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-500/20 text-green-100 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-100 border border-red-500/30'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-white text-[#0b1a4a] px-8 py-3 rounded-xl text-lg font-medium 
                         transition-all duration-300 transform
                         ${isSubmitting 
                           ? 'opacity-50 cursor-not-allowed' 
                           : 'hover:bg-gray-100 hover:scale-105'
                         }`}
              >
                {isSubmitting ? 'Sending...' : 'Submit Now'}
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
