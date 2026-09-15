import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync } from 'fs';
export const BASE = 'http://127.0.0.1:5000';
export const makeTally = () => {
  let pass = 0, fail = 0;
  return {
    ok: (n, c) => { c ? (pass++, console.log('  PASS', n)) : (fail++, console.log('  FAIL', n)); },
    done: () => { console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); },
  };
};
export async function boot({ cart = null, sandbox = false } = {}) {
  const login = await (await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'demo@govaly.test', password: 'Demo1234' }) })).json();
  const html = await (await fetch(BASE + '/')).text();
  const dom = new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g, ''), { url: BASE + '/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  // NOTE: returns 42 on purpose — the Arena preview host overrides window.scrollTo
  // with a function that returns a value; an implicit-return effect would crash (fixed in App.jsx)
  window.scrollTo = () => 42;
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.fetch = (u, o) => fetch(u.startsWith('http') ? u : BASE + u, o);
  if (sandbox) {
    // Arena preview iframes are OPAQUE ORIGIN: ANY access to storage throws SecurityError.
    // Simulate exactly that so pages must go through the safe storage.js wrapper.
    const deny = () => { throw new window.DOMException('Denied (opaque origin)', 'SecurityError'); };
    try { delete window.localStorage; } catch { /* older jsdom */ }
    try { delete window.sessionStorage; } catch { /* older jsdom */ }
    Object.defineProperty(window, 'localStorage', { get: deny, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { get: deny, configurable: true });
  } else {
    window.localStorage.setItem('govaly_token', login.accessToken);
    window.localStorage.setItem('govaly_refresh', login.refreshToken);
    if (cart) window.localStorage.setItem('govaly_cart_v1', JSON.stringify(cart));
  }
  window.eval(readFileSync('/home/user/govaly/client/dist/assets/' + readdirSync('/home/user/govaly/client/dist/assets').find(f => f.startsWith('index-') && f.endsWith('.js')), 'utf8'));
  await new Promise((r) => setTimeout(r, 2400));
  return { window, doc: window.document, login };
}
export const navigator = (window) => (p) => { window.history.pushState({}, '', p); window.dispatchEvent(new window.PopStateEvent('popstate')); };
export const setInput = (window) => (el, v) => {
  if (!el) throw new Error('setInput: element not found');
  // use the element's OWN realm prototype — window.HTMLInputElement can mismatch on long jsdom runs
  const own = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
  const s = (own && own.set) || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  try { s.call(el, v); } catch { el.value = v; }
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};
