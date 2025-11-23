const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/products
router.get('/', productController.getAllProducts);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

//--admin--
// POST /api/products
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);

// PUT /api/products/:id
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;