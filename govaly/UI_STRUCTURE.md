# Govaly — UI Structure & Colors (SRS Customer Build)
Reflects the simplified SRS customer site. Font: **Inter**. Source: `client/src/styles.css` + components.

---

## 1. 🎨 Color System

### Core tokens (`:root`)
| Token | Hex | Used for |
|-------|-----|----------|
| `--brand` | **`#E2136E`** | Primary pink — header, CTAs, active tabs, prices, badges, links |
| `--brand-600` | `#C01159` | gradient ends, hovers |
| `--brand-700` | `#A00F4B` | pressed states |
| `--brand-50` | `#FFF2F8` | pink tint backgrounds (auth panel tint, chips, empty states) |
| `--brand-100` | `#FFD2E6` | pink borders, star-empty `#F9D2E3` |
| `--ink` / `--ink-2` | `#191919` / `#333333` | headings / secondary text |
| `--muted` | `#7A7A85` | hints, subtitles |
| `--line` | `#E7E7E7` | borders & dividers |
| `--bg` / `--card` | `#FFFFFF` | page & cards |
| `--green` | `#0FAF00` | success toasts, COD accents |
| `--amber` | `#F5A623` | warnings, review stars alt |
| `--red` | `#E02D2D` | errors |
| radius `10px` · shadows `rgba(25,25,25,.07/.12)` | | cards 12–14px, pills 18–24px |

### Semantic extras
| Hex | Usage |
|-----|-------|
| `#12A150` | COD / delivered accents, "ONLY METHOD" chip |
| `#F7941D` | Processing status, warning chips |
| `#8A8A96` on `#F1F2F6` | Cancelled/grey pills |
| `#1D9BF0` | verified ✔ check |
| greys `#6D6D78 #9A9AA5 #55555E #F3F3F3 #FAFAFA` | secondary text, section fills |

### Status colors (orders)
Pending → pink `#E2136E` · Processing → amber `#F7941D` · Delivered → green `#12A150` · Cancelled → grey · Timeline dots pink filled/done, `#FFD2E6` upcoming · Review stars `#E2136E`/`#F9D2E3`

---

## 2. 🧱 Global Shell
```
┌─────────────────────────────────────────────┐
│ HEADER  pink #E2136E · burger · Logo ·      │
│  Search pill (live suggestions) · Wishlist♡ │
│  Cart🛍badge · Hi,Name ▾ (or Login)         │
├─────────────────────────────────────────────┤
│ PAGE CONTENT                                │
├─────────────────────────────────────────────┤
│ FOOTER  white · brand/tagline/DBID ·        │
│  Govaly Policies · Help & Support · Social  │
│  Payment strip: "Cash on Delivery" only     │
│  © Govaly Limited                           │
└─────────────────────────────────────────────┘
📱 BottomNav (≤767px): Home · Category · Cart · Profile
🔔 Toasts top-right
```
No topbar, no chat widget, no app/QR strip (SRS).

## 3. 📄 Pages (SRS customer set)

| Page | Route | Structure |
|------|-------|-----------|
| **Home** | `/` | **Shop by Category** — 30 sub-category cards (unique image each: Women Footwear, Men Shoes, Kids Shoes…) → product tabs (For You/Men/Women/Kids/Baby/Health & Beauty) → 12-card grid → View All. *No hero/USP/brands/deals/promos* |
| **Search** | header → `/products?search=` | live suggestions dropdown while typing (categories + product names, suggestions refine per character); results page: title, Filters sidebar, `Sort:` select, grid |
| **Category** | `/category/:slug` | header + products grid + sort; sub-category browsing |
| **Listing** | `/products` | Filters (category, price, discount, size) + Sort + 24 ProductCards/page + pagination |
| **Seller** | `/seller/:slug` | simple: seller name as title + grid of ONLY their products (no shop branding) |
| **PDP** | `/product/:slug` | breadcrumb · thumb rail + main image · brand (text) · title · ★rating + sold · price + MRP strike + %OFF · colors · sizes · qty stepper · **Add to Cart** + **Buy Now** · seller card · USP mini list · Reviews (list + submit form for eligible buyers) |
| **Wishlist** | `/wishlist` | saved ProductCards grid |
| **Cart** | `/cart` | item rows (✓, img, name, Color/Size chip, price, qty, 🗑) · Summary: Total Product Price → delivery (৳60, free ≥1500) → **Checkout** |
| **Checkout** | `/checkout` | Stepper · address cards + Add/Edit Address form (auto-opens if none) · Summary → **Place Order** |
| **Payment** | `/payment` | **Cash on Delivery — the only method** (radio, fixed selected) · Deliver-To card · Summary → **Confirm Order** |
| **Thank You** | `/order-success/:id` | ✓ mascot · Go# · "Payment method: Cash on Delivery" · track link · continue shopping |
| **My Orders** | `/orders` | mobile header (‹ + pink burger menu) + simple user strip (avatar + name ✔) · **tabs: All/Pending/Processing/Delivered/Cancelled** · order cards (Go#, seller, COD badge, status) · items with Reviewed: Positive 5★ / Add Review · totals · **Track** (simple timeline: Pending→Processing→Delivered), **Cancel Order** (pending), **Add Review** (delivered), **Order Again** |
| **Profile** | `/profile/:section` | sidebar: avatar, name ✔, menu: My Orders · My Wishlist · My Addresses · Payment Options (COD-only card) · Account Information · Setting · Govaly Helpline · Log Out. *No Points/Platinum/Vouchers* |
| **Auth** | `/login` `/register` | split card (pink brand panel: "Shopping? Go Valy!" + COD perk + review perk) · email+password login (wrong-password error, **no OTP/forgot/social**) · register: name/email/phone(optional)/password · **auto-redirects home if already signed in** |
| **Info pages** | `/about /contact /faq /returns /shipping /terms /privacy /report /sitemap` | H1 + subtitle + panels (FAQ accordions) |
| **Errors** | `/404 * /500 /502-505` | UFO 404 + Server Down pages |
| **Admin** | `/admin` | role-guarded (pre-registered admin login only) |

**Removed routes (404):** `/vouchers /chat /campaigns/* /brand/* /careers /become-a-seller /app`

## 4. 📐 Responsive
≤767px: BottomNav (page pads 76px), orders mobile header/strip, single-column profile, grids compress. Typography: Inter — H1 26 · H2 22 · H3 15.5–16 · body 13.5–14 · small 12.

## 5. ✅ Test suites (tests/, 90 checks)
journey7 orders 22 · journey8 auth+COD funnel (sandbox) 11 · journey9 home/search/PDP/seller 15 · journey10 all-pages sweep 31 · journey11 sandbox deep pass 11
