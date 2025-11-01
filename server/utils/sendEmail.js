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
  });
  return cachedTransporter;
}

export async function sendEmail({ to, subject, html, bcc, cc, replyTo, from }) {
  try {
    const transporter = getTransporter();
    if (!transporter) return { skipped: true };

    const mailOptions = {
      from: from || process.env.EMAIL_USER,
      to: to || undefined,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      html,
      replyTo: replyTo || undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (err) {
    console.error('sendEmail error:', err);
    return { success: false, error: err };
  }
}

export default sendEmail;
