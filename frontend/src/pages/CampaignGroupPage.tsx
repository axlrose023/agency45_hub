import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCampaigns } from '@/api/facebook';
import { useDateRange } from '@/hooks/useDateRange';
import type { CampaignResponse } from '@/types/facebook';
import InsightGrid from '@/components/ui/InsightGrid';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n/locale';
import { resolveFacebookErrorMessage } from '@/utils/apiError';

export default function CampaignGroupPage() {
  const { accountId, objective } = useParams<{ accountId: string; objective: string }>();
  const { dateRange } = useDateRange();
  const navigate = useNavigate();
  const { t } = useI18n();

  const accountName = useMemo(() => sessionStorage.getItem(`fb_account_${accountId}_name`), [accountId]);
  const currency = useMemo(() => sessionStorage.getItem(`fb_account_${accountId}_currency`) || 'USD', [accountId]);
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    getCampaigns(accountId, dateRange)
      .then((all) => setCampaigns(all.filter((c) => (c.objective || 'UNKNOWN') === objective)))
      .catch((error) => setError(resolveFacebookErrorMessage(error, t('adAccountLoadCampaignsError'), t)))
      .finally(() => setLoading(false));
  }, [accountId, dateRange, objective, t]);

  const objectiveLabel = (objective || 'UNKNOWN')
    .replace(/^OUTCOME_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate(`/accounts/${accountId}`)}
          className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors font-body mb-2 flex items-center gap-1"
        >
          &larr; {t('backToObjectives')}
        </button>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
          {objectiveLabel} {t('campaignsTitleSuffix')}
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          {accountName && <>{accountName} &middot; </>}{campaigns.length} {t('campaignsCountLabel')}
        </p>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          title={t('noCampaignsTitle')}
          description={t('noCampaignsDescription')}
        />
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.campaign_id}
              className="bg-white rounded-xl border border-brand-gray-200 p-4 sm:p-6 hover:shadow-md hover:border-brand-gray-300 transition-all"
            >
              <button
                onClick={() =>
                  navigate(`/accounts/${accountId}/campaigns/${campaign.campaign_id}/adsets`)
                }
                className="flex items-center justify-between mb-4 w-full text-left group"
              >
                <div>
                  <h3 className="font-heading font-semibold text-brand-black">
                    {campaign.campaign_name || t('unnamedCampaign')}
                  </h3>
                  <p className="text-xs text-brand-gray-500 mt-0.5">
                    ID: {campaign.campaign_id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={campaign.status} updatedTime={campaign.updated_time} />
                  <ChevronRight
                    size={20}
                    className="text-brand-gray-400 group-hover:text-brand-black transition-colors"
                  />
                </div>
              </button>
              <InsightGrid insights={campaign.insights} currency={currency} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
