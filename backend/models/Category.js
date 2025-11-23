const mongoose = require('mongoose');
const slugify = require('slugify');
const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
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

CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
  }
  next();
});

CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Category', CategorySchema);