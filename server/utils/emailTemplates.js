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

export function bookingApprovedEmail(name, booking) {
  const subject = 'Booking Approved - ' + booking.facilityName;
  const startTime = new Date(booking.startTime).toLocaleString();
  const endTime = new Date(booking.endTime).toLocaleString();
  
  const html = wrapEmail('Booking Approved', `
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>Great news! Your booking has been <strong>approved</strong>.</p>
    <div style="background: #f0f0f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin-top: 0; color: #0b1a4a;">Booking Details</h3>
      <p><strong>Facility:</strong> ${booking.facilityName}</p>
      <p><strong>Start Time:</strong> ${startTime}</p>
      <p><strong>End Time:</strong> ${endTime}</p>
    </div>
    <p>Please arrive on time and follow the facility rules. We hope you enjoy your booking!</p>
    <p style="margin-top: 20px;">
      <a href="${(process.env.APP_URL || 'http://localhost:5173') + '/facility'}" style="display:inline-block; padding:12px 20px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none; font-weight: bold;">View My Bookings</a>
    </p>
  `);
  return { subject, html };
}

export function bookingRejectedEmail(name, booking) {
  const subject = 'Booking Rejected - ' + booking.facilityName;
  const startTime = new Date(booking.startTime).toLocaleString();
  const endTime = new Date(booking.endTime).toLocaleString();
  
  const html = wrapEmail('Booking Rejected', `
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>We're sorry to inform you that your booking has been <strong>rejected</strong>.</p>
    <div style="background: #f0f0f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin-top: 0; color: #0b1a4a;">Booking Details</h3>
      <p><strong>Facility:</strong> ${booking.facilityName}</p>
      <p><strong>Start Time:</strong> ${startTime}</p>
      <p><strong>End Time:</strong> ${endTime}</p>
      <p><strong>Reason:</strong> ${booking.reason || 'Not specified'}</p>
    </div>
    <p>If you have any questions or concerns, please contact the administration.</p>
    <p style="margin-top: 20px;">
      <a href="${(process.env.APP_URL || 'http://localhost:5173') + '/facility'}" style="display:inline-block; padding:12px 20px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none; font-weight: bold;">Create New Booking</a>
    </p>
  `);
  return { subject, html };
}

export function complaintAssignedEmail(vendor, complaint) {
  const subject = `New Work Assigned: ${complaint.title}`;
  const html = wrapEmail('New Work Assignment', `
    <p>Hi <strong>${vendor.name || 'there'}</strong>,</p>
    <p>A new complaint has been assigned to you. Please review the details below and take appropriate action.</p>
    <div style="background: #f0f0f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin-top: 0; color: #0b1a4a;">${complaint.title}</h3>
      <p><strong>Category:</strong> <span style="text-transform: capitalize;">${complaint.category}</span></p>
      <p><strong>Priority:</strong> <span style="text-transform: capitalize; color: ${complaint.priority === 'high' ? '#d9534f' : complaint.priority === 'medium' ? '#f0ad4e' : '#5bc0de'};">${complaint.priority}</span></p>
      <p><strong>Location:</strong> ${complaint.location || 'Not specified'}</p>
      <p><strong>Description:</strong></p>
      <p style="white-space: pre-wrap; line-height: 1.6;">${complaint.description}</p>
      <p><strong>Submitted:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
    </div>
    <p style="margin-top: 20px;">
      <a href="${(process.env.APP_URL || 'http://localhost:5173') + '/vendor-complaints'}" style="display:inline-block; padding:12px 20px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none; font-weight: bold;">View Work Assignment →</a>
    </p>
  `);
  return { subject, html };
}

export function complaintStatusChangedEmail(user, complaint, newStatus) {
  const subject = `Complaint Status Updated: ${complaint.title}`;
  const statusColors = {
    'open': '#5bc0de',
    'in-progress': '#f0ad4e',
    'resolved': '#5cb85c',
    'closed': '#777'
  };
  const statusColor = statusColors[newStatus] || '#333';
  
  const html = wrapEmail('Complaint Status Update', `
    <p>Hi <strong>${user.name || 'there'}</strong>,</p>
    <p>The status of your complaint has been updated to <strong style="color: ${statusColor}; text-transform: uppercase;">${newStatus}</strong>.</p>
    <div style="background: #f0f0f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin-top: 0; color: #0b1a4a;">${complaint.title}</h3>
      <p><strong>Category:</strong> <span style="text-transform: capitalize;">${complaint.category}</span></p>
      <p><strong>Current Status:</strong> <span style="text-transform: capitalize; color: ${statusColor};">${newStatus}</span></p>
      <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    ${newStatus === 'resolved' || newStatus === 'closed' ? '<p>Thank you for your patience. If you have any further concerns, please submit a new complaint.</p>' : '<p>Our team is working on resolving your complaint. You will receive updates as progress is made.</p>'}
    <p style="margin-top: 20px;">
      <a href="${(process.env.APP_URL || 'http://localhost:5173') + '/complaints'}" style="display:inline-block; padding:12px 20px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none; font-weight: bold;">View Complaint Details →</a>
    </p>
  `);
  return { subject, html };
}

export function newCommentEmail(user, complaint, comment) {
  const subject = `New Comment on: ${complaint.title}`;
  const html = wrapEmail('New Comment Added', `
    <p>Hi <strong>${user.name || 'there'}</strong>,</p>
    <p>A new comment has been added to your complaint:</p>
    <div style="background: #f0f0f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin-top: 0; color: #0b1a4a;">${complaint.title}</h3>
      <div style="background: #fff; padding: 12px; border-left: 3px solid #0b1a4a; margin-top: 12px;">
        <p style="margin: 0 0 8px 0;"><strong>${comment.authorName}</strong> <span style="color: #999; font-size: 12px;">${new Date(comment.createdAt).toLocaleString()}</span></p>
        <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${comment.text}</p>
      </div>
    </div>
    <p style="margin-top: 20px;">
      <a href="${(process.env.APP_URL || 'http://localhost:5173') + '/complaints'}" style="display:inline-block; padding:12px 20px; background:#0b1a4a; color:#fff; border-radius:6px; text-decoration:none; font-weight: bold;">View Full Discussion →</a>
    </p>
  `);
  return { subject, html };
}

export function bookingReminderEmail(user, booking, facility) {
  const subject = `Reminder: Your booking starts in 1 hour - ${facility.name}`;
  const startTime = new Date(booking.startTime).toLocaleString();
  
  const html = wrapEmail('Booking Reminder', `
    <p>Hi <strong>${user.name || 'there'}</strong>,</p>
    <p>This is a friendly reminder that your booking starts in <strong>1 hour</strong>!</p>
    <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f0ad4e;">
      <h3 style="margin-top: 0; color: #0b1a4a;">📅 Booking Details</h3>
      <p><strong>Facility:</strong> ${facility.name}</p>
      <p><strong>Start Time:</strong> ${startTime}</p>
      <p><strong>Duration:</strong> ${Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60))} minutes</p>
      ${booking.purpose ? `<p><strong>Purpose:</strong> ${booking.purpose}</p>` : ''}
    </div>
    <p><strong>Important Reminders:</strong></p>
    <ul style="line-height: 1.8;">
      <li>Please arrive on time</li>
      <li>Follow all facility rules and guidelines</li>
      <li>Clean up after use</li>
      <li>Report any issues to the administration</li>
    </ul>
    <p>Have a great time!</p>
  `);
  return { subject, html };
}

export default {
  registrationPendingTemplate,
  accountApprovedTemplate,
  accountRejectedTemplate,
  announcementTemplate,
  resetOtpTemplate,
  bookingApprovedEmail,
  bookingRejectedEmail,
  complaintAssignedEmail,
  complaintStatusChangedEmail,
  newCommentEmail,
  bookingReminderEmail,
};
