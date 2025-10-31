import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ResidentDashboard() {
  const [user, setUser] = useState(null);
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />

      <main className="flex-grow pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h1 
              className="text-4xl font-normal text-ng-blue mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Welcome, {user?.name || 'Resident'}!
            </h1>
            <p className="text-lg text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Resident Dashboard
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-ng-blue">My Profile</h3>
                <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Email: {user?.email}</p>
              <p className="text-gray-600 mb-2">Role: {user?.role}</p>
              <button className="mt-4 bg-ng-blue text-white px-4 py-2 rounded-lg hover:bg-ng-accent transition-colors w-full">
                Edit Profile
              </button>
            </div>

            {/* Complaints Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-ng-blue">My Complaints</h3>
                <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-ng-blue mb-2">0</div>
              <p className="text-gray-600 mb-4">Active complaints</p>
              <button 
                onClick={() => navigate('/complaints')}
                className="bg-ng-blue text-white px-4 py-2 rounded-lg hover:bg-ng-accent transition-colors w-full"
              >
                View Complaints
              </button>
            </div>

            {/* Payments Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-ng-blue">Payments</h3>
                <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">$0.00</div>
              <p className="text-gray-600 mb-4">Current dues</p>
              <button 
                onClick={() => navigate('/payments')}
                className="bg-ng-blue text-white px-4 py-2 rounded-lg hover:bg-ng-accent transition-colors w-full"
              >
                View Payments
              </button>
            </div>

            {/* Facility Booking Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-ng-blue">Facility Booking</h3>
                <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-ng-blue mb-2">0</div>
              <p className="text-gray-600 mb-4">Active bookings</p>
              <button 
                onClick={() => navigate('/facility')}
                className="bg-ng-blue text-white px-4 py-2 rounded-lg hover:bg-ng-accent transition-colors w-full"
              >
                Book Facility
              </button>
            </div>

            {/* Announcements Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-ng-blue">Announcements</h3>
                <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-ng-blue mb-2">0</div>
              <p className="text-gray-600 mb-4">New announcements</p>
              <button className="bg-ng-blue text-white px-4 py-2 rounded-lg hover:bg-ng-accent transition-colors w-full">
                View All
              </button>
            </div>

            {/* Contact Support Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-ng-blue">Contact Support</h3>
                <svg className="w-8 h-8 text-ng-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Need help? Get in touch with us</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-ng-blue text-white px-4 py-2 rounded-lg hover:bg-ng-accent transition-colors w-full"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 
              className="text-2xl font-normal text-ng-blue mb-6"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Recent Activity
            </h2>
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No recent activity</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
