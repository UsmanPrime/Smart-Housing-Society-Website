import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: [true, 'Facility is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  purpose: {
    type: String,
    trim: true
  },
  attendees: {
    type: Number,
    min: [1, 'Attendees must be at least 1']
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
bookingSchema.index({ facilityId: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ startTime: 1 });
bookingSchema.index({ status: 1 });

// Compound index for conflict checking
bookingSchema.index({ facilityId: 1, startTime: 1, endTime: 1 });

// Virtual field for duration in minutes
bookingSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  return 0;
});

// Ensure virtuals are included in JSON
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// Update the updatedAt timestamp before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that endTime is after startTime
bookingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Validate that startTime is in the future for new bookings
bookingSchema.pre('save', function(next) {
  if (this.isNew && this.startTime < new Date()) {
    next(new Error('Cannot create booking for past time'));
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
