import { getAdAccounts } from '@/api/facebook';
import { type BroadcastPeriod, getChatId, getRegistrationLink, sendBroadcast, telegramLogout, toggleDailyReports } from '@/api/telegram';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/locale';
import { useAuthStore } from '@/store/authStore';
import { BarChart3, Bell, BellOff, Building2, Calendar, CalendarDays, Check, Clock, ExternalLink, LogOut, MessageCircle, RefreshCw, Send, Shield, Unlink, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [telegramConnected, setTelegramConnected] = useState<boolean>(Boolean(user?.telegram_chat_id));
  const [chatId, setChatId] = useState<number | null>(user?.telegram_chat_id ?? null);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(
    user?.telegram_username ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [waitingForBot, setWaitingForBot] = useState(false);
  const [botLink, setBotLink] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [adAccountName, setAdAccountName] = useState<string | null>(null);

  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [dailyToggling, setDailyToggling] = useState(false);

  const [broadcastLoading, setBroadcastLoading] = useState<BroadcastPeriod | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');

  const checkConnection = useCallback(async () => {
    setChecking(true);
    try {
      const data = await getChatId();
      setChatId(data.chat_id);
      setTelegramUsername(data.telegram_username);
      setDailyEnabled(data.telegram_daily_enabled);
      if (data.chat_id) {
        setTelegramConnected(true);
        setWaitingForBot(false);
        setBotLink(null);
      } else {
        setTelegramConnected(false);
      }
    } catch {
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (user?.ad_account_id) {
      getAdAccounts()
        .then((accounts) => {
          const match = accounts.find((a) => a.account_id === user.ad_account_id);
          if (match) setAdAccountName(match.name || null);
        })
        .catch(() => { });
    }
  }, [user?.ad_account_id]);

  useEffect(() => {
    if (!waitingForBot) return;
    const interval = setInterval(() => {
      getChatId()
        .then((data) => {
          if (data.chat_id) {
            setChatId(data.chat_id);
            setTelegramUsername(data.telegram_username);
            setTelegramConnected(true);
            setWaitingForBot(false);
            setBotLink(null);
          }
        })
        .catch(() => { });
    }, 3000);
    return () => clearInterval(interval);
  }, [waitingForBot]);

  const handleConnectTelegram = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRegistrationLink(locale === 'ru' ? 'ru' : 'ua');
      setBotLink(data.registration_link);
      setWaitingForBot(true);
      window.open(data.registration_link, '_blank');
    } catch {
      setError(t('registrationLinkFailed'));
    }
    setLoading(false);
  };

  const handleDisconnectTelegram = async () => {
    setLoading(true);
    try {
      await telegramLogout();
      setTelegramConnected(false);
      setChatId(null);
      setTelegramUsername(null);
      setWaitingForBot(false);
      setBotLink(null);
    } catch {
    }
    setLoading(false);
  };

  const handleBroadcast = async (period: BroadcastPeriod) => {
    setBroadcastLoading(period);
    setBroadcastSuccess(false);
    setBroadcastError('');
    try {
      await sendBroadcast(period, locale === 'ru' ? 'ru' : 'ua');
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    } catch {
      setBroadcastError(t('broadcastError'));
      setTimeout(() => setBroadcastError(''), 4000);
    }
    setBroadcastLoading(null);
  };

  const handleToggleDaily = async () => {
    setDailyToggling(true);
    try {
      const newValue = !dailyEnabled;
      await toggleDailyReports(newValue);
      setDailyEnabled(newValue);
    } catch {
    }
    setDailyToggling(false);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (!user) return null;

  const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}`;
  };

  const getDateRange = (period: BroadcastPeriod): string => {
    const today = new Date();
    const fmt = formatDate(today);
    if (period === 'today') return fmt;
    if (period === 'yesterday') {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return formatDate(d);
    }
    if (period === 'week') {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return `${formatDate(d)} – ${fmt}`;
    }
    if (period === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      return `${formatDate(d)} – ${fmt}`;
    }
    if (period === 'last30') {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return `${formatDate(d)} – ${fmt}`;
    }
    return fmt;
  };

  const broadcastButtons: { period: BroadcastPeriod; label: string; icon: typeof Calendar }[] = [
    { period: 'today', label: t('broadcastToday'), icon: Clock },
    { period: 'yesterday', label: t('broadcastYesterday'), icon: Calendar },
    { period: 'week', label: t('broadcastWeek'), icon: CalendarDays },
    { period: 'month', label: t('broadcastMonth'), icon: BarChart3 },
    { period: 'last30', label: t('broadcastLast30'), icon: CalendarDays },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
          {t('profileTitle')}
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">{t('profileSubtitle')}</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-brand-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-brand-gray-200 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-heading font-bold text-brand-gray-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-brand-black">{user.username}</h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-heading font-medium mt-1 ${user.is_admin
                  ? 'bg-brand-accent/10 text-brand-accent'
                  : 'bg-brand-gray-100 text-brand-gray-600'
                }`}
            >
              {user.is_admin ? <Shield size={12} /> : <User size={12} />}
              {user.is_admin ? t('profileRoleAdmin') : t('profileRoleUser')}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 py-3 border-t border-brand-gray-100">
            <Building2 size={18} className="text-brand-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-gray-500 font-heading uppercase tracking-wider">
                {t('adAccountLabel')}
              </p>
              {user.ad_account_id ? (
                <div>
                  <p className="text-sm text-brand-black font-medium">
                    {adAccountName || user.ad_account_id}
                  </p>
                  {adAccountName && (
                    <p className="text-xs text-brand-gray-400">ID: {user.ad_account_id}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-brand-gray-400">{t('noAccountAssigned')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Card */}
      <div className="bg-white rounded-xl border border-brand-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle size={20} className="text-brand-gray-600" />
          <h3 className="font-heading font-semibold text-brand-black">
            {t('telegramIntegrationTitle')}
          </h3>
        </div>

        {telegramConnected ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-emerald-700 font-medium">
                {t('connected')}
              </span>
              {chatId && (
                <span className="text-xs text-brand-gray-400 ml-2">
                  {t('chatIdLabel')}: {chatId}
                </span>
              )}
              {telegramUsername && (
                <span className="text-xs text-brand-gray-400 ml-2">
                  @{telegramUsername}
                </span>
              )}
            </div>
            <button
              onClick={handleDisconnectTelegram}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-heading font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Unlink size={16} />
              {t('disconnectTelegram')}
            </button>
          </div>
        ) : waitingForBot ? (
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-amber-800 font-medium">
                  {t('waitingTelegramConnection')}
                </span>
              </div>
              <p className="text-xs text-amber-700">
                {t('waitingTelegramDescription')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {botLink && (
                <a
                  href={botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-black text-white rounded-lg text-sm font-heading font-medium hover:bg-brand-gray-800 transition-colors"
                >
                  <ExternalLink size={16} />
                  {t('openTelegramAgain')}
                </a>
              )}
              <button
                onClick={checkConnection}
                disabled={checking}
                className="flex items-center gap-2 px-4 py-2.5 border border-brand-gray-300 rounded-lg text-sm font-heading font-medium hover:bg-brand-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
                {t('checkStatus')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-brand-gray-600 mb-4">
              {t('connectTelegramDescription')}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-200 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleConnectTelegram}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-black text-white rounded-lg text-sm font-heading font-medium hover:bg-brand-gray-800 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {loading ? t('connecting') : t('connectTelegram')}
            </button>
          </div>
        )}
      </div>

      {/* Broadcast Card - only when Telegram is connected */}
      {telegramConnected && (
        <div className="bg-white rounded-xl border border-brand-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={20} className="text-brand-gray-600" />
            <h3 className="font-heading font-semibold text-brand-black">
              {t('broadcastTitle')}
            </h3>
          </div>

          <p className="text-sm text-brand-gray-500 mb-4">
            {t('broadcastDescription')}
          </p>

          {/* Daily toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-brand-gray-200 mb-4">
            <div className="flex items-center gap-3">
              {dailyEnabled ? (
                <Bell size={18} className="text-brand-accent" />
              ) : (
                <BellOff size={18} className="text-brand-gray-400" />
              )}
              <div>
                <p className="text-sm font-heading font-medium text-brand-black">
                  {t('dailyReportsLabel')}
                </p>
                <p className="text-xs text-brand-gray-400">
                  {t('dailyReportsDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleDaily}
              disabled={dailyToggling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dailyEnabled ? 'bg-brand-accent' : 'bg-brand-gray-300'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dailyEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {broadcastSuccess && (
            <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-4 py-3 border border-emerald-200 mb-4 flex items-center gap-2">
              <Check size={16} />
              {t('broadcastSent')}
            </div>
          )}

          {broadcastError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-200 mb-4">
              {broadcastError}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {broadcastButtons.map(({ period, label, icon: Icon }) => (
              <button
                key={period}
                onClick={() => handleBroadcast(period)}
                disabled={broadcastLoading !== null}
                className="flex flex-col items-center gap-2 px-3 py-3 border border-brand-gray-200 rounded-lg text-sm font-heading font-medium text-brand-gray-700 hover:bg-brand-gray-50 hover:border-brand-gray-300 transition-colors disabled:opacity-50"
              >
                {broadcastLoading === period ? (
                  <RefreshCw size={18} className="animate-spin text-brand-accent" />
                ) : (
                  <Icon size={18} className="text-brand-gray-500" />
                )}
                <span className="text-xs">
                  {broadcastLoading === period ? t('broadcastSending') : label}
                </span>
                <span className="text-[10px] text-brand-gray-400 font-normal">
                  {getDateRange(period)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="bg-white rounded-xl border border-brand-gray-200 p-4 sm:p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-heading font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          {t('signOut')}
        </button>
      </div>
    </div>
  );
}
