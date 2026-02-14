import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCampaigns } from '@/api/facebook';
import { useDateRange } from '@/hooks/useDateRange';
import { groupCampaignsByObjective } from '@/utils/insightHelpers';
import type { ObjectiveGroup } from '@/types/facebook';
import InsightGrid from '@/components/ui/InsightGrid';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { ChevronRight, Target, ShoppingCart, Eye, MessageSquare, Video, Megaphone, Zap, BarChart3 } from 'lucide-react';
import { useI18n } from '@/i18n/locale';
import { resolveFacebookErrorMessage } from '@/utils/apiError';

const objectiveIcons: Record<string, React.ReactNode> = {
  OUTCOME_TRAFFIC: <Zap size={22} />,
  OUTCOME_SALES: <ShoppingCart size={22} />,
  OUTCOME_AWARENESS: <Eye size={22} />,
  OUTCOME_ENGAGEMENT: <MessageSquare size={22} />,
  OUTCOME_LEADS: <Target size={22} />,
  OUTCOME_APP_PROMOTION: <Megaphone size={22} />,
  VIDEO_VIEWS: <Video size={22} />,
  CONVERSIONS: <ShoppingCart size={22} />,
  LINK_CLICKS: <Zap size={22} />,
  REACH: <BarChart3 size={22} />,
  BRAND_AWARENESS: <Eye size={22} />,
  MESSAGES: <MessageSquare size={22} />,
  TRAFFIC: <Zap size={22} />,
  LEAD_GENERATION: <Target size={22} />,
};

function formatObjectiveName(objective: string): string {
  return objective
    .replace(/^OUTCOME_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export default function AdAccountPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const { dateRange } = useDateRange();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [groups, setGroups] = useState<ObjectiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stateAccountName = (location.state as { accountName?: string })?.accountName;
  const storageKey = `fb_account_${accountId}_name`;

  const accountName = (() => {
    if (stateAccountName) {
      sessionStorage.setItem(storageKey, stateAccountName);
      return stateAccountName;
    }
    return sessionStorage.getItem(storageKey);
  })();

  const currency = useMemo(() => sessionStorage.getItem(`fb_account_${accountId}_currency`) || 'USD', [accountId]);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    getCampaigns(accountId, dateRange)
      .then((campaigns) => setGroups(groupCampaignsByObjective(campaigns)))
      .catch((error) => setError(resolveFacebookErrorMessage(error, t('adAccountLoadCampaignsError'), t)))
      .finally(() => setLoading(false));
  }, [accountId, dateRange, t]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors font-body mb-2 flex items-center gap-1"
        >
          &larr; {t('backToAccounts')}
        </button>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
          {accountName || t('campaignsByObjective')}
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          {t('accountLabel')}: {accountId}
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title={t('noActiveCampaignsTitle')}
          description={t('noActiveCampaignsDescription')}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.objective}
              className="bg-white rounded-xl border border-brand-gray-200 p-4 sm:p-6 hover:shadow-md hover:border-brand-gray-300 transition-all"
            >
              <button
                onClick={() =>
                  navigate(`/accounts/${accountId}/objective/${encodeURIComponent(group.objective)}`)
                }
                className="flex items-center justify-between mb-5 w-full text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-brand-gray-100 flex items-center justify-center text-brand-gray-600">
                    {objectiveIcons[group.objective] || <Target size={22} />}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-brand-black">
                      {formatObjectiveName(group.objective)}
                    </h3>
                    <p className="text-xs text-brand-gray-500 mt-0.5">
                      {group.campaigns.length} {t('campaignsCountLabel')}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={22}
                  className="text-brand-gray-400 group-hover:text-brand-black transition-colors"
                />
              </button>
              <InsightGrid insights={group.aggregatedInsights} currency={currency} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
