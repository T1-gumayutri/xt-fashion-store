const express = require('express');
const router = express.Router({ mergeParams: true }); 

const { getProductReviews, createProductReview } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

router.route('/')
  .get(getProductReviews)
  .post(authMiddleware, createProductReview);

module.exports = router;