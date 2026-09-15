// Govaly catalog seed data — categories, sellers & products.
// (No brands, hero/deal banners, or coupons — removed from scope.)
// Product names/prices mirror a real BD fashion marketplace catalog (Govaly).

export const CATEGORIES = [
  // Women
  { name: 'Women Fashion', slug: 'women-fashion-wear', group: 'women' },
  { name: 'Women Bottom', slug: 'women-bottom-wear', group: 'women' },
  { name: 'Women Footwear', slug: 'women-footwear', group: 'women' },
  { name: 'Women Accessories', slug: 'women-fashion-accessories', group: 'women' },
  // Men
  { name: 'Men Topwear', slug: 'men-topwear', group: 'men' },
  { name: 'Men Bottomwear', slug: 'men-bottomwear', group: 'men' },
  { name: 'Men Footwear', slug: 'men-footwear', group: 'men' },
  { name: 'Men Fashion Accessories', slug: 'men-fashion-accessories', group: 'men' },
  // Kids
  { name: 'Kids Kurti', slug: 'kids-kurti', group: 'kids' },
  { name: 'Kids Girls Clothing', slug: 'kids-girls-clothing', group: 'kids' },
  { name: 'Kids Boys Clothing', slug: 'kids-boys-clothing', group: 'kids' },
  { name: 'Kids Accessories', slug: 'kids-accessories', group: 'kids' },
  { name: 'Kids Footwear', slug: 'kids-footwear', group: 'kids' },
  // Baby
  { name: 'Baby Clothing Set', slug: 'baby-clothing-set', group: 'baby' },
  { name: 'Baby Shoes', slug: 'baby-shoes', group: 'baby' },
  { name: 'Baby Accessories', slug: 'baby-accessories', group: 'baby' },
  { name: 'Baby Winter Wear', slug: 'baby-winter-wear', group: 'baby' },
  // Beauty
  { name: 'Health & Beauty', slug: 'health-beauty', group: 'health-beauty' },
];


// Top-level categories (the ones shown as the main structure, like the real site)
export const PARENTS = [
  { name: 'Men', slug: 'men', group: 'men' },
  { name: 'Women', slug: 'women', group: 'women' },
  { name: 'Kids', slug: 'kids', group: 'kids' },
  { name: 'Baby', slug: 'baby', group: 'baby' },
  { name: 'Health & Beauty', slug: 'health-beauty', group: 'health-beauty' },
];

// Sub-categories (children) — these slugs are ones I directly confirmed exist on
// govaly.com.bd (verified via live fetch), not the site's full/complete subcategory tree.
export const SUBCATEGORIES = [
  { name: 'Men Casual Shoes', slug: 'men-casual-shoes', group: 'men' },
  { name: 'Men Sneakers', slug: 'men-sneakers', group: 'men' },
  { name: 'Men Caps & Hats', slug: 'men-caps-hats', group: 'men' },
  { name: 'Men Bags', slug: 'men-bags', group: 'men' },
  { name: 'Men Watch', slug: 'men-watch', group: 'men' },
  { name: 'Men Panjabi & Koti', slug: 'men-panjabi-koti', group: 'men' },
  { name: 'Men Casual Shirts', slug: 'men-casual-shirts', group: 'men' },
  { name: 'Women Sharee', slug: 'women-sharee', group: 'women' },
  { name: 'Women Flat & Sandals', slug: 'women-flat-sandals', group: 'women' },
  { name: 'Women Bags', slug: 'women-bags', group: 'women' },
  { name: 'Jewellery', slug: 'jewellery', group: 'women' },
  { name: 'Wellness & Hygiene', slug: 'wellness-hygiene', group: 'health-beauty' },
  { name: 'Skincare, Bath & Body', slug: 'skincare-bath-body', group: 'health-beauty' },
  { name: 'Kids Bags', slug: 'kids-bags', group: 'kids' },
];

// Move products into finer sub-categories where the name makes it obvious.
export const SUBCATEGORY_RULES = [
  [(p) => p.group === 'men' && /watch/i.test(p.name), 'men-watch'],
  [(p) => p.group === 'men' && /sneaker/i.test(p.name), 'men-sneakers'],
  [(p) => p.group === 'men' && /\bshoes\b/i.test(p.name), 'men-casual-shoes'],
  [(p) => p.group === 'men' && /(cap|hat)\b/i.test(p.name), 'men-caps-hats'],
  [(p) => p.group === 'men' && /(panjabi|koti)/i.test(p.name), 'men-panjabi-koti'],
  [(p) => p.group === 'men' && /polo/i.test(p.name), 'men-casual-shirts'],
  [(p) => p.group === 'women' && /(saree|sharee)/i.test(p.name), 'women-sharee'],
  [(p) => p.group === 'health-beauty' && /(lotion|cream|soap|serum|essence)/i.test(p.name), 'skincare-bath-body'],
  [(p) => p.group === 'health-beauty' && /(razor|shav|vaporub|hair oil|hair color|perfume|body spray|cologne)/i.test(p.name), 'wellness-hygiene'],
];

export const GROUPS = [
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'kids', label: 'Kids' },
  { key: 'baby', label: 'Baby' },
  { key: 'health-beauty', label: 'Health & Beauty' },
];

// name, slug, category(slug), group, price, mrp
// NOTE: P() keeps its old positional signature (with an unused "brand" slot) so none
// of the ~100 product entries below needed to be rewritten — the brand value is simply
// dropped and never reaches the database.
const P = (slug, name, _brand, category, group, price, mrp, opts = {}) => ({
  slug, name, category, group, price, mrp, ...opts,
});

const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45'];
const CLOTH_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const KID_SIZES = ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '7-8Y'];
const BABY_SIZES = ['0-6M', '6-12M', '1-2Y', '2-3Y'];

export const PRODUCTS = [
  // ============================ MEN ============================
  P('walkaroo-soft-cushion-brown-kolhapuri-chappal-for-men', 'Walkaroo Soft Cushion Brown Kolhapuri Chappal for Men', 'walkaroo', 'men-footwear', 'men', 599, 749, { sizes: SHOE_SIZES, trending: true }),
  P('adidaas-style-slide-slipper-for-men-black-x-white', 'Men Stylish Slide Slipper — Black x White', 'diagram', 'men-footwear', 'men', 666, 799, { sizes: SHOE_SIZES, trending: true }),
  P('panda-comfortable-white-sneaker', 'Panda Comfortable White Sneaker', 'govaly-essentials', 'men-footwear', 'men', 865, 1200, { sizes: SHOE_SIZES, trending: true, featured: true }),
  P('adda-exclusive-coffee-color-flip-flops-for-men', 'Adda Exclusive Coffee Color Flip Flops for Men', 'adda', 'men-footwear', 'men', 670, 799, { sizes: SHOE_SIZES }),
  P('adda-trendy-maroon-casual-slippers-for-men', 'Adda Trendy Maroon Casual Slippers for Men', 'adda', 'men-footwear', 'men', 670, 799, { sizes: SHOE_SIZES }),
  P('mens-dual-buckle-casual-slide-sandals-olive-green', "Men's Dual Buckle Casual Slide Sandals — Olive Green", 'diagram', 'men-footwear', 'men', 589, 890, { sizes: SHOE_SIZES, trending: true }),
  P('adda-exclusive-black-color-flip-flops-for-men', 'Adda Exclusive Black Color Flip Flops for Men', 'adda', 'men-footwear', 'men', 670, 799, { sizes: SHOE_SIZES }),
  P('gurali-cord-fabrics-premium-sneaker-for-men-green', 'Gurali Cord Fabrics Premium Sneaker for Men — Green', 'govaly-essentials', 'men-footwear', 'men', 1199, 1349, { sizes: SHOE_SIZES }),
  P('sanrio-cartoon-character-watch-with-matching-box', 'Sanrio Cartoon Character Watch with Matching Box', 'head-gear', 'men-fashion-accessories', 'men', 600, 720, {}),
  P('adda-exclusive-ring-toe-ash-x-black-sandal-for-men', 'Adda Exclusive Ring Toe Sandal for Men — Ash x Black', 'adda', 'men-footwear', 'men', 670, 799, { sizes: SHOE_SIZES }),
  P('mens-slip-on-eva-slide-sandals-lightweight-daily-comfort', "Men's Slip-On EVA Slide Sandals — Lightweight Daily Comfort", 'diagram', 'men-footwear', 'men', 599, 750, { sizes: SHOE_SIZES }),
  P('gillette-fusion-manual-shaving-razor-blades-4-pcs-cartridge-uk', 'Gillette Fusion Manual Shaving Razor Blades 4s Cartridge (UK)', 'gillette', 'health-beauty', 'health-beauty', 1890, 2290, {}),
  P('walkaroo-blue-grey-sandal-for-mens', 'Walkaroo Blue Grey Sandal for Men', 'walkaroo', 'men-footwear', 'men', 570, 750, { sizes: SHOE_SIZES }),
  P('treadvibe-exclusive-rubber-sole-lace-up-sneaker-for-men-black-x-white', 'TreadVibe Exclusive Rubber Sole Lace-Up Sneaker — Black x White', 'treadvibe', 'men-footwear', 'men', 999, 1890, { sizes: SHOE_SIZES, featured: true, trending: true }),
  P('walkaroo-blue-flip-flops-for-mens', 'Walkaroo Blue Flip Flops for Men', 'walkaroo', 'men-footwear', 'men', 690, 800, { sizes: SHOE_SIZES }),
  P('genuine-leather-premium-sacchi-casual-shoes-chocolate', 'Genuine Leather Premium Sacchi Casual Shoes — Chocolate', 'leecooper', 'men-footwear', 'men', 1250, 1790, { sizes: SHOE_SIZES, featured: true }),
  P('adda-trendy-black-casual-slippers-for-men', 'Adda Trendy Black Casual Slippers for Men', 'adda', 'men-footwear', 'men', 670, 799, { sizes: SHOE_SIZES }),
  P('poedaagar-premium-luminous-hands-ladies-maroon-watch', 'Poedaagar Premium Luminous Hands Ladies Maroon Watch', 'head-gear', 'women-fashion-accessories', 'women', 1490, 2490, { featured: true }),
  P('raindrop-glass-bangles-golden', 'Raindrop Glass Bangles — Golden', 'zays', 'jewellery', 'women', 500, 610),
  P('crystal-crescent-traditional-bangles-for-women-ash', 'Crystal Crescent Traditional Bangles for Women — Ash', 'zays', 'jewellery', 'women', 500, 610),
  P('chunky-gold-puffed-heart-pendant-necklace', 'Chunky Gold Puffed Heart Pendant Necklace', 'zays', 'jewellery', 'women', 1290, 1470, { trending: true }),
  P('cat-eye-planets-stylish-necklace-for-girls-or-women-2-pcs', 'Cat Eye Planets Stylish Necklace for Girls or Women — 2 Pcs', 'zays', 'jewellery', 'women', 599, 790),
  P('trendy-k-style-corduroy-cosmetic-toiletry-bag-pink', 'Trendy K-Style Corduroy Cosmetic Toiletry Bag — Pink', 'zays', 'women-bags', 'women', 490, 590),
  P('china-mash-fabrics-polo-t-shirt-for-men-navy-blue', 'China Mash Fabrics Polo T-Shirt for Men — Navy Blue', 'zays', 'men-topwear', 'men', 490, 650, { sizes: CLOTH_SIZES }),
  P('adda-exclusive-ring-toe-maroon-sandal-for-men', 'Adda Exclusive Ring Toe Sandal for Men — Maroon', 'adda', 'men-footwear', 'men', 670, 799, { sizes: SHOE_SIZES }),
  P('treadvibe-trp-rubber-sole-lace-up-sneaker-for-men-black', 'TreadVibe TRP Rubber Sole Lace-Up Sneaker for Men — Black', 'treadvibe', 'men-footwear', 'men', 1099, 1890, { sizes: SHOE_SIZES }),
  P('intex-exclusive-black-sandals-for-men', 'Intex Exclusive Black Sandals for Men', 'govaly-essentials', 'men-footwear', 'men', 649, 699, { sizes: SHOE_SIZES }),
  P('zuqo-suede-fabric-drip-olive-premium-sneaker-for-men', "Zuqo Suede Fabric Drip Olive Premium Sneaker for Men", 'diagram', 'men-footwear', 'men', 1300, 1590, { sizes: SHOE_SIZES }),
  P('walkaroo-brown-sandal-for-mens', 'Walkaroo Brown Sandal for Men', 'walkaroo', 'men-footwear', 'men', 570, 750, { sizes: SHOE_SIZES }),
  P('gillette-fusion-manual-shaving-razor-blades-6s-pack-cartridge', 'Gillette Fusion Manual Shaving Razor Blades 6s Pack Cartridge', 'gillette', 'health-beauty', 'health-beauty', 2490, 2950, {}),
  P('treadvibe-ww-ash-rubber-sole-fashionable-sneaker-for-men', 'TreadVibe WW Ash Rubber Sole Fashionable Sneaker for Men', 'treadvibe', 'men-footwear', 'men', 999, 1890, { sizes: SHOE_SIZES, trending: true }),
  P('dioor-imported-ash-slide-for-men-china', "Men's Imported Lightweight Ash Slide — Dioor", 'diagram', 'men-footwear', 'men', 500, 1090, { sizes: SHOE_SIZES }),
  P('walkaroo-soft-cushion-brown-sandal-for-mens', 'Walkaroo Soft Cushion Brown Sandal for Men', 'walkaroo', 'men-footwear', 'men', 590, 890, { sizes: SHOE_SIZES }),
  P('bowling-premium-cross-panther-slides-for-men-black', 'Bowling Premium Cross Panther Slides for Men — Black', 'lotto-bangladesh', 'men-footwear', 'men', 1799, 2049, { sizes: SHOE_SIZES }),
  P('fogg-men-spray-scent-czar-perfume-30ml', 'FOGG Men Spray Scent Czar Perfume 30ml', 'beauty-mart', 'health-beauty', 'health-beauty', 499, 780, {}),

  // ============================ WOMEN ============================
  P('imported-floral-embroidery-mesh-fabric-maroon-bra-panty-set-pink', 'Imported Floral Embroidery Mesh Fabric Set — Maroon x Pink', 'zays', 'women-fashion-wear', 'women', 854, 1299, { sizes: ['M', 'L', 'XL', 'XXL'] }),
  P('two-piece-stitched-maroon-micro-stretch-fabric', 'Two Piece Stitched Maroon Micro Stretch Fabric', 'zays', 'women-fashion-wear', 'women', 1050, 1400, { sizes: CLOTH_SIZES }),
  P('imported-skirt-cut-suspender-butterfly-fancy-nighty-dark', 'Imported Skirt Cut Suspender Butterfly Fancy Nighty — Dark', 'zays', 'women-fashion-wear', 'women', 899, 1049, { sizes: ['Free Size'] }),
  P('front-open-butterfly-bra-panty-set-deep-maroon', 'Front Open Butterfly Set — Deep Maroon', 'zays', 'women-fashion-wear', 'women', 719, 949, { sizes: ['M', 'L', 'XL'] }),
  P('pakistani-maria-unstitched-dull-orange-three-piece', 'Pakistani Maria B Unstitched Three Piece — Dull Orange', 'zays', 'women-fashion-wear', 'women', 13375, 15000, { sizes: ['Unstitched'], featured: true }),
  P('embroidered-three-piece-set-for-women', 'Embroidered Three Piece Set for Women', 'zays', 'women-fashion-wear', 'women', 1490, 1600, { sizes: CLOTH_SIZES, trending: true }),
  P('karchupi-embroidered-three-piece', 'Karchupi Embroidered Three Piece', 'zays', 'women-fashion-wear', 'women', 1490, 1600, { sizes: CLOTH_SIZES }),
  P('karchupi-embroidered-three-piece-red-brown', 'Karchupi Embroidered Three Piece — Red Brown', 'zays', 'women-fashion-wear', 'women', 1490, 1600, { sizes: CLOTH_SIZES }),
  P('pakistani-rang-nagar-by-nur-pastel-hue', 'Pakistani Rang Nagar by Nur — Pastel Hue', 'zays', 'women-fashion-wear', 'women', 3650, 3990, { sizes: ['Unstitched'] }),
  P('rahq-lace-trim-tight-fitting-bustier-crop-corset-top-brown', 'RAHQ Lace Trim Bustier Crop Corset Top — Brown', 'zays', 'women-fashion-wear', 'women', 1990, 2400, { sizes: ['S', 'M', 'L'] }),
  P('luxury-chiffon-party-three-piece-for-women', 'Luxury Chiffon Party Three Piece for Women', 'zays', 'women-fashion-wear', 'women', 4000, 4500, { sizes: CLOTH_SIZES }),
  P('pakistani-maria-b-lawn-unstitched-three-piece-purple', 'Pakistani Maria B Lawn Unstitched Three Piece — Purple', 'zays', 'women-fashion-wear', 'women', 10950, 13700, { sizes: ['Unstitched'] }),
  P('pakistani-stitched-three-piece-wine-berry', 'Pakistani Stitched Three Piece — Wine Berry', 'zays', 'women-fashion-wear', 'women', 8500, 9500, { sizes: CLOTH_SIZES }),
  P('firerie-black-and-red-mesh-overlay-strapless-tie-hem-mini-dress', 'Firerie Black & Red Mesh Overlay Strapless Mini Dress', 'zays', 'women-fashion-wear', 'women', 2990, 3400, { sizes: ['S', 'M', 'L'] }),
  P('traditional-block-print-saree-for-women-angon', 'Traditional Block Print Saree for Women — Angon', 'zays', 'women-fashion-wear', 'women', 1320, 1500, { sizes: ['Free Size'], trending: true }),
  P('shein-mod-elegant-solid-color-versatile-halter-neck-top-burgundy', 'SHEIN MOD Elegant Halter Neck Top — Burgundy', 'zays', 'women-fashion-wear', 'women', 990, 1400, { sizes: ['S', 'M', 'L'] }),
  P('floral-embroidery-premium-bra-panty-set-purple-china', 'Floral Embroidery Premium Set — Purple', 'zays', 'women-fashion-wear', 'women', 889, 999, { sizes: ['M', 'L', 'XL'] }),

  // ============================ KIDS ============================
  P('imported-pu-leather-floral-green-girl-suit-china', 'Imported PU Leather Floral Green Girl Suit', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1380, 1690, { sizes: KID_SIZES, trending: true }),
  P('unicorn-magic-dark-purple-t-shirt-for-little-dreamers', 'Unicorn Magic Dark Purple T-Shirt for Little Dreamers', 'govaly-essentials', 'kids-girls-clothing', 'kids', 499, 600, { sizes: KID_SIZES }),
  P('casual-red-checked-print-frock-for-kids', 'Casual Red Checked Print Frock for Kids', 'govaly-essentials', 'kids-girls-clothing', 'kids', 899, 1249, { sizes: KID_SIZES, trending: true }),
  P('casual-peach-sleevless-frock-for-kids', 'Casual Peach Sleeveless Frock for Kids', 'govaly-essentials', 'kids-girls-clothing', 'kids', 799, 1449, { sizes: KID_SIZES }),
  P('fashionable-red-bows-frock-for-kids', 'Fashionable Red Bows Frock for Kids', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1699, 2099, { sizes: KID_SIZES, featured: true }),
  P('hand-crafted-cotton-red-work-kameez-pajama-set', 'Hand Crafted Cotton Red Work Kameez Pajama Set', 'govaly-essentials', 'kids-boys-clothing', 'kids', 690, 849, { sizes: KID_SIZES }),
  P('imported-white-princess-puffy-satin-tulle-party-gown', 'Imported White Princess Puffy Satin Tulle Party Gown', 'govaly-essentials', 'kids-girls-clothing', 'kids', 2950, 3200, { sizes: KID_SIZES }),
  P('imported-bow-tops-shorts-set-black-x-white', 'Imported Bow Tops & Shorts Set — Black x White', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1790, 2500, { sizes: KID_SIZES }),
  P('girls-red-floral-printed-top-pant-set', 'Girls Red Floral Printed Top Pant Set', 'govaly-essentials', 'kids-girls-clothing', 'kids', 600, 850, { sizes: KID_SIZES }),
  P('imported-brown-tops-white-pant-with-hat-set', 'Imported Brown Tops White Pant with Hat Set', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1280, 1600, { sizes: KID_SIZES }),
  P('imported-floral-ruffle-party-dress-dust-storm', 'Imported Floral Ruffle Party Dress — Dust Storm', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1050, 1460, { sizes: KID_SIZES }),
  P('imported-bow-print-layered-party-dress-china', 'Imported Bow Print Layered Party Dress', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1880, 2400, { sizes: KID_SIZES }),
  P('imported-baby-tops-denim-set-black', 'Imported Kids Tops & Denim Set — Black', 'govaly-essentials', 'kids-girls-clothing', 'kids', 2080, 2400, { sizes: KID_SIZES }),
  P('imported-3d-flower-summer-princess-dress-white', 'Imported 3D Flower Summer Princess Dress — White', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1480, 2000, { sizes: KID_SIZES }),
  P('soft-stylish-fit-minimalist-peach-party-dress-for-girls', 'Soft & Stylish Fit Minimalist Peach Party Dress for Girls', 'govaly-essentials', 'kids-girls-clothing', 'kids', 850, 1490, { sizes: KID_SIZES }),
  P('imported-pastel-floral-tops-bubble-pant-with-hat', 'Imported Pastel Floral Tops Bubble Pant with Hat', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1980, 2200, { sizes: KID_SIZES }),
  P('imported-red-butterfly-applique-balloon-dress', 'Imported Red Butterfly Applique Balloon Dress', 'govaly-essentials', 'kids-girls-clothing', 'kids', 1550, 1800, { sizes: KID_SIZES }),

  // ============================ BABY ============================
  P('red-spiderman-baby-t-shirt-and-pant-set', 'Red Spiderman Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES, trending: true }),
  P('minecraft-casual-white-wear-set', 'Minecraft Casual White Wear Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 590, 720, { sizes: BABY_SIZES }),
  P('rabbit-baby-t-shirt-and-pant-set', 'Rabbit Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES }),
  P('love-cat-baby-t-shirt-and-pant-set', 'Love Cat Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES }),
  P('casual-sand-baby-t-shirt-and-pant-set', 'Casual Sand Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 380, { sizes: BABY_SIZES }),
  P('black-x-white-baby-t-shirt-and-pant-set', 'Black X White Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES }),
  P('animal-design-red-baby-t-shirt-and-pant-set', 'Animal Design Red Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES }),
  P('little-boss-baby-t-shirt-and-pant-set', 'Little Boss Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES }),
  P('bynnus-baby-t-shirt-and-pant-set', 'Bynnus Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES }),
  P('baby-t-shirt-pant-set-of-4-pcs-combo-4', 'Baby T-Shirt & Pant Set of 4 Pcs — Combo 4', 'govaly-essentials', 'baby-clothing-set', 'baby', 490, 590, { sizes: BABY_SIZES }),
  P('dinosaur-baby-t-shirt-and-pant-set', 'Dinosaur Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 380, { sizes: BABY_SIZES }),
  P('black-butterfly-baby-girls-t-shirt-and-full-pant-set', "Black Butterfly Baby Girl's T-Shirt and Full Pant Set", 'govaly-essentials', 'baby-clothing-set', 'baby', 300, 600, { sizes: BABY_SIZES }),
  P('pink-butterfly-baby-girls-t-shirt-and-full-pant-set', "Pink Butterfly Baby Girl's T-Shirt and Full Pant Set", 'govaly-essentials', 'baby-clothing-set', 'baby', 300, 600, { sizes: BABY_SIZES }),
  P('flip-tiger-orange-kids-t-shirt-pant-set', 'Flip Tiger Orange Kids T-Shirt Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 350, 400, { sizes: BABY_SIZES }),
  P('nasa-paste-color-kids-set', 'NASA Paste Color Kids Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 570, 800, { sizes: BABY_SIZES }),
  P('baby-boys-ash-t-shirt-striped-shorts-set', 'Baby Boys Ash T-Shirt Striped Shorts Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 400, 650, { sizes: BABY_SIZES }),
  P('panda-baby-t-shirt-and-pant-set', 'Panda Baby T-Shirt and Pant Set', 'govaly-essentials', 'baby-clothing-set', 'baby', 280, 400, { sizes: BABY_SIZES }),
  P('mini-racer-yellow-t-shirt-set', 'Mini Racer Yellow T-Shirt Set — Speedy Style for Little Champs', 'govaly-essentials', 'baby-clothing-set', 'baby', 780, 1090, { sizes: BABY_SIZES }),
  P('baby-t-shirt-pant-set-of-4-pcs-combo', 'Baby T-Shirt & Pant Set of 4 Pcs — Combo', 'govaly-essentials', 'baby-clothing-set', 'baby', 490, 590, { sizes: BABY_SIZES }),
  P('baby-t-shirt-pant-set-of-4-pcs-combo-3', 'Baby T-Shirt & Pant Set of 4 Pcs — Combo 3', 'govaly-essentials', 'baby-clothing-set', 'baby', 490, 590, { sizes: BABY_SIZES }),

  // ======================== HEALTH & BEAUTY ========================
  P('johnsons-body-care-24hour-lasting-moisture-body-lotion-400ml', "Johnson's Body Care 24h Moisture Body Lotion 400ml", 'beauty-mart', 'health-beauty', 'health-beauty', 1299, 1699, { trending: true }),
  P('roger-gallet-open-edt-for-men-100ml', 'Roger & Gallet Open EDT for Men 100ml', 'beauty-mart', 'health-beauty', 'health-beauty', 1499, 1899, {}),
  P('pears-transparent-pure-gentle-soap-125g-x-2pcs', 'Pears Transparent Pure & Gentle Soap 125g x 2 Pcs', 'beauty-mart', 'health-beauty', 'health-beauty', 699, 799, {}),
  P('himalaya-softness-shine-hair-cream-140ml', 'Himalaya Softness & Shine Hair Cream with Olive Oil 140ml', 'beauty-mart', 'health-beauty', 'health-beauty', 599, 750, {}),
  P('kota-cosmetics-metal-hair-color-ash-grey', 'Kota Cosmetics Metal Hair Color — Ash Grey', 'beauty-mart', 'health-beauty', 'health-beauty', 999, 1079, {}),
  P('gillette-blue-ii-disposable-razor-12-pcs', 'Gillette Blue II Disposable Razor — 12 Pcs Combo', 'gillette', 'health-beauty', 'health-beauty', 849, 950, {}),
  P('vicks-vaporub-ointment-germany-100gm', 'Vicks Vaporub Ointment Germany 100gm', 'beauty-mart', 'health-beauty', 'health-beauty', 799, 860, {}),
  P('3w-crystal-white-milky-vitamin-essence-150ml', '3W Crystal White Milky Vitamin Essence 150ml', 'beauty-mart', 'health-beauty', 'health-beauty', 1600, 1800, {}),
  P('simple-kind-to-skin-vital-vitamin-day-cream-spf-15', 'Simple Kind To Skin Vital Vitamin Day Cream SPF-15 50ml', 'beauty-mart', 'health-beauty', 'health-beauty', 480, 590, {}),
  P('matana-angel-rose-drop-serum-30ml', 'Matana Angel Rose Drop Serum 30ml — Thailand', 'beauty-mart', 'health-beauty', 'health-beauty', 800, 900, {}),
  P('bioaqua-milk-body-lotion-250ml', 'Bioaqua Milk Body Lotion 250ml — China', 'beauty-mart', 'health-beauty', 'health-beauty', 790, 900, {}),
  P('nobel-lady-day-cream-peptides-50g', 'Nobel Lady Day Cream Peptides Hydra Cream 50g', 'beauty-mart', 'health-beauty', 'health-beauty', 990, 1100, {}),
  P('mooyam-glutathione-whitening-serum-30ml', 'Mooyam Glutathione Whitening Serum Plus 2% 30ml', 'beauty-mart', 'health-beauty', 'health-beauty', 500, 600, {}),
  P('technic-mega-lash-volumising-mascara-14ml', 'Technic Mega Lash Volumising Mascara 14ml — UK', 'beauty-mart', 'health-beauty', 'health-beauty', 490, 590, {}),
  P('indulekha-bringha-hair-oil-100ml', 'Indulekha Bringha Hair Oil 100ml — India', 'beauty-mart', 'health-beauty', 'health-beauty', 610, 880, {}),
  P('melasma-breakdown-face-serum-40ml', 'Melasma Breakdown Face Serum 40ml — Thailand', 'beauty-mart', 'health-beauty', 'health-beauty', 650, 710, {}),
  P('royal-mirage-sport-eau-de-cologne-120ml', 'Royal Mirage Sport Eau de Cologne Spray 120ml', 'beauty-mart', 'health-beauty', 'health-beauty', 1800, 2100, {}),
  P('armaf-odyssey-mega-body-spray-200ml', 'ARMAF Odyssey Mega Body Spray for Men 200ml', 'beauty-mart', 'health-beauty', 'health-beauty', 699, 1250, {}),
  P('paxmoly-stretch-marks-therapy-cream-70ml', 'Paxmoly Stretch Marks Therapy Cream 70ml — Korea', 'beauty-mart', 'health-beauty', 'health-beauty', 1000, 1100, {}),
];

export const SELLERS = [
  { name: 'Govaly Retail', slug: 'govaly-retail' },
  { name: 'Trendy Hub BD', slug: 'trendy-hub-bd' },
  { name: 'Dhaka Fashion House', slug: 'dhaka-fashion-house' },
  { name: 'Baby & Kids Zone', slug: 'baby-kids-zone' },
  { name: 'Glow Beauty House', slug: 'glow-beauty-house' },
];

// Deterministic pseudo-random from slug so seed data is stable between runs.
export function hashRand(str, min, max) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h % 1000) / 1000;
  return Math.round(min + n * (max - min));
}

