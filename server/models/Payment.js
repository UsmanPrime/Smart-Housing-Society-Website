import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  dueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResidentDue',
    required: true
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required']
  },
  transactionTime: {
    type: String,
    required: [true, 'Transaction time is required']
  },
  receiptImageUrl: {
    type: String,
    required: [true, 'Receipt image is required']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  // Distribution shares captured at verification
  vendorShare: { type: Number, default: 0 },
  adminShare: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ residentId: 1 });
paymentSchema.index({ dueId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ residentId: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
