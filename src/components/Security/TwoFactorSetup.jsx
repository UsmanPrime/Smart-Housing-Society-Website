import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../lib/http';
import Toast from '../Toast';

export default function TwoFactorSetup({ onClose }) {
  const [step, setStep] = useState(1); // 1: Generate, 2: Verify, 3: Backup Codes
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initiate2FA = async () => {
    setLoading(true);
    try {
      const response = await http.post('/api/2fa/setup');
      
      if (response.data.success) {
        setQrCode(response.data.data.qrCode);
        setSecret(response.data.data.secret);
        setBackupCodes(response.data.data.backupCodes);
        setStep(2);
      } else {
        showToast(response.data.message || 'Failed to setup 2FA', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to setup 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await http.post('/api/2fa/verify-setup', {
        token: verificationCode
      });
      
      if (response.data.success) {
        showToast('2FA successfully enabled!', 'success');
        setStep(3);
      } else {
        showToast(response.data.message || 'Invalid verification code', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    showToast('Backup codes copied to clipboard', 'success');
  };

  const downloadBackupCodes = () => {
    const codesText = `Smart Housing Society - 2FA Backup Codes\n\n${backupCodes.join('\n')}\n\nStore these codes securely. Each code can only be used once.`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-housing-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup codes downloaded', 'success');
  };

  const finish = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Step 1: Initiate Setup */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Enable Two-Factor Authentication</h2>
            <p className="text-gray-600 mb-6">
              Two-factor authentication adds an extra layer of security to your account. 
              You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={initiate2FA}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Start Setup'}
              </button>
              
              <button
                onClick={finish}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* Step 2: Scan QR and Verify */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Scan this QR code with your authenticator app
                </p>
                <details className="text-left">
                  <summary className="cursor-pointer text-blue-600 text-sm">
                    Can't scan? Enter manually
                  </summary>
                  <div className="mt-2 p-2 bg-white rounded border">
                    <p className="text-xs font-mono break-all">{secret}</p>
                  </div>
                </details>
              </div>

              <form onSubmit={verify2FA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter the 6-digit code from your app
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify and Enable'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Save Backup Codes</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Save these backup codes in a safe place. 
                Each code can only be used once if you lose access to your authenticator app.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={downloadBackupCodes}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Download Backup Codes
              </button>
              
              <button
                onClick={copyBackupCodes}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Copy to Clipboard
              </button>
              
              <button
                onClick={finish}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                I've Saved My Codes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
