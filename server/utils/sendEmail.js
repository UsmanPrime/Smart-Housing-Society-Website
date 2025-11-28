import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const service = process.env.EMAIL_SERVICE || 'gmail';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set; sendEmail will be a no-op.');
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    service,
    auth: { user, pass },
    pool: true, // Use pooled connections
    maxConnections: 5,
    maxMessages: 100,
  });
  return cachedTransporter;
}

/**
 * Send email with retry logic
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.bcc - BCC recipients
 * @param {string} options.cc - CC recipients
 * @param {string} options.replyTo - Reply-to address
 * @param {string} options.from - Sender address
 * @param {number} options.retries - Number of retries (default: 3)
 * @returns {Promise<Object>} Result object
 */
export async function sendEmail({ to, subject, html, bcc, cc, replyTo, from, retries = 3 }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('📧 Email skipped (no transporter configured)');
    return { skipped: true, reason: 'No transporter configured' };
  }

  const mailOptions = {
    from: from || process.env.EMAIL_USER,
    to: to || undefined,
    cc: cc || undefined,
    bcc: bcc || undefined,
    subject,
    html,
    replyTo: replyTo || undefined,
  };

  let lastError = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, info, attempt };
    } catch (err) {
      lastError = err;
      console.error(`❌ Email send attempt ${attempt}/${retries} failed:`, err.message);
      
      // Don't retry on permanent failures
      if (err.responseCode >= 500 || attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`❌ Email failed after ${retries} attempts to ${to}`);
  return { success: false, error: lastError, attempts: retries };
}

/**
 * Send bulk emails (non-blocking)
 * @param {Array<Object>} emailList - Array of email options
 * @returns {Promise<Array>} Array of results
 */
export async function sendBulkEmails(emailList) {
  console.log(`📧 Sending ${emailList.length} bulk emails...`);
  
  const promises = emailList.map(emailOptions => 
    sendEmail(emailOptions).catch(err => ({ success: false, error: err }))
  );
  
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  console.log(`📧 Bulk email results: ${successful} sent, ${failed} failed`);
  
  return results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason });
}

export default sendEmail;
