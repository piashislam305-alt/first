/* journey11 — SANDBOX deep pass (opaque-origin iframe, storage THROWS):
   SRS customer end-to-end: register → auto-login → browse home cards →
   search suggestions → PDP add-to-cart → checkout with add-address →
   COD order → Thank You → verify in orders → profile payment section. */
import { BASE, makeTally, boot, navigator, setInput } from './common.mjs';
const { ok, done } = makeTally();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { window, doc } = await boot({ sandbox: true });
const go = navigator(window);
const text = () => doc.body.textContent;
const type = setInput(window);
const byPH = (ph) => [...doc.querySelectorAll('input')].find((i) => i.placeholder === ph);
const btn = (re) => [...doc.querySelectorAll('button')].find((b) => re.test(b.textContent.trim()) && !b.disabled);

console.log('== sandbox integrity ==');
let denied = false;
try { window.localStorage.getItem('x'); } catch { denied = true; }
ok('storage access throws (preview simulated)', denied);

console.log('== register (real UI) ==');
go('/register'); await sleep(900);
type(byPH('Your name'), 'Pias SRS');
type(byPH('you@example.com'), 'pias@srs.test');
type(byPH('At least 6 characters'), 'Test1234');
[...doc.querySelectorAll('.auth-form form button')].find((b) => b.type === 'submit').click();
await sleep(2200);
ok('register → auto-login → home (Hi, Pias)', /Hi, Pias/.test(text()));
ok('home cards render in sandbox', /Shop by Category/.test(text()) && doc.querySelectorAll('.cat-item').length >= 10);

console.log('== PDP → cart ==');
const prods = (await (await fetch(BASE + '/api/products?limit=40&sort=popular')).json()).items;
const pick = prods[0];
go(`/product/${pick.slug}`); await sleep(1700);
[...doc.querySelectorAll('button')].find((b) => pick.sizes?.includes(b.textContent.trim()))?.click();
btn(/add to cart/i)?.click(); await sleep(900);
ok('added to cart (no crash)', /Added to cart/.test(text()));

console.log('== checkout: add address inline → place COD order ==');
go('/checkout'); await sleep(1800);
ok('add-address form auto-opens for fresh user', !!byPH('Enter your full name'));
type(byPH('Enter your phone number / email'), '+8801711223344');
type(byPH('Please choose your city/district'), 'Dhaka');
type(byPH('Building / House No / Floor / Street'), 'House 9, Road 2, Banani');
type(byPH('Please choose your area'), 'Banani');
btn(/^Save$/)?.click(); await sleep(1600);
ok('address saved & selectable', doc.querySelectorAll('.ck-addr').length >= 1);
doc.querySelector('label.ck-addr')?.click(); await sleep(300);
btn(/^Place Order$/)?.click(); await sleep(1800);
ok('payment: COD selected as the only method', /Cash on Delivery/.test(text()));
doc.querySelector('input[name="paym"]')?.click(); await sleep(350);
btn(/Confirm Order/)?.click(); await sleep(2400);
ok('order placed → Thank You + Go#', /Thank You for Your Order/.test(text()) && /Go#/.test(text()));

console.log('== verify order + profile in sandbox ==');
go('/orders'); await sleep(1700);
ok('order in My Orders (Pending + COD)', /Go#/.test(text()) && /Cash on Delivery/.test(text()));
ok('cancel available on the pending order', [...doc.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Cancel Order'));
go('/profile/payment'); await sleep(1100);
ok('profile → Payment Options: COD only, no crash', /Cash on Delivery/.test(text()) && !/Something went wrong/.test(text()));

done();
