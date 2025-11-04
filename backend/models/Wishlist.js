const mongoose = require('mongoose');
const { Schema } = mongoose;

const WishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    unique: true
  },
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  isDefault: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

WishlistSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

WishlistSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Wishlist', WishlistSchema);