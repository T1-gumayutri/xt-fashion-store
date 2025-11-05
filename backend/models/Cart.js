const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema con: từng item trong giỏ hàng
const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
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
  { _id: true }
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

CartSchema.virtual('totalItems').get(function () {
  return this.items.length;
});

CartSchema.virtual('totalQuantity').get(function () {
  return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

// 🔹 Cấu hình JSON output
CartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model('Cart', CartSchema);
