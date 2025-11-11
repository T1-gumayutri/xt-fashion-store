const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true },
    email:  { type: String, required: true, unique: true },
    phone:  { type: String, required: true },
    password: { type: String, required: true },
    role:   { type: String, default: 'user' },    // 'user' | 'admin' | ...
    status: { type: String, default: 'active' },  // 'active' | 'blocked'
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
