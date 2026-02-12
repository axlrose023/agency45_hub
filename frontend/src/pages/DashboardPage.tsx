import { getAdAccounts } from '@/api/facebook';
import EmptyState from '@/components/ui/EmptyState';
import FacebookConnect from '@/components/ui/FacebookConnect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useI18n } from '@/i18n/locale';
import { useAuthStore } from '@/store/authStore';
import type { AdAccountResponse } from '@/types/facebook';
import axios from 'axios';
import { Building2, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AccountCard({
  account,
  onClick,
  t,
}: {
  account: AdAccountResponse;
  onClick: () => void;
  t: (key: string) => string;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-brand-gray-200 p-6 text-left hover:shadow-md hover:border-brand-gray-300 transition-all group w-full"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-gray-100 flex items-center justify-center">
            <Building2 size={20} className="text-brand-gray-600" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-brand-black">
              {account.name || t('accountUnnamed')}
            </h3>
            <p className="text-xs text-brand-gray-500 mt-0.5">ID: {account.account_id}</p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-brand-gray-400 group-hover:text-brand-black transition-colors mt-1"
        />
      </div>

      <div className="flex items-center gap-3 mt-4">
        {account.currency && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-heading font-medium bg-brand-gray-100 text-brand-gray-600">
            {account.currency}
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-heading font-medium ${account.account_status === 1
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-brand-gray-100 text-brand-gray-600'
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${account.account_status === 1 ? 'bg-emerald-500' : 'bg-brand-gray-400'
              }`}
          />
          {account.account_status === 1 ? t('accountActive') : t('accountInactive')}
        </span>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<AdAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsFacebookConnect, setNeedsFacebookConnect] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.is_admin ?? false;

  const loadAccounts = useCallback(() => {
    setLoading(true);
    setError('');
    setNeedsFacebookConnect(false);
    getAdAccounts()
      .then(setAccounts)
      .catch((err) => {
        const isNotConnected =
          axios.isAxiosError(err) &&
          err.response?.status === 400 &&
          typeof err.response?.data?.detail === 'string' &&
          err.response.data.detail.toLowerCase().includes('not connected');

        if (isNotConnected) {
          setNeedsFacebookConnect(true);
        } else {
          setError(t('dashboardLoadAccountsError'));
        }
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  if (loading) return <LoadingSpinner size="lg" />;

  if (needsFacebookConnect) {
    if (isAdmin) {
      return <FacebookConnect onConnected={loadAccounts} />;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-brand-gray-200 p-8 sm:p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-brand-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand-gray-400" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <h2 className="text-xl font-heading font-bold text-brand-black mb-2">
              {t('facebookNotConnected')}
            </h2>
            <p className="text-sm text-brand-gray-500 font-body">
              {t('facebookContactAdmin')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  if (accounts.length === 0) {
    return (
      <div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
            {t('dashboardAdAccounts')}
          </h1>
        </div>
        <EmptyState
          title={t('dashboardNoAccountsTitle')}
          description={t('dashboardNoAccountsDescription')}
        />
      </div>
    );
  }

  if (accounts.length === 1) {
    const account = accounts[0];
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
            {t('dashboardYourAdAccount')}
          </h1>
          <p className="text-brand-gray-500 text-sm mt-1">
            {t('dashboardClickPerformance')}
          </p>
        </div>
        <div className="w-full max-w-md">
          <AccountCard
            account={account}
            onClick={() => navigate(`/accounts/${account.account_id}`, { state: { accountName: account.name } })}
            t={t}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
          {t('dashboardAdAccounts')}
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          {t('dashboardSelectAccountPerformance')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.account_id}
            account={account}
            onClick={() => navigate(`/accounts/${account.account_id}`, { state: { accountName: account.name } })}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
