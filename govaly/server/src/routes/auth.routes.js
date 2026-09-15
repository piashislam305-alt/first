import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { signToken, protect } from '../middleware/auth.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'govaly-dev-secret';
const REFRESH_SECRET = (process.env.JWT_SECRET || 'govaly-dev-secret') + '-refresh';

const signRefresh = (user) =>
  jwt.sign({ id: user._id, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '30d' });

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// read the httpOnly refresh cookie (no cookie-parser dep needed)
const cookieRefresh = (req) => {
  const raw = req.headers.cookie || '';
  const m = raw.match(/(?:^|;\s*)govaly_refresh=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

const issueSession = (res, user) => {
  const accessToken = signToken(user);
  const refreshToken = signRefresh(user);
  res.cookie('govaly_refresh', refreshToken, {
    httpOnly: true, sameSite: 'lax', path: '/api/auth', maxAge: 30 * 24 * 3600 * 1000,
  });
  return { accessToken, refreshToken };
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name?.trim() || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (!emailOk(email)) return res.status(400).json({ message: 'Please enter a valid email' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ name: name.trim(), email, phone: phone || '', password: await bcrypt.hash(password, 10) });
    const tokens = issueSession(res, user);
    res.status(201).json({ user, ...tokens });
  } catch (e) {
    res.status(500).json({ message: 'Could not create account', detail: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const tokens = issueSession(res, user);
    res.json({ user, ...tokens });
  } catch (e) {
    res.status(500).json({ message: 'Login failed', detail: e.message });
  }
});

// Exchange a valid refresh token (httpOnly cookie or body) for a new access token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.body?.refreshToken || cookieRefresh(req);
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const decoded = jwt.verify(token, REFRESH_SECRET);
    if (decoded.type !== 'refresh') return res.status(401).json({ message: 'Invalid token type' });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    const tokens = issueSession(res, user);
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('govaly_refresh', { path: '/api/auth' });
  res.json({ ok: true });
});

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

router.put('/me', protect, async (req, res) => {
  const { name, phone } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  res.json({ user: req.user });
});

// Change password (requires current password)
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!(await bcrypt.compare(currentPassword || '', req.user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ ok: true, message: 'Password updated' });
  } catch (e) {
    res.status(500).json({ message: 'Could not change password', detail: e.message });
  }
});

// ------- Forgot password (demo OTP flow) -------
const otpStore = new Map(); // email -> { otp, exp }
router.post('/forgot', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true, message: 'If that email exists, an OTP has been sent' });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(email, { otp, exp: Date.now() + 10 * 60 * 1000 });
  res.json({ ok: true, message: 'OTP sent to your email', demoOtp: otp });
});

router.post('/reset', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const otp = String(req.body?.otp || '').trim();
  const password = String(req.body?.password || '');
  const rec = otpStore.get(email);
  if (!rec || rec.exp < Date.now()) return res.status(400).json({ message: 'OTP expired — request a new one' });
  if (otp !== rec.otp) return res.status(400).json({ message: 'Incorrect OTP' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Account not found' });
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  otpStore.delete(email);
  res.json({ ok: true, message: 'Password updated — login with your new password' });
});

// ------- Addresses -------
router.post('/me/addresses', protect, async (req, res) => {
  const a = req.body;
  if (!a.fullName || !a.phone || !a.address) return res.status(400).json({ message: 'Name, phone and address are required' });
  if (a.isDefault) req.user.addresses.forEach((x) => (x.isDefault = false));
  req.user.addresses.push(a);
  await req.user.save();
  res.json({ addresses: req.user.addresses });
});

router.put('/me/addresses/:idx', protect, async (req, res) => {
  const i = Number(req.params.idx);
  if (!Number.isInteger(i) || i < 0 || i >= req.user.addresses.length)
    return res.status(404).json({ message: 'Address not found' });
  const a = req.body;
  if (!a.fullName || !a.phone || !a.address) return res.status(400).json({ message: 'Name, phone and address are required' });
  if (a.isDefault) req.user.addresses.forEach((x) => (x.isDefault = false));
  Object.assign(req.user.addresses[i], { ...a, instruction: a.instruction || '' });
  await req.user.save();
  res.json({ addresses: req.user.addresses });
});

router.patch('/me/addresses/:idx/default', protect, async (req, res) => {
  const i = Number(req.params.idx);
  if (!Number.isInteger(i) || i < 0 || i >= req.user.addresses.length)
    return res.status(404).json({ message: 'Address not found' });
  req.user.addresses.forEach((x, ix) => (x.isDefault = ix === i));
  await req.user.save();
  res.json({ addresses: req.user.addresses });
});

router.delete('/me/addresses/:idx', protect, async (req, res) => {
  const i = Number(req.params.idx);
  if (!Number.isInteger(i) || i < 0 || i >= req.user.addresses.length)
    return res.status(404).json({ message: 'Address not found' });
  req.user.addresses.splice(i, 1);
  await req.user.save();
  res.json({ addresses: req.user.addresses });
});

// ------- Wishlist (server-synced) -------
router.get('/wishlist', protect, async (req, res) => {
  await req.user.populate('wishlist');
  res.json({ items: req.user.wishlist });
});

router.post('/wishlist/:productId', protect, async (req, res) => {
  const id = req.params.productId;
  const i = req.user.wishlist.findIndex((w) => String(w) === id);
  if (i >= 0) req.user.wishlist.splice(i, 1);
  else req.user.wishlist.push(id);
  await req.user.save();
  await req.user.populate('wishlist');
  res.json({ items: req.user.wishlist, wishlisted: i < 0 });
});

export default router;
