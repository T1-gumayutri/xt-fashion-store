const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

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
      isPaid: paymentMethod === 'bank' ? false : false,
      status: 'pending'
    });

    const createdOrder = await order.save();

    await Cart.findOneAndDelete({ userId: req.user._id });

    res.status(201).json(createdOrder);

  } catch (err) {
    console.error(err);

    res.status(500).json({ msg: 'Lỗi Server khi tạo đơn hàng' });
  }
};

// GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Đơn hàng không tồn tại' });

    if (req.body.status) {
        order.status = req.body.status;
    }
    
    if (req.body.status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        if(order.paymentMethod === 'cod') {
            order.isPaid = true;
            order.paidAt = Date.now();
        }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};