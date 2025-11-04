const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'bot', 'admin'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatLogSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    messages: {
      type: [MessageSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    isResolved: {
      type: Boolean,
      default: false,
    },

    needsHumanSupport: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

ChatLogSchema.index({ userId: 1, createdAt: -1 });
ChatLogSchema.index({ isResolved: 1, needsHumanSupport: 1 });

ChatLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model('ChatLog', ChatLogSchema);
