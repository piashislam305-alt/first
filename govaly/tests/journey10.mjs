/* journey10 — SRS all-pages sweep: every remaining route renders real DB data,
   removed routes are gone, profile menu simplified, guards intact. */
import { BASE, makeTally, boot, navigator } from './common.mjs';
const { ok, done } = makeTally();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const home = await (await fetch(BASE + '/api/home')).json();
const prods = (await (await fetch(BASE + '/api/products?limit=40&sort=popular')).json()).items;
const catsArr = home.categories || [];
const parent = catsArr.find((c) => c.isParent) || catsArr[0];
const sub = catsArr.find((c) => !c.isParent) || catsArr[0];
const sellers = (await (await fetch(BASE + '/api/sellers')).json()).sellers;

const { window, doc } = await boot();
const go = navigator(window);
const text = () => doc.body.textContent;

console.log('== core browse pages ==');
go('/'); await sleep(1400);
ok('home: sub-category cards + tabs + grid', /Shop by Category/.test(text()) && doc.querySelectorAll('.cat-item').length >= 10 && doc.querySelectorAll('.pcard').length >= 8);
go('/products'); await sleep(1400);
ok('/products listing: Filters + Sort + ৳', /Filters/.test(text()) && /Sort:/.test(text()) && /৳/.test(text()));
go(`/category/${sub?.slug}`); await sleep(1500);
ok(`/category/${sub?.slug} renders`, doc.body.textContent.length > 200 && /৳/.test(text()));
go(`/seller/${sellers[0]?.slug}`); await sleep(1500);
ok('/seller/:slug renders products', /৳/.test(text()));
const slug = prods[0]?.slug;
go(`/product/${slug}`); await sleep(1600);
ok('/product/:slug renders gallery + ATC', doc.querySelectorAll('.pdp-thumb').length >= 1 && /Add to Cart/i.test(text()));

console.log('== cart & checkout shells ==');
go('/cart'); await sleep(1000);
ok('/cart renders (empty state OK)', /cart is empty|Total Product Price/i.test(text()));
go('/checkout'); await sleep(1600);
ok('/checkout renders address flow (authed)', /Place Order|Add Address|delivery/i.test(text()));

console.log('== profile (SRS menu) ==');
go('/profile'); await sleep(1500);
ok('profile menu: Orders/Wishlist/Addresses/Payment/Account/Setting/Helpline', /My Orders/.test(text()) && /My Wishlist/.test(text()) && /My Addresses/.test(text()) && /Payment Options/.test(text()) && /Account Information/.test(text()) && /Govaly Helpline/.test(text()));
ok('NO Points / Platinum / Voucher anywhere', !/Platinum|🎟|Points/.test(text()));
go('/profile/payment'); await sleep(1100);
ok('Payment Options → COD only', /Cash on Delivery/.test(text()) && /ONLY METHOD/.test(text()) && !/bKash|Nagad/i.test(text()));

console.log('== wishlist / auth ==');
go('/wishlist'); await sleep(1000);
ok('/wishlist renders', /wishlist|No saved/i.test(text()));
// boot() logs demo in — /login & /register must now bounce to home (form hidden when authed)
go('/login'); await sleep(900);
ok('login hidden when already signed in → home', window.location.pathname === '/' && /Shop by Category/.test(text()));
go('/register'); await sleep(900);
ok('register hidden when already signed in → home', window.location.pathname === '/' && /Shop by Category/.test(text()));
function byPH(ph) { return [...doc.querySelectorAll('input')].find((i) => i.placeholder === ph); }

console.log('== info pages ==');
const INFOS = { about: 'About Govaly', contact: 'Contact Us', faq: 'Frequently Asked Questions', returns: 'Returns & Refunds', shipping: 'Shipping Policy', terms: 'Terms & Conditions', privacy: 'Privacy Policy' };
for (const [path, title] of Object.entries(INFOS)) {
  go('/' + path); await sleep(600);
  ok(`/${path} → "${title}"`, text().includes(title));
}

console.log('== removed routes are gone ==');
for (const dead of ['/vouchers', '/chat', '/campaigns/beauty-fest', '/brand/leecooper', '/careers', '/become-a-seller', '/app']) {
  go(dead); await sleep(600);
  ok(`${dead} → 404 page`, /404|not found|unexpected/i.test(text()));
}

console.log('== guards & errors ==');
go('/admin'); await sleep(1100);
ok('/admin blocked for customer (bounced away from /admin)', window.location.pathname !== '/admin');
go('/ufo-journey10'); await sleep(700);
ok('404 page', /404|not found|unexpected/i.test(text()));
go('/503'); await sleep(600);
ok('503 page', /503|server/i.test(text()));

console.log('== bottom nav (4 items, no chat) ==');
go('/'); await sleep(900);
const bn = [...doc.querySelectorAll('.bottom-nav .bn-item')].map((b) => b.textContent.trim());
ok('bottom nav = Home/Category/Cart/Profile', JSON.stringify(bn) === JSON.stringify(['Home', 'Category', 'Cart', 'Profile']));

done();
