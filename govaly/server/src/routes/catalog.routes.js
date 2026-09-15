import { Router } from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Seller from '../models/Seller.js';

const router = Router();

router.get('/categories', async (_req, res) => {
  const categories = await Category.find().sort('order').lean();
  res.json({ categories });
});

// Live search suggestions — categories/subcategories + products (DB-driven)
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
router.get('/search/suggest', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 1) return res.json({ categories: [], products: [] });
  // word-start match: "men" hits "Men Topwear" but not "Women"
  const rx = new RegExp(`(^|[^a-zA-Z])${esc(q)}`, 'i');
  const [categories, products] = await Promise.all([
    Category.find({ name: rx }).sort('order').limit(7).select('name slug isParent parent').lean(),
    Product.find({ $or: [{ name: rx }, { category: rx }] })
      .sort({ sold: -1, rating: -1 }).limit(6)
      .select('name slug price mrp images').lean(),
  ]);
  res.json({
    categories,
    products: products.map((p) => ({ _id: p._id, name: p.name, slug: p.slug, price: p.price, mrp: p.mrp, image: p.images?.[0] || '' })),
  });
});

router.get('/categories/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ category });
});

router.get('/groups', async (_req, res) => {
  const [parents, children] = await Promise.all([
    Category.find({ isParent: true }).sort('order').lean(),
    Category.find({ isParent: false }).sort('order').lean(),
  ]);
  const groups = parents.map((p) => ({
    key: p.slug,
    name: p.name,
    image: p.image,
    children: children.filter((c) => c.parent === p.slug),
  }));
  res.json({ groups });
});

// Sellers — products are grouped and browsed by seller only (no brand concept)
router.get('/sellers', async (_req, res) => {
  const sellers = await Seller.find({ isActive: true }).sort('name').lean();
  const counts = await Product.aggregate([{ $group: { _id: '$seller', count: { $sum: 1 } } }]);
  const byslug = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json({ sellers: sellers.map((s) => ({ ...s, count: byslug[s.slug] || 0 })) });
});

// One call = everything the homepage needs (SRS: no hero/promo/brands/coupons/campaigns)
router.get('/home', async (_req, res) => {
  const [categories, trending, newArrivals] = await Promise.all([
    Category.find({ isParent: false }).sort('order').lean(),
    Product.find({ trending: true, isActive: true }).limit(12).lean(),
    Product.find({ isActive: true }).sort('-createdAt').limit(12).lean(),
  ]);
  res.json({ categories, trending, newArrivals });
});

export default router;
