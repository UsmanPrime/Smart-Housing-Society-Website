import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['plumbing', 'electrical', 'cleaning', 'maintenance', 'security', 'other'],
      message: '{VALUE} is not a valid category'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'medium'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in-progress', 'completed', 'resolved', 'closed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'open'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitted by user is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comments: [commentSchema],
  attachments: [{
    type: String,
    trim: true
  }],
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ category: 1, status: 1 });

// Virtual field: duration (time to resolve in hours)
complaintSchema.virtual('duration').get(function() {
  if (this.resolvedAt && this.createdAt) {
    const diff = this.resolvedAt - this.createdAt;
    return Math.round(diff / (1000 * 60 * 60)); // Convert ms to hours
  }
  return null;
});

// Middleware to set resolvedAt when status changes to 'resolved' or 'closed'
complaintSchema.pre('save', function(next) {
  if (this.isModified('status') && (this.status === 'resolved' || this.status === 'closed') && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// Method to add a comment
complaintSchema.methods.addComment = function(text, author, authorName) {
  this.comments.push({ text, author, authorName });
  return this.save();
};

// Static method to get complaints statistics
complaintSchema.statics.getStatsByUser = async function(userId) {
  return await this.aggregate([
    { $match: { assignedTo: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
