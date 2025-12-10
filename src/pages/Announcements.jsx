import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnnouncementsList from '../components/AnnouncementsList';
import AnnouncementForm from '../components/AnnouncementForm';

export default function Announcements() {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 10 });

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  // Load fonts for consistency
  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dm-serif-display'),
        import('@fontsource/poppins'),
      ]);
    };
    loadFonts();
  }, []);

  const onSaved = () => {
    setEditing(null);
    // Data will refresh when filters change
  };

  return (
    <div className="min-h-screen flex flex-col bg-ng-light">
      <Navbar />

      <main className="flex-grow pt-40 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-ng-blue to-ng-accent rounded-2xl shadow-lg p-8 text-white">
            <h1
              className="text-4xl font-normal mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Announcements
            </h1>
            <p className="opacity-90" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Stay updated with the latest notices from the society administration.
            </p>
          </div>

          {isAdmin && (
            <AnnouncementForm
              initialData={editing}
              onSuccess={onSaved}
              onCancel={() => setEditing(null)}
            />
          )}

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="border rounded-lg px-3 py-2"
                placeholder="Search title or content..."
              />
              <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className="border rounded-lg px-3 py-2"
              />
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
                className="border rounded-lg px-3 py-2"
              >
                {[5,10,20,50].map(n => <option key={n} value={n}>{n} per page</option>)}
              </select>
            </div>

            {/* List */}
            <AnnouncementsList
              onEdit={(a) => setEditing(a)}
              showActions={isAdmin}
              params={{ page, limit, search: search.trim(), from: from ? new Date(from).toISOString() : undefined, to: to ? new Date(new Date(to).setHours(23,59,59,999)).toISOString() : undefined }}
              onLoaded={({ pagination }) => {
                if (pagination) setMeta(pagination);
                else setMeta({ total: 0, page: 1, pages: 1, limit });
              }}
            />

            {/* Pagination */}
            {meta.pages > 1 && (
              <div className="flex items-center justify-between pt-2 text-sm">
                <div className="text-gray-600">Page {meta.page} of {meta.pages} • {meta.total} total</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={meta.page <= 1}
                    className="px-3 py-1 rounded-lg border disabled:opacity-50"
                  >Prev</button>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                    disabled={meta.page >= meta.pages}
                    className="px-3 py-1 rounded-lg border disabled:opacity-50"
                  >Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
