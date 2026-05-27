import { useState, useEffect, useRef } from 'react'
import http from '../lib/http';
import contactImage from '../assets/contact.jpg';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Add CSS for autofill styling
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #0b1a4a inset !important;
    box-shadow: 0 0 0 30px #0b1a4a inset !important;
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
  const [focusedField, setFocusedField] = useState(null);

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
      { threshold: 0.15 }
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

  const inputClasses = (fieldName) => `
    w-full px-6 py-4 rounded-2xl bg-[#0b1a4a] text-white placeholder:text-white/40 
    placeholder:uppercase border border-white/5 outline-none transition-all duration-400 text-sm
    focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/30
    hover:border-white/15
    ${focusedField === fieldName ? 'shadow-lg shadow-blue-500/10' : ''}
  `;

  return (
    <section id="contact" className="px-6 md:px-8 my-20 scroll-mt-28" ref={sectionRef}>
      <div className={`w-full mx-auto bg-gradient-to-br from-[#d5d8e1] to-[#c3c5ce]
        rounded-[30px] p-10 md:p-16 relative overflow-hidden
        transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0b1a4a]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#0b1a4a]/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Centered header */}
          <div className={`text-center mb-12
            transition-all duration-700 delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <span className="inline-block text-sm font-medium tracking-[0.25em] uppercase text-[#2a5d9b] mb-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-5xl text-[#0b1a4a]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Let's Talk
            </h2>
            <p className="text-[#0b1a4a]/70 text-lg mt-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Contact us today to learn more about our services.
            </p>
            <div className={`mx-auto mt-4 h-[2px] bg-gradient-to-r from-transparent via-[#2a5d9b]/50 to-transparent
              transition-all duration-1000 delay-500
              ${isVisible ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}></div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name & Email row */}
            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="NAME"
                required
                className={inputClasses('name')}
                style={{
                  WebkitBoxShadow: 'inset 0 0 0 1000px #0b1a4a',
                  WebkitTextFillColor: 'white'
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="EMAIL"
                required
                className={inputClasses('email')}
                style={{
                  WebkitBoxShadow: 'inset 0 0 0 1000px #0b1a4a',
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
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder="PHONE"
              className={inputClasses('phone')}
              style={{
                WebkitBoxShadow: 'inset 0 0 0 1000px #0b1a4a',
                WebkitTextFillColor: 'white'
              }}
            />

            {/* Message */}
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              placeholder="MESSAGE"
              rows="5"
              required
              className={`${inputClasses('message')} resize-none`}
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
              <div className={`p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 animate-fade-up ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/15 text-green-800 border border-green-500/20' 
                  : 'bg-red-500/15 text-red-800 border border-red-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  {submitStatus.type === 'success' ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {submitStatus.message}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary bg-gradient-to-r from-[#0b1a4a] to-[#1a3d6b]
                  text-white px-10 py-4 rounded-2xl text-base font-medium
                  shadow-lg shadow-blue-900/20
                  transition-all duration-500
                  ${isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-[#1a3d6b] hover:to-[#2a5d9b] hover:shadow-xl hover:shadow-blue-700/20'
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
