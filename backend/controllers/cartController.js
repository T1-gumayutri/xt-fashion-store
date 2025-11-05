// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const populateFields = [
  { path: 'items.productId', select: 'productName price inventory img' },
];

// Tạo (nếu chưa có) và trả cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [], isDefault: true });
  return cart;
};

// GET /api/carts  → lấy giỏ hàng hiện tại
exports.getCart = async (req, res, next) => {
  try {
    const cart = await (await getOrCreateCart(req.user.id))
      .populate(populateFields);
    res.json(cart);
  } catch (e) { next(e); }
};

// POST /api/carts/add  { productId, quantity }
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.isValidObjectId(productId))
      return res.status(400).json({ msg: 'productId không hợp lệ' });

    const product = await Product.findById(productId).select('inventory');
    if (!product) return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });

    if (quantity < 1) return res.status(400).json({ msg: 'Số lượng phải ≥ 1' });

    const cart = await getOrCreateCart(req.user.id);

    const idx = cart.items.findIndex(i => i.productId.toString() === productId);
    if (idx === -1) {
      // thêm mới
      if (quantity > product.inventory)
        return res.status(400).json({ msg: 'Vượt quá tồn kho' });
      cart.items.push({ productId, quantity });
    } else {
      // tăng số lượng
      const newQty = cart.items[idx].quantity + quantity;
      if (newQty > product.inventory)
        return res.status(400).json({ msg: 'Vượt quá tồn kho' });
      cart.items[idx].quantity = newQty;
    }

    await cart.save();
    await cart.populate(populateFields);
    res.status(201).json(cart);
  } catch (e) { next(e); }
};

// PUT /api/carts/item/:itemId  { quantity }
exports.updateItemQty = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ msg: 'Số lượng phải là số nguyên ≥ 1' });

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ msg: 'Item không tồn tại trong giỏ' });

    const product = await Product.findById(item.productId).select('inventory');
    if (!product) return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    if (quantity > product.inventory)
      return res.status(400).json({ msg: 'Vượt quá tồn kho' });

    item.quantity = quantity;
    await cart.save();
    await cart.populate(populateFields);
    res.json(cart);
  } catch (e) { next(e); }
};

// DELETE /api/carts/item/:itemId
exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req.user.id);

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ msg: 'Item không tồn tại trong giỏ' });

    item.deleteOne();
    await cart.save();
    await cart.populate(populateFields);
    res.json(cart);
  } catch (e) { next(e); }
};

// DELETE /api/carts  → xoá sạch giỏ
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (e) { next(e); }
};
