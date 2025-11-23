const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

//--admin--
// GET /api/categories
router.get('/', categoryController.getAllCategories);
// GET /api/categories/:id
router.get('/:id', categoryController.getCategoryById);

//--user--
// POST /api/categories
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);
// PUT /api/categories/:id
router.put('/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
// DELETE /api/categories/:id
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;