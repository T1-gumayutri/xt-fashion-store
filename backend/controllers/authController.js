const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ------------------- Đăng ký -------------------
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Email đã tồn tại' });

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
};

// ------------------- Đăng nhập thường -------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });

    // 🚫 Kiểm tra trạng thái bị block
    if (user.status === 'blocked')
      return res
        .status(403)
        .json({ msg: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
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
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// ------------------- Đăng nhập Google -------------------
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      if (user.status === 'blocked')
        return res
          .status(403)
          .json({ msg: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });

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
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    const newUser = new User({
      name,
      email,
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

    res.json({
      token: jwtToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
