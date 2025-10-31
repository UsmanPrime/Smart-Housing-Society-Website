import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import recaptchaIcon from '../assets/RecaptchaLogo.svg.png';
import loginImg from '../assets/login.jpeg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRobotChecked, setIsRobotChecked] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate reCAPTCHA
    if (!isRobotChecked) {
      setError('Please verify that you are not a robot');
      return;
    }

    setLoading(true);

    try {
      const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || '').trim();
      const url = `${API_BASE}/api/auth/login`;
      const res = await axios.post(url, { email, password });

      if (res.data?.success) {
        // Save token and user info
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
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
        className="relative flex-grow flex items-center justify-center min-h-screen pt-24" // added pt-24 for navbar spacing
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
            <div className="text-left mb-8">
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

              {/* Rectangular reCAPTCHA box styled exactly like contact form */}
              <div className="flex items-center gap-6 py-3 px-6 bg-[#0b1a4a] w-fit border border-white/10">
                <div className="w-8 h-8 border-2 border-white/30 flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={isRobotChecked}
                    onChange={(e) => setIsRobotChecked(e.target.checked)}
                    className="w-4 h-4 cursor-pointer" 
                    id="recaptcha"
                  />
                </div>
                <label 
                  htmlFor="recaptcha" 
                  className="text-white/90 text-base cursor-pointer"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  I'm not a robot
                </label>
                <img src={recaptchaIcon} alt="reCAPTCHA" className="w-8 h-8 ml-2" />
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

      <Footer />
    </div>
  );
}
