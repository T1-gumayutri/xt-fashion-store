const Message = require('../models/Message');

// POST /api/messages → Gửi phản hồi / liên hệ từ người dùng
exports.createMessage = async (req, res, next) => {
  try {
    const { email, content, type } = req.body;
    if (!email || !content)
      return res.status(400).json({ msg: 'Thiếu email hoặc nội dung' });

    const msg = await Message.create({ email, content, type });
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
};

// GET /api/messages → Lấy danh sách tin nhắn (admin)
exports.getAllMessages = async (req, res, next) => {
  try {
    const list = await Message.find().sort('-createAt');
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/:id → Lấy chi tiết 1 tin nhắn
exports.getMessageById = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ msg: 'Tin nhắn không tồn tại' });
    res.json(msg);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/messages/:id → Xoá tin nhắn (admin)
exports.deleteMessage = async (req, res, next) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Tin nhắn không tồn tại' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
