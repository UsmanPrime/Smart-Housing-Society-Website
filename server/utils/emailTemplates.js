const baseStyles = `font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;`;
const headerStyles = `background-color: #0b1a4a; color: white; padding: 16px 20px; border-radius: 10px 10px 0 0;`;
const cardStyles = `background-color: white; padding: 24px; border-radius: 0 0 10px 10px;`;

function wrapEmail(title, innerHtml) {
  return `
    <div style="${baseStyles}">
      <div style="${headerStyles}">
        <h2 style="margin:0;">${title}</h2>
      </div>
      <div style="${cardStyles}">
        ${innerHtml}
      </div>
      <div style="text-align:center; margin-top: 16px; color: #666; font-size: 12px;">
        <p>Smart Housing Society</p>
      </div>
    </div>
  `;
}

export function registrationPendingTemplate({ name }) {
  const subject = 'Welcome to Smart Housing Society — Registration Pending Approval';
  const html = wrapEmail('Registration Received', `
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for registering with the Smart Housing Society portal. Your account is currently <strong>pending approval</strong> by the administrator.</p>
    <p>You will receive an email once your account is reviewed. If you have any questions, just reply to this email.</p>
    <p>Regards,<br/>Smart Housing Society Team</p>
  `);
  return { subject, html };
}

export function accountApprovedTemplate({ name }) {
  const subject = 'Your Smart Housing Society Account Has Been Approved';
  const html = wrapEmail('Account Approved', `
    <p>Hi ${name || 'there'},</p>
    <p>Good news! Your account has been <strong>approved</strong>. You can now sign in and access all features.</p>
    <p><a href="${process.env.APP_URL || 'http://localhost:5173'}" style="display:inline-block; padding:10px 16px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none;">Go to Portal</a></p>
    <p>Welcome aboard!</p>
  `);
  return { subject, html };
}

export function accountRejectedTemplate({ name }) {
  const subject = 'Your Smart Housing Society Account Request';
  const html = wrapEmail('Account Status Update', `
    <p>Hi ${name || 'there'},</p>
    <p>We’re sorry to inform you that your account request has been <strong>rejected</strong>. If you believe this is a mistake, please contact the administrator.</p>
    <p>Regards,<br/>Smart Housing Society Team</p>
  `);
  return { subject, html };
}

export function announcementTemplate({ title, content, date }) {
  const subject = `New Announcement: ${title}`;
  const html = wrapEmail('New Announcement', `
    <h3 style="margin-top:0; color:#0b1a4a;">${title}</h3>
    <div style="color:#666; font-size: 12px; margin-bottom:8px;">${date ? new Date(date).toLocaleString() : ''}</div>
    <div style="white-space: pre-wrap; line-height:1.6;">${(content || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    <p style="margin-top:16px;">
      <a href="${(process.env.APP_URL || 'http://localhost:5173') + '/announcements'}" style="display:inline-block; padding:10px 16px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none;">View all announcements</a>
    </p>
  `);
  return { subject, html };
}

export function resetOtpTemplate({ name, otp }) {
  const subject = 'Your Smart Housing Society Password Reset Code';
  const html = wrapEmail('Password Reset Request', `
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>We received a request to reset your password. Use the following One-Time Password (OTP) to proceed:</p>
    <div style="font-size: 28px; letter-spacing: 4px; font-weight: bold; color: #0b1a4a; margin: 16px 0; padding: 12px; background: #f0f0f0; border-radius: 8px; text-align: center;">${otp}</div>
    <p style="color: #d9534f; font-weight: bold;">⏱ This code will expire in 10 minutes.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p style="margin-top: 20px;">
      <a href="${(process.env.APP_URL || 'http://localhost:5173') + '/forgot-password'}" style="display:inline-block; padding:12px 20px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none; font-weight: bold;">Reset Password →</a>
    </p>
  `);
  return { subject, html };
}

export default {
  registrationPendingTemplate,
  accountApprovedTemplate,
  accountRejectedTemplate,
  announcementTemplate,
  resetOtpTemplate,
};
