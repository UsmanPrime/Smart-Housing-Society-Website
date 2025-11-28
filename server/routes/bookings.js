import express from 'express';
import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  validateBookingTime,
  checkConflicts,
  isWithinOperatingHours
} from '../utils/bookingValidator.js';
import { sendEmail } from '../utils/sendEmail.js';
import { bookingApprovedEmail, bookingRejectedEmail } from '../utils/emailTemplates.js';

const router = express.Router();

/**
 * POST /api/bookings
 * Create a new booking (authenticated residents and admins)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      facilityId,
      startTime,
      endTime,
      purpose,
      attendees,
      notes
    } = req.body;
    
    // Validate required fields
    if (!facilityId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Facility, start time, and end time are required' });
    }
    
    // Validate user role - Only residents can book facilities
    if (req.user.role !== 'resident') {
      return res.status(403).json({ message: 'Only residents can create facility bookings' });
    }
    
    // Convert to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if facility exists and is available
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    if (!facility.availability) {
      return res.status(400).json({ message: 'Facility is not available for booking' });
    }
    
    // Check if user role is allowed
    if (!facility.bookingRules.allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to book this facility' });
    }
    
    // Validate booking time
    const timeValidation = validateBookingTime(facility, start, end);
    if (!timeValidation.valid) {
      return res.status(400).json({
        message: 'Invalid booking time',
        errors: timeValidation.errors
      });
    }
    
    // Check operating hours
    const operatingHoursCheck = isWithinOperatingHours(facility, start, end);
    if (!operatingHoursCheck.valid) {
      return res.status(400).json({ message: operatingHoursCheck.error });
    }
    
    // Check for conflicts
    const conflicts = await checkConflicts(facilityId, start, end);
    if (conflicts.length > 0) {
      return res.status(409).json({
        message: 'Time slot conflicts with existing booking',
        conflicts: conflicts.map(c => ({
          id: c._id,
          startTime: c.startTime,
          endTime: c.endTime,
          user: c.userId?.name
        }))
      });
    }
    
    // Validate attendees against capacity
    if (attendees && facility.capacity && attendees > facility.capacity) {
      return res.status(400).json({
        message: `Attendees (${attendees}) exceed facility capacity (${facility.capacity})`
      });
    }
    
    // Create booking
    const booking = new Booking({
      facilityId,
      userId: req.user.id,
      startTime: start,
      endTime: end,
      status: 'pending',
      purpose,
      attendees,
      notes
    });
    
    await booking.save();
    
    // Populate facility and user details for response
    await booking.populate('facilityId', 'name description');
    await booking.populate('userId', 'name email');
    
    // Send notification to admins
    const admins = await User.find({ role: 'admin', status: 'approved' });
    for (const admin of admins) {
      // TODO: Implement admin notification email
      console.log(`Notify admin ${admin.email} about new booking ${booking._id}`);
    }
    
    res.status(201).json({
      message: 'Booking created successfully. Awaiting admin approval.',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

/**
 * GET /api/bookings
 * List bookings with filters
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { facilityId, userId, status, startDate, endDate, limit = 50, skip = 0 } = req.query;
    
    const filter = {};
    
    // Apply filters
    if (facilityId) filter.facilityId = facilityId;
    if (status) filter.status = status;
    
    // Role-based filtering
    if (req.user.role === 'resident') {
      // Residents can only see their own bookings
      filter.userId = req.user.id;
    } else if (req.user.role === 'vendor') {
      // Vendors shouldn't access bookings
      return res.status(403).json({ message: 'Vendors cannot access bookings' });
    } else if (userId && req.user.role === 'admin') {
      // Admins can filter by user
      filter.userId = userId;
    }
    
    // Date range filter (defensive against "undefined"/invalid values)
    const isValidDateStr = (s) => typeof s === 'string' && s.trim() !== '' && s !== 'undefined' && s !== 'null' && !isNaN(new Date(s).getTime());
    const hasStart = isValidDateStr(startDate);
    const hasEnd = isValidDateStr(endDate);
    if (hasStart || hasEnd) {
      filter.startTime = {};
      if (hasStart) filter.startTime.$gte = new Date(startDate);
      if (hasEnd) filter.startTime.$lte = new Date(endDate);
    }
    
    const bookings = await Booking.find(filter)
      .populate('facilityId', 'name description category')
      .populate('userId', 'name email')
      .populate('approvedBy', 'name')
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Booking.countDocuments(filter);
    
    res.json({
      bookings,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

/**
 * GET /api/bookings/calendar/:facilityId
 * Get calendar view data for a facility
 */
router.get('/calendar/:facilityId', authenticateToken, async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const filter = {
      facilityId,
      startTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // Residents see only approved bookings
    if (req.user.role === 'resident') {
      filter.status = 'approved';
    }
    // Admins see all statuses
    
    const bookings = await Booking.find(filter)
      .populate('userId', 'name')
      .sort({ startTime: 1 });
    
    // Format for calendar
    const calendarData = bookings.map(booking => ({
      id: booking._id,
      start: booking.startTime,
      end: booking.endTime,
      status: booking.status,
      userId: booking.userId._id,
      userName: booking.userId.name,
      purpose: booking.purpose,
      isOwn: booking.userId._id.toString() === req.user.id
    }));
    
    res.json(calendarData);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ message: 'Error fetching calendar data', error: error.message });
  }
});

/**
 * GET /api/bookings/conflicts/check
 * Check for booking conflicts
 */
router.get('/conflicts/check', authenticateToken, async (req, res) => {
  try {
    const { facilityId, startTime, endTime, excludeBookingId } = req.query;
    
    if (!facilityId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Facility ID, start time, and end time are required' });
    }
    
    const conflicts = await checkConflicts(
      facilityId,
      new Date(startTime),
      new Date(endTime),
      excludeBookingId
    );
    
    res.json({
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.map(c => ({
        id: c._id,
        startTime: c.startTime,
        endTime: c.endTime,
        user: c.userId?.name,
        status: c.status
      }))
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ message: 'Error checking conflicts', error: error.message });
  }
});

/**
 * GET /api/bookings/:id
 * Get booking details
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('facilityId')
      .populate('userId', 'name email')
      .populate('approvedBy', 'name');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check permissions
    if (req.user.role === 'resident' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own bookings' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

/**
 * PUT /api/bookings/:id
 * Update booking
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow owner to update (and only pending bookings)
    if (req.user.role === 'resident') {
      if (booking.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own bookings' });
      }
      
      if (booking.status !== 'pending') {
        return res.status(400).json({ message: 'Can only update pending bookings' });
      }
    }
    
    const { startTime, endTime, purpose, attendees, notes } = req.body;
    
    // If time is being updated, revalidate
    if (startTime || endTime) {
      const newStart = startTime ? new Date(startTime) : booking.startTime;
      const newEnd = endTime ? new Date(endTime) : booking.endTime;
      
      const facility = await Facility.findById(booking.facilityId);
      
      // Validate booking time
      const timeValidation = validateBookingTime(facility, newStart, newEnd);
      if (!timeValidation.valid) {
        return res.status(400).json({
          message: 'Invalid booking time',
          errors: timeValidation.errors
        });
      }
      
      // Check operating hours
      const operatingHoursCheck = isWithinOperatingHours(facility, newStart, newEnd);
      if (!operatingHoursCheck.valid) {
        return res.status(400).json({ message: operatingHoursCheck.error });
      }
      
      // Check for conflicts
      const conflicts = await checkConflicts(
        booking.facilityId,
        newStart,
        newEnd,
        booking._id
      );
      
      if (conflicts.length > 0) {
        return res.status(409).json({
          message: 'Time slot conflicts with existing booking',
          conflicts
        });
      }
      
      booking.startTime = newStart;
      booking.endTime = newEnd;
    }
    
    // Update other fields
    if (purpose !== undefined) booking.purpose = purpose;
    if (attendees !== undefined) booking.attendees = attendees;
    if (notes !== undefined) booking.notes = notes;
    
    await booking.save();
    await booking.populate('facilityId', 'name description');
    await booking.populate('userId', 'name email');
    
    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
});

/**
 * DELETE /api/bookings/:id
 * Cancel/delete booking
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check permissions
    if (req.user.role === 'resident' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }
    
    // Check if booking is in the past
    if (booking.startTime < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past bookings' });
    }
    
    // Residents cancel (status → cancelled), admins can delete
    if (req.user.role === 'admin') {
      await Booking.findByIdAndDelete(req.params.id);
      res.json({ message: 'Booking deleted successfully' });
    } else {
      booking.status = 'cancelled';
      await booking.save();
      res.json({ message: 'Booking cancelled successfully', booking });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

/**
 * PUT /api/bookings/:id/approve
 * Approve booking (admin only)
 */
router.put('/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('facilityId', 'name')
      .populate('userId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be approved' });
    }
    
    // Update booking status
    booking.status = 'approved';
    booking.approvedBy = req.user.id;
    booking.approvalDate = new Date();
    
    await booking.save();
    
    // Send notification to resident
    try {
      const emailContent = bookingApprovedEmail(booking.userId.name, {
        facilityName: booking.facilityId.name,
        startTime: booking.startTime,
        endTime: booking.endTime
      });
      
      await sendEmail(booking.userId.email, 'Booking Approved', emailContent);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the approval if email fails
    }
    
    res.json({
      message: 'Booking approved successfully',
      booking
    });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ message: 'Error approving booking', error: error.message });
  }
});

/**
 * PUT /api/bookings/:id/reject
 * Reject booking (admin only)
 */
router.put('/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('facilityId', 'name')
      .populate('userId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be rejected' });
    }
    
    // Update booking status
    booking.status = 'rejected';
    booking.rejectionReason = rejectionReason;
    
    await booking.save();
    
    // Send notification to resident
    try {
      const emailContent = bookingRejectedEmail(booking.userId.name, {
        facilityName: booking.facilityId.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        reason: rejectionReason
      });
      
      await sendEmail(booking.userId.email, 'Booking Rejected', emailContent);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the rejection if email fails
    }
    
    res.json({
      message: 'Booking rejected successfully',
      booking
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
});

export default router;
