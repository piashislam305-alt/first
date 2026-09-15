/* eslint-disable no-console */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, stopDB } from './db.js';
import { seedDatabase } from './seed.js';
import Product from './models/Product.js';

import authRoutes from './routes/auth.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));

// ---------- API ----------
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'govaly-api', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes); // /api/categories, /api/sellers, /api/home, /api/groups…
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found' }));

// ---------- Static client (production build) ----------
const dist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(dist, { maxAge: '1d', index: false }));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

// ---------- Errors ----------
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(500).json({ message: 'Something went wrong', detail: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // First boot in a fresh environment → seed the catalog automatically.
    if ((await Product.countDocuments()) === 0) {
      console.log('[govaly] empty database — seeding catalog…');
      await seedDatabase(() => {});
    }
    const server = app.listen(PORT, '0.0.0.0', () =>
      console.log(`[govaly] API + client running → http://0.0.0.0:${PORT}`)
    );
    const shutdown = async () => {
      console.log('\n[govaly] shutting down…');
      server.close();
      await stopDB();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch((e) => {
    console.error('[fatal] DB connection failed:', e);
    process.exit(1);
  });
