import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { softAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/products
 * ?search= &category= &group= &seller= &min= &max= &minDiscount= &size= &sort=new|price_asc|price_desc|discount|rating|popular &page= &limit=
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, group, size, sort } = req.query;
    const q = { isActive: true };

    if (search) {
      const rx = new RegExp(String(search).trim().split(/\s+/).join('|'), 'i');
      q.$or = [{ name: rx }, { category: rx }, { description: rx }];
    }
    // NOTE: these are String fields on Product, so a comma-separated list must be
    // matched with $in — assigning the array directly would only match a document
    // whose field literally equals that array, i.e. it would never match anything.
    if (category) q.category = { $in: String(category).split(',') };
    if (group) q.group = { $in: String(group).split(',') };
    if (req.query.seller) q.seller = { $in: String(req.query.seller).split(',') };
    if (size) q.sizes = String(size);

    const min = Number(req.query.min), max = Number(req.query.max);
    if (!Number.isNaN(min) && req.query.min) q.price = { ...q.price, $gte: min };
    if (!Number.isNaN(max) && req.query.max) q.price = { ...q.price, $lte: max };
    const minDiscount = Number(req.query.minDiscount);
    if (!Number.isNaN(minDiscount) && req.query.minDiscount) q.discount = { $gte: minDiscount };

    const sortMap = {
      new: '-createdAt',
      price_asc: 'price',
      price_desc: '-price',
      discount: '-discount',
      rating: '-rating',
      popular: '-sold',
    };
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(60, Number(req.query.limit) || 24);
    const sortBy = sortMap[sort] || (sort === 'relevant' && search ? undefined : sortMap.popular);

    const [items, total] = await Promise.all([
      Product.find(q).sort(sortBy || '-rating').skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(q),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load products', detail: e.message });
  }
});

router.get('/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).lean();
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const [reviews, related] = await Promise.all([
    Review.find({ product: product._id }).sort('-createdAt').limit(20).lean(),
    Product.find({ _id: { $ne: product._id }, $or: [{ category: product.category }, { group: product.group }], isActive: true })
      .sort('-rating').limit(10).lean(),
  ]);
  res.json({ product, reviews, related });
});

// -------- Reviews --------
router.get('/:slug/reviews', async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug }).select('_id').lean();
  if (!p) return res.status(404).json({ message: 'Product not found' });
  const reviews = await Review.find({ product: p._id }).sort('-createdAt').limit(50).lean();
  res.json({ reviews });
});

router.post('/:slug/reviews', softAuth, async (req, res) => {
  try {
    const p = await Product.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    const rating = Math.max(1, Math.min(5, Number(req.body.rating)));
    if (!rating) return res.status(400).json({ message: 'Please pick a rating' });

    const review = await Review.create({
      product: p._id,
      user: req.user?._id,
      userName: req.user?.name || (req.body.name || 'Guest Shopper').slice(0, 40),
      rating,
      title: (req.body.title || '').slice(0, 80),
      comment: (req.body.comment || '').slice(0, 600),
    });

    const agg = await Review.aggregate([
      { $match: { product: p._id } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg[0]) {
      p.rating = Math.round(agg[0].avg * 10) / 10;
      p.numReviews = agg[0].count;
      await p.save();
    }
    res.status(201).json({ review });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'You already reviewed this product' });
    res.status(500).json({ message: 'Could not save review' });
  }
});

export default router;
