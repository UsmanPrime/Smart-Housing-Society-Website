import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['indoor', 'outdoor', 'amenity'],
    required: [true, 'Category is required']
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  availability: {
    type: Boolean,
    default: true
  },
  bookingRules: {
    minDuration: {
      type: Number,
      default: 60, // minutes
      min: [1, 'Minimum duration must be at least 1 minute']
    },
    maxDuration: {
      type: Number,
      default: 240, // minutes
      min: [1, 'Maximum duration must be at least 1 minute']
    },
    advanceBookingDays: {
      type: Number,
      default: 30,
      min: [0, 'Advance booking days cannot be negative']
    },
    minAdvanceHours: {
      type: Number,
      default: 2,
      min: [0, 'Minimum advance hours cannot be negative']
    },
    allowedRoles: {
      type: [String],
      enum: ['resident', 'admin'],
      default: ['resident', 'admin']
    }
  },
  operatingHours: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '21:00' }
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '21:00' }
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '21:00' }
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '21:00' }
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '21:00' }
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '21:00' }
    },
    sunday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '21:00' }
    }
  },
  maintenanceSchedule: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      trim: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance (name already has unique index from schema definition)
facilitySchema.index({ availability: 1 });
facilitySchema.index({ category: 1 });

// Update the updatedAt timestamp before saving
facilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate booking rules
facilitySchema.pre('save', function(next) {
  if (this.bookingRules.minDuration > this.bookingRules.maxDuration) {
    next(new Error('Minimum duration cannot be greater than maximum duration'));
  }
  next();
});

const Facility = mongoose.model('Facility', facilitySchema);

export default Facility;
