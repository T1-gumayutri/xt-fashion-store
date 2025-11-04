const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');

// nếu chưa có, thêm middleware adminOnly ở dưới
const { adminOnly } = require('../middleware/authExtras');

const ctrl = require('../controllers/userController');

/* ====== Auth & profile ====== */

// Đăng ký
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('fullname').optional().isLength({ min: 1 }).withMessage('Tên không hợp lệ'),
    body('phoneNumber').optional().isString(),
  ],
  ctrl.register
);

// Đăng nhập
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Thiếu mật khẩu'),
  ],
  ctrl.login
);

// Google login
router.post(
  '/google',
  [body('token').notEmpty().withMessage('Thiếu token Google')],
  ctrl.googleLogin
);

// Lấy thông tin cá nhân
router.get('/me', auth, ctrl.getMe);

// Cập nhật thông tin cá nhân
router.put('/me', auth, ctrl.updateMe);

// Đổi mật khẩu
router.put(
  '/me/password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Thiếu mật khẩu hiện tại'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
  ],
  ctrl.changePassword
);

/* ====== Admin ====== */
router.get('/', auth, adminOnly, ctrl.listUsers);
router.get('/:id', auth, adminOnly, ctrl.getUserById);
router.put('/:id', auth, adminOnly, ctrl.updateUserById);
router.delete('/:id', auth, adminOnly, ctrl.deleteUserById);

module.exports = router;
