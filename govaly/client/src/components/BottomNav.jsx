import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

/* Mobile bottom navigation — SRS build: Home · Category · Cart · Profile */
const ITEMS = [
  { key: 'home', label: 'Home', to: '/', Icon: HomeIcon, match: (p) => p === '/' },
  { key: 'category', label: 'Category', to: '/products', Icon: LayoutGrid, match: (p) => p.startsWith('/products') || p.startsWith('/category') || p.startsWith('/seller') },
  { key: 'cart', label: 'Cart', to: '/cart', Icon: ShoppingCart, match: (p) => p.startsWith('/cart') || p.startsWith('/checkout') || p.startsWith('/payment') },
  { key: 'profile', label: 'Profile', to: '/profile', Icon: User, match: (p) => p.startsWith('/profile') || p.startsWith('/orders') || p.startsWith('/wishlist') },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { cartQty } = useStore();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {ITEMS.map(({ key, label, to, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={key} to={to} className={`bn-item${active ? ' active' : ''}`} data-bn={key}>
            <span className="bn-ico">
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              {key === 'cart' && cartQty > 0 && <span className="bn-badge">{cartQty > 9 ? '9+' : cartQty}</span>}
            </span>
            <span className="bn-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
