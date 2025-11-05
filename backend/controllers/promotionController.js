const Promotion = require('../models/Promotion');
const Order = require('../models/Order');

// GET /api/promotions
exports.getAll = async (req, res, next) => {
  try {
    const list = await Promotion.find().sort('-createAt');
    res.json(list);
  } catch (err) { next(err); }
};

// POST /api/promotions (admin)
exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.code) body.code = body.code.toUpperCase().trim();
    const created = await Promotion.create(body);
    res.status(201).json(created);
  } catch (err) { next(err); }
};

// POST /api/promotions/validate  { code, orderTotal }
exports.validate = async (req, res, next) => {
  try {
    const { code, orderTotal = 0, userId } = req.body;
    const promo = await Promotion.findOne({ code: code?.toUpperCase().trim() });
    if (!promo) return res.status(404).json({ msg: 'Mã không tồn tại' });

    // kiểm tra điều kiện
    const now = new Date();
    if (!promo.isActive ||
        (promo.startDate && now < promo.startDate) ||
        (promo.endDate && now > promo.endDate)) {
      return res.status(400).json({ msg: 'Mã chưa đến hạn hoặc đã hết hạn' });
    }

    if (orderTotal < (promo.minOrderValue || 0))
      return res.status(400).json({ msg: `Đơn tối thiểu ${promo.minOrderValue} mới dùng mã` });

    if (promo.maxUses != null && promo.maxUses >= 0 && promo.usedCount >= promo.maxUses)
      return res.status(400).json({ msg: 'Mã đã đạt giới hạn số lần sử dụng' });

    if (promo.maxUsesPerUser != null && promo.maxUsesPerUser >= 0 && userId) {
      const usedByUser = await Order.countDocuments({
        userId,
        'promotion.code': promo.code
      });
      if (usedByUser >= promo.maxUsesPerUser)
        return res.status(400).json({ msg: 'Bạn đã dùng mã này đủ số lần cho phép' });
    }

    res.json(promo);
  } catch (err) { next(err); }
};
