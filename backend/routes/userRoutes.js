const router = require('express').Router();
const { body } = require('express-validator');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const ctrl = require('../controllers/userController');
//---PROFILE---
// GET /api/users/me
router.get('/me', authMiddleware, ctrl.getMe);

// PUT /api/users/me
router.put('/me', authMiddleware, ctrl.updateMe);

// PUT /api/users/me/password
router.put(
  '/me/password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Thiếu mật khẩu hiện tại'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
  ],
  ctrl.changePassword
);

//---ADMIN---
//GET /api/users: Lấy danh sách tất cả user
router.get('/', authMiddleware, adminMiddleware, ctrl.listUsers);

//GET /api/users/:id: Lấy chi tiết user theo ID
router.get('/:id', authMiddleware, adminMiddleware, ctrl.getUserById);

//PUT /api/users/:id: Sửa user theo ID
router.put('/:id', authMiddleware, adminMiddleware, ctrl.updateUserById);

//DELETE /api/users/:id: Xóa user theo ID
router.delete('/:id', authMiddleware, adminMiddleware, ctrl.deleteUserById);

module.exports = router;