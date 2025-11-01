import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ]);
    };
    loadFonts();

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const u = res.data.user;
          setName(u.name || '');
          setEmail(u.email || '');
          setPhone(u.phone || '');
        }
        setLoading(false);
      } catch (err) {
        console.error('Load profile failed:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return setError('To change password, fill all password fields.');
      }
      if (newPassword !== confirmPassword) {
        return setError('New password and confirm password do not match.');
      }
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const payload = { name: name.trim(), phone: phone.trim() };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await axios.put('/api/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMessage('Profile updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Update localStorage user for UI consistency
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            u.name = res.data.user?.name || u.name;
            u.email = res.data.user?.email || u.email;
            u.role = res.data.user?.role || u.role;
            localStorage.setItem('user', JSON.stringify(u));
            // Notify other components in the same tab
            window.dispatchEvent(new Event('user-updated'));
          } catch {}
        }
        // Optional: reload to ensure global UI picks up changes everywhere
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
      setSaving(false);
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />

      <main className="flex-grow pt-40 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-ng-blue to-ng-accent rounded-2xl shadow-lg p-8 text-white mb-6">
            <h1 className="text-4xl font-normal" style={{ fontFamily: "'DM Serif Display', serif" }}>Edit Profile</h1>
            <p className="opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>Update your personal details and password.</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
                {message && <div className="p-3 rounded bg-green-50 text-green-700 text-sm">{message}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Optional"
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-ng-blue mb-2">Change Password (optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                      placeholder="Current password"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                      placeholder="New password"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-ng-blue text-white hover:bg-ng-accent disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
