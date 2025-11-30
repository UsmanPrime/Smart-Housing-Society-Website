import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Earnings() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [payouts, setPayouts] = useState([])
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutError, setPayoutError] = useState('')
  const [requestAmount, setRequestAmount] = useState('')
  const [requestMethod, setRequestMethod] = useState('bank-transfer')
  const [requestNotes, setRequestNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ])
    }
    loadFonts()
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => {
      fetchEarnings(false) // silent refresh
    }, 30000) // 30s polling for near real-time updates
    return () => clearInterval(interval)
  }, [])

  async function fetchAll() {
    await Promise.all([fetchEarnings(), fetchPayoutHistory()])
  }

  async function fetchEarnings(showLoader = true) {
    try {
      if (showLoader) setLoading(true)
      const res = await api.get('/api/vendors/earnings')
      setData(res.data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load earnings')
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  async function fetchPayoutHistory() {
    try {
      setPayoutLoading(true)
      const res = await api.get('/api/vendors/payouts/history')
      setPayouts(res.data)
      setPayoutError('')
    } catch (err) {
      setPayoutError(err.message || 'Failed to load payout history')
    } finally {
      setPayoutLoading(false)
    }
  }

  async function submitPayout(e) {
    e.preventDefault()
    if (!requestAmount || Number(requestAmount) <= 0) return
    try {
      setSubmitting(true)
      await api.post('/api/vendors/payouts/request', {
        amount: Number(requestAmount),
        method: requestMethod,
        notes: requestNotes || undefined
      })
      setRequestAmount('')
      setRequestNotes('')
      await fetchPayoutHistory()
    } catch (err) {
      setPayoutError(err.message || 'Failed to request payout')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />
      <main className="flex-grow pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-ng-blue to-ng-accent rounded-2xl shadow-lg p-10 text-white mb-10">
            <h1 className="text-4xl font-normal" style={{ fontFamily: 'DM Serif Display, serif' }}>Vendor Earnings</h1>
            <p className="mt-2 text-lg opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>Live earnings analytics & payout management</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 space-y-10">
            <h2 className="text-2xl font-semibold text-ng-blue mb-4">Overview</h2>
            {loading && (
              <div className="text-gray-600">Loading earnings...</div>
            )}
            {!!error && (
              <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>
            )}
            {!loading && !error && data && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard label="Total" value={formatCurrency(data.totals.total, data.currency)} />
                  <StatCard label="This Month" value={formatCurrency(data.totals.month, data.currency)} />
                  <StatCard label="This Week" value={formatCurrency(data.totals.week, data.currency)} />
                  <StatCard label="Today" value={formatCurrency(data.totals.today, data.currency)} />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => fetchEarnings()} className="px-4 py-2 bg-ng-blue text-white rounded hover:bg-blue-700 text-sm">Refresh Earnings</button>
                  <button onClick={() => fetchPayoutHistory()} className="px-4 py-2 bg-ng-accent text-white rounded hover:bg-yellow-600 text-sm">Refresh Payouts</button>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-ng-blue mb-3">By Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(data.breakdown).map(([cat, info]) => (
                      <div key={cat} className="border rounded-lg p-4">
                        <div className="font-medium capitalize">{cat}</div>
                        <div className="text-sm text-gray-600">Jobs: {info.count}</div>
                        <div className="text-lg font-semibold text-green-700">{formatCurrency(info.amount, data.currency)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-ng-blue mb-3">Timeline (12 weeks)</h3>
                  <div className="space-y-2">
                    {data.timeline.map((t, idx) => (
                      <div key={idx} className="flex justify-between border rounded-lg p-3 text-sm">
                        <span className="text-gray-700">{t.label}</span>
                        <span className="font-semibold">{formatCurrency(t.amount, data.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Payout Request Form */}
            <div>
              <h2 className="text-2xl font-semibold text-ng-blue mb-4">Request Payout</h2>
              <form onSubmit={submitPayout} className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
                  <input type="number" min="1" value={requestAmount} onChange={e => setRequestAmount(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" required />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select value={requestMethod} onChange={e => setRequestMethod(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <input type="text" value={requestNotes} onChange={e => setRequestNotes(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Account details or reference" />
                </div>
                <div className="md:col-span-4 flex items-center gap-3">
                  <button disabled={submitting} type="submit" className="px-5 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Request'}</button>
                  <span className="text-xs text-gray-500">Requests require admin approval.</span>
                </div>
              </form>
              {payoutError && <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm">{payoutError}</div>}
            </div>
            {/* Payout History */}
            <div>
              <h2 className="text-2xl font-semibold text-ng-blue mb-4">Payout History</h2>
              {payoutLoading && <div className="text-gray-600">Loading payout history...</div>}
              {!payoutLoading && payouts.length === 0 && <div className="text-sm text-gray-500">No payout requests yet.</div>}
              {!payoutLoading && payouts.length > 0 && (
                <div className="space-y-2">
                  {payouts.map(p => (
                    <div key={p._id} className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-3 text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{formatCurrency(p.amount, p.currency)}</div>
                        <div className="text-xs text-gray-500">{new Date(p.requestedAt || p.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 md:mt-0">
                        <StatusBadge status={p.status} />
                        {p.method && <span className="text-xs px-2 py-1 bg-gray-100 rounded">{p.method}</span>}
                        {p.adminComment && <span className="text-xs text-gray-600 italic">{p.adminComment}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold text-green-700">{value}</div>
    </div>
  )
}

function formatCurrency(amount, currency = 'PKR') {
  try {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency }).format(amount || 0)
  } catch {
    return `${currency} ${Number(amount || 0).toLocaleString()}`
  }
}

function StatusBadge({ status }) {
  const map = {
    requested: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800'
  }
  return <span className={`text-xs font-semibold px-2 py-1 rounded ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
}
