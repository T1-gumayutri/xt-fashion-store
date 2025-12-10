const mongoose = require('mongoose');
const { Schema } = mongoose;

const PromotionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    
    description: {
      type: String,
      trim: true
    },

    type: {
      type: String,
      required: true,
      enum: ['percent', 'fixed', 'shipping'], 
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: 0,
      min: 0
    },

    maxUses: {
      type: Number,
      default: null,
      min: 0,
    },

    maxUsesPerUser: {
      type: Number,
      default: 1,
      min: 0,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' },
  }
);

PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

PromotionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model('Promotion', PromotionSchema);