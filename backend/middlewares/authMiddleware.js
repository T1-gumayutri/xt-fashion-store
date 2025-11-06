// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Không có token, truy cập bị từ chối' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'Token không hợp lệ' });
    }

    // 🚫 THÊM CHECK BỊ KHÓA Ở ĐÂY
    if (user.status === 'blocked') {
      return res
        .status(403)
        .json({ msg: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    // Lưu user vào request để dùng ở route & adminOnly
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ msg: 'Bạn không có quyền truy cập (chỉ admin)' });
  }
  next();
};

module.exports = { auth, adminOnly };
