import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShoppingBag, Truck, BadgePercent } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { Logo } from '../components/Header.jsx';
import api, { errMsg } from '../api.js';

function AuthShell({ children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-side">
          <div>
            <Logo light />
            <h2 style={{ marginTop: 26 }}>Shopping?<br />Go Valy!</h2>
            <p>Join Bangladesh's favorite online fashion mall — trendy fashion, footwear & lifestyle at the best prices.</p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, fontSize: 13.5 }}>
            <li className="row"><ShoppingBag size={16} /> 100+ products across 18 categories</li>
            <li className="row"><Truck size={16} /> Cash on delivery, 48-hr nationwide shipping</li>
            <li className="row"><BadgePercent size={16} /> Rate & review the products you buy</li>
          </ul>
        </div>
        <div className="auth-form">{children}</div>
      </div>
    </div>
  );
}

export function Login() {
  const { login, user } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(loc.state?.expired ? 'Session expired — please log in again.' : '');

  // already signed in → no reason to show the form (hide it, go home)
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await login(form.email, form.password);
      nav(loc.state?.from || '/', { replace: true });
    } catch (e2) {
      setErr(errMsg(e2, 'Login failed'));
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h3>Login to Govaly</h3>
      <p className="mut">Get access to your orders, wishlist & deals.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <div className="field"><label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
        <div className="field"><label>Password</label>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
        {err && <p style={{ color: 'var(--red)', margin: 0, fontSize: 13 }}>{err}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      </form>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}>
        <span className="mut">New to Govaly? <Link to="/register" className="link-brand">Create an account</Link></span>
      </div>
      <div className="demo-creds">
        <b>Demo accounts</b><br />
        Customer: <code>demo@govaly.test</code> / <code>Demo1234</code><br />
        Admin: <code>admin@govaly.test</code> / <code>Admin123</code>
      </div>
    </AuthShell>
  );
}

export function Register() {
  const { register, user } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // already signed in → hide the sign-up form
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await register(form);
      nav('/');
    } catch (e2) {
      setErr(errMsg(e2, 'Could not register'));
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h3>Create Account</h3>
      <p className="mut">Join Govaly — it takes less than a minute.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <div className="field"><label>Full Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
        <div className="field"><label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
        <div className="field"><label>Phone (optional)</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+8801XXXXXXXXX" /></div>
        <div className="field"><label>Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></div>
        {err && <p style={{ color: 'var(--red)', margin: 0, fontSize: 13 }}>{err}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Sign Up'}</button>
      </form>
      <p style={{ marginTop: 14, fontSize: 13.5 }}>
        Already have an account? <Link to="/login" className="link-brand">Login</Link>
      </p>
    </AuthShell>
  );
}
