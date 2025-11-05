const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Lấy model User đã được đăng ký trong server.js
const User = mongoose.model('User');

// Middleware: kiểm tra đã đăng nhập (có token hợp lệ)
exports.auth = async (req, res, next) => {
  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : authHeader;

  if (!token) {
    return res.status(401).json({ msg: 'Không có token, từ chối truy cập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // payload = { user: { id: ... } }
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};

// Middleware: chỉ cho phép role admin
exports.adminOnly = async (req, res, next) => {
  try {
    // req.user.id được gắn từ middleware auth
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Chỉ admin mới có quyền truy cập' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
