const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//REGISTER
exports.register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password } = req.body;
    
    if (!fullname || !email || !password) {
      return res.status(400).json({msg: 'Vui lòng nhập đủ thông tin'});
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Email đã tồn tại' });

    user = new User({
      fullname,
      email,
      phoneNumber,
      password,
      role: 'user',
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {id: user._id};
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({
        msg: 'Đăng ký thành công!',
        token,
        user: user.toJSON()
      });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });

    //Kiểm tra trạng thái bị block
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ msg: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });

    //PAYLOAD JWT
    const payload = { id: user._id};
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: user.toJSON()
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//GOOGLE LOGIN
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
      if (user.isBlocked) {
        return res
          .status(403)
          .json({ msg: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
      }

      const payload = { id: user._id };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.json({
        token: jwtToken,
        user: user.toJSON()
      });
    }

    //CREATE NEW NEU CHUA TON TAI
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    const newUser = new User({
      fullname: name,
      email,
      password: hashedPassword,
      phoneNumber: '',
      role: 'user',
    });

    await newUser.save();

    const payload = { id: newUser._id };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token: jwtToken,
      user: newUser.toJSON()
    });
    
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).send('Google Login Error');
  }
};

//Forget passwd--- send mail
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: 'Không tìm thấy email này trong hệ thống' });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `
      Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu.
      Vui lòng click vào link dưới đây để đặt mật khẩu mới:
      
      ${resetUrl}
      
      Link này sẽ hết hạn sau 15 phút.
      Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'XT-Fashion: Đặt lại mật khẩu',
        message,
      });

      res.status(200).json({ msg: 'Email đã được gửi! Vui lòng kiểm tra hòm thư.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ msg: 'Không thể gửi email. Vui lòng thử lại sau.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi Server');
  }
};

//Reset passwd
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ msg: 'Mật khẩu đã được đặt lại thành công! Hãy đăng nhập ngay.' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi Server');
  }
};