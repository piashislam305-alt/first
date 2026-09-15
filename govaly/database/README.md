# Govaly — MongoDB Database Files

Everything the site shows (products, categories & **sub-categories**,
**sellers**, users, reviews, orders) lives in MongoDB.
This folder contains a ready-made snapshot of the full database.

> **Note:** this snapshot predates the removal of brands/banners/coupons from
> the app. The JSON files here are no longer regenerated with those fields —
> run `npm run export:db` (inside `server/`) after seeding fresh to refresh
> this snapshot from the current schema.

```
database/
├── collections/          ← one JSON file per collection (mongoimport-ready)
│   ├── products.json     103 products (with seller, category, sub-category, stock, ratings)
│   ├── categories.json   5 parents (Men/Women/Kids/Baby/Health & Beauty) + 31 sub-categories
│   ├── sellers.json      5 sellers
│   ├── reviews.json      seeded product reviews
│   ├── users.json        demo customer + admin (bcrypt-hashed passwords)
│   └── orders.json       one demo order
└── import.sh             one-command importer
```

## Option A — Local MongoDB

```bash
mongod &                                        # start your MongoDB (or `brew services start mongodb-community`)
cd database
./import.sh "mongodb://127.0.0.1:27017/govaly"
```

## Option B — MongoDB Atlas (free tier works)

1. Create a cluster → *Database Access* → add a user → *Network Access* → allow your IP.
2. Get the connection string and import:

```bash
cd database
./import.sh "mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/govaly"
```

## Then point the app at it

Create `server/.env` (copy from `server/.env.example`):

```env
MONGO_URI=mongodb://127.0.0.1:27017/govaly      # or your Atlas URI
JWT_SECRET=change-me-to-a-long-random-string
PORT=5000
```

Run `npm run dev` — the app now uses **your** database.

## Notes

- **Zero-setup fallback:** if `MONGO_URI` is not set, the server boots its own embedded
  MongoDB and auto-seeds the exact same catalog — handy for quick demos.
- `users.json` contains **bcrypt password hashes** (never plain text). Demo logins:
  `demo@govaly.test / Demo1234` · `admin@govaly.test / Admin123`.
  Change `JWT_SECRET` for any real deployment.
- Re-export a live snapshot anytime: `cd server && npm run export:db`.
