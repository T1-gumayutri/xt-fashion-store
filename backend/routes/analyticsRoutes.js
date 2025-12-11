const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Dashboard Routes
router.get('/kpis', authMiddleware, adminMiddleware, analyticsController.getKpis);
router.get('/revenue', authMiddleware, adminMiddleware, analyticsController.getRevenueAnalytics);
router.get('/top-products', authMiddleware, adminMiddleware, analyticsController.getTopProducts);
router.get('/categories', authMiddleware, adminMiddleware, analyticsController.getCategoryAnalytics);
router.get('/order-status', authMiddleware, adminMiddleware, analyticsController.getOrderStatusAnalytics);
router.get('/top-customers', authMiddleware, adminMiddleware, analyticsController.getTopCustomers);
router.get('/low-stock', authMiddleware, adminMiddleware, analyticsController.getLowStock);

module.exports = router;