# Govaly Design Audit — Our Build vs. The Real Site

Compared against the live govaly.com.bd source (HTML + CSS bundles + assets).
Verified from their actual stylesheet values and markup — not guesswork.

## ✅ Verified facts from the real site

| Token | Real Govaly value | Where used |
|---|---|---|
| Primary | `#E2136E` | header bg, buttons, prices, badges, highlights |
| Primary hover | `#C01159` | button hover states |
| Light tint bg | `#FFF2F8` | overlays, tile gradients, section tints |
| Light border pink | `#FFD2E6` | tile/card borders |
| Text | `#191919` / `#181818` | headings, body |
| Divider | `#E7E7E7` | hairlines |
| Rating green | `#0FAF00` | rating badges |
| Font | **Inter only** (self-hosted) | everything |
| Logo | PNG image `/assets/logo/govaly.png` (circular G + wordmark) | header/footer |
| Chat button | **mascot face image** `/assets/home/mascot_face.png` | bottom-right FAB |
| USP icons | custom pink 3D icons (cash stack, return box, van, price tag) | USP strip |

---

## 🔴 Major differences (layout & structure)

1. **Header** — Real: solid `#E2136E` pink bar with white pill search (magnifier inside, pill
   "Search" button), white logo image, white Profile/Wishlist/Cart icons, hamburger far-left.
   Ours: white header, pink text logo, square attached search input, extra gradient utility
   topbar on top (real site has no such topbar — "Become a Seller" lives elsewhere).

2. **Category tiles shape** — Real: **SQUARE tiles with rounded-md corners** in white cards
   (151×151 desktop / 75×75 mobile), label below in small gray text, hover scale-105.
   Ours: **circular** images with pink border. (This is the most visible mismatch.)

3. **Category nav placement** — Real: the square category thumbnails sit in a horizontally
   scrollable white strip **directly under the pink header**. Ours: circles live inside a
   rounded section card further down the page.

4. **Hero** — Real: full-width **image banner carousel** (marketing banners, embla) with the
   centered white pill search overlaid, plus "Log In or Sign Up" text links near the banner.
   Ours: invented pink-gradient text slide with tagline/CTA button and side collage images.

5. **Footer** — Real: **white** footer, black text `#191919`, logo, DBID trade-license line
   ("DBID - 751626035"), "Download Govaly Mobile App" with a black-outlined Google Play button.
   Ours: dark purple-black footer with light text — opposite look.

6. **Page background** — Real: white page, sections as bordered/soft-shadow cards. Ours:
   gray `#f5f5f8` canvas with big rounded section containers.

## 🟠 Component-level differences

7. **USP strip** — Real: 4 equal white cards (66px tall), centered icon + single-line label
   ("Cash On Delivery" / "Instant Return" / "Delivery Within 48hrs" / "Best Price Deal"),
   custom pink 3D icons. Ours: left-aligned two-line items with lucide icons in pink squares.

8. **"Shop Under ৳" tiles** — Real: portrait `aspect-[6.84/9]` tiles with 1px `#FFD2E6`
   border, bottom overlay fading from **light pink `#FFF2F8`** (not dark), price in
   `#E2136E` bold, title in `#181818`. Ours: dark gradient overlay with all-white text.

9. **Featured Products cards** — Real: white image cards with pink **"15% OFF" ribbon
   centered at top** and title at bottom-center on light overlay. Ours: corner badge with
   big number, dark bottom gradient, bottom-left title.

10. **Brand row** — Real: clean white logo tiles with brand name in bold **dark** text below
    the logo. Ours: bordered tiles with pink brand name — different arrangement/color.

11. **Product card** — Ours adds things the real card doesn't lead with (uppercase pink
    brand line, always-visible "Add to Cart" button) and formats prices/ratings slightly
    differently (real: `৳599` bold + struck `৳749` + pink `(20% OFF)` + green `★ 5.00`).

12. **Buttons & radii** — Real buttons are **pill-shaped (`rounded-full`)** with
    `hover:scale-105` (e.g. "Open App", search button). Ours: 10px rounded rectangles.

13. **Chat FAB** — Real: white circular button with the **mascot face** image.
    Ours: pink gradient circle with a generic message icon.

14. **Logo** — Real: image logo (circular G mark + "Govaly" wordmark, 130×33 in header).
    Ours: text logo with my own rounded-square G SVG — clearly different mark.

## 🟡 Typography & palette

15. **Font** — Real uses **Inter** only; we pair **Poppins** headings with Inter body.
    Poppins nowhere on the real site.

16. **Color hue** — Our primary `#EC1380` / purple-magenta gradients (`#b30d5c → #ec1380 →
    #f04498`, hero tones `#d81b60/#ad1457/#c2185b`) vs. their exact `#E2136E` + `#C01159`
    hover + `#FFF2F8`/`#FFD2E6` tints. Close, but noticeably more purple in gradients.

17. **Rating pill green** — ours `#0e9f6e` vs. theirs `#0FAF00`.

## 🟢 Already matching well

- Overall page section order (hero → categories → USP → promos → featured → brands →
  shop-under → product tabs)
- Real catalog content (product names, ৳ prices, discounts, CDN imagery)
- Featured/under/promo sections exist with correct titles & links
- "Shopping? Go Valy" tagline, mascot concept, live chat, coupons, ৳ formatting

---

## Fix plan (when you say go)

1. Swap design tokens → `#E2136E/#C01159/#FFF2F8/#FFD2E6/#191919/#0FAF00`, kill gradients
2. Header → pink bar + white pill search + real logo PNG; add square-category strip below
3. Categories → square rounded tiles in white cards
4. Hero → image banner carousel + overlaid centered pill search + "Log In or Sign Up"
5. Footer → white theme + DBID line + Google Play button
6. USP/Shop-Under/Featured/Brand tiles → exact real styling (light pink overlays, ribbons)
7. Buttons → pills with hover scale; chat FAB → mascot face; font → Inter only
