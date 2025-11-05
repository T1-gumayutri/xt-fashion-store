const Category = require('../models/Category');

// [GET] /api/categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// [GET] /api/categories/:id
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// [POST] /api/categories (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { categoryName, description, img, isDefault } = req.body;

    const existed = await Category.findOne({ categoryName });
    if (existed) return res.status(400).json({ msg: 'Tên danh mục đã tồn tại' });

    const category = await Category.create({ categoryName, description, img, isDefault });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/categories/:id (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const { categoryName, description, img, isDefault } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: { categoryName, description, img, isDefault } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Không tìm thấy danh mục' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// [DELETE] /api/categories/:id (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Không tìm thấy danh mục' });
    res.json({ msg: 'Xóa danh mục thành công' });
  } catch (err) {
    next(err);
  }
};
