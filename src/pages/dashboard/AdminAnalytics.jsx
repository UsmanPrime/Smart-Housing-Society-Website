import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';
import useAuth from '../../hooks/useAuth';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [complaintsData, setComplaintsData] = useState(null);
  const [bookingsData, setBookingsData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = user?.token || localStorage.getItem('token');

      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      const queryString = params.toString();

      const [complaintsRes, bookingsRes, overviewRes] = await Promise.all([
        api.get(`/api/analytics/complaints${queryString ? '?' + queryString : ''}`, { token }),
        api.get(`/api/analytics/bookings${queryString ? '?' + queryString : ''}`, { token }),
        api.get('/api/analytics/overview', { token })
      ]);

      setComplaintsData(complaintsRes.data);
      setBookingsData(bookingsRes.data);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-100 py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-100 py-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            
            {/* Date Range Filter */}
            <div className="flex gap-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-4 py-2 border rounded-lg"
                placeholder="End Date"
              />
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Overview Cards */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={AlertCircle}
                label="Total Complaints"
                value={overview.totalComplaints}
                subtext={`${overview.openComplaints} open`}
                color="blue"
              />
              <StatCard
                icon={Calendar}
                label="Total Bookings"
                value={overview.totalBookings}
                subtext={`${overview.pendingBookings} pending`}
                color="green"
              />
              <StatCard
                icon={Users}
                label="Residents"
                value={overview.totalResidents}
                subtext="Active users"
                color="purple"
              />
              <StatCard
                icon={Users}
                label="Vendors"
                value={overview.totalVendors}
                subtext="Service providers"
                color="orange"
              />
            </div>
          )}

          {/* Complaints Analytics */}
          {complaintsData && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Complaints Analytics
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(complaintsData.byStatus || {}).map(([status, count]) => (
                      <div key={status}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize text-gray-700">{status}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(status)}`}
                            style={{ width: `${(count / complaintsData.totalComplaints) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(complaintsData.byCategory || {}).map(([category, count]) => (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize text-gray-700">{category}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${(count / complaintsData.totalComplaints) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vendor Performance */}
              {complaintsData.vendorPerformance && complaintsData.vendorPerformance.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h3 className="text-lg font-semibold mb-4">Vendor Performance Leaderboard</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Vendor</th>
                          <th className="text-center py-3 px-4">Total Jobs</th>
                          <th className="text-center py-3 px-4">Completed</th>
                          <th className="text-center py-3 px-4">Completion Rate</th>
                          <th className="text-center py-3 px-4">Avg Time (hrs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaintsData.vendorPerformance.map((vendor, idx) => (
                          <tr key={vendor.vendorId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{vendor.vendorName}</div>
                                <div className="text-sm text-gray-500">{vendor.vendorEmail}</div>
                              </div>
                            </td>
                            <td className="text-center py-3 px-4">{vendor.total}</td>
                            <td className="text-center py-3 px-4">{vendor.resolved}</td>
                            <td className="text-center py-3 px-4">
                              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                vendor.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                                vendor.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {vendor.completionRate}%
                              </span>
                            </td>
                            <td className="text-center py-3 px-4">{vendor.avgResolutionTime || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Average Resolution Time */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Average Resolution Time</h3>
                    <p className="text-gray-600">Time taken to resolve complaints</p>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {complaintsData.avgResolutionTime || 0}
                    <span className="text-xl ml-1">hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Analytics */}
          {bookingsData && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Bookings Analytics
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Approval Rate */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Approval Rate</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#10b981"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(bookingsData.approvalRate / 100) * 439.8} 439.8`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">
                          {bookingsData.approvalRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Peak Booking Hours */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Peak Booking Hours</h3>
                  <div className="space-y-2">
                    {bookingsData.peakHours && bookingsData.peakHours.slice(0, 5).map((hour) => (
                      <div key={hour.hour} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-16">{hour.label}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${(hour.count / Math.max(...bookingsData.peakHours.map(h => h.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{hour.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Most Booked Facilities */}
              {bookingsData.mostBooked && bookingsData.mostBooked.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h3 className="text-lg font-semibold mb-4">Most Booked Facilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookingsData.mostBooked.map((facility) => (
                      <div key={facility.facilityId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-900 mb-2">{facility.facilityName}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Total Bookings:</span>
                            <span className="font-semibold">{facility.totalBookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Approved:</span>
                            <span className="font-semibold text-green-600">{facility.approvedBookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span className="font-semibold">{facility.utilizationRate}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings by Day of Week */}
              {bookingsData.byDayOfWeek && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Bookings by Day of Week</h3>
                  <div className="space-y-3">
                    {bookingsData.byDayOfWeek.map((day) => (
                      <div key={day.day}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700">{day.day}</span>
                          <span className="font-semibold">{day.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(day.count / Math.max(...bookingsData.byDayOfWeek.map(d => d.count))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Helper Component
const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtext}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    open: 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

export default AdminAnalytics;
