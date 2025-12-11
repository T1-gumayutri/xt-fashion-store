const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Promotion = require('../models/Promotion');

// helper tự động hủy đơn VNPAY chưa thanh toán sau 24h
async function autoCancelExpiredVnpayOrders() {
  const now = new Date();
  const expiredTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const expiredOrders = await Order.find({
    paymentMethod: 'bank',
    paymentStatus: 'unpaid',
    status: 'pending',
    createdAt: { $lt: expiredTime }
  });

  for (const order of expiredOrders) {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const variantIndex = product.variants.findIndex(
        v => v.size === item.size && v.color === item.color
      );
      if (variantIndex !== -1) {
        product.variants[variantIndex].quantity += item.quantity;
      }
      product.inventory += item.quantity;
      await product.save();
    }

    order.status = 'cancelled';
    order.paymentStatus = 'expired';
    await order.save();
  }
}

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingInfo,
      paymentMethod,
      shippingFee,
      promotionCode
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'Không có sản phẩm nào để đặt' });
    }
    
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Sản phẩm ID ${item.productId} không tồn tại` });
      }

      const variantIndex = product.variants.findIndex(
        v => v.size === item.size && v.color === item.color
      );

      if (variantIndex === -1) {
        return res.status(400).json({ msg: `Sản phẩm ${product.productName} không có size/màu này` });
      }

      const variant = product.variants[variantIndex];

      if (variant.quantity < item.quantity) {
        return res.status(400).json({ 
          msg: `Sản phẩm ${product.productName} (${item.size}/${item.color}) đã hết hàng hoặc không đủ số lượng` 
        });
      }

      product.variants[variantIndex].quantity -= item.quantity;
      product.inventory -= item.quantity;
      await product.save();

      itemsPrice += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.productName,
        image: product.img[0].url,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });
    }

    const shipFee = Number(shippingFee) || 0;
    
    let discountAmount = 0;
    let promoToUpdate = null;

    if (promotionCode) {
      const promo = await Promotion.findOne({ code: promotionCode, isActive: true });
      
      if (!promo) {
          return res.status(400).json({ msg: 'Mã khuyến mãi không tồn tại hoặc đã bị khóa' });
      }

      const now = new Date();
      if (now < promo.startDate || now > promo.endDate) {
          return res.status(400).json({ msg: 'Mã khuyến mãi chưa bắt đầu hoặc đã hết hạn' });
      }

      if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
          return res.status(400).json({ msg: 'Mã khuyến mãi đã hết lượt sử dụng' });
      }

      if (itemsPrice < promo.minOrderValue) {
          return res.status(400).json({ 
             msg: `Đơn hàng chưa đủ điều kiện (Tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}đ)` 
          });
      }

      if (promo.type === 'percent') {
          discountAmount = (itemsPrice * promo.value) / 100;
          
          if (promo.maxDiscount > 0 && discountAmount > promo.maxDiscount) {
              discountAmount = promo.maxDiscount;
          }
      } else if (promo.type === 'fixed') {
          discountAmount = promo.value;
      } else if (promo.type === 'shipping') {
          discountAmount = promo.value; 
          if (discountAmount > shipFee) {
              discountAmount = shipFee;
          }
      }

      promoToUpdate = promo;
    }

    if (discountAmount > (itemsPrice + shipFee)) {
        discountAmount = itemsPrice + shipFee;
    }

    const total = itemsPrice + shipFee - discountAmount;

    const order = new Order({
      userId: req.user._id,
      orderCode: 'ORD-' + Date.now(),
      items: orderItems,
      shippingInfo,
      paymentMethod,
      itemsPrice,
      shippingFee: shipFee,
      total,
      promotion: discountAmount > 0 ? { code: promotionCode, discountAmount } : null,
      isPaid: false,
      paymentStatus: 'unpaid',
      status: 'pending'
    });

    const createdOrder = await order.save();

    if (promoToUpdate) {
      promoToUpdate.usedCount = (promoToUpdate.usedCount || 0) + 1;
      await promoToUpdate.save();
    }

    res.status(201).json(createdOrder);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server khi tạo đơn hàng' });
  }
};

// GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    await autoCancelExpiredVnpayOrders();

    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'fullname email');

    if (!order) return res.status(404).json({ msg: 'Đơn hàng không tồn tại' });

    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: 'Không có quyền xem đơn hàng này' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};


// GET /api/orders --admin--
exports.getAllOrders = async (req, res) => {
  try {
    await autoCancelExpiredVnpayOrders();
    const orders = await Order.find({})
        .populate('userId', 'fullname')
        .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// PUT /api/orders/:id/status --admin--
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body; 
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Đơn hàng không tồn tại' });

    if (status) {
        order.status = status;
        
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            if (order.paymentMethod === 'cod' && !paymentStatus) {
                order.isPaid = true;
                order.paymentStatus = 'paid';
                order.paidAt = Date.now();
            }
        }
    }

    if (paymentStatus) {
        order.paymentStatus = paymentStatus;

        if (paymentStatus === 'paid') {
            order.isPaid = true;
            if (!order.paidAt) order.paidAt = Date.now();
        } else if (paymentStatus === 'unpaid') {
            order.isPaid = false;
            order.paidAt = null;
        } 
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("Lỗi update status:", err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};