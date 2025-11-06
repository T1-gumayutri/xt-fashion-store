// routes/categoryRoutes.js
const express = require('express');
const { auth, adminOnly } = require('../middlewares/authMiddleware');
const {
  getCategories,
  createCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// ✅ GET all categories (public)
router.get('/', getCategories);

// ✅ POST create category (admin)
router.post('/', auth, adminOnly, createCategory);

module.exports = router;
