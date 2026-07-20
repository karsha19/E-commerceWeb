import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PriceTag from '../components/PriceTag';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Loading your cart…</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted mb-6">Find something you like and it'll show up here.</p>
        <Link to="/products" className="btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Your cart</h1>

      <div className="flex flex-col gap-4 mb-8">
        {items.map(item => (
          <div key={item.cart_id} className="flex items-center gap-4 p-4 card">
            <div className="w-20 h-20 bg-paper rounded-md overflow-hidden shrink-0">
              {item.image && <img src={`${API_ORIGIN}${item.image}`} alt={item.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${item.product_id}`} className="font-medium hover:text-cobalt transition-colors line-clamp-2">
                {item.name}
              </Link>
              <div className="mt-1"><PriceTag price={Number(item.price)} discount={Number(item.discount)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 border border-line rounded-md hover:border-cobalt"
              >−</button>
              <span className="w-8 text-center font-mono">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_id, Math.min(item.stock, item.quantity + 1))}
                className="w-8 h-8 border border-line rounded-md hover:border-cobalt"
              >+</button>
            </div>
            <div className="w-24 text-right font-mono font-semibold">₹{item.line_total.toFixed(2)}</div>
            <button
              onClick={() => removeFromCart(item.product_id)}
              className="text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-72 p-5 card">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="tear-line my-3" />
          <div className="flex justify-between font-semibold mb-5">
            <span>Total</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-2.5 bg-ink text-paper rounded-md font-medium hover:bg-cobalt transition-colors"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
