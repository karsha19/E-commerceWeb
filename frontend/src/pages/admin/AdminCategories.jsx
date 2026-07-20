import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/categories');
    setCategories(data);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!newName.trim()) return;
    try {
      await api.post('/categories', { name: newName.trim() });
      setNewName('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add category');
    }
  }

  async function handleSaveEdit(id) {
    await api.put(`/categories/${id}`, { name: editName.trim() });
    setEditingId(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Products in it will be uncategorized.')) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 input"
        />
        <button type="submit" className="px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-cobalt transition-colors">
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600 dark:text-red-400 dark:text-red-400 mb-4">{error}</p>}

      <div className="flex flex-col gap-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-2 px-4 py-2.5 border border-line rounded-md">
            {editingId === cat.id ? (
              <>
                <input
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 input text-sm py-1"
                  autoFocus
                />
                <button onClick={() => handleSaveEdit(cat.id)} className="text-cobalt text-sm hover:underline">Save</button>
                <button onClick={() => setEditingId(null)} className="text-muted text-sm hover:underline">Cancel</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{cat.name}</span>
                <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-cobalt text-sm hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(cat.id)} className="text-red-600 text-sm hover:underline">Delete</button>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="text-muted text-sm">No categories yet.</p>}
      </div>
    </div>
  );
}
