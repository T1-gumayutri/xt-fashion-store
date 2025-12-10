const router = require('express').Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

// tất cả endpoint đều yêu cầu admin
router.get('/kpis',             authMiddleware, adminMiddleware, ctrl.kpis);               // tổng quan
router.get('/revenue',          authMiddleware, adminMiddleware, ctrl.revenueByPeriod);    // doanh thu theo ngày/tháng
router.get('/top-products',     authMiddleware, adminMiddleware, ctrl.topProducts);        // top sp bán chạy
router.get('/top-categories',   authMiddleware, adminMiddleware, ctrl.topCategories);      // doanh thu theo danh mục
router.get('/low-stock',        authMiddleware, adminMiddleware, ctrl.lowStock);           // cảnh báo tồn kho
router.get('/promo-performance',authMiddleware, adminMiddleware, ctrl.promoPerformance);   // hiệu quả mã KM
router.get('/customers',        authMiddleware, adminMiddleware, ctrl.topCustomers);       // khách hàng chi tiêu nhiều

module.exports = router;