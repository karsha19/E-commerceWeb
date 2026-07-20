import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
    api.get('/products?sort=newest&limit=8').then(({ data }) => setFeatured(data.products)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero: the featured drop, not a stat block */}
      <section className="border-b border-line bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block price-tag mb-6">This week's drop</span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05] mb-5">
              Everyday goods,<br />honestly priced.
            </h1>
            <p className="text-muted text-lg max-w-md mb-8">
              No card required — pay cash on delivery. Every price you see is the price you pay.
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-ink text-paper rounded-md font-medium hover:bg-cobalt transition-colors"
            >
              Browse all products
            </Link>
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map(i => {
              const product = featured[i];
              const offset = i === 1 ? 'mt-8' : i === 2 ? '-mt-8' : '';
              const imgSrc = product?.image
                ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${product.image}`
                : null;
              return (
                <Link
                  key={i}
                  to={product ? `/products/${product.id}` : '/products'}
                  className={`aspect-square bg-paper border border-line rounded-lg overflow-hidden flex items-center justify-center hover:border-cobalt transition-colors ${offset}`}
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted text-xs font-mono px-3 text-center">
                      {product ? product.name : ''}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category chips */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="px-4 py-2 border border-line rounded-full text-sm font-medium hover:border-cobalt hover:text-cobalt transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured / newest products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">New in</h2>
          <Link to="/products" className="text-sm text-cobalt hover:underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted">No products yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
