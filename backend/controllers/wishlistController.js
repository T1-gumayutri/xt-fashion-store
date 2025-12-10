const Wishlist = require('../models/Wishlist');

//GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'productName price img slug');

    if (!wishlist) {
      return res.json([]);
    }

    res.json(wishlist.products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

//POST /api/wishlist/add
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [productId] });
    } else {
      const isExist = wishlist.products.some(p => p.toString() === productId);
      if (!isExist) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();
    
    await wishlist.populate('products', 'productName price img slug');
    
    res.json(wishlist.products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};

//DELETE /api/wishlist/remove/:id
exports.removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (wishlist) {
      wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
      await wishlist.save();
      
      await wishlist.populate('products', 'productName price img slug');
      res.json(wishlist.products);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi Server' });
  }
};