import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },
  status: { type: String, enum: ['requested', 'approved', 'rejected', 'paid'], default: 'requested' },
  method: { type: String, enum: ['bank-transfer', 'cash', 'wallet'], default: 'bank-transfer' },
  notes: { type: String, trim: true },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminComment: { type: String, trim: true },
}, { timestamps: true });

payoutSchema.index({ vendorId: 1, status: 1, requestedAt: -1 });

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
