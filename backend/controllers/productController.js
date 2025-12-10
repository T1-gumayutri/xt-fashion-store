const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const query = { isHidden: false };

    if (req.query.keyword) {
      query.productName = { $regex: req.query.keyword, $options: 'i' };
    }

    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        query.categoryId = category._id;
      }
    }

    const count = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createAt: -1 });

    res.json({ 
      products, 
      page, 
      pages: Math.ceil(count / pageSize),
      total: count 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// GET /api/products/:id --admin--
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId');
    if (!product) return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    res.json(product);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// POST /api/products --admin--
exports.createProduct = async (req, res) => {
  try {
    const { 
      productName, 
      description, 
      fullDescription,
      subCategory,
      categoryId, 
      price, 
      img,
      variants,
      isDefault,
      isHidden 
    } = req.body;

    let inventory = 0;
    if (variants && variants.length > 0) {
        inventory = variants.reduce((acc, item) => acc + Number(item.quantity), 0);
    }

    const newProduct = new Product({
      productName,
      description,
      fullDescription,
      subCategory,
      categoryId,
      price,
      img,
      variants,
      inventory,
      isDefault: isDefault || false,
      isHidden: isHidden || false
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server khi tạo sản phẩm' });
  }
};

// PUT /api/products/:id --admin--
exports.updateProduct = async (req, res) => {
  try {
    const { 
      productName, 
      description, 
      fullDescription,
      subCategory,
      categoryId, 
      price, 
      img, 
      variants, 
      isDefault, 
      isHidden 
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });

    if (productName) product.productName = productName;
    if (description !== undefined) product.description = description;
    if (fullDescription !== undefined) product.fullDescription = fullDescription;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (categoryId) product.categoryId = categoryId;
    if (price !== undefined) product.price = price;
    if (img) product.img = img;
    
    if (isDefault !== undefined) product.isDefault = isDefault;
    if (isHidden !== undefined) product.isHidden = isHidden;

    if (variants) {
        product.variants = variants;
        product.inventory = variants.reduce((acc, item) => acc + Number(item.quantity), 0);
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

// DELETE /api/products/:id --admin--
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    
    await product.deleteOne();
    res.json({ msg: 'Đã xóa sản phẩm thành công' });

  } catch (err) {
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};