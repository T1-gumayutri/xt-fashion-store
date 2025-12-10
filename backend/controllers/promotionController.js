const Promotion = require('../models/Promotion');
const Order = require('../models/Order');

//--Admin--
// GET /api/promotions
exports.getAll = async (req, res, next) => {
  try {
    const list = await Promotion.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
};

//--admin--
// POST /api/promotions
exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.code) body.code = body.code.toUpperCase().trim();
    
    const exists = await Promotion.findOne({ code: body.code });
    if (exists) return res.status(400).json({ msg: 'Mã giảm giá này đã tồn tại' });

    const created = await Promotion.create(body);
    res.status(201).json(created);
  } catch (err) { next(err); }
};

//--admin--
// PUT /api/promotions/:id
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    
    delete body.code; 

    const updated = await Promotion.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return res.status(404).json({ msg: 'Không tìm thấy mã giảm giá' });

    res.json(updated);
  } catch (err) { next(err); }
};
//--admin--
// DELETE /api/promotions/:id
exports.deletePromo = async (req, res, next) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Không tìm thấy mã giảm giá' });
    res.json({ msg: 'Đã xóa mã giảm giá thành công' });
  } catch (err) { next(err); }
};

//Public/User
// POST /api/promotions/check
exports.checkPromotion = async (req, res, next) => {
  try {
    const { code, cartTotal = 0, userId } = req.body;
    
    if (!code) return res.status(400).json({ msg: 'Vui lòng nhập mã' });

    const promo = await Promotion.findOne({ code: code.toUpperCase().trim() });
    if (!promo) return res.status(404).json({ msg: 'Mã không tồn tại' });

    // 1. Kiểm tra hiệu lực
    const now = new Date();
    if (!promo.isActive) return res.status(400).json({ msg: 'Mã này đang tạm khóa' });
    if (promo.startDate && now < promo.startDate) return res.status(400).json({ msg: 'Mã chưa đến đợt áp dụng' });
    if (promo.endDate && now > promo.endDate) return res.status(400).json({ msg: 'Mã đã hết hạn' });

    // 2. Kiểm tra giá trị đơn hàng
    if (cartTotal < (promo.minOrderValue || 0)) {
      return res.status(400).json({ 
        msg: `Đơn hàng phải từ ${promo.minOrderValue.toLocaleString()}đ mới được dùng mã này` 
      });
    }

    // 3. Kiểm tra số lượng tổng
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ msg: 'Mã đã hết lượt sử dụng' });
    }

    // 4. Kiểm tra giới hạn mỗi người dùng 
    if (userId && promo.maxUsesPerUser !== null) {
      const usedByUser = await Order.countDocuments({
        userId,
        'promotion.code': promo.code,
        status: { $ne: 'cancelled' }
      });
      
      if (usedByUser >= promo.maxUsesPerUser) {
        return res.status(400).json({ msg: `Bạn chỉ được dùng mã này ${promo.maxUsesPerUser} lần` });
      }
    }

    //--tinh toan so tien giam--
    let discountAmount = 0;

    if (promo.type === 'fixed') {
      discountAmount = promo.value;
    } else if (promo.type === 'percent') {
      discountAmount = (cartTotal * promo.value) / 100;
      if (promo.maxDiscount > 0 && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else if (promo.type === 'shipping') {
        discountAmount = 0; 
    }

    if (discountAmount > cartTotal) discountAmount = cartTotal;

    res.json({
      success: true,
      msg: 'Áp dụng mã thành công',
      data: {
        code: promo.code,
        discountAmount: Math.floor(discountAmount),
        description: promo.description,
        type: promo.type
      }
    });

  } catch (err) { next(err); }
};
//--user lấy list mã hoạt động ---
exports.getActivePromotions = async (req, res, next) => {
  try {
    const list = await Promotion.find({ 
        isActive: true, 
        startDate: { $lte: new Date() },
        endDate: { $gt: new Date() } 
    }).sort({ endDate: 1 });
    
    res.json(list);
  } catch (err) { next(err); }
};