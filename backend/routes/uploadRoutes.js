const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

//upload images --admin--
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'Vui lòng chọn file ảnh!' });
    }

    const images = req.files.map(file => ({
      public_id: file.filename,
      url: file.path
    }));

    res.json({
      msg: 'Upload thành công!',
      images: images 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Lỗi server khi upload ảnh' });
  }
});

module.exports = router;