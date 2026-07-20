import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/products${query ? `?search=${encodeURIComponent(query)}` : ''}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link to="/" className="font-display font-bold text-xl tracking-tight shrink-0">
          YourPersonalFavouriteStore<span className="text-cobalt">.</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden sm:flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full px-3 py-2 text-sm bg-surface text-ink placeholder:text-muted border border-line rounded-l-md focus:outline-none focus:border-cobalt transition-colors"
          />
          <button type="submit" className="px-4 bg-ink text-paper text-sm rounded-r-md hover:bg-cobalt transition-colors">
            Search
          </button>
        </form>

        <nav className="flex items-center gap-5 ml-auto text-sm font-medium">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-line/60 transition-colors text-base"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link to="/products" className="hover:text-cobalt transition-colors hidden sm:inline">All Products</Link>
          {user && <Link to="/wishlist" className="hover:text-cobalt transition-colors hidden sm:inline">Wishlist</Link>}
          {user && <Link to="/orders" className="hover:text-cobalt transition-colors hidden sm:inline">Orders</Link>}
          {isAdmin && <Link to="/admin" className="hover:text-cobalt transition-colors">Admin</Link>}

          <Link to="/cart" className="relative hover:text-cobalt transition-colors">
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-amber text-[#12131A] text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="hover:text-cobalt transition-colors">{user.name.split(' ')[0]}</Link>
              <button onClick={logout} className="text-muted hover:text-ink transition-colors">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="px-3 py-1.5 bg-ink text-paper rounded-md hover:bg-cobalt transition-colors">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
