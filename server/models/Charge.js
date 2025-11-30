import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Charge title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  chargeMonth: {
    type: String,
    required: [true, 'Charge month is required'],
    match: [/^\d{4}-\d{2}$/, 'Charge month must be in YYYY-MM format']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for performance
chargeSchema.index({ createdBy: 1 });
chargeSchema.index({ chargeMonth: 1 });
chargeSchema.index({ status: 1 });
chargeSchema.index({ createdAt: -1 });

const Charge = mongoose.model('Charge', chargeSchema);

export default Charge;
