import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/users');
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(u) {
    const newRole = u.role === 'admin' ? 'customer' : 'admin';
    await api.put(`/users/${u.id}/role`, { role: newRole });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user account? This cannot be undone.')) return;
    await api.delete(`/users/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {u.id !== currentUser.id ? (
                      <>
                        <button onClick={() => toggleRole(u)} className="text-cobalt hover:underline mr-4">
                          {u.role === 'admin' ? 'Make customer' : 'Make admin'}
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="text-red-600 dark:text-red-400 hover:underline transition-colors">Delete</button>
                      </>
                    ) : (
                      <span className="text-muted text-xs">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
