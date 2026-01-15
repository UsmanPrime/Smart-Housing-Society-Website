import { useState } from 'react';

export default function TwoFactorPrompt({ onVerify, onCancel }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onVerify(code);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
        
        <p className="text-gray-600 mb-6">
          Enter the 6-digit code from your authenticator app or use a backup code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authentication Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\s/g, ''));
                setError('');
              }}
              placeholder="000000 or backup code"
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
              maxLength={10}
              autoFocus
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
          <p>Lost your device?</p>
          <p>Use one of your backup codes instead.</p>
        </div>
      </div>
    </div>
  );
}
