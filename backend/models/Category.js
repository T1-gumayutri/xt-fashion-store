const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  img: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

CategorySchema.index({ categoryName: 1 }, { unique: true });

CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Category', CategorySchema);
