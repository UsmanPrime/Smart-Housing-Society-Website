import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../lib/api';
import Footer from '../components/Footer'
import recaptchaIcon from '../assets/RecaptchaLogo.svg.png'
import loginImg from '../assets/register.jpg'

export default function Register() {
  const [userType, setUserType] = useState('resident')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [specialization, setSpecialization] = useState([])
  const [specOpen, setSpecOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isRobotChecked, setIsRobotChecked] = useState(false)
  const navigate = useNavigate()

  const SPECIALIZATION_OPTIONS = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
  ]

  const toggleSpecialization = (val) => {
    setSpecialization((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    )
  }

  const selectAllSpecs = () => {
    setSpecialization(SPECIALIZATION_OPTIONS.map((o) => o.value))
  }

  const clearAllSpecs = () => {
    setSpecialization([])
  }

  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ])
    }
    loadFonts()
    const t = setTimeout(() => setMounted(true), 20)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !email || !password || !confirmPassword || !phone) {
      setError('Please fill all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!isRobotChecked) {
      setError('Please verify that you are not a robot')
      return
    }

    setLoading(true)
    try {
      const url = `${API_BASE}/api/auth/register`
      const payload = {
        name,
        email,
        password,
        phone,
        role: userType,
      };
      if (userType === 'vendor') {
        payload.specialization = specialization;
      }
      const res = await axios.post(url, payload)

      if (res.data?.success) {
        setSuccess(res.data?.message || 'Registration successful! Please wait for admin approval.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(res.data?.message || 'Registration failed')
      }
    } catch (err) {
      const msg = err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors[0]?.msg : null) ||
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Autofill override so inputs remain blue and text white */}
      <style>{`
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

      <main
        className="relative flex-grow flex items-center justify-center min-h-screen pt-36 pb-20"
        style={{
          backgroundImage: `url(${loginImg})`,
          backgroundPosition: 'top center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />

        <div
          className={`
            relative z-10 w-full max-w-4xl px-6 md:px-8 mt-8
            transform transition-all duration-500 ease-out
            ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-6 scale-95'}
          `}
        >
          <div className="mx-auto max-w-2xl">
            <div className="text-left mb-8">
              <h1
                className="text-4xl font-normal text-white mb-2"
                style={{ fontFamily: `"DM Serif Display", serif` }}
              >
                Register
              </h1>
              <p className="text-lg text-white/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Create New Account
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>

              {/* User type */}
              <div>
                <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Select user type
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl text-white text-lg bg-[#0b1a4a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <option value="resident">Resident</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              {/* Specialization for vendor only */}
              {userType === 'vendor' && (
                <div>
                  <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Specialization (select one or more)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSpecOpen((o) => !o)}
                      className="w-full px-6 py-4 rounded-xl text-white text-left text-lg bg-[#0b1a4a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                      aria-haspopup="listbox"
                      aria-expanded={specOpen ? 'true' : 'false'}
                    >
                      {specialization.length === 0 && (
                        <span className="text-white/70">Select specializations</span>
                      )}
                      {specialization.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {specialization.map((val) => {
                            const opt = SPECIALIZATION_OPTIONS.find((o) => o.value === val)
                            return (
                              <span key={val} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm">
                                {opt?.label || val}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </button>

                    {specOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl bg-[#0b1a4a] border border-white/10 shadow-lg">
                        <div className="max-h-52 overflow-y-auto py-2">
                          {SPECIALIZATION_OPTIONS.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer"
                                checked={specialization.includes(opt.value)}
                                onChange={() => toggleSpecialization(opt.value)}
                              />
                              <span className="text-white/90 capitalize">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-white/10 bg-[#0b1a4a]">
                          <div className="flex gap-2">
                            <button type="button" onClick={selectAllSpecs} className="text-sm text-white/90 hover:underline">Select all</button>
                            <button type="button" onClick={clearAllSpecs} className="text-sm text-white/80 hover:underline">Clear</button>
                          </div>
                          <button type="button" onClick={() => setSpecOpen(false)} className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md">Done</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/70 mt-2">You can choose multiple options.</p>
                </div>
              )}

              

              {/* Name */}
              <div>
                <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-8 py-5 rounded-xl text-white text-lg placeholder-white/70 bg-[#0b1a4a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-8 py-5 rounded-xl text-white text-lg placeholder-white/70 bg-[#0b1a4a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-8 py-5 rounded-xl text-white text-lg placeholder-white/70 bg-[#0b1a4a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Re-enter password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-8 py-5 rounded-xl text-white text-lg placeholder-white/70 bg-[#0b1a4a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Contact number */}
              <div>
                <label className="block text-lg font-medium text-white/90 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Contact number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter contact number"
                  className="w-full px-8 py-5 rounded-xl text-white text-lg placeholder-white/70 bg-[#0b1a4a] border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* reCAPTCHA box (same style as contact form but blue here) */}
              <div className="flex items-center gap-6 py-3 px-6 bg-[#0b1a4a] w-fit border border-white/10">
                <div className="w-8 h-8 border-2 border-white/30 flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={isRobotChecked}
                    onChange={(e) => setIsRobotChecked(e.target.checked)}
                    className="w-4 h-4 cursor-pointer" 
                    id="recaptcha-register" 
                  />
                </div>
                <label
                  htmlFor="recaptcha-register"
                  className="text-white/90 text-base cursor-pointer"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  I'm not a robot
                </label>
                <img src={recaptchaIcon} alt="reCAPTCHA" className="w-8 h-8 ml-2" />
              </div>

              {/* Feedback */}
              {error && (
                <div className="bg-red-500/20 text-red-100 border border-red-500/30 rounded-xl p-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/20 text-green-100 border border-green-500/30 rounded-xl p-4">
                  {success}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/30 my-6" />

              {/* Register button (smaller width) */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-32 md:w-40 flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-[#0b1a4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b1a4a] ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-95'}`}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>

              {/* Links */}
              <div className="text-left space-y-2 pt-4">
                <div>
                  <span className="text-base text-white/90">
                    Already have an account?{' '}
                    <Link to="/login" className="underline">
                      Login
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

            {/* extra bottom spacer so background image remains visible below links */}
            <div className="h-8 md:h-12" />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}