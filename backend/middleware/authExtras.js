const User = require('../models/User');

exports.adminOnly = async (req, res, next) => {
  const me = await User.findById(req.user.id);
  if (!me || me.role !== 'admin') return res.status(403).json({ msg: 'Yêu cầu quyền admin' });
  next();
};
