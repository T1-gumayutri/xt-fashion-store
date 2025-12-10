const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

// Tạo URL thanh toán VNPAY --TOKEN
router.post('/create_payment_url', authMiddleware, paymentController.createPaymentUrl);

// IPN VNPAY gọi lại -- no token
router.get('/vnpay_ipn', paymentController.vnpIpn);

// URL VNPAY redirect user về sau khi thanh toán
router.get('/vnpay_return', paymentController.vnpReturn);

module.exports = router;
