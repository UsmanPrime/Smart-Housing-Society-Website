import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect } from 'react'

export default function Earnings() {
  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ])
    }
    loadFonts()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />
      <main className="flex-grow pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-ng-blue to-ng-accent rounded-2xl shadow-lg p-10 text-white mb-10">
            <h1 className="text-4xl font-normal" style={{ fontFamily: 'DM Serif Display, serif' }}>Vendor Earnings</h1>
            <p className="mt-2 text-lg opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>Analytics and payouts (Coming Soon)</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold text-ng-blue mb-4">Overview</h2>
            <p className="text-gray-600 mb-6">Revenue tracking, payout scheduling, and financial insights will appear here once implemented.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>Completed job monetary values</li>
              <li>Payout requests & history</li>
              <li>Earnings by category and time period</li>
              <li>Export reports (CSV / PDF)</li>
            </ul>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              This section is scaffolded and safe to navigate. Implementation pending.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
