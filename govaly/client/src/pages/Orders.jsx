import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Store, ChevronDown, ChevronLeft, Menu, CheckCircle } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import { Spinner } from '../components/ui.jsx';

/* SRS My Orders — simplified:
   tabs: All · Pending · Processing · Delivered · Cancelled
   payment: Cash on Delivery only · tracking: simple status timeline
   reviews & ratings on delivered items · Order Again · Cancel (pending only) */

const TABS = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];
const TAB_MATCH = {
  Pending: (s) => s === 'Placed',
  Processing: (s) => s === 'Processing',
  Delivered: (s) => s === 'Delivered',
  Cancelled: (s) => s === 'Cancelled',
};

/* internal status → display name */
const DISPLAY = {
  Placed: 'Pending', Processing: 'Processing', Delivered: 'Delivered', Cancelled: 'Cancelled',
};
const EVENT_NOTES = {
  'Pending': 'Your order has been placed and is waiting for confirmation',
  'Processing': 'Your order has been confirmed and is being prepared',
  'Delivered': 'Your order has been delivered successfully',
  'Cancelled': 'Your order has been cancelled',
};

function PinkStars({ value = 0, onPick, size = 22 }) {
  return (
    <span className="pstars" role={onPick ? 'radiogroup' : undefined} aria-label={onPick ? 'Rating' : `${value} star${value > 1 ? 's' : ''}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i} type="button" className="pstar" disabled={!onPick}
          onClick={() => onPick?.(i)}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={i <= value ? '#e2136e' : '#f9d2e3'}>
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
          </svg>
        </button>
      ))}
    </span>
  );
}

function Timeline({ order }) {
  const events = [...(order.timeline || [])].reverse(); // latest first
  return (
    <div className="otimeline">
      {events.map((ev, i) => (
        <div className={`tl-row${i === 0 ? ' latest' : ''}`} key={i}>
          <span className="tl-dot" />
          <div className="tl-body">
            <b>{DISPLAY[ev.status] || ev.status}</b>
            <span className="tl-note">{ev.note || EVENT_NOTES[ev.status] || ''}</span>
            <span className="tl-time">{new Date(ev.at).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------- per-item review form (SRS #15: reviews & ratings for eligible purchased products) ------- */
function ReviewForm({ orderId, itemIdx, onDone }) {
  const { toast } = useStore();
  const [type, setType] = useState('Positive');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/review`, { itemIdx, type, rating, comment });
      toast('Review submitted — thanks! ⭐', 'ok');
      onDone();
    } catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
  };

  return (
    <div className="rev-form">
      <div className="rev-row">
        <span className="rev-lab">Review:</span>
        <span className="rev-pills">
          {['Positive', 'Negative', 'Neutral'].map((t) => (
            <button key={t} type="button" className={`rpill ${t.toLowerCase()}${type === t ? ' on' : ''}`} onClick={() => setType(t)}>{t}</button>
          ))}
        </span>
        <span className="rev-lab" style={{ marginLeft: 26 }}>Comment:</span>
        <textarea
          className="rev-comment" placeholder="Write a comment..." rows={3} maxLength={500}
          value={comment} onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="rev-row" style={{ marginTop: 8 }}>
        <span className="rev-lab">Rating:</span>
        <PinkStars value={rating} onPick={setRating} />
      </div>
      <div className="rev-row" style={{ justifyContent: 'flex-end', marginTop: 6 }}>
        <button type="button" className="rev-submit" disabled={busy} onClick={submit}>{busy ? 'Submitting…' : 'Submit Review'}</button>
      </div>
    </div>
  );
}

function OrderCard({ o, sellerName, tab, open, onToggle, reload }) {
  const { addToCart, toast } = useStore();
  const nav = useNavigate();
  const [reviewFor, setReviewFor] = useState(null); // item idx

  const cancelled = o.status === 'Cancelled';
  const delivered = o.status === 'Delivered';
  const unreviewed = delivered ? o.items.filter((it) => !it.review?.type).length : 0;
  const latest = DISPLAY[o.timeline?.[o.timeline.length - 1]?.status] || DISPLAY[o.status] || o.status;

  const act = async (path, okMsg) => {
    try { await api.post(`/orders/${o.orderId}/${path}`); toast(okMsg, 'ok'); reload(); }
    catch (e) { toast(errMsg(e), 'err'); }
  };

  const orderAgain = () => {
    o.items.forEach((it) => addToCart({
      _id: it.product, slug: it.slug, name: it.name, images: [it.image],
      price: it.price, mrp: it.mrp, seller: it.seller, colors: it.color ? [it.color] : [],
      sizes: it.size ? [it.size] : [], stock: 50,
    }, it.size, it.qty, true));
    toast('Items added back to your cart 🛒', 'ok');
    nav('/cart');
  };

  const btn = (label, cls, fn) => <button className={cls} onClick={fn}>{label}</button>;

  // footer actions per tab (simplified)
  const footBtns = [];
  if (o.status === 'Placed') {
    footBtns.push(btn(open ? 'Close' : 'Track', 'otrack', () => onToggle()));
    footBtns.push(btn('Cancel Order', 'ochip ochip-dark', () => act('cancel', 'Order cancelled')));
  } else if (delivered) {
    footBtns.push(btn(open ? 'Close' : 'Track', 'otrack', () => onToggle()));
    if (unreviewed > 0) footBtns.push(btn('Add Review', 'obtn obtn-pink', () => {
      const idx = o.items.findIndex((it) => !it.review?.type);
      setReviewFor(reviewFor === idx ? null : idx);
    }));
    footBtns.push(btn('Order Again', 'obtn obtn-line', orderAgain));
  } else if (!cancelled) {
    footBtns.push(btn(open ? 'Close' : 'Track', 'otrack', () => onToggle()));
  }

  return (
    <div className={`ocard${open || reviewFor !== null ? ' open' : ''}`}>
      {/* header */}
      <div className="ocard-head">
        <b className="ocard-id">{o.orderId.replace(/^GV-/, 'Go#')}</b>
        {sellerName && <span className="ocard-seller"><Store size={12} /> {sellerName}</span>}
        <span className="ocard-pays">
          <span className="opay opay-cod">Cash on Delivery</span>
          {(cancelled || delivered) && <span className={`ostatus ${cancelled ? 'is-dark' : 'is-pink'}`}>{latest}</span>}
        </span>
      </div>

      {/* items */}
      <div className="ocard-items">
        {o.items.map((it, ix) => (
          <div key={ix}>
            <div className="ocard-item">
              <Link to={`/product/${it.slug || ''}`}><img src={it.image} alt={it.name} /></Link>
              <div className="ocard-mid">
                <Link to={`/product/${it.slug || ''}`} className="ocard-name">{it.name}</Link>
                <div className="ocard-chips">
                  <span className="ocard-chip">{[it.color && `Color: ${it.color}`, it.size && `Size: ${it.size}`].filter(Boolean).join(', ')}</span>
                </div>
              </div>
              <div className="ocard-right">
                <span className="ocard-price">৳{it.price}</span>
                <span className="ocard-qty">Quantity: {it.qty}</span>
                {it.review?.type && (
                  <span className="oreviewed">Reviewed: <b className="ov-pos">{it.review.type}</b> <b className="ov-star">{it.review.rating}★</b></span>
                )}
                <span className="ocard-amt">Amount: <b>৳{it.price * it.qty}</b></span>
              </div>
            </div>
            {reviewFor === ix && (
              <ReviewForm orderId={o.orderId} itemIdx={ix} onDone={reload} />
            )}
          </div>
        ))}
      </div>

      {/* totals */}
      <div className="ocard-foot">
        <div className="ocard-totals">
          <span>Subtotal: <b>৳{o.subtotal}</b></span>
          <span>Delivery: <b>{o.deliveryFee === 0 ? 'FREE' : `৳${o.deliveryFee}`}</b></span>
          <span className="ocard-total">Total: <b>৳{o.total}</b></span>
        </div>
        <div className="ocard-btns">{footBtns}</div>
      </div>

      {/* tracking timeline */}
      {open && <Timeline order={o} />}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState('All');
  const [closed, setClosed] = useState({});
  const [sellerNames, setSellerNames] = useState({});
  const [menu, setMenu] = useState(false);
  const { user } = useStore();
  const nav = useNavigate();

  const load = () => api.get('/orders/mine').then(({ data }) => setOrders(data.orders)).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);
  useEffect(() => { setClosed({}); }, [tab]);
  useEffect(() => {
    api.get('/sellers').then(({ data }) => {
      const m = {};
      (data.sellers || []).forEach((s) => { m[s.slug] = s.name; });
      setSellerNames(m);
    }).catch(() => {});
  }, []);

  if (!orders) return <Spinner />;

  const shown = tab === 'All' ? orders : orders.filter((o) => TAB_MATCH[tab]?.(o.status));
  // default: timeline open in status tabs, closed on All
  const isOpen = (id) => (closed[id] !== undefined ? !closed[id] : tab !== 'All');
  const toggle = (id) => setClosed((c) => ({ ...c, [id]: isOpen(id) }));

  return (
    <div className="orders-page">
      {/* mobile: "‹ My Orders" header + pink-circle hamburger */}
      <div className="m-ord-head">
        <button className="m-back" onClick={() => nav(-1)} aria-label="Back"><ChevronLeft size={22} /></button>
        <b>My Orders</b>
        <button className={`m-burger${menu ? ' open' : ''}`} onClick={() => setMenu((v) => !v)} aria-label="Menu" aria-expanded={menu}><Menu size={16} /></button>
        {menu && (
          <div className="m-menu">
            <Link to="/profile" onClick={() => setMenu(false)}>👤 Profile</Link>
            <Link to="/wishlist" onClick={() => setMenu(false)}>❤️ Wishlist</Link>
            <Link to="/products" onClick={() => setMenu(false)}>🛍️ Shop Products</Link>
          </div>
        )}
      </div>
      {/* mobile: simple user strip — avatar · verified name */}
      <div className="m-user-strip">
        <span className="m-ava" aria-hidden="true">{(user?.name || 'U')[0].toUpperCase()}</span>
        <span className="m-name">{user?.name || 'User Name'} <CheckCircle size={13} strokeWidth={2.6} /></span>
      </div>

      <h2 className="dsk-only" style={{ margin: '0 2px 10px', fontSize: 22 }}>My Orders</h2>

      <div className="otabs">
        {TABS.map((t) => (
          <button key={t} className={`otab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="panel pf-empty" style={{ marginTop: 14 }}>
          <Package size={34} strokeWidth={1.5} style={{ margin: '0 auto 8px', color: 'var(--brand)', display: 'block' }} />
          No {tab !== 'All' ? tab.toLowerCase() + ' ' : ''}orders yet.
          <div style={{ marginTop: 12 }}>
            <Link to="/products" className="btn btn-primary btn-sm">Start Shopping</Link>
          </div>
        </div>
      ) : (
        shown.map((o) => (
          <OrderCard
            key={o._id}
            o={o}
            sellerName={sellerNames[o.seller]}
            tab={tab}
            open={isOpen(o._id)}
            onToggle={() => toggle(o._id)}
            reload={load}
          />
        ))
      )}
    </div>
  );
}
