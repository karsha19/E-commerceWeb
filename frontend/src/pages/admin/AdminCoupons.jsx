import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', discount_percent: '', expires_at: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/coupons');
    setCoupons(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/coupons', form);
      setForm({ code: '', discount_percent: '', expires_at: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create coupon');
    }
  }

  async function toggleActive(c) {
    await api.put(`/coupons/${c.id}`, { active: !c.active });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    load();
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 mb-8 p-4 border border-line rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <input
            required placeholder="CODE" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="input font-mono text-sm"
          />
          <input
            required type="number" placeholder="Discount %" value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
            className="input font-mono text-sm"
          />
        </div>
        <input
          type="date" value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          className="input text-sm"
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" className="self-start px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-cobalt transition-colors">
          Create coupon
        </button>
      </form>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 border border-line rounded-md text-sm">
              <span className="font-mono font-semibold">{c.code}</span>
              <span className="text-muted">{c.discount_percent}% off</span>
              {c.expires_at && <span className="text-muted text-xs">exp. {new Date(c.expires_at).toLocaleDateString()}</span>}
              <span className={`ml-auto badge ${c.active ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'badge-neutral'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => toggleActive(c)} className="text-cobalt hover:underline">
                {c.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-red-600 dark:text-red-400 hover:underline transition-colors">Delete</button>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-muted text-sm">No coupons yet.</p>}
        </div>
      )}
    </div>
  );
}
