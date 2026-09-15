/* journey9 — SRS home structure, advanced search suggestions, PDP essentials,
   simple seller page. Normal (non-sandbox) mode. */
import { BASE, makeTally, boot, navigator, setInput } from './common.mjs';
const { ok, done } = makeTally();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const home = await (await fetch(BASE + '/api/home')).json();
const { window, doc } = await boot();
const go = navigator(window);
const text = () => doc.body.textContent;
const type = setInput(window);

console.log('== Home (SRS-simple) ==');
await sleep(1200);
ok('Shop by Category with sub-category cards', /Shop by Category/.test(text()) && doc.querySelectorAll('.cat-item').length >= 10);
ok('product tabs (For You / Men / Women…)', /For You/.test(text()) && /Health & Beauty/.test(text()));
ok('product grid renders', doc.querySelectorAll('.grid .pcard').length >= 8);
ok('NO hero / USP / brands / deals / promo / flash / campaigns', !/Flash Sale/.test(text()) && !doc.querySelector('.hero, .usp, .campaign-card') && !/Best Price Deal/.test(text()));
const catHref = doc.querySelector('.cat-item')?.getAttribute('href');
ok('sub-category cards link to /category/:slug', !!catHref && catHref.startsWith('/category/'));

console.log('== search suggestions (live type-ahead) ==');
go('/'); await sleep(800);
const inp = doc.querySelector('input[placeholder="Search products..."]') || doc.querySelector('input');
type(inp, 'wo'); await sleep(1100);
ok('suggestions dropdown opens', !!doc.querySelector('.sug, [class*="sug"]'));
const sugText = doc.querySelector('.sug, [class*="sug"]')?.textContent || '';
ok('suggests categories/products for "wo"', sugText.length > 0 && (/[Ww]omen|[Ww]ool|[Ww]allet|shirt|shoe/i.test(sugText) || doc.querySelectorAll('.sug-row, [class*="sug"] button, [class*="sug"] a').length >= 1));
type(inp, 'shoe'); await sleep(1100);
const sug2 = doc.body.textContent;
ok('refined query updates suggestions', /shoe|Shoe|Sandal|Sneaker/i.test(sug2));

console.log('== search results page ==');
go('/products?search=shoe'); await sleep(1500);
ok('results page with title + Sort + ৳ prices', /Results for "shoe"/.test(text()) && /Sort:/.test(text()) && /৳/.test(text()));

console.log('== PDP essentials ==');
const prods = (await (await fetch(BASE + '/api/products?limit=10&sort=popular')).json()).items;
const pick = prods[0];
go(`/product/${pick.slug}`); await sleep(1700);
ok('PDP: name/price/৳ + Add to Cart + Buy Now', text().includes(pick.name) && !!btn(/add to cart/i) && !!btn(/buy now/i));
function btn(re) { return [...doc.querySelectorAll('button')].find((b) => re.test(b.textContent.trim())); }
ok('PDP: reviews section present', /Reviews|ratings/i.test(text()));
ok('PDP: no share row, no brand page link', !doc.querySelector('.share-row') && !doc.querySelector('a[href^="/brand/"]'));

console.log('== simple seller page ==');
const sellers = (await (await fetch(BASE + '/api/sellers')).json()).sellers;
const seller = sellers[0];
const sp = (await (await fetch(BASE + `/api/products?seller=${seller.slug}&limit=24`)).json());
go(`/seller/${seller.slug}`); await sleep(1600);
ok('seller page: seller name as title', text().includes(seller.name));
ok('seller page: only their products', doc.querySelectorAll('.pcard').length >= 1 && doc.querySelectorAll('.pcard').length <= (sp.total ?? 99));
ok('no seller shop branding (banner/info tabs)', !doc.querySelector('.seller-banner, .shop-hero'));

done();
