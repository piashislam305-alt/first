import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, Heart, MapPin, User, Settings, HelpCircle, LogOut,
  Bell, BadgeCheck, Trash2, ChevronRight, Lock, BellRing, Users, Ticket, CreditCard,
} from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import Orders from './Orders.jsx';

const DIVISIONS = ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

const MENU = [
  [ShoppingCart, 'My Orders', 'orders'],
  [Heart, 'My Wishlist', 'wishlist'],
  [MapPin, 'My Addresses', 'addresses'],
  [CreditCard, 'Payment Options', 'payment'],
  [User, 'Account Information', 'account'],
  [Settings, 'Setting', 'settings'],
  [HelpCircle, 'Govaly Helpline', 'helpline'],
];

const TITLES = {
  orders: ['My Orders', 'Track and manage your orders'],
  wishlist: ['My Wishlist', 'Your favorite products in one place'],
  addresses: ['My Addresses', 'Addresses you added for shipping'],
  account: ['Account Information', 'Update your profile information'],
  settings: ['Account Settings', 'Manage your account preferences and security settings'],
  helpline: ['Govaly Helpline', 'Get assistance with your orders, account, and more'],
  payment: ['Payment Options', 'Manage how you pay — cash or digital'],
};

/* ---------------- Sections ---------------- */

function AccountSection() {
  const { user, updateUser, toast } = useStore();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data.user);
      setEdit(false);
      toast('Profile updated ✓', 'ok');
    } catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
  };

  return (
    <>
      {edit ? (
        <div className="panel panel-pad pf-card">
          <div className="form-grid">
            <div className="field"><label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>Save Changes</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="panel panel-pad pf-card pf-info">
          <div className="pf-avatar-lg">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="pf-info-grid">
            <div><label>Name</label><p>{user?.name}</p></div>
            <div><label>Phone</label><p>{user?.phone || '--'}</p></div>
            <div><label>Email</label><p>{user?.email}</p></div>
            <div><label>Date Of Birth</label><p>--</p></div>
            <div><label>Gender</label><p>Prefer not to say</p></div>
            <div />
            <button className="btn btn-primary btn-sm" style={{ justifySelf: 'end' }} onClick={() => setEdit(true)}>Edit Profile</button>
          </div>
        </div>
      )}
    </>
  );
}

function AddressesSection() {
  const { user, toast } = useStore();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [na, setNa] = useState({ label: 'Home', fullName: user?.name || '', phone: user?.phone || '', division: 'Dhaka', city: '', area: '', address: '', isDefault: false });

  useEffect(() => { api.get('/auth/me').then(({ data }) => setAddresses(data.user.addresses || [])).catch(() => {}); }, []);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/me/addresses', na);
      setAddresses(data.addresses); setShowForm(false);
      toast('Address saved ✓', 'ok');
    } catch (e2) { toast(errMsg(e2), 'err'); } finally { setBusy(false); }
  };

  const del = async (i) => {
    try {
      const { data } = await api.delete(`/auth/me/addresses/${i}`);
      setAddresses(data.addresses);
      toast('Address removed', 'ok');
    } catch (e) { toast(errMsg(e), 'err'); }
  };

  return (
    <>
      <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Add Address</button>
      </div>

      {showForm && (
        <form className="panel panel-pad" onSubmit={add} style={{ marginBottom: 14, display: 'grid', gap: 10 }}>
          <div className="form-grid">
            <div className="field"><label>Label</label>
              <select value={na.label} onChange={(e) => setNa({ ...na, label: e.target.value })}>
                <option>Home</option><option>Office</option><option>Other</option>
              </select></div>
            <div className="field"><label>Full Name</label>
              <input required value={na.fullName} onChange={(e) => setNa({ ...na, fullName: e.target.value })} /></div>
            <div className="field"><label>Phone</label>
              <input required value={na.phone} onChange={(e) => setNa({ ...na, phone: e.target.value })} /></div>
            <div className="field"><label>Division</label>
              <select value={na.division} onChange={(e) => setNa({ ...na, division: e.target.value })}>
                {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
              </select></div>
            <div className="field"><label>City</label>
              <input value={na.city} onChange={(e) => setNa({ ...na, city: e.target.value })} /></div>
            <div className="field"><label>Area</label>
              <input value={na.area} onChange={(e) => setNa({ ...na, area: e.target.value })} /></div>
          </div>
          <div className="field"><label>Address</label>
            <input required value={na.address} onChange={(e) => setNa({ ...na, address: e.target.value })} placeholder="House, road, landmark…" /></div>
          <button className="btn btn-primary btn-sm" style={{ justifySelf: 'start' }} disabled={busy}>Save Address</button>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="panel pf-empty">No addresses found</div>
      ) : (
        addresses.map((a, i) => (
          <div className="panel panel-pad" key={i} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontSize: 13.5, lineHeight: 1.65 }}>
              <b>{a.label}</b>{a.isDefault && <span className="status-chip st-delivered" style={{ marginLeft: 8 }}>DEFAULT</span>}
              <div>{a.fullName} · {a.phone}</div>
              <div className="mut">{a.address}, {a.area}, {a.city} {a.division}</div>
            </div>
            <button className="trash" onClick={() => del(i)} aria-label="Delete address"><Trash2 size={16} /></button>
          </div>
        ))
      )}
    </>
  );
}

function SettingsSection() {
  const { toast } = useStore();
  const [openPw, setOpenPw] = useState(false);
  const [notif, setNotif] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const { changePassword } = useStore();

  useEffect(() => { try { setNotif(Notification.permission === 'granted'); } catch { /* noop */ } }, []);

  const allowNotif = async () => {
    try {
      const p = await Notification.requestPermission();
      setNotif(p === 'granted');
      toast(p === 'granted' ? 'Notifications enabled ✓' : 'Notifications blocked in this browser', p === 'granted' ? 'ok' : 'err');
    } catch { toast('Notifications not supported here', 'err'); }
  };

  return (
    <>
      <div className="panel panel-pad" style={{ marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <span className="help-ic" style={{ background: '#fde7f1' }}><BellRing size={18} color="var(--brand)" /></span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 14.5 }}>Browser notifications</b>
          <div className="mut" style={{ fontSize: 12.5 }}>This browser</div>
          <div className="mut" style={{ fontSize: 12.5 }}>
            {notif ? 'You are subscribed to order updates.' : 'Get order status and deal alerts.'}{' '}
            {!notif && <button className="link-brand" style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: 12.5 }} onClick={allowNotif}>Allow in browser</button>}
          </div>
        </div>
        <button
          className={`switch${notif ? ' on' : ''}`}
          role="switch" aria-checked={notif} aria-label="Browser notifications"
          onClick={() => (notif ? toast('Toggle from your browser permission', 'err') : allowNotif())}
        ><span /></button>
      </div>

      <div className="panel panel-pad" style={{ padding: 0 }}>
        <button className="pf-rowbtn" onClick={() => setOpenPw(!openPw)} style={{ width: '100%' }}>
          <span className="help-ic" style={{ background: '#fde7f1' }}><Lock size={18} color="var(--brand)" /></span>
          <span style={{ flex: 1, textAlign: 'left' }}>
            <b style={{ fontSize: 14.5, display: 'block' }}>Change Password</b>
            <span className="mut" style={{ fontSize: 12.5 }}>Update your account password for better security</span>
          </span>
          <ChevronRight size={17} className={openPw ? 'rot90' : ''} />
        </button>
        {openPw && (
          <div style={{ padding: '4px 18px 18px' }}>
            <div className="form-grid">
              <div className="field"><label>Current password</label>
                <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
              <div className="field"><label>New password (min 6)</label>
                <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
              <div className="field"><label>Confirm new password</label>
                <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
            </div>
            <button
              className="btn btn-primary btn-sm" style={{ marginTop: 10 }}
              disabled={busy || !pw.current || !pw.next}
              onClick={async () => {
                if (pw.next !== pw.confirm) return toast('New passwords do not match', 'err');
                setBusy(true);
                try { await changePassword(pw.current, pw.next); setPw({ current: '', next: '', confirm: '' }); }
                catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
              }}
            >Update Password</button>
          </div>
        )}
      </div>
    </>
  );
}

function HelplineSection() {
  return (
    <>
      <a className="panel pf-rowbtn" style={{ background: '#eef7ee', marginBottom: 10 }} href="https://wa.me/8801907104920" target="_blank" rel="noopener noreferrer">
        <span className="help-ic" style={{ background: '#25d366' }}>💬</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Chat in Whatsapp</span>
        <ChevronRight size={17} />
      </a>
      <a className="panel pf-rowbtn" style={{ marginBottom: 10 }} href="tel:+8801969901212">
        <span className="help-ic" style={{ background: '#fde7f1' }}>📞</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Direct Support</span>
        <b style={{ fontSize: 13 }}>Hotline: 8801969901212</b>
      </a>
      <Link className="panel pf-rowbtn" style={{ marginBottom: 10 }} to="/chat">
        <span className="help-ic" style={{ background: '#e7f0fd' }}><Ticket size={17} color="#2563eb" /></span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Ticket Support</span>
        <ChevronRight size={17} />
      </Link>
      <Link className="panel pf-rowbtn" style={{ marginBottom: 10 }} to="/faq">
        <span className="help-ic" style={{ background: '#fef3e2' }}>❓</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>FAQ</span>
        <ChevronRight size={17} />
      </Link>
      <div className="panel pf-rowbtn" style={{ width: '100%' }}>
        <span className="help-ic" style={{ background: '#fde7f1' }}><Users size={17} color="var(--brand)" /></span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Community</span>
        <a
          className="btn btn-outline btn-sm"
          href="https://facebook.com/groups/govaly"
          target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >Visit Community Group</a>
      </div>
    </>
  );
}

function WishlistSection() {
  const { wishlist, toggleWishlist, addToCart, toast } = useStore();
  if (!wishlist.length) return <div className="panel pf-empty">Your wishlist is empty — tap the ♥ on any product to save it here.</div>;
  return (
    <div className="panel" style={{ padding: '4px 0' }}>
      {wishlist.map((p) => {
        return (
          <div className="wl-row" key={p._id}>
            <Link to={`/product/${p.slug}`}><img src={p.images?.[0]} alt={p.name} className="wl-thumb" /></Link>
            <Link to={`/product/${p.slug}`} className="wl-name">{p.name}</Link>
            <div className="wl-price">
              <b>৳{p.price}</b>
            </div>
            <button className="trash" onClick={() => toggleWishlist(p)} aria-label="Remove"><Trash2 size={16} /></button>
            <button className="btn btn-primary btn-sm" onClick={() => { addToCart(p, null, 1, true); toast('Added to cart 🛍️', 'ok'); }}>Add to Cart</button>
          </div>
        );
      })}
    </div>
  );
}

function PaymentSection() {
  return (
    <>
      <div className="panel pf-rowbtn" style={{ width: '100%', background: '#fff4e5', marginBottom: 10, cursor: 'default' }}>
        <span className="help-ic" style={{ background: '#f7941d' }}>💵</span>
        <span style={{ flex: 1, textAlign: 'left' }}>
          <b style={{ fontSize: 14.5, display: 'block' }}>Cash on Delivery</b>
          <span className="mut" style={{ fontSize: 12.5 }}>Pay in cash when your order arrives — available all over Bangladesh. Online payment gateways are not available yet.</span>
        </span>
        <span className="status-chip st-delivered">ONLY METHOD</span>
      </div>
    </>
  );
}

/* ---------------- Layout ---------------- */

export default function Profile() {
  const { user, logout } = useStore();
  const { section = 'account' } = useParams();
  const nav = useNavigate();
  if (!user) return null;
  const [title, sub] = TITLES[section] || TITLES.account;

  return (
    <div className="container pf-grid">
      {/* Sidebar — Govaly structure */}
      <aside className="pf-side">
        <div className="pf-side-top">
          <div className="pf-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div className="pf-id">
            <b style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{user.name} <BadgeCheck size={13} color="#1d9bf0" /></b>
          </div>
          <Bell size={17} color="var(--ink-2)" style={{ marginLeft: 'auto' }} />
        </div>
        <nav className="pf-menu">
          {MENU.map(([Ic, label, key]) => (
            <Link key={key} to={`/profile/${key}`} className={`pf-item${section === key ? ' pf-active' : ''}`}>
              <Ic size={16} /> {label}
            </Link>
          ))}
          {user.role === 'admin' && (
            <Link to="/admin" className="pf-item"><Settings size={16} /> Admin Panel</Link>
          )}
          <button className="pf-item pf-out" onClick={() => { logout(); nav('/'); }}>
            <LogOut size={16} /> Log Out
          </button>
        </nav>
      </aside>

      {/* Content */}
      <section className="pf-main">
        <div className="pf-heading">
          <h2 style={{ margin: 0 }}>{title}</h2>
          <p className="mut" style={{ margin: '2px 0 0' }}>{sub}</p>
        </div>

        {section === 'orders' && <Orders />}
        {section === 'wishlist' && <WishlistSection />}
        {section === 'payment' && <PaymentSection />}
        {section === 'addresses' && <AddressesSection />}
        {(section === 'account' || !TITLES[section]) && <AccountSection />}
        {section === 'settings' && <SettingsSection />}
        {section === 'helpline' && <HelplineSection />}
      </section>
    </div>
  );
}
