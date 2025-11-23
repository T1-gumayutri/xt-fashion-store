const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const ensureValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map(e => e.msg).join(', '));
    err.statusCode = 400;
    throw err;
  }
};

//---Profile---
// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    res.json(req.user); 
  } catch (e) { next(e); }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { fullname, phoneNumber, address } = req.body; 
    
    const updateFields = {};
    if (fullname) updateFields.fullname = fullname;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (address) updateFields.address = address;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    );

    res.json(updatedUser);
  } catch (e) { next(e); }
};

// PUT /api/users/me/password
exports.changePassword = async (req, res, next) => {
  try {
    ensureValid(req);
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Mật khẩu hiện tại không đúng' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Đổi mật khẩu thành công' });
  } catch (e) { next(e); }
};

//---Admin---
// GET /api/users
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { next(e); }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User không tồn tại' });
    res.json(user);
  } catch (e) { next(e); }
};

// PUT /api/users/:id (Admin cập nhật User)
exports.updateUserById = async (req, res, next) => {
  try {
    const { fullname, phoneNumber, role, isBlocked } = req.body;
    const updateFields = {};

    if (fullname) updateFields.fullname = fullname;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (role) updateFields.role = role;
    if (isBlocked !== undefined) updateFields.isBlocked = isBlocked;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ msg: 'User không tồn tại' });
    res.json(updatedUser);
  } catch (e) { next(e); }
};

// DELETE /api/users/:id
exports.deleteUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User không tồn tại' });
    
    res.json({ msg: 'Đã xóa người dùng thành công' });
  } catch (e) { next(e); }
};