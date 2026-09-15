const service = require('../services/sellerOrderService');
const error = (res, e) => res.status(e.status || 500).json({ success: false, message: e.message || 'Server error.' });

const listSellerOrders = async (req, res) => {
  try { res.json({ success: true, data: await service.listSellerOrders(req.seller._id, req.query) }); }
  catch (e) { error(res, e); }
};

const getSellerOrder = async (req, res) => {
  try { res.json({ success: true, data: await service.getSellerOrder(req.seller._id, req.params.orderId) }); }
  catch (e) { error(res, e); }
};

const updateSellerOrderStatus = async (req, res) => {
  try {
    const data = await service.updateSellerOrderStatus(req.seller._id, req.params.orderId, req.body.status);
    res.json({ success: true, message: 'Order status updated successfully.', data });
  } catch (e) { error(res, e); }
};

module.exports = { listSellerOrders, getSellerOrder, updateSellerOrderStatus };
