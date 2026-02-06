import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRegistrationLink, telegramLogout, getChatId } from '@/api/telegram';
import { Shield, User, Building2, MessageCircle, Link, Unlink } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [telegramConnected, setTelegramConnected] = useState<boolean>(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [registrationLink, setRegistrationLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getChatId()
      .then((data) => {
        setChatId(data.chat_id);
        setTelegramConnected(!!data.chat_id);
      })
      .catch(() => {});
  }, []);

  const handleConnectTelegram = async () => {
    setLoading(true);
    try {
      const data = await getRegistrationLink();
      setRegistrationLink(data.registration_link);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleDisconnectTelegram = async () => {
    setLoading(true);
    try {
      await telegramLogout();
      setTelegramConnected(false);
      setChatId(null);
      setRegistrationLink(null);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-brand-black">Profile</h1>
        <p className="text-brand-gray-500 text-sm mt-1">Your account information</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-brand-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-gray-200 flex items-center justify-center">
            <span className="text-2xl font-heading font-bold text-brand-gray-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-brand-black">{user.username}</h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-heading font-medium mt-1 ${
                user.is_admin
                  ? 'bg-brand-accent/10 text-brand-accent'
                  : 'bg-brand-gray-100 text-brand-gray-600'
              }`}
            >
              {user.is_admin ? <Shield size={12} /> : <User size={12} />}
              {user.is_admin ? 'Administrator' : 'User'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 py-3 border-t border-brand-gray-100">
            <Building2 size={18} className="text-brand-gray-400" />
            <div>
              <p className="text-xs text-brand-gray-500 font-heading uppercase tracking-wider">
                Ad Account
              </p>
              <p className="text-sm text-brand-black font-medium">
                {user.ad_account_id || 'No account assigned'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Card */}
      <div className="bg-white rounded-xl border border-brand-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle size={20} className="text-brand-gray-600" />
          <h3 className="font-heading font-semibold text-brand-black">Telegram Integration</h3>
        </div>

        {telegramConnected ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-emerald-700 font-medium">Connected</span>
              {chatId && (
                <span className="text-xs text-brand-gray-400 ml-2">Chat ID: {chatId}</span>
              )}
            </div>
            <button
              onClick={handleDisconnectTelegram}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-heading font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Unlink size={16} />
              Disconnect Telegram
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-brand-gray-600 mb-4">
              Connect your Telegram account to receive notifications.
            </p>

            {registrationLink ? (
              <div className="bg-brand-gray-50 rounded-lg p-4 border border-brand-gray-200">
                <p className="text-sm text-brand-gray-600 mb-2">
                  Click the link below to connect your Telegram:
                </p>
                <a
                  href={registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-accent font-medium hover:underline break-all"
                >
                  <Link size={14} />
                  {registrationLink}
                </a>
              </div>
            ) : (
              <button
                onClick={handleConnectTelegram}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-black text-white rounded-lg text-sm font-heading font-medium hover:bg-brand-gray-800 transition-colors disabled:opacity-50"
              >
                <Link size={16} />
                {loading ? 'Loading...' : 'Connect Telegram'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
