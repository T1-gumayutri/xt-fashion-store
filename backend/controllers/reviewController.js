const Review = require('../models/Review');
const Product = require('../models/Product');

// GET /api/products/:id/reviews
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id, status: 'approved'})
      .populate('user', 'fullname')
      .sort({ createdAt: -1 }); 
      
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// POST /api/products/:id/reviews
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ msg: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    await Review.create({
      name: req.user.fullname,
      rating: Number(rating),
      comment,
      user: req.user._id,
      product: productId,
    });

    const reviews = await Review.find({ product: productId });

    product.numReviews = reviews.length;

    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    product.rating = Math.round(product.rating * 10) / 10;

    await product.save();

    res.status(201).json({ msg: 'Đánh giá thành công' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// GET /api/products/admin/reviews  (ADMIN)
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('product', 'productName')
      .populate('user', 'fullname email')
      .sort({ createdAt: -1 });

    const data = reviews.map((r) => ({
      _id: r._id,
      productId: r.product?._id,
      productName: r.product?.productName || 'Sản phẩm đã xoá',
      customer:
        r.user?.fullname || r.user?.email || r.name || 'Khách',
      rating: r.rating,
      content: r.comment,
      status: r.status || 'approved',
      createdAt: r.createdAt,
    }));

    return res.json(data);
  } catch (err) {
    console.error('getAllReviewsAdmin error:', err);
    return res
      .status(500)
      .json({ msg: 'Lỗi server khi lấy danh sách đánh giá' });
  }
};

// DELETE /api/products/admin/reviews/:reviewId  (ADMIN)
exports.deleteReviewAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ msg: 'Không tìm thấy đánh giá' });
    }

    const productId = review.product;

    // xoá review
    await review.deleteOne();

    // cập nhật lại rating + numReviews của product
    const product = await Product.findById(productId);
    if (product) {
      const reviews = await Review.find({ product: productId });

      product.numReviews = reviews.length;

      if (reviews.length > 0) {
        const avg =
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        product.rating = Math.round(avg * 10) / 10;
      } else {
        product.rating = 0;
      }

      await product.save();
    }

    return res.json({ msg: 'Đã xoá đánh giá thành công' });
  } catch (err) {
    console.error('deleteReviewAdmin error:', err);
    return res
      .status(500)
      .json({ msg: 'Lỗi server khi xoá đánh giá' });
  }
};

// / PUT /api/products/admin/reviews/:reviewId/status (ADMIN)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ msg: 'Không tìm thấy đánh giá' });
    }

    review.status = status;
    await review.save();

    return res.json({ 
      msg: 'Cập nhật trạng thái thành công', 
      review 
    });

  } catch (err) {
    console.error('updateReviewStatus error:', err);
    return res.status(500).json({ msg: 'Lỗi server khi cập nhật trạng thái' });
  }
};