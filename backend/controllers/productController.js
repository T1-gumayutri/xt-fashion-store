const Product = require('../models/Product');
const Category = require('../models/Category');

// [GET] /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { keyword, categoryId, min, max, page = 1, limit = 10 } = req.query;

    const query = {};
    if (keyword) query.$text = { $search: keyword };
    if (categoryId) query.categoryId = categoryId;
    if (min || max) query.price = { ...(min && { $gte: +min }), ...(max && { $lte: +max }) };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('categoryId', 'categoryName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(+limit);

    const total = await Product.countDocuments(query);
    res.json({ total, page: +page, products });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'categoryName');
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// [POST] /api/products (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const { categoryId, productName, description, img, price, inventory, isDefault } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: 'Danh mục không tồn tại' });

    const product = await Product.create({
      categoryId,
      productName,
      description,
      img,
      price,
      inventory,
      isDefault,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/products/:id (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const { productName, description, img, price, inventory, categoryId, isDefault } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { productName, description, img, price, inventory, categoryId, isDefault } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// [DELETE] /api/products/:id (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    res.json({ msg: 'Xóa sản phẩm thành công' });
  } catch (err) {
    next(err);
  }
};
