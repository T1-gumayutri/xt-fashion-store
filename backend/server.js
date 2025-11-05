require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Kết nối MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log(err));

// --- User Model ---
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // 'user' | 'admin' | ...
    status: { type: String, default: 'active' }, // 'active' | 'blocked'
  },
  { timestamps: true }
);
const User = mongoose.model('User', UserSchema);

// --- Promotion Model ---
const PromotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // mã giảm giá
    desc: { type: String, default: '' }, // mô tả
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true }, // % hoặc số tiền
    qty: { type: Number, default: 0 }, // số lượng mã
    start: { type: Date, required: true }, // ngày bắt đầu
    end: { type: Date, required: true }, // ngày kết thúc
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true }
);

const Promotion = mongoose.model('Promotion', PromotionSchema);

// --- Category Model ---
const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true }, // VD: "Quần"
  slug: { type: String, required: true, unique: true }, // VD: "quan"
});

const Category = mongoose.model('Category', CategorySchema);

// --- Product Model ---
const InventorySchema = new mongoose.Schema({
  color: String, // "Đen"
  colorHex: String, // "#000000"
  sizes: [String], // ["29","30","31"]
});

const ProductSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // AJNR02
    name: { type: String, required: true },
    category: { type: String, required: true }, // "Quần"
    subCategory: { type: String, required: true }, // "Quần Dài"
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }, // tổng tồn kho
    status: { type: String, enum: ['active', 'out'], default: 'active' },
    images: [String], // ['/assets/...jpg', ...]
    inventory: [InventorySchema], // như bạn mô tả
    fullDescription: String, // HTML long text
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

// --- Import middleware sau khi User model đã đăng ký ---
const { auth, adminOnly } = require('./middlewares/authMiddleware');


// ================== AUTH ==================

// 1. REGISTRATION ENDPOINT
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email đã tồn tại' });
    }

    user = new User({
      name,
      email,
      phone,
      password,
      role: 'user',
      status: 'active',
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ msg: 'Đăng ký thành công!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// 2. LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ msg: 'Email hoặc mật khẩu không đúng' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// 3. GOOGLE LOGIN ENDPOINT
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // User exists, log them in
      const payload = { user: { id: user.id } };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '5h',
      });
      return res.json({
        token: jwtToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // User doesn't exist, create a new account
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        phone: 'N/A',
        role: 'user',
        status: 'active',
      });

      await newUser.save();

      const payload = { user: { id: newUser.id } };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '5h',
      });
      return res.json({
        token: jwtToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ================== USERS (ADMIN) ==================

// Lấy danh sách user cho trang Admin
app.get('/api/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Cập nhật thông tin user (tên, email, role, status)
app.put('/api/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ msg: 'User không tồn tại' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Xóa user khỏi database
app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'User không tồn tại' });
    }
    res.json({ msg: 'Đã xóa user thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ================== PROMOTIONS ==================

// Lấy danh sách mã giảm giá (admin dùng, nhưng có thể public)
app.get('/api/promotions', async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Thêm promotion (admin)
app.post('/api/promotions', auth, adminOnly, async (req, res) => {
  try {
    const { code, desc, type, value, qty, start, end, status } = req.body;

    const exists = await Promotion.findOne({ code });
    if (exists) {
      return res.status(400).json({ msg: 'Mã giảm giá đã tồn tại' });
    }

    const promo = new Promotion({
      code,
      desc,
      type,
      value,
      qty,
      start: new Date(start),
      end: new Date(end),
      status: status || 'active',
    });

    const saved = await promo.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Cập nhật promotion (admin)
app.put('/api/promotions/:id', auth, adminOnly, async (req, res) => {
  try {
    const { code, desc, type, value, qty, start, end, status } = req.body;

    const updated = await Promotion.findByIdAndUpdate(
      req.params.id,
      {
        code,
        desc,
        type,
        value,
        qty,
        start: new Date(start),
        end: new Date(end),
        status,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'Promotion không tồn tại' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Xóa promotion (admin)
app.delete('/api/promotions/:id', auth, adminOnly, async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Promotion không tồn tại' });
    }
    res.json({ msg: 'Đã xóa promotion' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ================== CATEGORIES ==================

// Lấy danh sách categories (public)
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await Category.find().sort({ categoryName: 1 });
    res.json(cats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Thêm category (admin)
app.post('/api/categories', auth, adminOnly, async (req, res) => {
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
});

// ================== PRODUCTS ==================

// Lấy danh sách sản phẩm (public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Thêm sản phẩm (admin)
app.post('/api/products', auth, adminOnly, async (req, res) => {
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
    if (existed) {
      return res.status(400).json({ msg: 'Mã sản phẩm đã tồn tại' });
    }

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
});

// Cập nhật sản phẩm (admin)
app.put('/api/products/:id', auth, adminOnly, async (req, res) => {
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

    if (!updated) {
      return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Xoá sản phẩm (admin)
app.delete('/api/products/:id', auth, adminOnly, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    }
    res.json({ msg: 'Đã xoá sản phẩm' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
