const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    img: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    inventory: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseCount: {
      type: Number,
      default: 0,
      min: 0,
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

ProductSchema.index({ productName: 'text', description: 'text' });

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model('Product', ProductSchema);
