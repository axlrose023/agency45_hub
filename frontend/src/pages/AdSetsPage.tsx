import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdSets } from '@/api/facebook';
import { useDateRange } from '@/hooks/useDateRange';
import type { AdSetResponse } from '@/types/facebook';
import InsightGrid from '@/components/ui/InsightGrid';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { ChevronRight } from 'lucide-react';

export default function AdSetsPage() {
  const { accountId, campaignId } = useParams<{ accountId: string; campaignId: string }>();
  const { dateRange } = useDateRange();
  const navigate = useNavigate();
  const [adsets, setAdsets] = useState<AdSetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accountId || !campaignId) return;
    setLoading(true);
    getAdSets(accountId, campaignId, dateRange)
      .then(setAdsets)
      .catch(() => setError('Failed to load ad sets'))
      .finally(() => setLoading(false));
  }, [accountId, campaignId, dateRange]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors font-body mb-2 flex items-center gap-1"
        >
          &larr; Back to Campaigns
        </button>
        <h1 className="text-2xl font-heading font-bold text-brand-black">Ad Sets</h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Campaign: {campaignId} &middot; {adsets.length} ad set{adsets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {adsets.length === 0 ? (
        <EmptyState title="No Ad Sets" description="No active ad sets found for this campaign." />
      ) : (
        <div className="space-y-4">
          {adsets.map((adset) => (
            <div
              key={adset.adset_id}
              className="bg-white rounded-xl border border-brand-gray-200 p-6 hover:shadow-md hover:border-brand-gray-300 transition-all"
            >
              <button
                onClick={() => navigate(`/adsets/${adset.adset_id}/ads`)}
                className="flex items-center justify-between mb-4 w-full text-left group"
              >
                <div>
                  <h3 className="font-heading font-semibold text-brand-black">
                    {adset.adset_name || 'Unnamed Ad Set'}
                  </h3>
                  <p className="text-xs text-brand-gray-500 mt-0.5">
                    ID: {adset.adset_id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={adset.status} />
                  <ChevronRight
                    size={20}
                    className="text-brand-gray-400 group-hover:text-brand-black transition-colors"
                  />
                </div>
              </button>

              {/* Targeting summary */}
              {adset.targeting && Object.keys(adset.targeting).length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {adset.targeting.age_min && (
                    <span className="px-2 py-0.5 bg-brand-gray-100 text-brand-gray-600 rounded text-xs font-body">
                      Age: {String(adset.targeting.age_min)}-{String(adset.targeting.age_max || '65+')}
                    </span>
                  )}
                  {adset.targeting.genders && (
                    <span className="px-2 py-0.5 bg-brand-gray-100 text-brand-gray-600 rounded text-xs font-body">
                      Gender: {Array.isArray(adset.targeting.genders) ? (adset.targeting.genders as number[]).map((g) => (g === 1 ? 'Male' : 'Female')).join(', ') : 'All'}
                    </span>
                  )}
                </div>
              )}

              <InsightGrid insights={adset.insights} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
