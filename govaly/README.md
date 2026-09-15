# Govaly — Shopping? Go Valy! 🛍️

A full-featured **MERN stack e-commerce marketplace** inspired by [govaly.com.bd](https://govaly.com.bd) —
Bangladesh's favorite online fashion mall. Trendy fashion, footwear & lifestyle with cash-on-delivery
e-commerce UX tuned for the Bangladeshi market (৳ pricing, bKash/Nagad, divisions, 48-hr delivery).

![stack](https://img.shields.io/badge/stack-MongoDB%20·%20Express%20·%20React%20·%20Node-pink)

---

## ✨ Features

### Storefront
- 📂 **Category pages** — banner + category name with dedicated **Top Rated / For You / Top Sold**
  product-grid sections, sub-category chips, and full filter view one click away
- 🌳 **Category hierarchy** — Men / Women / Kids / Baby / Health & Beauty parents with 30+ real
  sub-categories (Men Sneakers, Men Watch, Women Sharee, Skincare, Wellness…), shown in the drawer
  mega-menu and the **left sidebar tree** on listing pages
- 🏠 **Homepage** — auto-rotating hero carousel, 18 category circles, USP strip (COD / returns / 48-hrs /
  best price), promo banners, featured deals, top-brand row, "Shop under ৳" deal tiles and tabbed product
  grid (For You / Men / Women / Kids / Baby / Health & Beauty)
- 🔎 **Catalog** — server-side search, category / brand / **seller** / price / discount / size filters,
  6 sort modes, pagination, URL-synced filter state
- 📄 **Product page** — price & discount block, size selector, qty stepper, stock warnings, delivery USPs,
  **reviews & ratings** (post your own), related products
- 🛒 **Cart** — per-size line items, qty steppers, **coupon engine** (`GOVALY10`, `WELCOME100`, `EID200`),
  free delivery over ৳1500, live savings meter
- 💳 **Checkout** — saved address book, all 8 BD divisions, 4 payment methods (COD, bKash, Nagad, card)
- 📦 **Orders** — order confirmation, live status timeline (Placed → Confirmed → Packed → Shipped →
  Delivered), self-service cancellation
- ❤️ **Wishlist** — synced to the account for logged-in users, localStorage for guests
- 💬 **Live chat widget** with a rule-based Govaly Buddy bot
- 🔐 **Auth** — JWT **access token (1d) + rotating refresh token (30d, httpOnly cookie + body)**,
  bcrypt-hashed passwords, role-based access, change-password flow, auto session renewal
- ⚙️ **Admin panel** — revenue/orders/users stats, product CRUD (create / edit / delete), order status
  management
- 🏷️ **Brand & Seller pages share one UI** — `/brand/:slug` and `/seller/:slug` render the same
  listing component (Brand ID / Seller ID → single Product Grid)
- 📱 Fully responsive — mobile drawer menu, bottom-sheet filters, adaptive grids

### Engineering
- REST API with **server-side re-pricing** of every order (never trusts client prices)
- Coupons validated server-side with caps & minimum-order rules
- Partial unique index so one review per user per product (guest reviews allowed for demo)
- Auto-seed on first boot — the store fills itself on a fresh database
- Dev mode proxies `/api` to Vite; production build is served statically by Express (single port)

---

## 🚀 Quick Start

```bash
# 1) install everything
npm run install:all        # installs server/ and client/ deps

# 2) run in development (API :5000 + Vite dev server :5173 with HMR)
npm run dev                # → open http://localhost:5173

# ——— or production mode (single port) ———
npm run prod               # builds client → Express serves it on http://localhost:5000
```

> **Use your own MongoDB (recommended for real use):** create `server/.env` from
> `server/.env.example`, set `MONGO_URI=mongodb://127.0.0.1:27017/govaly` (local) or your Atlas URI,
> then import the ready-made database snapshot:
>
> ```bash
> cd database && ./import.sh "mongodb://127.0.0.1:27017/govaly"
> ```
>
> **Zero-setup fallback:** with no `MONGO_URI`, the server boots an embedded MongoDB and auto-seeds
> the identical catalog (103 products). Snapshot is re-exportable anytime: `npm run export:db` (in server/).

Re-seed anytime with `npm run seed`.

### Demo accounts

| Role      | Email               | Password   |
|-----------|---------------------|------------|
| Customer  | `demo@govaly.test`  | `Demo1234` |
| Admin     | `admin@govaly.test` | `Admin123` |

### Coupons
`GOVALY10` — 10% off (max ৳300, min ৳500) · `WELCOME100` — ৳100 off ৳999+ · `EID200` — ৳200 off ৳2499+

---

## 🗂 Project Structure

```
govaly/
├── package.json             # root scripts (concurrently)
├── database/                # MongoDB snapshot: collections/*.json + import.sh (see database/README.md)
├── server/                  # ─── Express + MongoDB ───
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js         # app entry: API + static client, graceful shutdown
│       ├── db.js            # MONGO_URI or embedded mongod (auto)
│       ├── seed.js          # idempotent seeder (CLI + auto-seed on boot)
│       ├── data/catalog.js  # 103 products, 18 categories, brands, banners, coupons
│       ├── middleware/auth.js   # JWT protect / adminOnly / softAuth
│       ├── models/          # User, Category (parents + sub-categories), Brand, Seller, Product, Order, Review, Banner
│       └── routes/
│           ├── auth.routes.js      # register/login/me/addresses/wishlist
│           ├── catalog.routes.js   # categories, brands, /home payload, coupon validate
│           ├── product.routes.js   # list+filters, detail, reviews
│           ├── order.routes.js     # place / mine / detail / cancel
│           └── admin.routes.js     # stats, product CRUD, order status
└── client/                  # ─── React (Vite) ───
    ├── index.html · vite.config.js
    ├── public/img/          # self-hosted catalog imagery + fonts (no CDN needed)
    └── src/
        ├── api.js           # axios instance + JWT interceptor
        ├── context/StoreContext.jsx   # auth + cart + wishlist + toasts
        ├── components/      # Header, Footer, HeroCarousel, HomeSections, ProductCard,
        │                    # ChatWidget, Guards (auth/admin), UI atoms
        └── pages/           # Home, Listing, ProductDetail, Cart, Checkout, OrderSuccess,
                             # Orders, Wishlist, Auth, Profile, Admin, NotFound
```

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` `/api/auth/login` | JWT auth |
| GET/PUT | `/api/auth/me` | profile (protected) |
| GET/POST | `/api/auth/wishlist(/:productId)` | server-synced wishlist |
| GET | `/api/sellers` | seller directory with product counts |
| GET | `/api/home` | one payload for the whole homepage |
| GET | `/api/products` | `?search&category&group&brand&min&max&minDiscount&size&sort&page` |
| GET | `/api/products/:slug` | product + reviews + related |
| GET/POST | `/api/products/:slug/reviews` | read / post review |
| POST | `/api/coupons/validate` | coupon engine |
| POST | `/api/orders` | place order (server re-prices) |
| GET | `/api/orders/mine` `/api/orders/:orderId` | order history |
| POST | `/api/orders/:orderId/cancel` | customer cancel |
| GET | `/api/admin/stats` `/api/admin/orders` | dashboard (admin) |
| POST/PUT/DELETE | `/api/admin/products(/:id)` | product CRUD (admin) |
| PUT | `/api/admin/orders/:orderId/status` | update status (admin) |

## 📝 Notes

- Product data (names, prices, imagery) mirrors a real BD marketplace catalog for realism; built for
  learning/portfolio use.
- Card / bKash / Nagad payments are UX stubs (demo) — integrate a PSP like ShurjoPay/SSLCommerz for real
  transactions.
- The wishlist-merge, JWT secrets, and payment hooks are intentionally simple & commented for easy
  extension.
