import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdAccounts } from '@/api/facebook';
import type { AdAccountResponse } from '@/types/facebook';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, ChevronRight } from 'lucide-react';

function AccountCard({ account, onClick }: { account: AdAccountResponse; onClick: () => void }) {
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
              {account.name || 'Unnamed Account'}
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
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-heading font-medium ${
            account.account_status === 1
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-brand-gray-100 text-brand-gray-600'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              account.account_status === 1 ? 'bg-emerald-500' : 'bg-brand-gray-400'
            }`}
          />
          {account.account_status === 1 ? 'Active' : 'Inactive'}
        </span>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<AdAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAdAccounts()
      .then(setAccounts)
      .catch(() => setError('Failed to load ad accounts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  if (accounts.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-brand-black">Ad Accounts</h1>
        </div>
        <EmptyState
          title="No Ad Accounts"
          description="No ad accounts are available. Contact your administrator."
        />
      </div>
    );
  }

  // Single account — centered prominent card
  if (accounts.length === 1) {
    const account = accounts[0];
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-brand-black">Your Ad Account</h1>
          <p className="text-brand-gray-500 text-sm mt-1">
            Click to view campaign performance
          </p>
        </div>
        <div className="w-full max-w-md">
          <AccountCard
            account={account}
            onClick={() => navigate(`/accounts/${account.account_id}`)}
          />
        </div>
      </div>
    );
  }

  // Multiple accounts — grid
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-brand-black">Ad Accounts</h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Select an account to view campaign performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.account_id}
            account={account}
            onClick={() => navigate(`/accounts/${account.account_id}`)}
          />
        ))}
      </div>
    </div>
  );
}
