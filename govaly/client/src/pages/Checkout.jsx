import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MapPin, Store, ChevronDown, X, Pencil, Home as HomeIc, Building2, CircleCheck } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import Stepper from '../components/Stepper.jsx';

const DIVISIONS = ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];
const EMPTY_ADDR = { fullName: '', phone: '', division: 'Dhaka', city: '', area: '', address: '', instruction: '', label: 'Home', isDefault: false };

function AddressForm({ init, onSave, onClose, saving }) {
  const [f, setF] = useState({ ...EMPTY_ADDR, ...init });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="panel panel-pad ck-form" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <div className="form-grid">
        <div className="field"><label>Full Name*</label>
          <input required value={f.fullName} onChange={set('fullName')} placeholder="Enter your full name" /></div>
        <div className="field"><label>Division*</label>
          <select required value={f.division} onChange={set('division')}>
            {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
          </select></div>
        <div className="field"><label>Phone Number*</label>
          <input required value={f.phone} onChange={set('phone')} placeholder="Enter your phone number / email" /></div>
        <div className="field"><label>City / District*</label>
          <input required value={f.city} onChange={set('city')} placeholder="Please choose your city/district" /></div>
        <div className="field"><label>Address*</label>
          <input required value={f.address} onChange={set('address')} placeholder="Building / House No / Floor / Street" /></div>
        <div className="field"><label>Area (Police Station)*</label>
          <input required value={f.area} onChange={set('area')} placeholder="Please choose your area" /></div>
      </div>
      <div className="field" style={{ marginTop: 4 }}><label>Additional Instruction</label>
        <input value={f.instruction} onChange={set('instruction')} placeholder="Enter Additional Instruction" /></div>
      <div style={{ marginTop: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Select a label for effective delivery:</label>
        <div className="row" style={{ gap: 10, marginTop: 7 }}>
          <button type="button" className={`label-btn${f.label === 'Home' ? ' on' : ''}`} onClick={() => setF({ ...f, label: 'Home' })}><HomeIc size={14} /> Home</button>
          <button type="button" className={`label-btn${f.label === 'Office' ? ' on' : ''}`} onClick={() => setF({ ...f, label: 'Office' })}><Building2 size={14} /> Office</button>
        </div>
      </div>
      <label className="row ck-default" style={{ gap: 8, marginTop: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={f.isDefault} onChange={(e) => setF({ ...f, isDefault: e.target.checked })} />
        <span className="ck-default-txt">Make it default address</span>
      </label>
      <div className="row" style={{ gap: 10, marginTop: 14 }}>
        <button type="submit" className="save-pill" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        {onClose && <button type="button" className="save-pill save-pill-ghost" onClick={onClose}>Cancel</button>}
      </div>
    </form>
  );
}

export default function Checkout() {
  const { cart, user, toast, setQty } = useStore();
  const nav = useNavigate();
  const [sellerNames, setSellerNames] = useState({});
  const [checked, setChecked] = useState({}); // key -> bool
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selAddr, setSelAddr] = useState(null); // index
  const [mode, setMode] = useState(null); // null | 'add' | 'edit'
  const [editIdx, setEditIdx] = useState(null);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    api.get('/sellers').then(({ data }) => {
      const m = {};
      (data.sellers || []).forEach((s) => { m[s.slug] = s.name; });
      setSellerNames(m);
    }).catch(() => {});
    api.get('/auth/me').then(({ data }) => {
      const list = data.user.addresses || [];
      setAddresses(list);
      const di = list.findIndex((a) => a.isDefault);
      setSelAddr(di >= 0 ? di : list.length ? 0 : null);
      if (!list.length) setMode('add');
    }).catch(() => {});
  }, []);

  const keyOf = (i) => `${i.product}|${i.size}`;
  const isChecked = (i) => checked[keyOf(i)] !== false;
  const groups = [];
  cart.filter(isChecked).forEach((i) => {
    const g = i.seller || 'other';
    let grp = groups.find((x) => x.seller === g);
    if (!grp) { grp = { seller: g, items: [] }; groups.push(grp); }
    grp.items.push(i);
  });
  const sellerLabel = (slug) => (slug === 'other' ? 'Govaly Marketplace' : sellerNames[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

  const items = cart.filter(isChecked);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 1500 ? 0 : subtotal > 0 ? 60 : 0;
  const total = subtotal + delivery;
  const perSeller = groups.length ? Math.floor(delivery / groups.length) : 0;
  const feeSplit = groups.map((g, ix) => ({ name: sellerLabel(g.seller), fee: ix === 0 ? delivery - perSeller * (groups.length - 1) : perSeller }));

  const saveAddress = async (f) => {
    setSaving(true);
    try {
      const { data } = mode === 'edit'
        ? await api.put(`/auth/me/addresses/${editIdx}`, f)
        : await api.post('/auth/me/addresses', f);
      const list = data.addresses || [];
      setAddresses(list);
      if (f.isDefault) setSelAddr(list.findIndex((a) => a.isDefault));
      else if (mode === 'add') setSelAddr(list.length - 1);
      setMode(null); setEditIdx(null);
      toast('Address saved ✓', 'ok');
    } catch (e) { toast(errMsg(e), 'err'); } finally { setSaving(false); }
  };

  const removeAddress = async (ix) => {
    try {
      const { data } = await api.delete(`/auth/me/addresses/${ix}`);
      const list = data.addresses || [];
      setAddresses(list);
      setSelAddr((s) => Math.min(s ?? 0, Math.max(0, list.length - 1)));
      if (!list.length) setMode('add');
      toast('Address removed', 'ok');
    } catch (e) { toast(errMsg(e), 'err'); }
  };

  const makeDefault = async (ix) => {
    try {
      const { data } = await api.patch(`/auth/me/addresses/${ix}/default`);
      setAddresses(data.addresses || []);
      toast('Default delivery address updated ✓', 'ok');
    } catch (e) { toast(errMsg(e), 'err'); }
  };

  if (!cart.length)
    return (
      <div className="container empty">
        <h3>Nothing to checkout</h3>
        <p>Your cart is empty — add some products first.</p>
      </div>
    );

  const a = selAddr != null ? addresses[selAddr] : null;

  return (
    <div className="container cartflow">
      <button className="cart-back" onClick={() => nav('/cart')}><span style={{ fontSize: 18 }}>‹</span> Checkout</button>
      <Stepper current={2} />

      <div className="ck-grid">
        {/* LEFT */}
        <div>
          {mode === 'add' && (
            <>
              <div className="row" style={{ justifyContent: 'space-between', margin: '2px 2px 10px' }}>
                <b style={{ fontSize: 16.5 }}>Add Address</b>
                <button className="trash" onClick={() => { setMode(null); if (!addresses.length) nav('/cart'); }} aria-label="Close"><X size={19} /></button>
              </div>
              <AddressForm init={{ ...EMPTY_ADDR, fullName: user?.name || '', phone: user?.phone || '' }} onSave={saveAddress} saving={saving} />
            </>
          )}
          {mode === 'edit' && (
            <>
              <div className="row" style={{ justifyContent: 'space-between', margin: '2px 2px 10px' }}>
                <b style={{ fontSize: 16.5 }}>Edit Address</b>
                <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }} onClick={() => { setMode('add'); setEditIdx(null); }}>+ Add Address</button>
              </div>
              <AddressForm init={addresses[editIdx] || EMPTY_ADDR} onSave={saveAddress} onClose={() => { setMode(null); setEditIdx(null); }} saving={saving} />
            </>
          )}

          {mode === null && (
            <>
              <div className="row" style={{ justifyContent: 'space-between', margin: '2px 2px 10px' }}>
                <b style={{ fontSize: 16.5 }}>Select a Delivery Address</b>
                <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }} onClick={() => { setMode('add'); setEditIdx(null); }}>+ Add Address</button>
              </div>

              {addresses.map((ad, ix) => (
                <label className={`panel ck-addr${selAddr === ix ? ' sel' : ''}`} key={ix} style={{ marginBottom: 10 }}>
                  <input type="radio" name="ckaddr" checked={selAddr === ix} onChange={() => setSelAddr(ix)} aria-label={`Use address ${ix + 1}`} />
                  <div className="ck-addr-body">
                    <div className="row" style={{ gap: 7 }}>
                      <MapPin size={15} color="var(--brand)" />
                      <b style={{ fontSize: 14.5 }}>{ad.fullName}</b>
                    </div>
                    <div style={{ fontSize: 13.5, margin: '2px 0' }}>{ad.phone}</div>
                    <div style={{ fontSize: 13, color: '#3d3d46', lineHeight: 1.5 }}>
                      {ad.address}{ad.instruction ? `, ${ad.instruction}` : ''}<br />{ad.area}, {ad.city}, {ad.division}
                    </div>
                    <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className="chip-label">{ad.label || 'Home'}</span>
                      {ad.isDefault
                        ? <span className="chip-default">Default Delivery Address</span>
                        : <button className="chip-makedefault" onClick={(e) => { e.preventDefault(); makeDefault(ix); }}>Make It Default</button>}
                    </div>
                  </div>
                  <div className="ck-addr-actions">
                    <button className="trash" onClick={(e) => { e.preventDefault(); removeAddress(ix); }} aria-label="Delete address"><Trash2 size={16} /></button>
                    <button className="edit-link" onClick={(e) => { e.preventDefault(); setMode('edit'); setEditIdx(ix); }}>Edit</button>
                  </div>
                </label>
              ))}
            </>
          )}

          {/* item groups (selected) */}
          {groups.map((g) => {
            const gAll = g.items.every((i) => checked[keyOf(i)] !== false);
            return (
              <div className="panel" key={g.seller} style={{ marginTop: 12, overflow: 'hidden' }}>
                <label className="seller-head">
                  <input
                    type="checkbox" checked={gAll}
                    onChange={() => {
                      const next = !gAll;
                      setChecked((c) => { const m = { ...c }; g.items.forEach((i) => { m[keyOf(i)] = next; }); return m; });
                    }}
                  />
                  <Store size={15} color="var(--brand)" />
                  <b style={{ fontSize: 13.5 }}>{sellerLabel(g.seller)}</b>
                </label>
                <div className="seller-table">
                  {g.items.map((i) => (
                    <div className="st-row" key={keyOf(i)}>
                      <div className="st-prod">
                        <input type="checkbox" checked={isChecked(i)} onChange={() => setChecked((c) => ({ ...c, [keyOf(i)]: !isChecked(i) }))} aria-label={`Select ${i.name}`} />
                        <img src={i.image} alt={i.name} />
                        <div>
                          <span className="st-name">{i.name}</span>
                          <span className="size-chip">{[i.color && `Color: ${i.color}`, i.size && `Size: ${i.size}`].filter(Boolean).join(', ')}</span>
                        </div>
                      </div>
                      <b className="st-price">৳{i.price * i.qty}</b>
                      <div className="st-actions">
                        <button className="trash" onClick={() => toast('Uncheck items or remove them from the Cart', 'err')} aria-label="Remove"><Trash2 size={16} /></button>
                        <span className="qty">
                          <button onClick={() => setQty(i.product, i.size, i.qty - 1)} aria-label="Decrease">−</button>
                          <span>{i.qty}</span>
                          <button onClick={() => setQty(i.product, i.size, i.qty + 1)} aria-label="Increase">+</button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT */}
        <div className="ck-right">

          <div className="panel panel-pad" style={{ marginTop: 12 }}>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Summary</h3>
            <div className="sumrow"><span>Product Price</span><span>৳{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="sumrow" style={{ alignItems: 'flex-start' }}>
              <span>Standard Delivery{feeSplit.length > 1 && <span className="fee-sub"><br />{feeSplit.map((f) => <span key={f.name}>↳ {f.name} <b>৳{f.fee}</b><br /></span>)}</span>}
              </span>
              <span>{delivery === 0 ? <span className="free">FREE</span> : `৳${delivery}`}</span>
            </div>
            <div className="sumrow total" style={{ fontSize: 16 }}>
              <span>Total Payable</span><span>৳{total.toLocaleString('en-IN')}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 14, borderRadius: 24, padding: '13px 16px', fontSize: 15.5 }}
              disabled={!items.length || (!a && mode === null)}
              onClick={() => {
                if (!a) return toast('Please add a delivery address', 'err');
                nav('/payment', { state: { addressIdx: selAddr, stamp: Date.now() } });
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
