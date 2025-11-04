const mongoose = require('mongoose');
const { Schema } = mongoose;

const NewsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    img: {
      type: String,
      default: '',
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

NewsSchema.index({ title: 'text', content: 'text' });

NewsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model('News', NewsSchema);
