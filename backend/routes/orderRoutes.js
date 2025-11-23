const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// USER ROUTES
// POST /api/orders
router.post('/', authMiddleware, orderController.createOrder);

// GET /api/orders/my-orders
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

// GET /api/orders/:id
router.get('/:id', authMiddleware, orderController.getOrderById);

// ADMIN
// GET /api/orders
router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders);

// PUT /api/orders/:id/status
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;