import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 py-32">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 
            className="text-4xl font-normal text-ng-blue mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Access Denied
          </h1>

          <p className="text-lg text-gray-600 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          <Link
            to="/"
            className="inline-block bg-ng-blue text-white px-8 py-3 rounded-lg hover:bg-ng-accent transition-colors font-medium"
          >
            Go to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
