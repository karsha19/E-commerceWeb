import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PriceTag from '../components/PriceTag';
import { useCart } from '../context/CartContext';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function Wishlist() {
  const [items, setItems] = useState(null);
  const { addToCart } = useCart();

  async function load() {
    const { data } = await api.get('/wishlist');
    setItems(data);
  }

  useEffect(() => { load(); }, []);

  async function remove(productId) {
    await api.delete(`/wishlist/${productId}`);
    load();
  }

  async function moveToCart(productId) {
    await addToCart(productId, 1);
    await remove(productId);
  }

  if (items === null) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
        <p className="text-muted mb-6">Save things you're thinking about — they'll show up here.</p>
        <Link to="/products" className="btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Wishlist</h1>
      <div className="flex flex-col gap-4">
        {items.map(item => (
          <div key={item.wishlist_id} className="flex items-center gap-4 p-4 card">
            <div className="w-20 h-20 bg-paper rounded-md overflow-hidden shrink-0">
              {item.image && <img src={`${API_ORIGIN}${item.image}`} alt={item.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${item.product_id}`} className="font-medium hover:text-cobalt transition-colors line-clamp-2">
                {item.name}
              </Link>
              <div className="mt-1"><PriceTag price={Number(item.price)} discount={Number(item.discount)} /></div>
            </div>
            <button
              onClick={() => moveToCart(item.product_id)}
              disabled={item.stock === 0}
              className="px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-cobalt transition-colors disabled:opacity-40"
            >
              Move to cart
            </button>
            <button onClick={() => remove(item.product_id)} className="text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
