import { Router } from 'express';
import Product from '../models/Product.js';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Category from '../models/Category.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/stats', async (_req, res) => {
  const [totalProducts, totalOrders, users, revenueAgg, byStatus, recent] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    (await import('../models/User.js')).default.countDocuments({ role: 'customer' }),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find().sort('-createdAt').limit(8).lean(),
  ]);
  res.json({
    totalProducts, totalOrders, users,
    revenue: revenueAgg[0]?.sum || 0,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    recentOrders: recent,
  });
});

// ---------- Products ----------
router.get('/products', async (req, res) => {
  const { search } = req.query;
  const q = {};
  if (search) q.name = new RegExp(String(search), 'i');
  const items = await Product.find(q).sort('-createdAt').limit(200).lean();
  res.json({ items });
});

router.post('/products', async (req, res) => {
  try {
    const b = req.body;
    const cat = await Category.findOne({ slug: b.category }).lean();
    const slug = (b.slug || b.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({
      name: b.name, slug, description: b.description || '',
      category: b.category, group: cat?.group || 'men',
      images: b.images?.length ? b.images : [`/img/products/${slug}.jpg`],
      price: Number(b.price), mrp: Number(b.mrp) || Number(b.price),
      stock: Number(b.stock) || 25, sizes: b.sizes || [],
      featured: !!b.featured, trending: !!b.trending,
    });
    res.status(201).json({ product });
  } catch (e) {
    res.status(400).json({ message: 'Could not create product', detail: e.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const b = req.body;
    const price = Number(b.price), mrp = Number(b.mrp);
    const update = {
      name: b.name, description: b.description, category: b.category,
      price, mrp, stock: Number(b.stock),
      // findByIdAndUpdate skips document middleware, so the discount recompute that
      // normally runs in Product's pre('validate') hook has to be done here too.
      discount: mrp ? Math.round(((mrp - price) / mrp) * 100) : 0,
      featured: !!b.featured, trending: !!b.trending, isActive: b.isActive !== false,
    };
    if (b.sizes) update.sizes = b.sizes;
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (e) {
    res.status(400).json({ message: 'Could not update product', detail: e.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ---------- Orders ----------
router.get('/orders', async (_req, res) => {
  const orders = await Order.find().sort('-createdAt').limit(200).populate('user', 'name email').lean();
  res.json({ orders });
});

router.put('/orders/:orderId/status', async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = status;
  order.timeline.push({ status, note: `Updated by admin → ${status}` });
  if (status === 'Delivered') order.payment.status = 'paid';
  await order.save();
  res.json({ order });
});

export default router;
