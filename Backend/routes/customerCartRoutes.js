const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');
const { protectCustomer } = require('../middleware/authMiddleware');

// 4.4 Cart
router.get('/', protectCustomer, getCart);
router.post('/', protectCustomer, addToCart);
router.patch('/:itemId', protectCustomer, updateCartItem);
router.delete('/:itemId', protectCustomer, removeFromCart);

module.exports = router;
