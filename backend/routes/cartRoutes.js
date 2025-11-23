const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/carts
router.get('/', cartController.getCart);

// POST /api/carts/add
router.post('/add', cartController.addToCart);

// PUT /api/carts/update
router.put('/update', cartController.updateCartItem);

// DELETE /api/carts/remove
router.delete('/remove', cartController.removeCartItem);

// DELETE /api/carts/clear
router.delete('/clear', cartController.clearCart);

module.exports = router;