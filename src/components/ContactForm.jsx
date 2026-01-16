import { useState, useEffect, useRef } from 'react';
import http from '../lib/http';
import contactImage from '../assets/contact.jpg';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Add CSS for autofill styling
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #001149 inset !important;
    box-shadow: 0 0 0 30px #001149 inset !important;
  }
  input:-webkit-autofill {
    -webkit-text-fill-color: white !important;
  }
`;

export default function ContactForm() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const recaptchaRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [recaptchaToken, setRecaptchaToken] = useState('');

  // Load fonts and set up scroll animation observer, initialize reCAPTCHA
  useEffect(() => {
    // Inject autofill CSS
    const style = document.createElement('style');
    style.textContent = autofillStyles;
    document.head.appendChild(style);

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

    // Initialize reCAPTCHA widget
    const initRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
        try {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: (token) => setRecaptchaToken(token),
            'expired-callback': () => setRecaptchaToken(''),
          });
        } catch (e) {
          console.error('reCAPTCHA render error:', e);
        }
      }
    };

    // If grecaptcha is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      initRecaptcha();
    } else {
      // Wait for grecaptcha to load
      window.addEventListener('load', initRecaptcha);
      return () => window.removeEventListener('load', initRecaptcha);
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
    if (!recaptchaToken) {
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
      const response = await http.post('/api/contact', {
        ...formData,
        recaptchaToken
      });
      
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
        setRecaptchaToken('');
        
        // Reset reCAPTCHA widget
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
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
    <section id="contact" className="px-8 my-16 scroll-mt-28" ref={sectionRef}>
      {/* Main container with light background and centered content */} 
      <div className="w-full mx-auto bg-[#d5d8e1] rounded-[30px] p-12 md:p-16 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Centered header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl text-[#0b1a4a] mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Let's Talk
            </h2>
            <p className="text-[#0b1a4a] text-lg">
              Contact us today to learn more about our services.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name & Email row */}
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="NAME"
                required
                className="w-full px-6 py-4 rounded-2xl bg-[#001149] text-white placeholder:text-white/70 placeholder:uppercase border-none outline-none transition-colors text-sm focus:ring-2 focus:ring-blue-400"
                style={{
                  WebkitBoxShadow: 'inset 0 0 0 1000px #001149',
                  WebkitTextFillColor: 'white'
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="EMAIL"
                required
                className="w-full px-6 py-4 rounded-2xl bg-[#001149] text-white placeholder:text-white/70 placeholder:uppercase border-none outline-none transition-colors text-sm focus:ring-2 focus:ring-blue-400"
                style={{
                  WebkitBoxShadow: 'inset 0 0 0 1000px #001149',
                  WebkitTextFillColor: 'white'
                }}
              />
            </div>

            {/* Phone */}
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="PHONE"
              className="w-full px-6 py-4 rounded-2xl bg-[#001149] text-white placeholder:text-white/70 placeholder:uppercase border-none outline-none transition-colors text-sm focus:ring-2 focus:ring-blue-400"
              style={{
                WebkitBoxShadow: 'inset 0 0 0 1000px #001149',
                WebkitTextFillColor: 'white'
              }}
            />

            {/* Message */}
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="MESSAGE"
              rows="6"
              required
              className="w-full px-6 py-4 rounded-2xl bg-[#001149] text-white placeholder:text-white/70 placeholder:uppercase border-none outline-none transition-colors resize-none text-sm"
            ></textarea>

            {/* reCAPTCHA widget */}
            <div 
              ref={recaptchaRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                transform: 'scale(0.9)',
                transformOrigin: 'center'
              }}
            ></div>

            {/* Status Message */}
            {submitStatus.message && (
              <div className={`p-4 rounded-2xl ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/20 text-green-800 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-800 border border-red-500/30'
              }`}>
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button with proper spacing and alignment */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-[#001149] text-white px-10 py-4 rounded-2xl text-base font-medium 
                         transition-all duration-300 transform
                         ${isSubmitting 
                           ? 'opacity-50 cursor-not-allowed' 
                           : 'hover:bg-[#0b1a4a] hover:scale-105'
                         }`}
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
