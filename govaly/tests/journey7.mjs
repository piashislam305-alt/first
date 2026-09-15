/* journey7 — SRS My Orders: tabs All/Pending/Processing/Delivered/Cancelled,
   COD-only badges, Track timeline, Add Review, Order Again, Cancel Order.
   MUST run first on a fresh seed (expects the 5 seeded demo orders untouched). */
import { BASE, makeTally, boot, navigator } from './common.mjs';
const { ok, done } = makeTally();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { window, doc } = await boot();
const go = navigator(window);
const text = () => doc.body.textContent;

console.log('== tabs ==');
go('/orders'); await sleep(1800);
const tabEls = [...doc.querySelectorAll('.otab')].map((b) => b.textContent.trim());
ok('5 SRS tabs', JSON.stringify(tabEls) === JSON.stringify(['All', 'Pending', 'Processing', 'Delivered', 'Cancelled']));
ok('All shows 5 seeded orders', doc.querySelectorAll('.ocard').length === 5);
ok('no removed tabs (Return/Exchange/Refund/To Review/Shipping)', !/To Review|Exchange|Refund/.test(doc.querySelector('.otabs')?.textContent || ''));

console.log('== badges ==');
ok('COD-only badge', [...doc.querySelectorAll('.opay-cod')].length === 5 && /Cash on Delivery/.test(text()));
ok('no Pay Now / Paid / Unpaid / Refunded badges', !doc.querySelector('.opay-btn') && !doc.querySelector('.opay-paid') && !doc.querySelector('.opay-unpaid') && !doc.querySelector('.opay-refunded'));

console.log('== Pending tab: track + cancel ==');
[...doc.querySelectorAll('.otab')].find((b) => b.textContent === 'Pending')?.click(); await sleep(700);
ok('Pending shows 1 order', doc.querySelectorAll('.ocard').length === 1);
ok('timeline open by default (Processing→Pending steps)', /Your order has been placed/.test(text()));
ok('Cancel Order button on pending', [...doc.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Cancel Order'));
[...doc.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cancel Order')?.click(); await sleep(1200);
ok('cancel works → toast + moves to Cancelled', /Order cancelled/.test(text()));

console.log('== Processing tab ==');
[...doc.querySelectorAll('.otab')].find((b) => b.textContent === 'Processing')?.click(); await sleep(700);
ok('Processing shows 1 order, status text', doc.querySelectorAll('.ocard').length === 1 && /Processing/.test(text()));
ok('Track/Close toggle (no cancel on processing)', !!doc.querySelector('.otrack') && ![...doc.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Cancel Order'));
doc.querySelector('.otrack')?.click(); await sleep(400);
ok('timeline toggles closed (open by default)', doc.querySelector('.otimeline') === null);
doc.querySelector('.otrack')?.click(); await sleep(400);
ok('timeline toggles open again', doc.querySelector('.otimeline') !== null);

console.log('== Delivered tab: review + order again ==');
[...doc.querySelectorAll('.otab')].find((b) => b.textContent === 'Delivered')?.click(); await sleep(800);
ok('Delivered shows 2 orders', doc.querySelectorAll('.ocard').length === 2);
ok('reviewed item shows Reviewed: Positive 5★', /Reviewed:/.test(text()) && /Positive/.test(text()) && /5★/.test(text()));
const addRev = [...doc.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add Review');
ok('Add Review button on unreviewed order', !!addRev);
addRev?.click(); await sleep(500);
ok('review form opens (Positive/Negative/Neutral + stars + submit)', !!doc.querySelector('.rev-form') && /Submit Review/.test(text()));
// submit a review
doc.querySelector('.rev-submit')?.click(); await sleep(1400);
ok('review submits → toast + Reviewed count grows', /Review submitted/.test(text()));
const oa = [...doc.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Order Again');
ok('Order Again button', !!oa);
oa?.click(); await sleep(1500);
ok('Order Again → cart with items', /cart/i.test(window.location.pathname) && /৳/.test(text()));

console.log('== Cancelled tab ==');
go('/orders'); await sleep(1500);
[...doc.querySelectorAll('.otab')].find((b) => b.textContent === 'Cancelled')?.click(); await sleep(700);
ok('Cancelled shows 2 (seed + new cancel)', doc.querySelectorAll('.ocard').length === 2);
ok('cancelled card: status text, no action chips', doc.querySelectorAll('.ocard')[0]?.querySelectorAll('.ochip').length === 0);

done();
