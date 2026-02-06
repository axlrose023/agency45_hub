import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAds } from '@/api/facebook';
import { useDateRange } from '@/hooks/useDateRange';
import type { AdResponse } from '@/types/facebook';
import InsightGrid from '@/components/ui/InsightGrid';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { ExternalLink, ImageOff } from 'lucide-react';

export default function AdsPage() {
  const { adsetId } = useParams<{ adsetId: string }>();
  const { dateRange } = useDateRange();
  const navigate = useNavigate();
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!adsetId) return;
    setLoading(true);
    getAds(adsetId, dateRange)
      .then(setAds)
      .catch(() => setError('Failed to load ads'))
      .finally(() => setLoading(false));
  }, [adsetId, dateRange]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors font-body mb-2 flex items-center gap-1"
        >
          &larr; Back to Ad Sets
        </button>
        <h1 className="text-2xl font-heading font-bold text-brand-black">Ads</h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Ad Set: {adsetId} &middot; {ads.length} ad{ads.length !== 1 ? 's' : ''}
        </p>
      </div>

      {ads.length === 0 ? (
        <EmptyState title="No Ads" description="No active ads found for this ad set." />
      ) : (
        <div className="space-y-6">
          {ads.map((ad) => (
            <div
              key={ad.ad_id}
              className="bg-white rounded-xl border border-brand-gray-200 overflow-hidden"
            >
              {/* Top: Creative + Info side by side */}
              <div className="flex flex-col sm:flex-row">
                {/* Creative preview */}
                <div className="sm:w-64 md:w-80 flex-shrink-0 bg-brand-gray-50">
                  {ad.creative?.image_url || ad.creative?.thumbnail_url ? (
                    <img
                      src={ad.creative.image_url || ad.creative.thumbnail_url || ''}
                      alt={ad.creative.title || ad.ad_name || 'Ad creative'}
                      className="w-full h-56 sm:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 sm:h-full min-h-[160px] flex items-center justify-center">
                      <ImageOff size={40} className="text-brand-gray-300" />
                    </div>
                  )}
                </div>

                {/* Ad info */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-brand-black">
                        {ad.ad_name || 'Unnamed Ad'}
                      </h3>
                      <p className="text-xs text-brand-gray-500 mt-0.5">ID: {ad.ad_id}</p>
                    </div>
                    <StatusBadge status={ad.status} />
                  </div>

                  {ad.creative && (
                    <div className="space-y-1.5">
                      {ad.creative.title && (
                        <p className="text-sm font-heading font-medium text-brand-gray-800">
                          {ad.creative.title}
                        </p>
                      )}
                      {ad.creative.body && (
                        <p className="text-sm text-brand-gray-600 line-clamp-3">
                          {ad.creative.body}
                        </p>
                      )}
                      {ad.creative.link_url && (
                        <a
                          href={ad.creative.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline mt-1"
                        >
                          <ExternalLink size={12} />
                          {ad.creative.link_url.length > 60
                            ? ad.creative.link_url.slice(0, 60) + '...'
                            : ad.creative.link_url}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Insights on full width */}
              <div className="border-t border-brand-gray-200 p-6 bg-brand-gray-50/50">
                <InsightGrid insights={ad.insights} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
