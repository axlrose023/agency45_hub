import { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser } from '@/api/users';
import { getAdAccounts } from '@/api/facebook';
import type { UserResponse, UsersPaginationResponse } from '@/types/user';
import type { AdAccountResponse } from '@/types/facebook';
import Pagination from '@/components/ui/Pagination';
import PasswordInput from '@/components/ui/PasswordInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, X, Shield, User } from 'lucide-react';

export default function UsersPage() {
  const [data, setData] = useState<UsersPaginationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adAccounts, setAdAccounts] = useState<AdAccountResponse[]>([]);

  // Create user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAdAccountId, setNewAdAccountId] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: 10 };
      if (search) params.username__search = search;
      const result = await getUsers(params as any);
      setData(result);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    getAdAccounts().then(setAdAccounts).catch(() => {});
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await createUser({
        username: newUsername,
        password: newPassword,
        ad_account_id: newAdAccountId || null,
      });
      setShowModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewAdAccountId('');
      fetchUsers();
    } catch {
      setCreateError('Failed to create user');
    }
    setCreating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-brand-black">Users</h1>
          <p className="text-brand-gray-500 text-sm mt-1">Manage users and account assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-black text-white rounded-lg font-heading font-medium text-sm hover:bg-brand-gray-800 transition-colors"
        >
          <Plus size={18} />
          Create User
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-brand-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No Users Found" description="No users match your search criteria." />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-brand-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-gray-200 bg-brand-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-brand-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Ad Account
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Telegram
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-100">
                {data.items.map((user: UserResponse) => (
                  <tr key={user.id} className="hover:bg-brand-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gray-200 flex items-center justify-center">
                          <span className="text-xs font-heading font-bold text-brand-gray-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-black">{user.username}</p>
                          <p className="text-xs text-brand-gray-400">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-heading font-medium ${
                          user.is_admin
                            ? 'bg-brand-accent/10 text-brand-accent'
                            : 'bg-brand-gray-100 text-brand-gray-600'
                        }`}
                      >
                        {user.is_admin ? <Shield size={12} /> : <User size={12} />}
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-brand-gray-600">
                        {user.ad_account_id || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.telegram_chat_id
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-brand-gray-100 text-brand-gray-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.telegram_chat_id ? 'bg-emerald-500' : 'bg-brand-gray-400'
                          }`}
                        />
                        {user.telegram_chat_id ? 'Connected' : 'Not connected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />
        </>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-lg">Create User</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-gray-400 hover:text-brand-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-heading font-medium text-brand-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full border border-brand-gray-300 rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-medium text-brand-gray-700 mb-1.5">
                  Password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-medium text-brand-gray-700 mb-1.5">
                  Ad Account
                </label>
                <select
                  value={newAdAccountId}
                  onChange={(e) => setNewAdAccountId(e.target.value)}
                  className="w-full border border-brand-gray-300 rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent bg-white"
                >
                  <option value="">No account assigned</option>
                  {adAccounts.map((acc) => (
                    <option key={acc.account_id} value={acc.account_id}>
                      {acc.name || acc.account_id} ({acc.account_id})
                    </option>
                  ))}
                </select>
              </div>

              {createError && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-200">
                  {createError}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-brand-black text-white font-heading font-semibold py-3 rounded-lg hover:bg-brand-gray-800 transition-colors disabled:opacity-50 text-sm"
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
