/**
 * File URL Helper Utilities
 * Converts database file paths to authenticated API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Extract filename from a file path
 * @param {string} path - File path (e.g., "uploads/receipts/receipt-123.jpg")
 * @returns {string} - Filename (e.g., "receipt-123.jpg")
 */
export const getFilename = (path) => {
  if (!path) return '';
  return path.split('/').pop();
};

/**
 * Convert complaint image path to authenticated URL
 * @param {string} path - Database path (e.g., "uploads/complaints/image.jpg")
 * @returns {string} - Authenticated URL (e.g., "/api/files/complaints/image.jpg")
 */
export const getComplaintImageUrl = (path) => {
  if (!path) return '';
  const filename = getFilename(path);
  return `${API_BASE_URL}/api/files/complaints/${filename}`;
};

/**
 * Convert receipt image path to authenticated URL
 * @param {string} path - Database path (e.g., "uploads/receipts/receipt.jpg")
 * @returns {string} - Authenticated URL (e.g., "/api/files/receipts/receipt.jpg")
 */
export const getReceiptImageUrl = (path) => {
  if (!path) return '';
  const filename = getFilename(path);
  return `${API_BASE_URL}/api/files/receipts/${filename}`;
};

/**
 * Get file type from path/URL
 * @param {string} url - File URL or path
 * @returns {string} - File type ('image', 'pdf', 'unknown')
 */
export const getFileType = (url) => {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(lower)) return 'image';
  if (/\.pdf$/i.test(lower)) return 'pdf';
  return 'unknown';
};

/**
 * Check if URL is an image
 * @param {string} url - File URL
 * @returns {boolean}
 */
export const isImageUrl = (url) => getFileType(url) === 'image';

/**
 * Check if URL is a PDF
 * @param {string} url - File URL
 * @returns {boolean}
 */
export const isPdfUrl = (url) => getFileType(url) === 'pdf';

/**
 * Download file from authenticated endpoint
 * @param {string} url - Authenticated file URL
 * @param {string} filename - Desired download filename
 */
export const downloadFile = async (url, filename) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'download';
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};
