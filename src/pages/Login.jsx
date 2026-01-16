import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import http from '../lib/http';
import { getCsrfToken } from '../hooks/useCsrf';
import TwoFactorPrompt from '../components/Security/TwoFactorPrompt';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import loginImg from '../assets/login.jpeg';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  // load fonts used elsewhere and for "Login" heading
  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ]);
    };
    loadFonts();

    // small delay to trigger entrance animation
    const t = setTimeout(() => setMounted(true), 20);
    return () => {
      clearTimeout(t);
    };
  }, []);

  // Initialize reCAPTCHA widget
  useEffect(() => {
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError('Please verify that you are not a robot');
      return;
    }

    setLoading(true);

    try {
      // Fetch CSRF token before login
      await getCsrfToken();

      const res = await http.post('/api/auth/login', { 
        email, 
        password,
        recaptchaToken 
      });

      if (res.data?.success) {
        // Save tokens and user info separately for enhanced security
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Redirect based on role
        const userRole = res.data.user.role;
        if (userRole === 'admin') {
          navigate('/dashboard/admin');
        } else if (userRole === 'vendor') {
          navigate('/dashboard/vendor');
        } else {
          navigate('/dashboard/resident');
        }
      } else if (res.data?.require2FA) {
        // 2FA required - show prompt
        setRequire2FA(true);
        setPendingUserId(res.data.userId);
        setLoading(false);
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      let msg = 'Login failed. Please check your credentials.';
      
      if (err.response?.data?.message) {
        // Backend returned a specific error message
        msg = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        // Network error - backend not reachable
        msg = 'Cannot connect to server. Please check your internet connection or try again later.';
      }
      
      setError(msg);
      // Reset reCAPTCHA on error
      if (window.grecaptcha) {
        window.grecaptcha.reset();
        setRecaptchaToken('');
      }
    } finally {
      if (!require2FA) {
        setLoading(false);
      }
    }
  };

  const handle2FAVerify = async (twoFactorToken) => {
    try {
      const res = await http.post('/api/auth/login', {
        email,
        password,
        recaptchaToken,
        twoFactorToken
      });

      if (res.data?.success) {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        const userRole = res.data.user.role;
        if (userRole === 'admin') {
          navigate('/dashboard/admin');
        } else if (userRole === 'vendor') {
          navigate('/dashboard/vendor');
        } else {
          navigate('/dashboard/resident');
        }
      } else {
        throw new Error(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Autofill override so inputs remain blue and text white */}
      <style>{`
        /* Prevent Chrome autofill from changing background to white */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0px 1000px #0b1a4a inset !important;
          box-shadow: 0 0 0px 1000px #0b1a4a inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        input:-moz-autofill {
          box-shadow: 0 0 0px 1000px #0b1a4a inset !important;
          -moz-text-fill-color: #ffffff !important;
        }
      `}</style>

      {/* Full-bleed background */}
      <main
        className="relative flex-grow flex items-center justify-center min-h-screen pt-32 md:pt-40" // extra top padding for spacing from navbar
        style={{
          backgroundImage: `url(${loginImg})`,
          backgroundPosition: 'top center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />

        {/* Centered content wrapper — increased max width to allow wider inputs */}
        <div
          className={`
            relative z-10 w-full max-w-4xl px-6 md:px-8
            transform transition-all duration-500 ease-out
            ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-6 scale-95'}
          `}
        >
          {/* Inner column width controls how wide the inputs are.
              Increase max-w-2xl to make inputs wider, or reduce for smaller. */}
          <div className="mx-auto max-w-2xl">
            {/* Header: apply DM Serif Display to title */}
            <div className="text-center mb-8">
              <h1
                className="text-4xl font-normal text-white mb-2"
                style={{ fontFamily: `"DM Serif Display", serif` }}
              >
                Login
              </h1>
              <p className="text-lg text-white/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Log in to NextGen Residency
              </p>
            </div>

            {/* Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Email */}
                <div>
                  <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{ backgroundColor: '#0b1a4a' }}
                    className="w-full px-8 py-5 rounded-xl text-white text-lg placeholder-white/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ backgroundColor: '#0b1a4a' }}
                    className="w-full px-8 py-5 rounded-xl text-white text-lg placeholder-white/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>

              {/* Google reCAPTCHA v2 Widget */}
              <div className="flex justify-start">
                <div ref={recaptchaRef} className="g-recaptcha"></div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/30 my-6" />

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 text-red-100 border border-red-500/30 rounded-xl p-4">
                  {error}
                </div>
              )}

              {/* Login Button - reduced width */}
              <div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-32 md:w-40 flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-[#0b1a4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b1a4a] ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-95'}`}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

              </div>

              {/* Links - added proper Link component for forgot password */}
              <div className="text-left space-y-2 pt-4">
                <div>
                  <span className="text-base text-white/90">
                    Don't have an account?{' '}
                    <Link to="/signup" className="underline">
                      Sign Up
                    </Link>
                  </span>
                </div>
                <div>
                  <Link to="/forgot-password" className="text-base text-white/90 underline">
                    Forget Your Password?
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 2FA Prompt Modal */}
      {require2FA && (
        <TwoFactorPrompt
          onVerify={handle2FAVerify}
          onCancel={() => {
            setRequire2FA(false);
            setPendingUserId(null);
            setLoading(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
