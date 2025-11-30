import mongoose from 'mongoose';

const residentDueSchema = new mongoose.Schema({
  chargeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charge',
    required: true
  },
  // If this due originates from a complaint workflow
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Denormalized fields for quick access
  residentName: {
    type: String,
    required: true
  },
  houseNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  adminShare: { type: Number, default: 0 },
  vendorShare: { type: Number, default: 0 },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
residentDueSchema.index({ residentId: 1 });
residentDueSchema.index({ chargeId: 1 });
residentDueSchema.index({ status: 1 });
residentDueSchema.index({ dueDate: 1 });
residentDueSchema.index({ residentId: 1, status: 1 });

// Method to check if due is overdue
residentDueSchema.methods.checkOverdue = function() {
  if (this.status === 'pending' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  return this;
};

const ResidentDue = mongoose.model('ResidentDue', residentDueSchema);

export default ResidentDue;
