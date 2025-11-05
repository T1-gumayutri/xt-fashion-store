const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.post('/', auth, ctrl.createOrder);
router.get('/mine', auth, ctrl.getMyOrders);

// (nên bảo vệ admin)
router.get('/', ctrl.getAllOrders);
router.put('/:id/status', ctrl.updateStatus);

module.exports = router;