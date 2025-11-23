const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ msg: 'Token không hợp lệ hoặc User không tồn tại' });
      }
      
      if (req.user.isBlocked) {
         return res.status(403).json({ msg: 'Tài khoản đã bị khóa' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: 'Token không hợp lệ' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Không có token, từ chối truy cập' });
  }
};

// Middleware kiểm tra quyền Admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Yêu cầu quyền Admin' });
  }
};

module.exports = { authMiddleware, adminMiddleware };