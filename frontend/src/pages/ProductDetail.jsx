import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PriceTag from '../components/PriceTag';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setMessage('');
    api.get(`/products/${id}`).then(({ data }) => setProduct(data)).catch(() => setProduct(null));
    api.get(`/products/${id}/related`).then(({ data }) => setRelated(data)).catch(() => {});
    api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data)).catch(() => {});
    if (user) {
      api.post(`/recently-viewed/${id}`).catch(() => {});
    }
  }, [id, user]);

  async function handleAddToCart() {
    if (!user) return (window.location.href = '/login');
    await addToCart(product.id, quantity);
    setMessage('Added to cart.');
  }

  async function handleWishlist() {
    if (!user) return (window.location.href = '/login');
    await api.post('/wishlist', { product_id: product.id });
    setWishlisted(true);
  }

  async function submitReview(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      const { data } = await api.get(`/products/${id}/reviews`);
      setReviews(data);
      setMessage('Review submitted — thanks!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit review.');
    }
  }

  if (product === null) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid sm:grid-cols-2 gap-10 mb-16">
        <div className="aspect-square bg-paper border border-line rounded-lg flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img src={`${API_ORIGIN}${product.image}`} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-muted font-mono text-sm">No image</span>
          )}
        </div>

        <div>
          {product.brand && <span className="text-xs uppercase tracking-wide text-muted font-mono">{product.brand}</span>}
          <h1 className="text-3xl font-bold mt-1 mb-2">{product.name}</h1>
          {product.category_name && (
            <Link to={`/products?category=${product.category_id}`} className="text-sm text-cobalt hover:underline">
              {product.category_name}
            </Link>
          )}

          <div className="flex items-center gap-3 mt-4">
            <StarRating rating={Number(product.rating)} size="lg" />
            <span className="text-sm text-muted">({reviews.length} reviews)</span>
          </div>

          <div className="mt-5">
            <PriceTag price={Number(product.price)} discount={Number(product.discount)} size="lg" />
          </div>

          <p className="text-muted mt-5 leading-relaxed">{product.description}</p>

          <div className="mt-6 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-700 dark:text-green-400 font-medium">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-medium">Out of stock</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <input
              type="number" min={1} max={product.stock || 1} value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 input font-mono"
            />
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="px-6 py-2.5 bg-ink text-paper rounded-md font-medium hover:bg-cobalt transition-colors disabled:opacity-40"
            >
              Add to cart
            </button>
            <button
              onClick={handleWishlist}
              className="btn-secondary"
            >
              {wishlisted ? '♥ Saved' : '♡ Wishlist'}
            </button>
          </div>

          {message && <p className="text-sm text-cobalt mt-3">{message}</p>}
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-16 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        {user && (
          <form onSubmit={submitReview} className="mb-8 p-4 border border-line rounded-lg flex flex-col gap-3">
            <label className="text-sm font-medium flex flex-col gap-1">
              Your rating
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                className="w-24 input text-sm"
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your thoughts on this product…"
              rows={3}
              className="input text-sm"
            />
            <button type="submit" className="self-start px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-cobalt transition-colors">
              Submit review
            </button>
            <p className="text-xs text-muted">You can only review products from delivered orders.</p>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-muted text-sm">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-5 tear-line pt-5">
            {reviews.map(r => (
              <div key={r.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-sm font-medium">{r.user_name}</span>
                </div>
                {r.comment && <p className="text-sm text-muted">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
