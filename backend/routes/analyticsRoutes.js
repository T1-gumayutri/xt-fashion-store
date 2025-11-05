const router = require('express').Router();
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/authExtras');
const ctrl = require('../controllers/analyticsController');

// tất cả endpoint đều yêu cầu admin
router.get('/kpis',             auth, adminOnly, ctrl.kpis);               // tổng quan
router.get('/revenue',          auth, adminOnly, ctrl.revenueByPeriod);    // doanh thu theo ngày/tháng
router.get('/top-products',     auth, adminOnly, ctrl.topProducts);        // top sp bán chạy
router.get('/top-categories',   auth, adminOnly, ctrl.topCategories);      // doanh thu theo danh mục
router.get('/low-stock',        auth, adminOnly, ctrl.lowStock);           // cảnh báo tồn kho
router.get('/promo-performance',auth, adminOnly, ctrl.promoPerformance);   // hiệu quả mã KM
router.get('/customers',        auth, adminOnly, ctrl.topCustomers);       // khách hàng chi tiêu nhiều

module.exports = router;
