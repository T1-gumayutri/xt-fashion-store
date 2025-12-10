const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// PUBLIC
// POST /api/promotions/check
router.post('/check', ctrl.checkPromotion);

//GET list mã active
router.get('/active', ctrl.getActivePromotions);

//---admin--

// GET /api/promotions
router.get('/', authMiddleware, adminMiddleware, ctrl.getAll);

// POST /api/promotions
router.post('/', authMiddleware, adminMiddleware, ctrl.create);

// PUT /api/promotions/:id
router.put('/:id', authMiddleware, adminMiddleware, ctrl.update);

// DELETE /api/promotions/:id
router.delete('/:id', authMiddleware, adminMiddleware, ctrl.deletePromo);

module.exports = router;