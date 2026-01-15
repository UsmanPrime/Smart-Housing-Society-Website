import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Password strength validator
const passwordValidator = (password) => {
  const minLength = 8;
  const maxLength = 128;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (password.length > maxLength) {
    throw new Error('Password must be less than 128 characters');
  }
  if (!hasUpperCase) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    throw new Error('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    throw new Error('Password must contain at least one special character');
  }
  
  return true;
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['resident', 'vendor', 'admin'], default: 'resident' },
    // Two-Factor Authentication fields
    twoFAEnabled: { type: Boolean, default: false },
    twoFASecret: { type: String, select: false }, // TOTP secret (encrypted)
    backupCodes: [{ type: String, select: false }], // Hashed backup codes
    twoFAVerified: { type: Boolean, default: false }, // Whether 2FA setup was completed
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // Password reset (OTP) fields
    resetOtpHash: { type: String },
    resetOtpExpires: { type: Date },
    // Security fields
    passwordChangedAt: { type: Date },
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
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

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Pre-save middleware for password validation and hashing
userSchema.pre('save', async function(next) {
  // Only validate and hash if password is being modified
  if (this.isModified('passwordHash')) {
    try {
      // If it's a new password (not already hashed), validate and hash it
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (!this.passwordHash.startsWith('$2')) {
        // Validate password strength
        passwordValidator(this.passwordHash);
        
        // Hash password with 12 rounds (stronger than default 10)
        this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
        
        // Update password changed timestamp
        this.passwordChangedAt = Date.now();
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to increment login attempts and lock account
userSchema.methods.incLoginAttempts = function() {
  // If lock has expired, restart
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

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
