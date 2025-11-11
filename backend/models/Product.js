const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  color:    String,
  colorHex: String,
  sizes:   [String],
});

const ProductSchema = new mongoose.Schema(
  {
    code:        { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    category:    { type: String, required: true },
    subCategory: { type: String, required: true },
    price:       { type: Number, required: true },
    stock:       { type: Number, default: 0 },
    status:      { type: String, enum: ['active', 'out'], default: 'active' },
    images:      [String],
    inventory:   [InventorySchema],
    fullDescription: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
