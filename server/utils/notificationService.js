import { queueNotification } from './notificationQueue.js';
import Complaint from '../models/Complaint.js';
import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';

/**
 * Queue notification for complaint assignment to vendor
 * @param {String} complaintId - ID of the complaint
 * @param {String} vendorId - ID of the vendor
 */
export async function notifyComplaintAssignment(complaintId, vendorId) {
  try {
    const complaint = await Complaint.findById(complaintId)
      .populate('submittedBy', 'name email');
    const vendor = await User.findById(vendorId, 'name email');

    if (!complaint || !vendor) {
      console.error('Complaint or vendor not found for notification');
      return;
    }

    queueNotification({
      type: 'complaint_assigned',
      data: { vendor, complaint: complaint.toObject() }
    });

    console.log(`✅ Complaint assignment notification queued for ${vendor.email}`);
  } catch (error) {
    console.error('Error queuing complaint assignment notification:', error);
  }
}

/**
 * Queue notification when complaint status changes
 * @param {String} complaintId - ID of the complaint
 * @param {String} newStatus - New status of the complaint
 */
export async function notifyComplaintStatusChange(complaintId, newStatus) {
  try {
    const complaint = await Complaint.findById(complaintId)
      .populate('submittedBy', 'name email');

    if (!complaint) {
      console.error('Complaint not found for status change notification');
      return;
    }

    queueNotification({
      type: 'complaint_status_changed',
      data: {
        user: complaint.submittedBy,
        complaint: complaint.toObject(),
        newStatus
      }
    });

    console.log(`✅ Status change notification queued for ${complaint.submittedBy.email}`);
  } catch (error) {
    console.error('Error queuing status change notification:', error);
  }
}

/**
 * Queue notification when a new comment is added
 * @param {String} complaintId - ID of the complaint
 * @param {Object} comment - Comment object
 * @param {String} recipientId - ID of the user to notify
 */
export async function notifyNewComment(complaintId, comment, recipientId) {
  try {
    const complaint = await Complaint.findById(complaintId);
    const recipient = await User.findById(recipientId, 'name email');

    if (!complaint || !recipient) {
      console.error('Complaint or recipient not found for comment notification');
      return;
    }

    queueNotification({
      type: 'new_comment',
      data: {
        user: recipient,
        complaint: complaint.toObject(),
        comment
      }
    });

    console.log(`✅ New comment notification queued for ${recipient.email}`);
  } catch (error) {
    console.error('Error queuing new comment notification:', error);
  }
}

/**
 * Queue notification when booking is approved
 * @param {String} bookingId - ID of the booking
 */
export async function notifyBookingApproved(bookingId) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('facilityId', 'name');

    if (!booking) {
      console.error('Booking not found for approval notification');
      return;
    }

    queueNotification({
      type: 'booking_approved',
      data: {
        user: booking.userId,
        booking: booking.toObject(),
        facility: booking.facilityId
      }
    });

    console.log(`✅ Booking approval notification queued for ${booking.userId.email}`);
  } catch (error) {
    console.error('Error queuing booking approval notification:', error);
  }
}

/**
 * Queue notification when booking is rejected
 * @param {String} bookingId - ID of the booking
 */
export async function notifyBookingRejected(bookingId) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('facilityId', 'name');

    if (!booking) {
      console.error('Booking not found for rejection notification');
      return;
    }

    queueNotification({
      type: 'booking_rejected',
      data: {
        user: booking.userId,
        booking: booking.toObject(),
        facility: booking.facilityId
      }
    });

    console.log(`✅ Booking rejection notification queued for ${booking.userId.email}`);
  } catch (error) {
    console.error('Error queuing booking rejection notification:', error);
  }
}

/**
 * Queue booking reminder (1 hour before)
 * @param {String} bookingId - ID of the booking
 */
export async function sendBookingReminder(bookingId) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('facilityId', 'name');

    if (!booking) {
      console.error('Booking not found for reminder');
      return;
    }

    queueNotification({
      type: 'booking_reminder',
      data: {
        user: booking.userId,
        booking: booking.toObject(),
        facility: booking.facilityId
      }
    });

    console.log(`✅ Booking reminder queued for ${booking.userId.email}`);
  } catch (error) {
    console.error('Error queuing booking reminder:', error);
  }
}

/**
 * Schedule booking reminders (to be called by a cron job)
 */
export async function scheduleBookingReminders() {
  try {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const upcomingBookings = await Booking.find({
      status: 'approved',
      startTime: {
        $gte: oneHourFromNow,
        $lte: twoHoursFromNow
      }
    });

    for (const booking of upcomingBookings) {
      await sendBookingReminder(booking._id);
    }

    console.log(`✅ Scheduled ${upcomingBookings.length} booking reminders`);
  } catch (error) {
    console.error('Error scheduling booking reminders:', error);
  }
}

export default {
  notifyComplaintAssignment,
  notifyComplaintStatusChange,
  notifyNewComment,
  notifyBookingApproved,
  notifyBookingRejected,
  sendBookingReminder,
  scheduleBookingReminders,
};
