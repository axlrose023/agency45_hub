import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { getUserById } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import PasswordInput from '@/components/ui/PasswordInput';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tokens = await login({ username, password });
      setTokens(tokens.access_token, tokens.refresh_token);

      const decoded = jwtDecode<{ sub: string }>(tokens.access_token);
      const userData = await getUserById(decoded.sub);
      setUser(userData);

      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-200 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/agency45.png" alt="Agency45" className="w-20 h-20 rounded-full mb-4" />
            <h1 className="font-heading font-bold text-2xl tracking-tight text-brand-black">
              Agency45
            </h1>
            <p className="text-brand-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-heading font-medium text-brand-gray-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full border border-brand-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-heading font-medium text-brand-gray-700 mb-1.5">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-black text-white font-heading font-semibold py-3 rounded-lg hover:bg-brand-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-gray-400 text-xs mt-6">
          Agency45 Hub &mdash; Ad Management Platform
        </p>
      </div>
    </div>
  );
}
