import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discount: '', brand: '',
    stock: '', category_id: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        setForm({
          name: data.name, description: data.description || '', price: data.price,
          discount: data.discount || 0, brand: data.brand || '', stock: data.stock,
          category_id: data.category_id || ''
        });
        setExistingImage(data.image);
      });
    }
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit product' : 'Add product'}</h1>

      {error && <div className="mb-4 alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input" />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Price (₹)
            <input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input font-mono" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Discount (%)
            <input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="input font-mono" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Brand
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Stock
            <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="input font-mono" />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Category
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="input">
            <option value="">— None —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Product image
          {existingImage && !imageFile && (
            <p className="text-xs text-muted mb-1">Current image on file — upload a new one to replace it.</p>
          )}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImageFile(e.target.files[0])}
            className="text-sm" />
        </label>

        <button type="submit" disabled={submitting}
          className="mt-2 px-4 py-2.5 bg-ink text-paper rounded-md font-medium hover:bg-cobalt transition-colors disabled:opacity-50">
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </div>
  );
}
