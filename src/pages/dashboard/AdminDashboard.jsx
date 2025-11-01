import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AnnouncementsList from '../../components/AnnouncementsList';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allResidents, setAllResidents] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [showResidents, setShowResidents] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    // Fetch all data on page load
    fetchPendingUsers();
    fetchAllUsers('resident');
    fetchAllUsers('vendor');
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/pending-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPendingUsers(response.data.users);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError(err.response?.data?.message || 'Failed to load pending users');
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPendingUsers(pendingUsers.filter(u => u._id !== userId));
        alert('User approved successfully!');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      alert(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/reject/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPendingUsers(pendingUsers.filter(u => u._id !== userId));
        alert('User rejected successfully!');
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert(err.response?.data?.message || 'Failed to reject user');
    }
  };

  const fetchAllUsers = async (role, toggleShow = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/users/${role}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        if (role === 'resident') {
          setAllResidents(response.data.users);
          if (toggleShow) setShowResidents(!showResidents);
        } else if (role === 'vendor') {
          setAllVendors(response.data.users);
          if (toggleShow) setShowVendors(!showVendors);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${role}s:`, err);
      alert(err.response?.data?.message || `Failed to load ${role}s`);
    }
  };


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
              Admin Dashboard
            </h1>
            <p className="text-lg opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome back, {user?.name || 'Admin'}! Manage your housing society.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Residents Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Residents</p>
                  <div className="text-3xl font-bold text-ng-blue">
                    {allResidents.filter(r => r.status === 'approved').length}
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-green-600">↑ All approved residents</p>
            </div>

            {/* Pending Approvals Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pending Approvals</p>
                  <div className="text-3xl font-bold text-orange-600">{pendingUsers.length}</div>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button className="text-sm text-orange-600 hover:underline">Review now →</button>
            </div>

            {/* Active Complaints Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Complaints</p>
                  <div className="text-3xl font-bold text-red-600">0</div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <button 
                onClick={() => navigate('/complaints')}
                className="text-sm text-red-600 hover:underline"
              >
                View details →
              </button>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Monthly Revenue</p>
                  <div className="text-3xl font-bold text-green-600">$0</div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500">Current month</p>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-normal text-ng-blue"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  User Management
                </h2>
                <svg className="w-6 h-6 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              
              <div className="space-y-4">
                <div className="w-full px-4 py-3 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-ng-blue font-medium">Pending Registrations ({pendingUsers.length})</span>
                  </div>
                  
                  {loading ? (
                    <p className="text-gray-600 text-sm">Loading...</p>
                  ) : error ? (
                    <p className="text-red-600 text-sm">{error}</p>
                  ) : pendingUsers.length === 0 ? (
                    <p className="text-gray-600 text-sm">No pending registrations</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pendingUsers.map((pendingUser) => (
                        <div key={pendingUser._id} className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{pendingUser.name}</p>
                              <p className="text-sm text-gray-600">{pendingUser.email}</p>
                              <p className="text-sm text-gray-600">{pendingUser.phone}</p>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {pendingUser.role}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleApprove(pendingUser._id)}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(pendingUser._id)}
                              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="w-full rounded-lg bg-gray-50">
                  <button 
                    onClick={() => fetchAllUsers('resident', true)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center justify-between rounded-lg"
                  >
                    <span className="text-gray-700 font-medium">All Residents ({allResidents.length})</span>
                    <svg 
                      className={`w-5 h-5 text-gray-700 transition-transform ${showResidents ? 'rotate-90' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {showResidents && (
                    <div className="px-4 pb-4 space-y-2 max-h-80 overflow-y-auto">
                      {allResidents.length === 0 ? (
                        <p className="text-gray-600 text-sm py-2">No residents found</p>
                      ) : (
                        allResidents.map((resident) => (
                          <div key={resident._id} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{resident.name}</p>
                                <p className="text-sm text-gray-600">{resident.email}</p>
                                <p className="text-sm text-gray-600">{resident.phone || 'No phone'}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                resident.status === 'approved' ? 'bg-green-100 text-green-800' :
                                resident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {resident.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                <div className="w-full rounded-lg bg-gray-50">
                  <button 
                    onClick={() => fetchAllUsers('vendor', true)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center justify-between rounded-lg"
                  >
                    <span className="text-gray-700 font-medium">All Vendors ({allVendors.length})</span>
                    <svg 
                      className={`w-5 h-5 text-gray-700 transition-transform ${showVendors ? 'rotate-90' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {showVendors && (
                    <div className="px-4 pb-4 space-y-2 max-h-80 overflow-y-auto">
                      {allVendors.length === 0 ? (
                        <p className="text-gray-600 text-sm py-2">No vendors found</p>
                      ) : (
                        allVendors.map((vendor) => (
                          <div key={vendor._id} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{vendor.name}</p>
                                <p className="text-sm text-gray-600">{vendor.email}</p>
                                <p className="text-sm text-gray-600">{vendor.phone || 'No phone'}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                vendor.status === 'approved' ? 'bg-green-100 text-green-800' :
                                vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {vendor.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Announcements Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-normal text-ng-blue"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Announcements
                </h2>
                <svg className="w-6 h-6 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => navigate('/announcements')}
                  className="bg-ng-blue text-white px-4 py-2 rounded-lg hover:bg-ng-accent transition-colors"
                >
                  Manage Announcements
                </button>
                <button 
                  onClick={() => navigate('/announcements')}
                  className="text-ng-blue hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <AnnouncementsList limit={5} />
              </div>
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
                onClick={() => navigate('/complaints')}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-blue-50 transition-all text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Manage Complaints</p>
              </button>

              <button 
                onClick={() => navigate('/payments')}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-blue-50 transition-all text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">View Payments</p>
              </button>

              <button 
                onClick={() => navigate('/facility')}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-blue-50 transition-all text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Facility Bookings</p>
              </button>

              <button className="p-4 rounded-lg border-2 border-gray-200 hover:border-ng-blue hover:bg-blue-50 transition-all text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">View Reports</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
