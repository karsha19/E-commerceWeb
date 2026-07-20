import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-32 text-center">
      <p className="price-tag price-tag--lg mb-6 inline-flex">404</p>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-muted mb-6">The page you're looking for doesn't exist or moved.</p>
      <Link to="/" className="px-5 py-2.5 bg-ink text-paper rounded-md font-medium hover:bg-cobalt transition-colors">
        Back home
      </Link>
    </div>
  );
}
