/* journey8 — SRS auth + purchase funnel through the REAL UI (sandbox mode: opaque-origin
   storage that throws — exactly like the preview iframe):
   register → logout → wrong password → login → PDP → cart → checkout (COD) →
   place order → Thank You (Go#) → orders shows it. */
import { BASE, makeTally, boot, navigator, setInput } from './common.mjs';
const { ok, done } = makeTally();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { window, doc } = await boot({ sandbox: true });
const go = navigator(window);
const text = () => doc.body.textContent;
const type = setInput(window);
const byPH = (ph) => [...doc.querySelectorAll('input')].find((i) => i.placeholder === ph);
const btn = (re) => [...doc.querySelectorAll('button')].find((b) => re.test(b.textContent.trim()) && !b.disabled);
const submitAuth = () => [...doc.querySelectorAll('.auth-form form button')].find((b) => b.type === 'submit');

console.log('== guest gates (SRS: cart/wishlist/order/review need login) ==');
const prods = (await (await fetch(BASE + '/api/products?limit=40&sort=popular')).json()).items;
const pick = prods[0];
go('/checkout'); await sleep(900);
ok('guest /checkout → bounced to /login', window.location.pathname === '/login');
go(`/product/${pick.slug}`); await sleep(1700);
ok('guest PDP shows Login-to-review (no form)', /Login to review/.test(text()) && !doc.querySelector('.rform textarea'));
btn(/add to cart/i)?.click(); await sleep(900);
ok('guest Add to Cart → bounced to /login', window.location.pathname === '/login');

console.log('== register ==');
go('/register'); await sleep(900);
type(byPH('Your name'), 'SRS Tester');
type(byPH('you@example.com'), `srs-${Date.now()}@test.com`);
type(byPH('At least 6 characters'), 'Test1234');
submitAuth().click(); await sleep(2200);
ok('register → auto-login (Hi, SRS)', /Hi, SRS/.test(text()));

console.log('== no OTP / forgot anywhere ==');
go('/login'); await sleep(700);
// log out first via profile
go('/profile'); await sleep(1200);
[...doc.querySelectorAll('button, a')].find((b) => /Log Out/.test(b.textContent))?.click(); await sleep(1200);
go('/login'); await sleep(800);
ok('login has no OTP / Forgot Password', !!q_pwd() && !/OTP|Forgot Password/i.test(text()));
function q_pwd() { return doc.querySelector('input[type="password"]'); }

console.log('== login: wrong password then correct ==');
type(doc.querySelector('input[type="email"]'), 'demo@govaly.test');
type(q_pwd(), 'Nope123');
submitAuth().click(); await sleep(1600);
ok('wrong password → error shown', /invalid|incorrect|wrong|failed/i.test(text()));
type(q_pwd(), 'Demo1234');
submitAuth().click(); await sleep(2100);
ok('correct login → home', /Hi, Demo/.test(text()));

console.log('== PDP → Add to Cart (sandbox, authed) ==');
go(`/product/${pick.slug}`); await sleep(1700);
ok('PDP: gallery + swatches, NO share row', doc.querySelectorAll('.pdp-thumb').length >= 1 && !doc.querySelector('.share-row'));
const sizeBtn = [...doc.querySelectorAll('button')].find((b) => pick.sizes?.includes(b.textContent.trim()));
sizeBtn?.click(); await sleep(250);
btn(/add to cart/i)?.click(); await sleep(900);
ok('added to cart', /Added to cart/.test(text()));

console.log('== cart ==');
go('/cart'); await sleep(1200);
ok('cart line + totals', text().includes(pick.name) && /Total Product Price/.test(text()));
[...doc.querySelectorAll('button, a')].find((b) => /checkout/i.test(b.textContent.trim()))?.click();
await sleep(1800);
ok('checkout reached (address + Place Order, no voucher panel)', /Place Order/.test(text()) && !/Apply a Voucher/i.test(text()));

console.log('== place COD order ==');
q_addr()?.click(); await sleep(400);
function q_addr() { return doc.querySelector('label.ck-addr'); }
btn(/^Place Order$/)?.click(); await sleep(1800);
ok('payment step: COD only', /Cash on Delivery/.test(text()) && !/bKash|Nagad|SSLCommerz/i.test(text()));
doc.querySelector('input[name="paym"]')?.click(); await sleep(350);
btn(/Confirm Order/)?.click(); await sleep(2400);
ok('order placed → Thank You + Go# + COD note', /Thank You for Your Order/.test(text()) && /Go#/.test(text()) && /Cash on Delivery/.test(text()));

console.log('== order appears in My Orders ==');
go('/orders'); await sleep(1700);
ok('new order visible (Pending, COD, Track)', /Go#/.test(text()) && /Cash on Delivery/.test(text()) && !!doc.querySelector('.otrack'));

done();
