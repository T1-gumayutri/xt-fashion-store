const express = require('express');
const { auth, adminOnly } = require('../middlewares/authMiddleware');
const {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require('../controllers/promotionController');

const router = express.Router();

// GET all promotions (public)
router.get('/', getPromotions);

// POST create (admin only)
router.post('/', auth, adminOnly, createPromotion);

// PUT update (admin only)
router.put('/:id', auth, adminOnly, updatePromotion);

// DELETE remove (admin only)
router.delete('/:id', auth, adminOnly, deletePromotion);

module.exports = router;
