const service = require('../services/wishlistService');
const error = (res, e) => res.status(e.status || 500).json({ success: false, message: e.message || 'Server error.' });

const getWishlist = async (req, res) => {
  try { res.json({ success: true, data: await service.getWishlist(req.customer._id) }); }
  catch (e) { error(res, e); }
};

const addToWishlist = async (req, res) => {
  try {
    const data = await service.addProduct(req.customer._id, req.params.productId);
    res.status(201).json({ success: true, message: 'Product added to wishlist.', data });
  } catch (e) { error(res, e); }
};

const removeFromWishlist = async (req, res) => {
  try {
    const data = await service.removeProduct(req.customer._id, req.params.productId);
    res.json({ success: true, message: 'Product removed from wishlist.', data });
  } catch (e) { error(res, e); }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
