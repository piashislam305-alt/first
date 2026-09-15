import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Heart, ShoppingBag, User, Home, Menu, X, MessageCircle,
  Headphones, Mail, Phone, ChevronDown, Bell, BadgeCheck, ShoppingCart,
  MapPin, Settings, HelpCircle, LogOut,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import api from '../api.js';

export function Logo({ light = false }) {
  return (
    <span className="logo">
      <img
        src="/img/brand/govaly-logo.png"
        alt="Govaly"
        className={`logo-img${light ? ' logo-img-light' : ''}`}
      />
    </span>
  );
}

/* ---------------- Live search suggestions (autocomplete) ---------------- */
function SearchSuggest({ q, onPick }) {
  const [sug, setSug] = useState({ categories: [], products: [] });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = q.trim();
    if (!s) { setSug({ categories: [], products: [] }); setOpen(false); return; }
    const t = setTimeout(() => {
      api.get(`/search/suggest?q=${encodeURIComponent(s)}`)
        .then(({ data }) => { setSug(data); setOpen(true); })
        .catch(() => {});
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const has = sug.categories.length || sug.products.length;
  if (!open || !has) return null;
  return (
    <div className="search-sug" onMouseDown={(e) => e.preventDefault()}>
      {sug.categories.length > 0 && (
        <>
          <div className="sug-head">Categories</div>
          {sug.categories.map((c) => (
            <button key={c.slug} className="sug-row" onClick={() => onPick({ type: 'cat', slug: c.slug })}>
              <Search size={13} className="sug-ic" />
              <span className="sug-name">{c.name}</span>
              <span className="sug-tag">{c.isParent ? 'Category' : 'Sub-category'}</span>
            </button>
          ))}
        </>
      )}
      {sug.products.length > 0 && (
        <>
          <div className="sug-head">Products</div>
          {sug.products.map((p) => (
            <button key={p.slug} className="sug-row" onClick={() => onPick({ type: 'prod', slug: p.slug })}>
              {p.image
                ? <img src={p.image} alt="" className="sug-thumb" />
                : <span className="sug-thumb sug-thumb-empty" />}
              <span className="sug-name">{p.name}</span>
              <b className="sug-price">৳{p.price}</b>
            </button>
          ))}
        </>
      )}
      <button
        className="sug-row sug-all"
        onClick={() => onPick({ type: 'search' })}
      >
        <Search size={13} className="sug-ic" />
        See all results for “{q.trim()}”
      </button>
    </div>
  );
}

/* ---------------- Account dropdown (Govaly structure) ---------------- */
function AccountMenu() {
  const { user, logout } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!user) {
    return (
      <Link className="nav-icon" to="/login" title="Account">
        <User size={20} />
        <span>Account</span>
      </Link>
    );
  }

  const items = [
    [ShoppingCart, 'My Orders', '/profile/orders'],
    [Heart, 'My Wishlist', '/profile/wishlist'],
    [MapPin, 'My Addresses', '/profile/addresses'],
    [User, 'Account Information', '/profile/account'],
    [Settings, 'Settings', '/profile/settings'],
    [HelpCircle, 'Govaly Helpline', '/profile/helpline'],
  ];

  return (
    <div className="acct-wrap" ref={ref}>
      <button className="nav-icon acct-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="acct-avatar">{user.name[0]?.toUpperCase()}</span>
        <span className="acct-hi">Hi, {user.name.split(' ')[0]}<br /><b>Account <ChevronDown size={12} style={{ display: 'inline' }} /></b></span>
      </button>
      {open && (
        <div className="acct-menu">
          <div className="acct-head">
            <div>
              <b style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {user.name} <BadgeCheck size={14} color="#1d9bf0" />
              </b>
              <span className="mut" style={{ fontSize: 12 }}>{user.email}</span>
            </div>
            <Bell size={17} color="var(--ink-2)" />
          </div>
          {items.map(([Ic, label, to]) => (
            <button key={to} className="acct-item" onClick={() => { setOpen(false); nav(to); }}>
              <Ic size={16} /> {label}
            </button>
          ))}
          <button
            className="acct-item acct-out"
            onClick={() => { setOpen(false); logout(); nav('/'); }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, cartQty, wishlist, logout } = useStore();
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState(null); // open accordion (parent slug)
  const [scrolled, setScrolled] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCats(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    nav(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  const pick = useCallback((s) => {
    if (s.type === 'cat') nav(`/category/${s.slug}`);
    else if (s.type === 'prod') nav(`/product/${s.slug}`);
    else nav(`/products?search=${encodeURIComponent(q.trim())}`);
  }, [nav, q]);

  const hideSearch = pathname === '/' && !scrolled;
  const parents = cats.filter((c) => c.isParent);
  const childrenOf = (slug) => cats.filter((c) => !c.isParent && c.parent === slug);

  return (
    <>
      <div className="nav-wrap">
        <div className="container nav">
          <button className="nav-icon burger" onClick={() => setDrawer(true)} aria-label="Menu">
            <Menu size={22} />
          </button>
          <Link to="/" aria-label="Govaly home"><Logo light /></Link>

          <form className={`nav-search${hideSearch ? ' hidden-at-top' : ''}`} onSubmit={submit} autoComplete="off">
            <Search size={16} color="#9a9aa5" style={{ marginRight: 8, flex: '0 0 auto' }} />
            <input
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit">Search</button>
            <SearchSuggest q={q} onPick={pick} />
          </form>

          <div className="nav-actions">
            <span className="nav-sep" />
            <Link className="nav-icon" to="/wishlist" title="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && <b className="nav-badge">{wishlist.length}</b>}
              <span>Wishlist</span>
            </Link>
            <span className="nav-sep" />
            <Link className="nav-icon" to="/cart" title="Cart">
              <ShoppingBag size={20} />
              {cartQty > 0 && <b className="nav-badge">{cartQty}</b>}
              <span>Cart</span>
            </Link>
            <span className="nav-sep" />
            <AccountMenu />
          </div>
        </div>
      </div>

      {drawer && (
        <>
          <div className="drawer-veil" onClick={() => setDrawer(false)} />
          <aside className="drawer">
            <div className="drawer-title">
              <h3>Categories</h3>
              <button className="trash" onClick={() => setDrawer(false)} aria-label="Close"><X size={22} /></button>
            </div>

            <Link to="/products" onClick={() => setDrawer(false)} className="acc-btn" style={{ justifyContent: 'space-between' }}>
              <span className="row"><Home size={16} style={{ color: 'var(--brand)' }} /> For You</span>
            </Link>

            {parents.map((p) => (
              <div key={p.slug}>
                <button
                  className={`acc-btn${acc === p.slug ? ' open' : ''}`}
                  onClick={() => setAcc(acc === p.slug ? null : p.slug)}
                >
                  {p.name}
                  <ChevronDown size={16} />
                </button>
                {acc === p.slug && (
                  <div className="acc-body">
                    <Link to={`/category/${p.slug}`} onClick={() => setDrawer(false)}>All {p.name}</Link>
                    {childrenOf(p.slug).map((c) => (
                      <Link key={c.slug} to={`/category/${c.slug}`} onClick={() => setDrawer(false)}>
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Contact block — real Govaly contacts */}
            <div className="drawer-contacts">
              <Link className="dcontact" to="/profile/helpline">
                <Headphones size={17} /> Govaly Helpline
              </Link>
              <a className="dcontact" href="mailto:support@govaly.com.bd">
                <Mail size={17} /> support@govaly.com.bd
              </a>
              <a className="dcontact" href="tel:+8801969901212">
                <Phone size={17} /> 01969901212
              </a>
              <a className="dcontact" href="https://wa.me/8801907104920" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} /> 01907104920
              </a>
            </div>

            <div style={{ marginTop: 14, display: 'grid', gap: 4, paddingBottom: 10 }}>
              {user ? (
                <>
                  <Link to="/profile/orders" onClick={() => setDrawer(false)}>📦 My Orders</Link>
                  <Link to="/profile/account" onClick={() => setDrawer(false)}>👤 My Profile</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setDrawer(false)}>⚙️ Admin Panel</Link>}
                  <button
                    style={{ padding: '9px 10px', borderRadius: 8, fontWeight: 600, background: 'none', border: 0, textAlign: 'left', fontSize: 14, color: 'var(--ink-2)' }}
                    onClick={() => { logout(); setDrawer(false); nav('/'); }}
                  >
                    🚪 Log Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setDrawer(false)}>👤 Login / Sign Up</Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
