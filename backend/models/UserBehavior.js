// models/UserBehavior.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const BehaviorItemSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['view', 'search', 'click', 'add_to_cart', 'purchase']
    },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    keyword:   { type: String, trim: true },
    meta:      { type: Schema.Types.Mixed },
    at:        { type: Date, default: Date.now }
  },
  { _id: false }
);

const UserBehaviorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    behaviors: {
      type: [BehaviorItemSchema],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0
    }
  },
  {
    timestamps: true
  }
);

UserBehaviorSchema.index({ userId: 1, createdAt: -1 });
UserBehaviorSchema.index({ sessionId: 1, createdAt: -1 });
UserBehaviorSchema.index({ 'behaviors.action': 1, createdAt: -1 });

UserBehaviorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { delete ret._id; }
});

module.exports = mongoose.model('UserBehavior', UserBehaviorSchema);
