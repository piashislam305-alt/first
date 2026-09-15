const cartService = require('../services/cartService');

const sendError = (res, error) => {
  res.status(error.status || 500).json({ success: false, message: error.message || 'Server error.' });
};

const getCart = async (req, res) => {
  try {
    res.json({ success: true, data: await cartService.getCart(req.customer._id) });
  } catch (error) { sendError(res, error); }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required.' });
    const data = await cartService.addItem(req.customer._id, productId, quantity);
    res.status(201).json({ success: true, message: 'Product added to cart.', data });
  } catch (error) { sendError(res, error); }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const data = await cartService.updateItem(req.customer._id, req.params.itemId, quantity);
    res.json({ success: true, message: 'Cart updated.', data });
  } catch (error) { sendError(res, error); }
};

const removeFromCart = async (req, res) => {
  try {
    const data = await cartService.removeItem(req.customer._id, req.params.itemId);
    res.json({ success: true, message: 'Product removed from cart.', data });
  } catch (error) { sendError(res, error); }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
