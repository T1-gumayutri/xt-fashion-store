const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    
    rating: { 
      type: Number, 
      required: true, 
      min: 1,
      max: 5
    },
    
    comment: { type: String, required: true },

    status: {
      type: String,
      enum: ['approved', 'pending', 'hidden'],
      default: 'approved',
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);