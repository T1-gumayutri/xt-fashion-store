const Category = require('../models/Category');

// GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Danh mục không tồn tại' });
    }

    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Danh mục không tồn tại' });
    }
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// POST /api/categories --Admin--
exports.createCategory = async (req, res) => {
  try {
    const { name, description, img, isDefault } = req.body;

    // Kiểm tra trùng tên
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ msg: 'Tên danh mục này đã tồn tại' });
    }

    const newCategory = new Category({
      name,
      description,
      img,
      isDefault
    });

    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};


// PUT /api/categories/:id --admin--
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, img, isDefault } = req.body;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Danh mục không tồn tại' });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (img) category.img = img;
    if (isDefault !== undefined) category.isDefault = isDefault;

    await category.save();

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// DELETE /api/categories/:id --admin--
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Danh mục không tồn tại' });
    }

    await category.deleteOne();

    res.json({ msg: 'Đã xóa danh mục thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};