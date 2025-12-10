const mongoose = require('mongoose');
const { Schema } = mongoose;

const WishlistSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
}, { timestamps: true });

WishlistSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Wishlist', WishlistSchema);