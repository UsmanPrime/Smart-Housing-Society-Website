import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnnouncementsList({ limit = 0, refreshKey = 0, onEdit, showActions = false, params = {}, onLoaded }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (limit) searchParams.set('limit', String(limit));
      Object.entries(params || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).length > 0) searchParams.set(k, String(v));
      });

      const qs = searchParams.toString();
      const url = `/api/announcements${qs ? `?${qs}` : ''}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
        setPagination(res.data.pagination || null);
        if (onLoaded) onLoaded({ pagination: res.data.pagination || null });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError(err.response?.data?.message || 'Failed to load announcements');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, refreshKey, JSON.stringify(params)]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-sm">Loading announcements...</div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  if (!announcements.length) {
    return <div className="text-gray-500 text-sm">No announcements yet</div>;
  }

  const formatDate = (d) => new Date(d).toLocaleString();

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div key={a._id} className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-ng-blue">{a.title}</h4>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(a.date || a.createdAt)}
                {a.createdBy?.name ? ` • by ${a.createdBy.name}` : ''}
              </div>
            </div>
            {isAdmin && showActions && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onEdit && onEdit(a)}
                  className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-700 mt-2 whitespace-pre-wrap">
            {a.content}
          </p>
        </div>
      ))}
      {/* Expose pagination status for parent; not rendering controls here */}
      {pagination && (
        <div className="text-xs text-gray-500">
          Page {pagination.page} of {pagination.pages} • {pagination.total} total
        </div>
      )}
    </div>
  );
}
