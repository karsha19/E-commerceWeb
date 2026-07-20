import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [pwMessage, setPwMessage] = useState('');

  useEffect(() => {
    api.get('/auth/profile').then(({ data }) => setForm({ name: data.name, email: data.email }));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/auth/profile', form);
      setUser({ ...user, name: form.name, email: form.email });
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update profile.');
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMessage('');
    try {
      await api.put('/auth/change-password', pwForm);
      setPwMessage('Password changed.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMessage(err.response?.data?.message || 'Could not change password.');
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col gap-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">Your profile</h1>
        {message && <p className="text-sm text-cobalt mb-3">{message}</p>}
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input" />
          </label>
          <button type="submit" className="self-start px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-cobalt transition-colors">
            Save changes
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Change password</h2>
        {pwMessage && <p className="text-sm text-cobalt mb-3">{pwMessage}</p>}
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Current password
            <input type="password" required value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            New password
            <input type="password" required minLength={6} value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="input" />
          </label>
          <button type="submit" className="self-start px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-cobalt transition-colors">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
