import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'govaly-dev-secret', {
    expiresIn: '7d',
  });

// Require a valid Bearer token; attaches req.user
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please login to continue' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'govaly-dev-secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Session expired, login again' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired, login again' });
  }
}

// Allow only admins
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
}

// Optional auth — attaches req.user if a valid token exists, never blocks
export async function softAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'govaly-dev-secret');
      req.user = await User.findById(decoded.id);
    }
  } catch {
    /* ignore */
  }
  next();
}
