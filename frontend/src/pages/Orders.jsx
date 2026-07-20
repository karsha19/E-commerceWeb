import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLORS = {
  pending: 'bg-amber/20 text-amber-800 dark:text-amber-300',
  processing: 'bg-cobalt/10 text-cobalt',
  shipped: 'bg-cobalt/10 text-cobalt',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
};

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  }, []);

  if (orders === null) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
        <p className="text-muted mb-6">Once you place an order, it'll show up here.</p>
        <Link to="/products" className="px-5 py-2.5 bg-ink text-paper rounded-md font-medium hover:bg-cobalt transition-colors">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Order history</h1>
      <div className="flex flex-col gap-3">
        {orders.map(order => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex items-center justify-between p-4 border border-line rounded-lg hover:border-cobalt transition-colors"
          >
            <div>
              <p className="font-medium">Order #{order.id}</p>
              <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-line'}`}>
              {order.status}
            </span>
            <span className="font-mono font-semibold">₹{Number(order.total).toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
