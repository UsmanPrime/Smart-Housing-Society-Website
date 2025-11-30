import ClamScan from 'clamscan';
import fs from 'fs';
import path from 'path';

const clam = new ClamScan({
  removeInfected: false,
  quarantineInfected: false,
  clamdscan: {
    socket: process.env.CLAMAV_SOCKET || false,
    host: process.env.CLAMAV_HOST || '127.0.0.1',
    port: process.env.CLAMAV_PORT ? parseInt(process.env.CLAMAV_PORT, 10) : 3310,
    timeout: 60000,
  },
});

export async function virusScanMiddleware(req, res, next) {
  try {
    const enabled = (process.env.ENABLE_VIRUS_SCAN || 'true').toLowerCase() === 'true';
    if (!enabled) return next();
    const files = [];
    if (req.file) files.push(req.file);
    if (Array.isArray(req.files)) files.push(...req.files);
    if (files.length === 0) return next();

    const scanner = await clam.init();
    if (!scanner) return next();

    for (const f of files) {
      const filePath = f.path || (f.destination && f.filename ? path.join(f.destination, f.filename) : null);
      if (!filePath) continue;
      const { isInfected } = await scanner.scanFile(filePath);
      if (isInfected) {
        return res.status(400).json({ success: false, message: 'Uploaded file failed virus scan.' });
      }
    }
    return next();
  } catch (err) {
    // If scanning fails, block in production; allow in dev with warning
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      return res.status(500).json({ success: false, message: 'Virus scanning error. Try again later.' });
    }
    return next();
  }
}
