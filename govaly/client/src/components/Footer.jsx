import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Music2, MessageCircle, Banknote } from 'lucide-react';
import { Logo } from './Header.jsx';

/* SRS footer — simple: brand · policies · support · social. COD is the only payment. */

const policies = [
  ['Return & Refund Policy', '/returns'],
  ['Shipping & Delivery Policy', '/shipping'],
  ['Privacy Policy', '/privacy'],
  ['Terms & Conditions', '/terms'],
];

const help = [
  ['Contact Us', '/contact'],
  ['FAQ', '/faq'],
  ['About Us', '/about'],
  ['Report a Product', '/report'],
];

const socials = [
  [Facebook, 'Facebook', 'https://facebook.com/govaly'],
  [Instagram, 'Instagram', 'https://instagram.com/govaly'],
  [Music2, 'TikTok', 'https://tiktok.com/@govaly'],
  [Youtube, 'YouTube', 'https://youtube.com/@govaly'],
  [MessageCircle, 'WhatsApp', 'https://wa.me/8801907104920'],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="fbrand"><Logo /></div>
            <div className="tagline">Bangladesh's Favorite Online Fashion Mall</div>
            <p className="dbid">DBID - 751626035</p>
          </div>

          <div>
            <h4>Govaly Policies</h4>
            {policies.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}
          </div>

          <div>
            <h4>Help & Support</h4>
            {help.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}
          </div>

          <div>
            <h4>Social Links</h4>
            {socials.map(([Ic, label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="soc-row">
                <Ic size={15} /> {label}
              </a>
            ))}
          </div>
        </div>

        {/* Payment strip — COD only (SRS) */}
        <div className="paywith">
          <span className="paywith-label">Payment Method</span>
          <div className="paywith-chips">
            <span className="pay-tile" style={{ color: '#12a150' }}><Banknote size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Cash on Delivery</span>
          </div>
        </div>

        <div className="footer-bottom" style={{ justifyContent: 'center' }}>
          <span>© {new Date().getFullYear()} Govaly Limited</span>
        </div>
      </div>
    </footer>
  );
}
