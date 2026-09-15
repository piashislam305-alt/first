/**
 * Exports every collection from the connected MongoDB to
 * ../database/collections/*.json (JSON arrays, mongoimport-compatible).
 *
 * Run (inside server/):   npm run export:db
 * Uses MONGO_URI if set, otherwise the embedded MongoDB (same as the app).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { connectDB, stopDB } from './db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Seller from './models/Seller.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../database/collections');

const COLLECTIONS = [
  ['users', User], ['categories', Category], ['sellers', Seller],
  ['products', Product], ['reviews', Review], ['orders', Order],
];

async function exportDb() {
  await connectDB();
  fs.mkdirSync(OUT, { recursive: true });

  for (const [name, model] of COLLECTIONS) {
    const docs = await model.find().lean();
    for (const d of docs) delete d.__v;
    fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(docs, null, 1));
    console.log(`[export] ${name}: ${docs.length} docs → database/collections/${name}.json`);
  }

  console.log('[export] ✅ done. Import with database/import.sh "<mongo-uri>"');
  await stopDB();
}

export default exportDb;

// CLI
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  exportDb().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
