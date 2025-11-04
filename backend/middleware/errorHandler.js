module.exports = (err, req, res, next) => {
  console.error('Đã xảy ra lỗi!', err);
  res.status(500).json({ message: err.message || 'Server Error' });
};
