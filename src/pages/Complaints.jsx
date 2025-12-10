import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import complainTop from '../assets/complaintTOP.webp';
import complaintHouse from '../assets/complaintHOUSE.jpg';
import ComplaintForm from '../components/complaints/ComplaintForm';
import ComplaintList from '../components/complaints/ComplaintList';
import ComplaintDetailModal from '../components/complaints/ComplaintDetailModal';
import useAuth from '../hooks/useAuth';

export default function Page() {
  const { user } = useAuth();
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const [activeTab, setActiveTab] = useState('my'); // my | all | assigned
  const location = useLocation();
  const [selected, setSelected] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const isResident = user?.role === 'resident';

  // Set initial tab based on role
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('all');
    } else if (isVendor) {
      setActiveTab('assigned');
    } else {
      setActiveTab('my');
    }
    // Apply status filter from query param by forcing tab if vendor
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam && isVendor) {
      setActiveTab('assigned');
    }
  }, [isAdmin, isVendor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const key = entry.target.dataset.section;
            setVisibleSections(prev => ({ ...prev, [key]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );
    Object.values(sectionRefs.current).forEach(section => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const setRef = (key, el) => { sectionRefs.current[key] = el };

  const handleFormSuccess = () => {
    // Data will be refreshed when tab changes or user navigates
    // ComplaintList will fetch fresh data from parent state changes
  };

  const handleComplaintUpdate = () => {
    // Data will be refreshed through component re-render
    // ComplaintList will fetch fresh data from parent state changes
  };

  // Define available tabs based on role
  const availableTabs = [];
  if (isAdmin) {
    availableTabs.push(
      { key: 'all', label: 'All Complaints' },
      { key: 'my', label: 'My Complaints' },
      { key: 'assigned', label: 'Assigned' }
    );
  } else if (isVendor) {
    availableTabs.push(
      { key: 'assigned', label: 'Assigned to Me' }
    );
  } else {
    availableTabs.push(
      { key: 'my', label: 'My Complaints' }
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <header
        ref={el => setRef('hero', el)}
        data-section="hero"
        className="relative h-[450px] md:h-[600px] lg:h-[700px] bg-center bg-cover"
        style={{ backgroundImage: `url(${complaintHouse})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-center items-center text-white pt-12 md:pt-16">
          <h1
            className={`text-3xl md:text-5xl font-semibold tracking-wide transition-all duration-1000 ${
              visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
            }`}
          >
            Complaint Management
          </h1>
          <img
            src={complainTop}
            alt="illustration"
            className={`mt-4 w-72 md:w-[28rem] transition-all duration-1000 delay-200 ${
              visibleSections.hero ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          />
        </div>
      </header>

      {/* Tabs + Content */}
      <main className="bg-[#c3c5ce] py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Tabs */}
          {availableTabs.length > 1 && (
            <div className="flex gap-2 mb-6">
              {availableTabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === t.key ? 'bg-[#07164a] text-white' : 'bg-white text-[#07164a] hover:bg-slate-100'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Two columns: form + list (hide form for vendors) */}
          <div className={`grid grid-cols-1 ${isVendor ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-10`}>
            {isResident && (
              <section>
                <h2 className="text-xl font-semibold mb-2">Submit a Complaint / Service Request</h2>
                <p className="text-sm text-gray-700 mb-6">Please fill out the form below</p>
                <ComplaintForm onSuccess={handleFormSuccess} />
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold mb-4">
                {activeTab === 'all' && 'All Complaints'}
                {activeTab === 'my' && 'My Complaints'}
                {activeTab === 'assigned' && 'Assigned Complaints'}
              </h2>
              <ComplaintList 
                tab={activeTab} 
                statusFilter={new URLSearchParams(location.search).get('status') || undefined}
                onOpen={(c) => setSelected(c)} 
              />
            </section>
          </div>
        </div>
      </main>

      <Footer />

      {selected && (
        <ComplaintDetailModal 
          complaint={selected} 
          onClose={() => setSelected(null)} 
          onUpdate={handleComplaintUpdate}
        />
      )}
    </div>
  );
}
