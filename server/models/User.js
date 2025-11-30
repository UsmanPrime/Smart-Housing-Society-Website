import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['resident', 'vendor', 'admin'], default: 'resident' },
    twoFAEnabled: { type: Boolean, default: false },
    twoFASecret: { type: String, select: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // Password reset (OTP) fields
    resetOtpHash: { type: String },
    resetOtpExpires: { type: Date },
    // Vendor-specific fields
    specialization: [{ 
      type: String, 
      enum: ['plumbing', 'electrical', 'cleaning', 'maintenance', 'security', 'other']
    }],
    isAvailable: { type: Boolean, default: true },
    serviceCategory: { type: String, trim: true },
    services: [{
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      active: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }],
    ratings: [{
      residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
      stars: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now }
    }],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Recalculate rating averages when ratings array changes (manual trigger via method)
userSchema.methods.addRating = function(stars) {
  // Update running average efficiently
  this.ratingCount = (this.ratingCount || 0) + 1;
  const prevTotal = (this.ratingAverage || 0) * (this.ratingCount - 1);
  this.ratingAverage = ((prevTotal + stars) / this.ratingCount);
};

// Index already defined by unique:true in schema, no need to add manually
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
