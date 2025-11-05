const News = require('../models/News');

//GET /api/news  → Lấy tất cả tin tức
exports.getAllNews = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = q
      ? { $text: { $search: q } }
      : {};
    const news = await News.find(filter).sort('-createAt');
    res.json(news);
  } catch (err) {
    next(err);
  }
};

//GET /api/news/:id  → Lấy chi tiết tin tức
exports.getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ msg: 'Tin tức không tồn tại' });
    res.json(news);
  } catch (err) {
    next(err);
  }
};

//POST /api/news  → Thêm tin mới (admin)
exports.createNews = async (req, res, next) => {
  try {
    const { title, content, img } = req.body;
    const newNews = await News.create({ title, content, img });
    res.status(201).json(newNews);
  } catch (err) {
    next(err);
  }
};

//PUT /api/news/:id  → Cập nhật tin tức
exports.updateNews = async (req, res, next) => {
  try {
    const { title, content, img, isDefault } = req.body;
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { $set: { title, content, img, isDefault } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Tin tức không tồn tại' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

//DELETE /api/news/:id --> Xoá tin tức
exports.deleteNews = async (req, res, next) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Tin tức không tồn tại' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
