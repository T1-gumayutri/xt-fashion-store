const Product = require('../models/Product');

// Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Thêm sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const {
      code,
      name,
      category,
      subCategory,
      price,
      stock,
      status,
      images,
      inventory,
      fullDescription,
    } = req.body;

    const existed = await Product.findOne({ code });
    if (existed) return res.status(400).json({ msg: 'Mã sản phẩm đã tồn tại' });

    const product = new Product({
      code,
      name,
      category,
      subCategory,
      price,
      stock,
      status,
      images,
      inventory,
      fullDescription,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const {
      code,
      name,
      category,
      subCategory,
      price,
      stock,
      status,
      images,
      inventory,
      fullDescription,
    } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        code,
        name,
        category,
        subCategory,
        price,
        stock,
        status,
        images,
        inventory,
        fullDescription,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    res.json({ msg: 'Đã xóa sản phẩm thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
