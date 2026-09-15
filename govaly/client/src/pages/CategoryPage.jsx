import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { Spinner } from '../components/ui.jsx';

/**
 * Category Page (customer-facing, Task 3)
 * ├── Category Header / Banner
 * ├── Category Name
 * ├── Top Rated      → Product Grid
 * ├── For You        → Product Grid
 * └── Top Sold       → Product Grid
 */
const SECTIONS = [
  { key: 'top-rated', label: 'Top Rated', sort: 'rating', sub: 'Highest customer ratings in this category' },
  { key: 'for-you', label: 'For You', sort: 'new', sub: 'Fresh picks picked for you' },
  { key: 'top-sold', label: 'Top Sold', sort: 'popular', sub: 'Best sellers our customers keep buying' },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [category, setCategory] = useState(null);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setNotFound(false);

    api.get(`/categories/${slug}`)
      .then(({ data }) => {
        if (!live) return;
        if (data.category.isParent) {
          // parent categories (Men, Women…) open their full group listing
          nav(`/products?group=${data.category.slug}`, { replace: true });
          return;
        }
        setCategory(data.category);
        // fetch all three sections in parallel
        Promise.all(
          SECTIONS.map((s) =>
            api
              .get('/products', { params: { category: slug, sort: s.sort, limit: 12 } })
              .then(({ data }) => [s.key, data.items])
          )
        ).then((entries) => {
          if (!live) return;
          setSections(Object.fromEntries(entries));
          setLoading(false);
        });
      })
      .catch(() => live && (setNotFound(true), setLoading(false)));

    return () => { live = false; };
  }, [slug]);

  // sibling sub-categories (for the chips row)
  const [siblings, setSiblings] = useState([]);
  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      const cs = data.categories;
      const me = cs.find((c) => c.slug === slug);
      if (!me) return;
      setSiblings(cs.filter((c) => !c.isParent && c.parent === me.parent && c.slug !== slug));
    }).catch(() => {});
  }, [slug]);

  if (loading) return <Spinner />;
  if (notFound || !category)
    return (
      <div className="container empty">
        <h3>Category not found</h3>
        <p><Link className="link-brand" to="/products">Browse all products →</Link></p>
      </div>
    );

  return (
    <div className="container">
      {siblings.length > 0 && (
        <div className="chips" style={{ paddingTop: 14 }}>
          <Link className="chip" style={{ border: '1px solid var(--brand-100)', cursor: 'pointer' }} to={`/products?group=${category.parent}`}>
            All {category.parent.replace('-', ' ')}
          </Link>
          {siblings.map((s) => (
            <Link className="chip" style={{ border: '1px solid var(--brand-100)', cursor: 'pointer' }} to={`/category/${s.slug}`} key={s.slug}>
              {s.name}
            </Link>
          ))}
        </div>
      )}
      {category.banner && (
        <div className="cat-banner"><img src={category.banner} alt={category.name} /></div>
      )}

      <div className="section-head" style={{ paddingTop: 18 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>{category.name}</h2>
          <small>Cash on delivery · Delivery within 48 hrs · 7-day return</small>
        </div>
        <Link className="view-all" to={`/products?category=${category.slug}`}>
          All {category.name} <ChevronRight size={13} style={{ display: 'inline' }} />
        </Link>
      </div>

      {SECTIONS.map((s) => (
        <section className="section container" key={s.key} style={{ boxShadow: 'none', padding: 0, marginTop: 6 }}>
          <div className="section-head" style={{ paddingLeft: 4 }}>
            <div>
              <h2>{s.label}</h2>
              <small>{s.sub}</small>
            </div>
            <Link className="view-all" to={`/products?category=${category.slug}&sort=${s.sort === 'popular' ? 'popular' : s.sort === 'rating' ? 'rating' : 'new'}`}>
              View All →
            </Link>
          </div>
          {(sections[s.key]?.length || 0) === 0 ? (
            <p className="mut" style={{ padding: '4px 4px 14px' }}>No products here yet.</p>
          ) : (
            <div className="grid" style={{ paddingTop: 8 }}>
              {sections[s.key].map((p) => <ProductCard p={p} key={p._id} compact />)}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
