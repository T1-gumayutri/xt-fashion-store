const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Lấy danh sách người dùng (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ msg: 'User không tồn tại' });
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'User không tồn tại' });
    res.json({ msg: 'Đã xóa user thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
