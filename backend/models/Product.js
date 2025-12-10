const mongoose = require('mongoose');
const slugify = require('slugify');
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

    subCategory: {
      type: String,
      index: true
    },

    slug: {
      type: String,
      unique: true,
      index: true
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    fullDescription: 
    {
      type: String
    },

    img: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: null }
      }
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    variants: [
      {
        size: { type: String, required: true },
        color: { type: String, required: true },
        colorHex: { type: String},
        quantity: { type: Number, required: true, default: 0 },
        images: { type: String },
      }
    ],

    inventory: {
      type: Number,
      default: 0,
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

    isHidden: {
        type: Boolean,
        default: false
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' },
  }
);

ProductSchema.index({ productName: 'text', description: 'text' });

ProductSchema.pre('save', function(next) {
  if (this.isModified('productName')) {
    this.slug = slugify(this.productName, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
  }
  next();
});

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model('Product', ProductSchema);
