const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const ShippingInfoSchema = new Schema({
  recipientName: { type: String, required: true, trim: true },
  phoneNumber:   { type: String, required: true, trim: true },
  address:       { type: String, required: true, trim: true },
  ward:          { type: String, required: true, trim: true },
  district:      { type: String, required: true, trim: true },
  province:      { type: String, required: true, trim: true }
}, { _id: false });

const PromotionSchema = new Schema({
  code: { type: String, trim: true },
  discountAmount: { type: Number, default: 0 } 
}, { _id: false });

const OrderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderCode: {
    type: String,
    unique: true
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank'],
    required: true,
    default: 'cod'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
  type: String,
  enum: ['unpaid', 'paid', 'failed', 'expired', 'refunded'],
  default: 'unpaid'
},
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  
  shippingInfo: {
    type: ShippingInfoSchema,
    required: true
  },
  
  itemsPrice: { type: Number, required: true, default: 0 },
  shippingFee:{ type: Number, required: true, default: 0 },
  total:      { type: Number, required: true, min: 0 },
  promotion: {
    type: PromotionSchema,
    default: null
  }
}, { timestamps: true });

OrderSchema.index({ userId: 1, createdAt: -1 });

OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Order', OrderSchema);