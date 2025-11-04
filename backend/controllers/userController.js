const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper: tạo JWT
const signToken = (userId) =>
  jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '5h' });

// helper: bắt lỗi validate
const ensureValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map(e => e.msg).join(', '));
    err.statusCode = 400;
    throw err;
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Email đã tồn tại' });
    }

    user = new User({ name, email, phone, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ msg: 'Đăng ký thành công!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { name: user.name, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

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
      // User exists, log them in
      const payload = { user: { id: user.id } };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
      res.json({ token: jwtToken, user: { name: user.name, email: user.email } });
    } else {
      // User doesn't exist, create a new account
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        phone: 'N/A' 
      });

      await newUser.save();

      // Log the new user in
      const payload = { user: { id: newUser.id } };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
      res.json({ token: jwtToken, user: { name: newUser.name, email: newUser.email } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id).select('-password');
    res.json(me);
  } catch (e) { next(e); }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { fullname, phoneNumber } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { fullname, phoneNumber } },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (e) { next(e); }
};

// PUT /api/users/me/password
exports.changePassword = async (req, res, next) => {
  try {
    ensureValid(req);
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ msg: 'Mật khẩu hiện tại không đúng' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: 'Đổi mật khẩu thành công' });
  } catch (e) { next(e); }
};

// ==== Admin zone ====

// GET /api/users
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (e) { next(e); }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ msg: 'User không tồn tại' });
    res.json(u);
  } catch (e) { next(e); }
};

// PUT /api/users/:id
exports.updateUserById = async (req, res, next) => {
  try {
    const { fullname, phoneNumber, role } = req.body;
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { fullname, phoneNumber, role } },
      { new: true }
    ).select('-password');
    if (!u) return res.status(404).json({ msg: 'User không tồn tại' });
    res.json(u);
  } catch (e) { next(e); }
};

// DELETE /api/users/:id
exports.deleteUserById = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
};
