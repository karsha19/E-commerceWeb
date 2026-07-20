import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, category, sort, minPrice, maxPrice, page, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  function goToPage(p) {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="sm:w-56 shrink-0 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide text-muted">Category</h3>
            <div className="flex flex-col gap-1 text-sm">
              <button onClick={() => updateParam('category', '')} className={`text-left px-2 py-1 rounded ${!category ? 'bg-ink text-paper' : 'hover:bg-line'}`}>
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', String(c.id))}
                  className={`text-left px-2 py-1 rounded ${category === String(c.id) ? 'bg-ink text-paper' : 'hover:bg-line'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide text-muted">Price range</h3>
            <div className="flex gap-2">
              <input
                type="number" placeholder="Min" defaultValue={minPrice}
                onBlur={(e) => updateParam('minPrice', e.target.value)}
                className="w-full input text-sm font-mono"
              />
              <input
                type="number" placeholder="Max" defaultValue={maxPrice}
                onBlur={(e) => updateParam('maxPrice', e.target.value)}
                className="w-full input text-sm font-mono"
              />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted">
              {loading ? 'Loading…' : `${pagination.total ?? products.length} products`}
            </p>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input text-sm px-2 py-1.5"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-line/40 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium mb-1">No products match those filters.</p>
              <p className="text-muted text-sm">Try widening your price range or clearing a filter.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={goToPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
