const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const reviewRouter = require('./reviewRoutes');

// ADMIN - reviews
router.get('/admin/reviews', authMiddleware, adminMiddleware, reviewController.getAllReviewsAdmin);

router.delete('/admin/reviews/:reviewId', authMiddleware, adminMiddleware, reviewController.deleteReviewAdmin);

router.put('/admin/reviews/:reviewId/status', authMiddleware, adminMiddleware, reviewController.updateReviewStatus);

// GET /api/products
router.get('/', productController.getAllProducts);

//--admin--
// POST /api/products
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);

// PUT /api/products/:id
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

// GET /api/products/:id
router.get('/:id', productController.getProductById);


router.use('/:id/reviews', reviewRouter);

module.exports = router;