require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(cors()); // Allow requests from our React app
app.use(express.json()); // Allow server to read JSON data

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// --- User Model ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// --- API Endpoints ---

// 1. REGISTRATION ENDPOINT
app.post('/api/auth/register', async (req, res) => {
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
});

// 2. LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
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
});


// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));