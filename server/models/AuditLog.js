import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'CHARGE_CREATED',
      'PAYMENT_UPLOADED',
      'PAYMENT_VERIFIED',
      'PAYMENT_REJECTED',
      'USER_APPROVED',
      'USER_REJECTED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'PROFILE_UPDATED',
      'PASSWORD_RESET',
      'COMPLAINT_CREATED',
      'COMPLAINT_UPDATED',
      'BOOKING_CREATED',
      'BOOKING_APPROVED',
      'BOOKING_REJECTED'
    ]
  },
  resourceType: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: ['charge', 'payment', 'due', 'user', 'complaint', 'booking', 'facility', 'announcement']
  },
  resourceId: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
