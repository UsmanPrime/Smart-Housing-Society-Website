import Booking from '../models/Booking.js';

/**
 * Validate booking time against facility rules
 * @param {Object} facility - Facility document
 * @param {Date} startTime - Booking start time
 * @param {Date} endTime - Booking end time
 * @returns {Object} - { valid: boolean, errors: [] }
 */
function validateBookingTime(facility, startTime, endTime) {
  const errors = [];
  
  // Calculate duration in minutes
  const duration = Math.round((endTime - startTime) / (1000 * 60));
  
  // Check duration rules
  if (duration < facility.bookingRules.minDuration) {
    errors.push(`Booking duration must be at least ${facility.bookingRules.minDuration} minutes`);
  }
  
  if (duration > facility.bookingRules.maxDuration) {
    errors.push(`Booking duration cannot exceed ${facility.bookingRules.maxDuration} minutes`);
  }
  
  // Check advance booking rules
  const now = new Date();
  const hoursUntilBooking = (startTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilBooking < facility.bookingRules.minAdvanceHours) {
    errors.push(`Booking must be made at least ${facility.bookingRules.minAdvanceHours} hours in advance`);
  }
  
  const daysUntilBooking = (startTime - now) / (1000 * 60 * 60 * 24);
  
  if (daysUntilBooking > facility.bookingRules.advanceBookingDays) {
    errors.push(`Booking cannot be made more than ${facility.bookingRules.advanceBookingDays} days in advance`);
  }
  
  // Check if booking is in the past
  if (startTime < now) {
    errors.push('Cannot create booking for past time');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check for booking conflicts
 * @param {String} facilityId - Facility ID
 * @param {Date} startTime - Booking start time
 * @param {Date} endTime - Booking end time
 * @param {String} excludeBookingId - Booking ID to exclude (for updates)
 * @returns {Promise<Array>} - Array of conflicting bookings
 */
async function checkConflicts(facilityId, startTime, endTime, excludeBookingId = null) {
  const query = {
    facilityId,
    status: { $in: ['pending', 'approved'] }, // Only check active bookings
    $or: [
      // New booking starts during existing booking
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      // New booking ends during existing booking
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      // New booking completely contains existing booking
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  };
  
  // Exclude current booking for updates
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflicts = await Booking.find(query)
    .populate('userId', 'name email')
    .lean();
  
  return conflicts;
}

/**
 * Check if booking is within facility operating hours
 * @param {Object} facility - Facility document
 * @param {Date} startTime - Booking start time
 * @param {Date} endTime - Booking end time
 * @returns {Object} - { valid: boolean, error: string }
 */
function isWithinOperatingHours(facility, startTime, endTime) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Get day of week for start time
  const startDay = dayNames[startTime.getDay()];
  const endDay = dayNames[endTime.getDay()];
  
  // Check if booking spans multiple days
  if (startDay !== endDay) {
    return {
      valid: false,
      error: 'Booking cannot span multiple days'
    };
  }
  
  const operatingHours = facility.operatingHours[startDay];
  
  if (!operatingHours) {
    return {
      valid: false,
      error: `Facility is not available on ${startDay}`
    };
  }
  
  // Parse operating hours (format: "HH:MM")
  const [openHour, openMinute] = operatingHours.start.split(':').map(Number);
  const [closeHour, closeMinute] = operatingHours.end.split(':').map(Number);
  
  // Create date objects for comparison
  const openTime = new Date(startTime);
  openTime.setHours(openHour, openMinute, 0, 0);
  
  const closeTime = new Date(startTime);
  closeTime.setHours(closeHour, closeMinute, 0, 0);
  
  // Check if booking is within operating hours
  if (startTime < openTime || endTime > closeTime) {
    return {
      valid: false,
      error: `Facility operating hours on ${startDay} are ${operatingHours.start} - ${operatingHours.end}`
    };
  }
  
  // Check maintenance schedule
  if (facility.maintenanceSchedule && facility.maintenanceSchedule.length > 0) {
    for (const maintenance of facility.maintenanceSchedule) {
      if (
        (startTime >= maintenance.startDate && startTime < maintenance.endDate) ||
        (endTime > maintenance.startDate && endTime <= maintenance.endDate) ||
        (startTime <= maintenance.startDate && endTime >= maintenance.endDate)
      ) {
        return {
          valid: false,
          error: `Facility is under maintenance from ${maintenance.startDate.toLocaleDateString()} to ${maintenance.endDate.toLocaleDateString()}`
        };
      }
    }
  }
  
  return {
    valid: true,
    error: null
  };
}

/**
 * Calculate booking statistics for a user
 * @param {String} userId - User ID
 * @param {Number} period - Period in days (default 30)
 * @returns {Promise<Object>} - Booking statistics
 */
async function calculateBookingStats(userId, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  const bookings = await Booking.find({
    userId,
    createdAt: { $gte: startDate }
  });
  
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };
  
  return stats;
}

export {
  validateBookingTime,
  checkConflicts,
  isWithinOperatingHours,
  calculateBookingStats
};
