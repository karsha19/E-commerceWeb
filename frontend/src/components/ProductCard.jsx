import { Link } from 'react-router-dom';
import PriceTag from './PriceTag';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  async function handleAdd(e) {
    e.preventDefault();
    if (!user) return (window.location.href = '/login');
    try {
      await addToCart(product.id, 1);
    } catch {
      // could surface a toast here
    }
  }

  const imgSrc = product.image
    ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${product.image}`
    : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col card-hover overflow-hidden relative"
    >
      {product.discount > 0 && (
        <span className="absolute top-2 left-2 z-10 badge bg-amber text-[#12131A] font-mono">
          −{Number(product.discount)}%
        </span>
      )}
      <div className="aspect-square bg-paper flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-muted text-sm font-mono">No image</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        {product.brand && <span className="text-xs uppercase tracking-wide text-muted font-mono">{product.brand}</span>}
        <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2">{product.name}</h3>
        {product.rating > 0 && <StarRating rating={Number(product.rating)} />}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <PriceTag price={Number(product.price)} discount={Number(product.discount)} />
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="text-sm font-medium px-3 py-1.5 rounded-md bg-ink text-paper hover:bg-cobalt transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Add
          </button>
        </div>
        {product.stock === 0 && (
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Out of stock</span>
        )}
      </div>
    </Link>
  );
}
