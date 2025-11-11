const Promotion = require('../models/Promotion');

// Lấy danh sách promotion
exports.getPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Thêm promotion
exports.createPromotion = async (req, res) => {
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
};

// Cập nhật promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { code, desc, type, value, qty, start, end, status } = req.body;

    const updated = await Promotion.findByIdAndUpdate(
      req.params.id,
      { code, desc, type, value, qty, start: new Date(start), end: new Date(end), status },
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
};

// Xóa promotion
exports.deletePromotion = async (req, res) => {
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
};
