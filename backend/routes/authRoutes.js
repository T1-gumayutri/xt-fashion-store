const express = require('express');
const {
  register,
  login,
  googleLogin,
} = require('../controllers/authController');

const router = express.Router();

// Đăng ký
router.post('/register', register);

// Đăng nhập thường
router.post('/login', login);

// Đăng nhập Google
router.post('/google', googleLogin);

module.exports = router;
