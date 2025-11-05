const Order = require('../models/Order');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const Cart = require('../models/Cart');

// Tính tiền và xác thực tồn kho
async function computeSubtotalAndCheck(items) {
  let subtotal = 0;
  const normalized = [];

  for (const { productId, quantity } of items) {
    const product = await Product.findById(productId);
    if (!product) throw new Error(`Sản phẩm không tồn tại: ${productId}`);
    if (quantity < 1) throw new Error('Số lượng phải >= 1');
    if (quantity > product.inventory)
      throw new Error(`"${product.productName}" vượt quá tồn kho`);

    const price = product.price;
    subtotal += price * quantity;
    normalized.push({ productId, quantity, price });
  }

  return { subtotal, normalized };
}

function calcDiscountByType(promo, subtotal) {
  if (!promo) return 0;
  if (promo.type === 'percent') return Math.floor((promo.value / 100) * subtotal);
  if (promo.type === 'fixed') return Math.min(promo.value, subtotal);
  return 0;
}

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingInfo, paymentMethod = 'cod', promoCode } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ msg: 'Giỏ hàng trống' });

    // 1) Tính tiền & check tồn kho
    const { subtotal, normalized } = await computeSubtotalAndCheck(items);

    // 2) Áp khuyến mãi (nếu có)
    let promoDoc = null;
    let discount = 0;

    if (promoCode) {
      promoDoc = await Promotion.findOne({ code: promoCode.toUpperCase().trim() });
      if (!promoDoc) return res.status(400).json({ msg: 'Mã khuyến mãi không tồn tại' });

      // Kiểm tra trạng thái & thời gian
      const now = new Date();
      if (!promoDoc.isActive ||
          (promoDoc.startDate && now < promoDoc.startDate) ||
          (promoDoc.endDate && now > promoDoc.endDate)) {
        return res.status(400).json({ msg: 'Mã khuyến mãi chưa đến hạn hoặc đã hết hạn' });
      }

      // Min order value
      if (subtotal < (promoDoc.minOrderValue || 0))
        return res.status(400).json({ msg: `Đơn tối thiểu ${promoDoc.minOrderValue} mới được áp mã` });

      // Tổng số lần dùng toàn hệ thống
      if (promoDoc.maxUses != null && promoDoc.maxUses >= 0 && promoDoc.usedCount >= promoDoc.maxUses)
        return res.status(400).json({ msg: 'Mã đã đạt giới hạn số lần sử dụng' });

      // Số lần dùng theo user
      if (promoDoc.maxUsesPerUser != null && promoDoc.maxUsesPerUser >= 0) {
        const usedByUser = await Order.countDocuments({
          userId: req.user.id,
          'promotion.code': promoDoc.code
        });
        if (usedByUser >= promoDoc.maxUsesPerUser)
          return res.status(400).json({ msg: 'Bạn đã dùng mã này đủ số lần cho phép' });
      }

      // Tính discount theo type/value
      discount = calcDiscountByType(promoDoc, subtotal);
    }

    const finalTotal = Math.max(0, subtotal - discount);

    // 3) Tạo Order
    const order = await Order.create({
      userId: req.user.id,
      items: normalized,            // đã kèm price snapshot
      paymentMethod,
      status: 'pending',
      shippingInfo,
      total: finalTotal,            // theo schema của bạn: chỉ có "total"
      promotion: promoDoc
        ? { code: promoDoc.code, type: promoDoc.type, value: promoDoc.value, discount }
        : null
    });

    // 4) Trừ tồn kho & tăng purchaseCount
    for (const { productId, quantity } of normalized) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { inventory: -quantity, purchaseCount: quantity }
      });
    }

    // 5) Tăng bộ đếm dùng mã (nếu có)
    if (promoDoc) {
      promoDoc.usedCount = (promoDoc.usedCount || 0) + 1;
      await promoDoc.save();
    }

    // 6) Xoá giỏ của user (tuỳ chọn)
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/mine
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort('-createdAt')
      .populate('items.productId', 'productName price img');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders  (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate('userId', 'fullname email');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status  (admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending','processing','shipped','delivered','cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ msg: 'Trạng thái không hợp lệ' });

    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
