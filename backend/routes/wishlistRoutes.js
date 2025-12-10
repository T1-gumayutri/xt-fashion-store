const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/wishlistController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', ctrl.getWishlist);
router.post('/add', ctrl.addToWishlist);
router.delete('/remove/:id', ctrl.removeFromWishlist);

module.exports = router;