const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Số lượng phải >= 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Số lượng phải là số nguyên',
      },
    },
  },
  { _id: false }
);

// Schema chính: giỏ hàng
const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

CartSchema.virtual('totalLineItems').get(function () {
  return this.items.length;
});

CartSchema.virtual('totalQuantity').get(function () {
  return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

CartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model('Cart', CartSchema);
