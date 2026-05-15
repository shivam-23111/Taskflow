import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  IoLockClosedOutline,
  IoLogOutOutline,
  IoMailOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, email };
      if (password) payload.password = password;
      await API.put('/users/profile', payload);
      toast.success('Profile updated. Please re-login to see changes.');
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-lg border border-dark-800 bg-dark-900 p-5 lg:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-amber-400 text-2xl font-bold text-dark-950">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-primary-300">Account</p>
              <h2 className="text-2xl font-bold text-dark-50">{user?.name}</h2>
              <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase text-primary-200">
                <IoShieldCheckmarkOutline size={14} />
                {user?.role}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-coral-500/30 px-4 py-2 text-sm font-semibold text-coral-300 transition-colors hover:bg-coral-500/10"
          >
            <IoLogOutOutline size={18} />
            Sign Out
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-lg border border-dark-800 bg-dark-900 p-6">
          <h3 className="text-sm font-semibold uppercase text-dark-300">Profile Details</h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Full Name</label>
              <div className="relative">
                <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-dark-700 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Email</label>
              <div className="relative">
                <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-dark-700 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">
                New Password <span className="text-dark-600">(optional)</span>
              </label>
              <div className="relative">
                <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-lg border border-dark-700 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-dark-950 transition-colors hover:bg-primary-400 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <aside className="rounded-lg border border-dark-800 bg-dark-900 p-6">
          <h3 className="text-sm font-semibold uppercase text-dark-300">Access Snapshot</h3>
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-dark-800 bg-dark-950/60 p-4">
              <p className="text-xs font-semibold uppercase text-dark-500">Role</p>
              <p className="mt-2 text-lg font-bold capitalize text-dark-50">{user?.role}</p>
            </div>
            <div className="rounded-lg border border-dark-800 bg-dark-950/60 p-4">
              <p className="text-xs font-semibold uppercase text-dark-500">Session</p>
              <p className="mt-2 text-sm font-semibold text-primary-200">Authenticated</p>
            </div>
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-4">
              <p className="text-xs font-semibold uppercase text-amber-200">Note</p>
              <p className="mt-2 text-sm text-dark-300">
                Profile updates are saved immediately; re-login refreshes the visible session data.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ProfilePage;
