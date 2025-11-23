const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Hàm phụ trợ: Tính tổng tiền giỏ hàng trước khi trả về
const calcTotalCart = (cart) => {
  let totalPrice = 0;
  cart.items.forEach(item => {
    if (item.productId && item.productId.price) {
      totalPrice += item.quantity * item.productId.price;
    }
  });
  const cartObj = cart.toObject();
  cartObj.totalPrice = totalPrice;
  return cartObj;
};

//GET /api/carts
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'productName price img slug');

    if (!cart) {
      return res.json({ items: [], totalQuantity: 0, totalPrice: 0 });
    }

    res.json(calcTotalCart(cart));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

//POST /api/carts/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    const qty = Number(quantity) || 1;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });

    const variant = product.variants.find(v => v.size === size && v.color === color);

    if (!variant) {
      return res.status(400).json({ msg: `Sản phẩm này không có màu ${color} size ${size}` });
    }

    if (variant.quantity < qty) {
      return res.status(400).json({ msg: `Sản phẩm tạm hết hàng hoặc không đủ số lượng` });
    }

    const price = product.price;
    const image = product.img && product.img.length > 0 ? product.img[0].url : '';
    const name = product.productName;

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ productId, size, color, quantity: qty });
    }

    await cart.save();

    await cart.populate('items.productId', 'productName price img slug');
    
    res.json(calcTotalCart(cart));

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

//PUT /api/carts/update
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    const newQty = Number(quantity);

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ msg: 'Giỏ hàng trống' });

    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (itemIndex > -1) {
      if (newQty > 0) {
        cart.items[itemIndex].quantity = newQty;
      } else {
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      
      await cart.populate('items.productId', 'productName price img slug');
      res.json(calcTotalCart(cart));
    } else {
      res.status(404).json({ msg: 'Sản phẩm không có trong giỏ' });
    }

  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

//DELETE /api/carts/remove
exports.removeCartItem = async (req, res) => {
  try {
    const { productId, size, color } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ msg: 'Giỏ hàng trống' });

    cart.items = cart.items.filter(item => 
      !(item.productId.toString() === productId && item.size === size && item.color === color)
    );

    await cart.save();
    await cart.populate('items.productId', 'productName price img slug');
    res.json(calcTotalCart(cart));

  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

//DELETE /api/carts/clear
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ items: [], totalPrice: 0, totalQuantity: 0 });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};