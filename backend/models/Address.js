const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  street: { 
    type: String, 
    required: true, 
    trim: true 
  },
  ward: { 
    type: String, 
    required: true, 
    trim: true 
  },
  district: { 
    type: String, 
    required: true, 
    trim: true 
  },
  city: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

AddressSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

AddressSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Address', AddressSchema);