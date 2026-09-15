const express = require('express');
const router = express.Router();
const { listSellerOrders, getSellerOrder, updateSellerOrderStatus } = require('../controllers/sellerOrderController');
const { protectSeller } = require('../middleware/authMiddleware');

// 3.4 Seller Orders
router.get('/', protectSeller, listSellerOrders);
router.get('/:id', protectSeller, (req, res, next) => {
  req.params.orderId = req.params.id;
  return getSellerOrder(req, res, next);
});
router.patch('/:id/status', protectSeller, (req, res, next) => {
  req.params.orderId = req.params.id;
  return updateSellerOrderStatus(req, res, next);
});

module.exports = router;
