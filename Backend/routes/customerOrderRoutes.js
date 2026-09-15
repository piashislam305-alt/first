const express = require('express');
const router = express.Router();
const { checkout, listOrders, getOrder, trackOrder } = require('../controllers/orderController');
const { protectCustomer } = require('../middleware/authMiddleware');

// 4.5 Checkout & Orders
router.post('/checkout', protectCustomer, checkout);
router.get('/orders', protectCustomer, listOrders);
router.get('/orders/:id', protectCustomer, (req, res, next) => {
  req.params.orderId = req.params.id;
  return getOrder(req, res, next);
});
router.get('/orders/:id/track', protectCustomer, (req, res, next) => {
  req.params.orderId = req.params.id;
  return trackOrder(req, res, next);
});

module.exports = router;
