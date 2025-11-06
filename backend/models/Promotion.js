const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema(
  {
    code:   { type: String, required: true, unique: true },
    desc:   { type: String, default: '' },
    type:   { type: String, enum: ['percent', 'fixed'], required: true },
    value:  { type: Number, required: true },
    qty:    { type: Number, default: 0 },
    start:  { type: Date, required: true },
    end:    { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promotion', PromotionSchema);
