import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ]);
    };
    loadFonts();
  }, []);

  const requestOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!email) return setError('Please enter your email');
    try {
      setLoading(true);
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('If an account exists, an OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!otp) return setError('Enter the OTP sent to your email');
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/verify-otp', { email, otp });
      if (res.data?.success) {
        setMessage('OTP verified. You can set a new password.');
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!newPassword || !confirmPassword) return setError('Enter and confirm the new password');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
      if (res.data?.success) {
        setMessage('Password updated. You can now log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />
      <main className="flex-grow pt-40 pb-16 px-6">
        <div className="max-w-lg mx-auto w-full">
          <div className="bg-gradient-to-r from-ng-blue to-ng-accent rounded-2xl shadow-lg p-8 text-white mb-6">
            <h1 className="text-3xl font-normal" style={{ fontFamily: "'DM Serif Display', serif" }}>Forgot Password</h1>
            <p className="opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>Reset your password securely using a one-time code sent to your email.</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
            {message && <div className="p-3 rounded bg-green-50 text-green-700 text-sm">{message}</div>}

            {step === 1 && (
              <form onSubmit={requestOtp} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="you@example.com" required />
                <button type="submit" disabled={loading} className="mt-2 px-4 py-2 rounded-lg bg-ng-blue text-white hover:bg-ng-accent disabled:opacity-60">{loading ? 'Sending...' : 'Send OTP'}</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={verifyOtp} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">We sent an OTP to</label>
                  <div className="text-gray-800 font-medium">{email}</div>
                </div>
                <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border rounded-lg px-3 py-2 tracking-widest" placeholder="123456" required />
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-ng-blue text-white hover:bg-ng-accent disabled:opacity-60">{loading ? 'Verifying...' : 'Verify OTP'}</button>
                  <button type="button" onClick={requestOtp} className="px-4 py-2 rounded-lg border">Resend</button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={resetPassword} className="space-y-3">
                <div className="text-gray-700 text-sm">Email: <span className="font-medium">{email}</span></div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="At least 6 characters" required />
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                <button type="submit" disabled={loading} className="mt-2 px-4 py-2 rounded-lg bg-ng-blue text-white hover:bg-ng-accent disabled:opacity-60">{loading ? 'Saving...' : 'Set New Password'}</button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
