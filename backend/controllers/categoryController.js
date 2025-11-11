const Category = require('../models/Category');

// Lấy danh sách category (public)
exports.getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ categoryName: 1 });
    res.json(cats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Thêm category (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { categoryName, slug } = req.body;
    const existed = await Category.findOne({ slug });
    if (existed) return res.status(400).json({ msg: 'Slug đã tồn tại' });

    const cat = new Category({ categoryName, slug });
    const saved = await cat.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
