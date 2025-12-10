import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AnnouncementsList from '../../components/AnnouncementsList';
import { api } from '../../lib/api';
import useAuth from '../../hooks/useAuth';

export default function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', description: '' });
  const [savingService, setSavingService] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Load fonts
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ]);
    };
    loadFonts();
    const token = auth?.token || localStorage.getItem('token') || undefined;

    const fetchStats = async () => {
      try {
        const data = await api.get('/api/vendors/stats', { token });
        if (data?.data) {
          setStats(data.data);
          setServices(data.data.services || []);
        }
      } catch (e) {
        console.warn('Failed to fetch vendor stats:', e?.message || e);
      }
    };

    const fetchRecent = async () => {
      try {
        const res = await api.get('/api/vendors/my-work?limit=10', { token });
        if (res?.data?.complaints) {
          // Show only open or in-progress newest 5
            const list = res.data.complaints
              .filter(c => ['open','in-progress'].includes(c.status))
              .slice(0,5);
            setRecentRequests(list);
        }
      } catch (e) {
        console.warn('Failed to fetch recent requests:', e?.message || e);
      }
    };

    fetchStats();
    fetchRecent();
  }, []);

  const submitNewService = async () => {
    if (!newService.name.trim()) return;
    try {
      setSavingService(true);
      const token = auth?.token || localStorage.getItem('token') || undefined;
      await api.post('/api/vendors/services', newService, { token });
      setNewService({ name: '', description: '' });
      // Refresh services via stats endpoint for consolidated data
      const data = await api.get('/api/vendors/stats', { token });
      if (data?.data) {
        setStats(data.data);
        setServices(data.data.services || []);
      }
    } catch (e) {
      alert(e?.message || 'Failed to add service');
    } finally {
      setSavingService(false);
    }
  };

  const removeService = async (index) => {
    if (!confirm('Remove this service?')) return;
    try {
      const token = auth?.token || localStorage.getItem('token') || undefined;
      await api.delete(`/api/vendors/services/${index}`, { token });
      const data = await api.get('/api/vendors/stats', { token });
      if (data?.data) {
        setStats(data.data);
        setServices(data.data.services || []);
      }
    } catch (e) {
      alert(e?.message || 'Failed to remove service');
    }
  };

  const ratingAverage = stats.ratingAverage || 0;
  const ratingCount = stats.ratingCount || 0;
  const filledStars = Math.round(ratingAverage);

  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />

       <main className="flex-grow pt-40 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-ng-blue to-ng-accent rounded-2xl shadow-lg p-8 mb-8 text-white">
            <h1 
              className="text-4xl font-normal mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Vendor Dashboard
            </h1>
            <p className="text-lg opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome, {user?.name || 'Vendor'}! Manage your services.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Services Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-ng-blue">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Services</p>
                  <div className="text-3xl font-bold text-ng-blue">{stats.inProgress || 0}</div>
                </div>
                <div className="bg-ng-blue/10 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500">Services offered</p>
            </div>

            {/* Pending Requests Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
                  <div className="text-3xl font-bold text-orange-600">{stats.open || 0}</div>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button className="text-sm text-orange-600 hover:underline">View requests →</button>
            </div>

            {/* Completed Jobs Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Completed Jobs</p>
                  <div className="text-3xl font-bold text-green-600">{stats.completed || 0}</div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500">This month</p>
            </div>

            {/* Earnings Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Earnings</p>
                  <div className="text-3xl font-bold text-blue-600">$0</div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            {/* Announcements Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-ng-blue">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Announcements</p>
                  <div className="text-sm text-gray-500">Latest updates</div>
                </div>
                <div className="bg-ng-blue/10 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto mb-3">
                <AnnouncementsList limit={3} />
              </div>
              <button 
                onClick={() => navigate('/announcements')}
                className="text-sm text-ng-blue hover:underline"
              >View all →</button>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Requests */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-normal text-ng-blue"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Recent Requests
                </h2>
                <svg className="w-6 h-6 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              
              {recentRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg mb-2">No recent requests</p>
                  <p className="text-sm text-gray-400">Open or in-progress tasks will show here</p>
                </div>
              )}
              {recentRequests.length > 0 && (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {recentRequests.map(r => (
                    <div key={r._id} className="bg-white p-3 rounded-md shadow-sm border text-sm">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{r.title}</p>
                          <p className="text-xs text-gray-500">{r.category} • {r.priority}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === 'open' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{r.status}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Services */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-normal text-ng-blue"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  My Services
                </h2>
                <svg className="w-6 h-6 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Service name"
                    className="border rounded px-3 py-2 text-sm"
                    value={newService.name}
                    onChange={e => setNewService(s => ({ ...s, name: e.target.value }))}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    className="border rounded px-3 py-2 text-sm"
                    rows={2}
                    value={newService.description}
                    onChange={e => setNewService(s => ({ ...s, description: e.target.value }))}
                  />
                  <button
                    onClick={submitNewService}
                    disabled={savingService || !newService.name.trim()}
                    className="w-full bg-ng-blue disabled:opacity-40 text-white px-6 py-2 rounded-lg hover:bg-ng-accent transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {savingService ? 'Saving...' : 'Add Service'}
                  </button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {services.length === 0 && (
                    <p className="text-sm text-gray-500">No services added yet</p>
                  )}
                  {services.map((svc, idx) => (
                    <div key={idx} className="bg-white border rounded p-3 text-sm flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{svc.name}</p>
                        {svc.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{svc.description}</p>}
                      </div>
                      <button
                        onClick={() => removeService(idx)}
                        className="text-xs text-rose-600 hover:underline"
                      >Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profile and Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-2xl font-normal text-ng-blue"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Vendor Profile
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <p className="text-gray-900 font-medium">{user?.name || 'Not set'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-900">{user?.email || 'Not set'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                <p className="text-gray-900">{stats.serviceCategory || 'Not set'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className={`w-5 h-5 ${star <= filledStars ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">({ratingCount} reviews, avg {ratingAverage.toFixed(1)})</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => navigate('/profile')}
                className="bg-ng-blue text-white px-6 py-2 rounded-lg hover:bg-ng-accent transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 
              className="text-2xl font-normal text-ng-blue mb-6"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/complaints?status=open')}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-ng-blue/5 transition-all text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-sm font-medium text-gray-700">View Requests</p>
              </button>

              <button 
                onClick={() => navigate('/complaints?status=completed')}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-ng-blue/5 transition-all text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Completed Jobs</p>
              </button>

              <button 
                onClick={() => navigate('/earnings')}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-ng-blue/5 transition-all text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">View Earnings</p>
              </button>

              <button 
                onClick={() => navigate('/')}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-ng-blue/5 transition-all text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Contact Support</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
