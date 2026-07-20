import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/orders/admin/all', { params: statusFilter ? { status: statusFilter } : {} });
    setOrders(data.orders);
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">#{o.id}</td>
                  <td className="px-4 py-3">
                    <div>{o.customer_name}</div>
                    <div className="text-muted text-xs">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono">₹{Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="input text-sm py-1 capitalize"
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
