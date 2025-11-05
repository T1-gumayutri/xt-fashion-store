// routes/cartRoutes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.get('/', auth, ctrl.getCart);
router.post('/add', auth, ctrl.addItem);
router.put('/item/:itemId', auth, ctrl.updateItemQty);
router.delete('/item/:itemId', auth, ctrl.removeItem);
router.delete('/', auth, ctrl.clearCart);

module.exports = router;