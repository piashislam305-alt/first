/* eslint-disable no-console */
/**
 * Seeds the database with the Govaly catalog.
 * Run: npm run seed   (inside server/) — also auto-runs on server boot when DB is empty.
 */
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, stopDB } from './db.js';
import {
  CATEGORIES, PARENTS, SUBCATEGORIES, SUBCATEGORY_RULES, SELLERS, PRODUCTS, hashRand,
} from './data/catalog.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Seller from './models/Seller.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';

dotenv.config();

const catBanner = {
  'women-fashion-wear': '/img/catbanners/women-fashion-wear.jpg',
  'kids-girls-clothing': '/img/catbanners/kids-girls-clothing.jpg',
  'health-beauty': '/img/catbanners/health-beauty.jpg',
  'baby-clothing-set': '/img/catbanners/baby-clothing-set.jpg',
};

const groupBlurbs = {
  men: 'Crafted for everyday comfort with premium materials and a modern fit — perfect forBD streets to meet-ups.',
  women: 'Elegant, comfortable and on-trend — a go-to pick for festive seasons and everyday grace.',
  kids: 'Soft, skin-friendly fabric that keeps up with all the playtime energy. Easy wash, durable stitch.',
  baby: 'Gentle on delicate skin, easy to change, and adorable for every little moment.',
  'health-beauty': '100% authentic product sourced from trusted distributors. Dermatologist-safe for daily use.',
};

function describe(p) {
  const b = groupBlurbs[p.group] || 'A great pick from Govaly — quality you can trust at the best price in Bangladesh.';
  return `${p.name}. ${b} Cash on delivery available all over Bangladesh, delivery within 48 hours, and 7-day easy return. Check the size chart before ordering. For any help, reach our 24/7 live chat.`;
}

function reviewSeeds(product) {
  const names = ['Tanvir A.', 'Sadia H.', 'Rakib M.', 'Nusrat J.', 'Arif C.', 'Mim K.', 'Shakil R.', 'Farhan I.'];
  const texts = [
    'Product exactly as shown, delivery was super fast. Recommended!',
    'Quality is really good for this price. Govaly never disappoints.',
    'Received within 2 days in Dhaka. Packaging was neat.',
    'Original product, sealed pack. Will order again.',
    'Comfortable and looks premium. Worth the money.',
    'Seller behavior was great, product is authentic.',
  ];
  const n = hashRand(product.slug + 'rc', 2, 6);
  const reviews = [];
  for (let i = 0; i < n; i++) {
    const k = hashRand(product.slug + i, 0, 100) % texts.length;
    reviews.push({
      userName: names[hashRand(product.slug + 'n' + i, 0, 100) % names.length],
      rating: hashRand(product.slug + 'r' + i, 3, 5),
      title: ['Great value', 'As described', 'Fast delivery', 'Authentic product'][i % 4],
      comment: texts[k],
    });
  }
  return reviews;
}

export async function seedDatabase(log = (...a) => console.log(...a)) {
  await connectDB();

  log('[seed] clearing old data…');
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}), Seller.deleteMany({}),
    Product.deleteMany({}), Order.deleteMany({}), Review.deleteMany({}),
  ]);

  log('[seed] users…');
  const [adminPass, demoPass] = await Promise.all([bcrypt.hash('Admin123', 10), bcrypt.hash('Demo1234', 10)]);
  await User.create([
    { name: 'Govaly Admin', email: 'admin@govaly.test', password: adminPass, role: 'admin', phone: '+8801700000000' },
    {
      name: 'Demo Shopper', email: 'demo@govaly.test', password: demoPass, phone: '+8801712345678',
      addresses: [{
        label: 'Home', fullName: 'Demo Shopper', phone: '+8801712345678', division: 'Dhaka',
        city: 'Dhaka', area: 'Dhanmondi', address: 'House 12, Road 5, Dhanmondi', isDefault: true,
      }],
    },
  ]);

  log('[seed] categories, sub-categories & sellers…');
  const imgFile = (slug) => `/img/categories/${slug}.jpg`;
  const imgExists = (slug) => fs.existsSync(path.resolve(process.cwd(), '../client/public', imgFile(slug)));

  // parents first (Men / Women / Kids / Baby / Health & Beauty)
  const parents = PARENTS.map((p, i) => ({
    ...p, isParent: true, parent: '', order: i, image: '', banner: '',
  }));
  // children: original categories + finer sub-categories (skip slugs that are parents)
  const parentSlugs = new Set(PARENTS.map((p) => p.slug));
  const children = [...CATEGORIES, ...SUBCATEGORIES]
    .filter((c) => !parentSlugs.has(c.slug))
    .map((c, i) => ({
    ...c, parent: c.group, isParent: false, order: i,
    image: imgExists(c.slug) ? imgFile(c.slug) : '',
    banner: catBanner[c.slug] || '',
  }));
  await Category.create(parents);
  await Category.create(children);
  await Seller.create(SELLERS.map((s) => ({
    ...s,
    description: 'Verified Govaly seller — authentic products, fast delivery.',
    rating: 4.5 + (hashRand(s.slug, 0, 4) / 10),
  })));

  log('[seed] products…');
  const docs = PRODUCTS.map((p) => {
    const r = hashRand(p.slug, 36, 49) / 10;
    // move into finer sub-categories where obvious (men-watch, men-sneakers, skincare…)
    let category = p.category;
    for (const [match, sub] of SUBCATEGORY_RULES) {
      if (match(p)) { category = sub; break; }
    }
    return {
      ...p,
      category,
      description: describe(p),
      images: [`/img/products/${p.slug}.jpg`],
      seller: SELLERS[hashRand(p.slug + 'seller', 0, SELLERS.length - 1)].slug,
      rating: r,
      numReviews: hashRand(p.slug + 'c', 12, 420),
      sold: hashRand(p.slug + 's', 30, 900),
      stock: hashRand(p.slug + 'st', 8, 80),
      tags: [p.group, ...(p.trending ? ['trending'] : [])],
    };
  });

  // multi-image galleries: own photo + up to 2 siblings from the same sub-category
  const byCat = {};
  for (const d of docs) (byCat[d.category] ||= []).push(d);
  for (const pool of Object.values(byCat)) {
    for (const d of pool) {
      const sibs = pool.filter((x) => x.slug !== d.slug).slice(0, 2).map((x) => x.images[0]);
      d.images = [...d.images, ...sibs];
    }
  }

  // color variants — deterministic palette per group
  const PALETTES = {
    men: ['Black', 'Navy Blue', 'Olive Green', 'Brown'],
    women: ['Maroon', 'Pink', 'Black', 'Cream'],
    kids: ['Red', 'Royal Blue', 'Yellow'],
    baby: ['Sky Blue', 'Peach', 'White'],
    'health-beauty': ['White', 'Green', 'Pink'],
  };
  docs.forEach((d, i) => {
    const pal = PALETTES[d.group] || ['Black'];
    d.colors = [pal[i % pal.length], pal[(i + 1) % pal.length], pal[(i + 2) % pal.length]].filter((v, ix, a) => a.indexOf(v) === ix);
  });

  const created = await Product.insertMany(docs);

  // backfill sub-category images — every sub gets a DISTINCT image:
  // dedicated file → its own first product → an unused image from the same group
  const productImg = {};
  for (const p of created) if (p.images?.[0] && !productImg[p.category]) productImg[p.category] = p.images[0];
  const groupPool = {};
  for (const p of created) if (p.images?.[0]) (groupPool[p.group] ||= []).push(p.images[0]);
  for (const g of Object.keys(groupPool)) groupPool[g] = [...new Set(groupPool[g])];
  const used = new Set(Object.values(productImg));
  const parentFallback = {};
  for (const c of await Category.find({ isParent: false }).sort('order')) {
    let img = c.image || productImg[c.slug] || '';
    if (!img) {
      const pool = groupPool[c.parent] || [];
      img = pool.find((u) => !used.has(u)) || pool[0] || '';
    }
    if (img) { used.add(img); parentFallback[c.parent] ||= img; }
    if (img && img !== c.image) { c.image = img; await c.save(); }
  }
  for (const p of await Category.find({ isParent: true })) {
    if (parentFallback[p.slug]) await Category.updateOne({ _id: p._id }, { image: parentFallback[p.slug] });
  }
  console.log(`[seed] ${created.length} products`);

  log('[seed] reviews…');
  const reviewDocs = [];
  for (const p of created) {
    for (const r of reviewSeeds(p)) reviewDocs.push({ product: p._id, ...r });
  }
  await Review.insertMany(reviewDocs);

  log('[seed] demo orders (all statuses)…');
  const demoUser = await User.findOne({ email: 'demo@govaly.test' });
  await Order.deleteMany({ user: demoUser._id });

  const STEP_DEFS = {
    pending: ['Pending', 'Your order has been placed and is waiting for confirmation'],
    processing: ['Processing', 'Your order has been confirmed and is being prepared'],
    delivered: ['Delivered', 'Your order has been delivered successfully'],
    cancelled: ['Cancelled', 'Your order has been cancelled'],
  };
  const FULL_FLOW = ['pending', 'processing', 'received', 'packed', 'picked', 'transit', 'hub', 'delivered'];
  const mkTimeline = (keys, daysAgo) => keys.map((k, i) => ({
    status: STEP_DEFS[k][0], note: STEP_DEFS[k][1],
    at: new Date(Date.now() - daysAgo * 864e5 + i * 5 * 36e5),
  }));
  const mkItems = (idxs, qtys) => idxs.map((pi, i) => {
    const p = created[pi];
    return {
      product: p._id, slug: p.slug, name: p.name, image: p.images[0],
      seller: p.seller || '', color: p.colors?.[0] || 'Black',
      size: p.sizes?.[0] || 'Free Size', price: p.price, mrp: p.mrp, qty: qtys[i],
      review: null,
    };
  });
  const mkOrder = async (idxs, qtys, { status, method = 'cod', paid = false, steps, daysAgo = 4, shopRating = 0, serviceRating = 0, reviewed = [] }) => {
    const its = mkItems(idxs, qtys);
    reviewed.forEach((ri) => { its[ri].review = { type: 'Positive', rating: 5, comment: 'Great quality, fast delivery. Highly recommended!' }; });
    const sub = its.reduce((s, i) => s + i.price * i.qty, 0);
    const del = sub >= 1500 ? 0 : 60;
    return Order.create({
      user: demoUser._id,
      orderId: 'GV-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10),
      items: its,
      address: demoUser.addresses[0],
      payment: { method, status: paid ? 'paid' : 'pending' },
      subtotal: sub, deliveryFee: del, total: sub + del,
      status, timeline: mkTimeline(steps, daysAgo),
      shopRating, serviceRating,
    });
  };

  // SRS customer flow: Pending → Processing → Delivered (+ Cancelled). COD only.
  await mkOrder([2, 13], [2, 1], { status: 'Delivered', method: 'cod', steps: ['pending', 'processing', 'delivered'], daysAgo: 6, reviewed: [0] }); // Delivered + reviewed
  await mkOrder([5, 9], [2, 1], { status: 'Delivered', method: 'cod', steps: ['pending', 'processing', 'delivered'], daysAgo: 5 });               // Delivered (can review + Order Again)
  await mkOrder([11, 20], [2, 1], { status: 'Processing', method: 'cod', steps: ['pending', 'processing'], daysAgo: 2 });                          // Processing
  await mkOrder([30], [3], { status: 'Placed', method: 'cod', steps: ['pending'], daysAgo: 0 });                                                   // Pending (can cancel)
  await mkOrder([33], [1], { status: 'Cancelled', method: 'cod', steps: ['pending', 'cancelled'], daysAgo: 3 });                                   // Cancelled

  log('[seed] ✅ done.');
}
