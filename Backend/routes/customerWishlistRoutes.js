const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protectCustomer } = require('../middleware/authMiddleware');

// 4.3 Wishlist
router.get('/', protectCustomer, getWishlist);
router.post('/:productId', protectCustomer, addToWishlist);
router.delete('/:productId', protectCustomer, removeFromWishlist);

module.exports = router;
