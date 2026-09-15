import { Router } from 'express';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Place an order (COD / mock gateway)
router.post('/', protect, async (req, res) => {
  try {
    const { items, address, payment = {} } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty' });
    if (!address?.fullName || !address?.phone || !address?.address) {
      return res.status(400).json({ message: 'Full delivery address is required' });
    }

    // Re-price every line server-side — never trust client prices
    const ids = items.map((i) => i.product);
    const dbProducts = await Product.find({ _id: { $in: ids } }).lean();
    const byId = Object.fromEntries(dbProducts.map((p) => [String(p._id), p]));
    const safeItems = [];
    for (const it of items) {
      const p = byId[String(it.product)];
      if (!p) return res.status(400).json({ message: 'A product in your cart no longer exists' });
      const qty = Math.max(1, Math.min(10, Number(it.qty) || 1));
      safeItems.push({
        product: p._id, slug: p.slug, name: p.name, image: p.images?.[0] || '',
        seller: p.seller || '',
        color: it.color || p.colors?.[0] || '',
        size: it.size || p.sizes?.[0] || 'Free Size', price: p.price, mrp: p.mrp, qty,
      });
    }
    const realSubtotal = safeItems.reduce((s, i) => s + i.price * i.qty, 0);
    const realDelivery = realSubtotal >= 1500 ? 0 : 60;

    const order = await Order.create({
      user: req.user._id,
      orderId: 'GV-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10),
      items: safeItems,
      address,
      payment: { method: ['cod', 'bkash', 'nagad', 'card'].includes(payment.method) ? payment.method : 'cod', status: 'pending' },
      subtotal: realSubtotal,
      deliveryFee: realDelivery,
      total: realSubtotal + realDelivery,
      status: 'Placed',
      timeline: [{ status: 'Placed', note: 'Order received' }],
    });

    await Product.updateMany({ _id: { $in: ids } }, { $inc: { sold: 1, stock: -1 } });
    res.status(201).json({ order });
  } catch (e) {
    res.status(500).json({ message: 'Could not place order', detail: e.message });
  }
});

router.get('/mine', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt').lean();
  res.json({ orders });
});

router.get('/:orderId', protect, async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id }).lean();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});

router.post('/:orderId/cancel', protect, async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['Placed', 'Processing'].includes(order.status)) {
    return res.status(400).json({ message: 'This order can no longer be cancelled' });
  }
  order.status = 'Cancelled';
  order.timeline.push({ status: 'Cancelled', note: 'Your order has been cancelled' });
  await order.save();
  res.json({ order });
});

// ---- Item review (To Review tab) ----
router.post('/:orderId/review', protect, async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const { itemIdx = 0, type = 'Positive', rating = 5, comment = '' } = req.body;
  const it = order.items[Number(itemIdx)];
  if (!it) return res.status(404).json({ message: 'Item not found' });
  if (!['Positive', 'Negative', 'Neutral'].includes(type)) return res.status(400).json({ message: 'Invalid review type' });
  it.review = { type, rating: Math.max(1, Math.min(5, Number(rating) || 5)), comment: String(comment).slice(0, 500) };
  try {
    await Review.create({
      product: it.product, user: req.user._id, userName: req.user.name,
      rating: it.review.rating, title: type, comment: it.review.comment,
    });
  } catch { /* duplicate user+product review — keep order-level review only */ }
  await order.save();
  res.json({ order });
});


export { ORDER_STATUSES };
export default router;
