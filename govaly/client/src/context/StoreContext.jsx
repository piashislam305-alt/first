import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import storage from '../storage.js';

const StoreContext = createContext(null);
const CART_KEY = 'govaly_cart_v1';
const WL_KEY = 'govaly_wishlist_v1';

const read = (k, fb) => {
  try {
    return JSON.parse(storage.get(k)) ?? fb;
  } catch {
    return fb;
  }
};

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const nav = useNavigate();
  const loc = useLocation();
  const pathRef = useRef('/');
  pathRef.current = loc.pathname;
  const [booting, setBooting] = useState(true);
  const [cart, setCart] = useState(() => read(CART_KEY, []));
  const [wishlist, setWishlist] = useState(() => read(WL_KEY, []));
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, kind = 'brand') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  // boot: restore session (access token; api.js auto-refreshes if expired)
  useEffect(() => {
    (async () => {
      if (storage.get('govaly_token') || storage.get('govaly_refresh')) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          const wl = await api.get('/auth/wishlist');
          setWishlist(wl.data.items || []);
        } catch {
          /* refresh failed too → logged out */
        }
      }
      setBooting(false);
    })();
  }, []);

  // global logout broadcast (refresh expired mid-session)
  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setWishlist([]);
      toast('Session expired — please login again', 'err');
      // stale session on a protected page → straight to login (no dead ends)
      if (['/checkout', '/payment', '/order-success', '/orders', '/profile', '/wishlist'].some((x) => (pathRef.current || '').startsWith(x))) {
        nav('/login', { state: { expired: 1 } });
      }
    };
    window.addEventListener('govaly:logout', onLogout);
    return () => window.removeEventListener('govaly:logout', onLogout);
  }, [toast, nav]);

  useEffect(() => { storage.set(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { storage.set(WL_KEY, JSON.stringify(wishlist)); }, [wishlist]);

  // ---------- auth ----------
  const applySession = (data) => {
    storage.set('govaly_token', data.accessToken || data.token);
    if (data.refreshToken) storage.set('govaly_refresh', data.refreshToken);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    applySession(data);
    const wl = await api.get('/auth/wishlist');
    setWishlist(wl.data.items || []);
    toast(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`, 'ok');
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    applySession(data);
    setWishlist([]);
    toast('Account created — happy shopping! 🎉', 'ok');
    return data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
    toast('Password updated ✓', 'ok');
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    storage.remove('govaly_token');
    storage.remove('govaly_refresh');
    setUser(null);
    setWishlist([]);
    toast('Logged out. See you soon!');
  };

  // ---------- cart ----------
  const addToCart = (product, size = null, qty = 1, silent = false, color = null) => {
    // SRS: cart actions require login — guests are sent to /login (nothing hidden, no dead ends)
    if (!user) {
      toast('Please login to add items to your cart', 'err');
      nav('/login', { state: { from: pathRef.current } });
      return;
    }
    const pick = size || product.sizes?.[0] || 'Free Size';
    const col = color ?? product.colors?.[0] ?? '';
    setCart((c) => {
      const i = c.findIndex((x) => x.product === product._id && x.size === pick && (x.color || '') === col);
      if (i >= 0) {
        const next = [...c];
        next[i] = { ...next[i], qty: Math.min(10, next[i].qty + qty) };
        return next;
      }
      return [
        ...c,
        {
          product: product._id, slug: product.slug, name: product.name,
          image: product.images?.[0] || '',
          seller: product.seller,
          color: col,
          price: product.price, mrp: product.mrp,
          size: pick, qty, stock: product.stock ?? 50,
        },
      ];
    });
    if (!silent) toast('Added to cart 🛍️', 'ok');
  };

  const setQty = (productId, size, qty) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((x) => !(x.product === productId && x.size === size))
        : c.map((x) => (x.product === productId && x.size === size ? { ...x, qty: Math.min(10, qty) } : x))
    );

  const removeFromCart = (productId, size) => {
    setCart((c) => c.filter((x) => !(x.product === productId && x.size === size)));
    toast('Removed from cart');
  };

  const clearCart = () => setCart([]);

  // ---------- wishlist ----------
  const toggleWishlist = async (product) => {
    // SRS: wishlist requires login
    if (!user) {
      toast('Please login to save items to your wishlist', 'err');
      nav('/login', { state: { from: pathRef.current } });
      return;
    }
    try {
      const { data } = await api.post(`/auth/wishlist/${product._id}`);
      setWishlist(data.items || []);
      toast(data.wishlisted ? 'Saved to wishlist ❤️' : 'Removed from wishlist', data.wishlisted ? 'ok' : undefined);
    } catch (e) {
      toast(errMsg(e, 'Could not update wishlist'), 'err');
    }
  };

  const isWishlisted = (id) => wishlist.some((w) => w._id === id);

  const counts = useMemo(
    () => ({
      cartQty: cart.reduce((s, i) => s + i.qty, 0),
      cartSubtotal: cart.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    [cart]
  );

  const value = {
    user, booting, login, register, logout, changePassword, updateUser: setUser,
    cart, addToCart, setQty, removeFromCart, clearCart,
    wishlist, toggleWishlist, isWishlisted,
    toasts, toast, ...counts,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
