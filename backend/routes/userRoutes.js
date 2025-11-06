// routes/userRoutes.js
const express = require('express');
const { auth, adminOnly } = require('../middlewares/authMiddleware');
const {
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// ✅ GET all users (admin)
router.get('/', auth, adminOnly, getUsers);

// ✅ PUT update user info (admin)
router.put('/:id', auth, adminOnly, updateUser);

// ✅ DELETE remove user (admin)
router.delete('/:id', auth, adminOnly, deleteUser);

module.exports = router;
