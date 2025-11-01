import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnnouncementForm({ initialData = null, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      // Convert to local datetime-local format if present
      const d = initialData.date || initialData.createdAt;
      if (d) {
        const iso = new Date(d).toISOString();
        setDate(iso.slice(0, 16));
      } else {
        setDate('');
      }
    } else {
      setTitle('');
      setContent('');
      setDate('');
    }
  }, [initialData]);

  if (!isAdmin) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('Please provide title and content');

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const payload = {
        title: title.trim(),
        content: content.trim(),
      };
      if (date) payload.date = new Date(date).toISOString();

      if (initialData && initialData._id) {
        await axios.put(`/api/announcements/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/announcements', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setSaving(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Save failed:', err);
      alert(err.response?.data?.message || 'Failed to save announcement');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 border space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ng-blue">{initialData ? 'Edit Announcement' : 'Create Announcement'}</h3>
        {initialData && onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-gray-600 hover:text-gray-900">Cancel edit</button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ng-blue"
          placeholder="Enter title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ng-blue"
          placeholder="Write the announcement..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date (optional)</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ng-blue"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-ng-blue text-white hover:bg-ng-accent disabled:opacity-60"
        >
          {saving ? 'Saving...' : (initialData ? 'Update' : 'Publish')}
        </button>
      </div>
    </form>
  );
}
