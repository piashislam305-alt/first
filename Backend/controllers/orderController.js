const service = require('../services/orderService');
const error = (res, e) => res.status(e.status || 500).json({ success: false, message: e.message || 'Server error.' });

const checkout = async (req, res) => {
  try {
    const data = await service.checkout(req.customer._id, req.body);
    res.status(201).json({ success: true, message: 'Order placed successfully.', data });
  } catch (e) { error(res, e); }
};

const listOrders = async (req, res) => {
  try { res.json({ success: true, data: await service.listCustomerOrders(req.customer._id, req.query) }); }
  catch (e) { error(res, e); }
};

const getOrder = async (req, res) => {
  try { res.json({ success: true, data: await service.getCustomerOrder(req.customer._id, req.params.orderId) }); }
  catch (e) { error(res, e); }
};

const trackOrder = async (req, res) => {
  try { res.json({ success: true, data: await service.trackCustomerOrder(req.customer._id, req.params.orderId) }); }
  catch (e) { error(res, e); }
};

module.exports = { checkout, listOrders, getOrder, trackOrder };
