import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/orders/admin/analytics').then(({ data }) => setData(data)).catch(() => setData(false));
  }, []);

  if (data === null) return <p className="text-muted">Loading…</p>;
  if (data === false) return <p className="text-muted">Could not load analytics.</p>;

  const maxRevenue = Math.max(...data.dailySales.map(d => Number(d.revenue)), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-5 border border-line rounded-lg">
          <p className="text-xs uppercase text-muted font-mono mb-1">Total orders</p>
          <p className="text-2xl font-bold font-mono">{data.totals.total_orders}</p>
        </div>
        <div className="p-5 border border-line rounded-lg">
          <p className="text-xs uppercase text-muted font-mono mb-1">Total revenue</p>
          <p className="text-2xl font-bold font-mono">₹{Number(data.totals.total_revenue).toFixed(2)}</p>
        </div>
        <div className="p-5 border border-line rounded-lg">
          <p className="text-xs uppercase text-muted font-mono mb-1">Pending orders</p>
          <p className="text-2xl font-bold font-mono">
            {data.byStatus.find(s => s.status === 'pending')?.count || 0}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">Orders by status</h2>
          <div className="flex flex-col gap-2">
            {data.byStatus.map(s => (
              <div key={s.status} className="flex items-center justify-between text-sm border-b border-line pb-2">
                <span className="capitalize">{s.status}</span>
                <span className="font-mono">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Top products</h2>
          <div className="flex flex-col gap-2">
            {data.topProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-line pb-2">
                <span className="line-clamp-1">{p.name}</span>
                <span className="font-mono text-muted">{p.units_sold} sold</span>
              </div>
            ))}
            {data.topProducts.length === 0 && <p className="text-sm text-muted">No sales yet.</p>}
          </div>
        </div>
      </div>

      {data.dailySales.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold mb-3">Last 30 days</h2>
          <div className="flex items-end gap-1 h-32 border-b border-line">
            {data.dailySales.map(d => (
              <div
                key={d.date}
                title={`${d.date}: ₹${Number(d.revenue).toFixed(2)}`}
                className="flex-1 bg-cobalt/70 hover:bg-cobalt transition-colors rounded-t-sm"
                style={{ height: `${(Number(d.revenue) / maxRevenue) * 100}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
