import { useI18n } from '@/i18n/locale';
import type { InsightsData } from '@/types/facebook';
import { formatCurrency, formatDecimal, formatNumber, formatPercent } from '@/utils/formatters';
import { BarChart3, DollarSign, Eye, MessageSquare, MousePointerClick, Percent, Target, Users } from 'lucide-react';
import InsightCard from './InsightCard';

interface Metric {
  label: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
}

interface InsightGridProps {
  insights: InsightsData | null;
  currency?: string;
  compact?: boolean;
}

export default function InsightGrid({ insights, currency = 'USD', compact = false }: InsightGridProps) {
  const { t } = useI18n();

  const metrics: Metric[] = [
    { label: t('insightSpend'), value: insights ? formatCurrency(insights.spend, currency) : '--', icon: <DollarSign size={14} /> },
    { label: t('insightImpressions'), value: insights ? formatNumber(insights.impressions) : '--', icon: <Eye size={14} /> },
    { label: t('insightClicks'), value: insights ? formatNumber(insights.clicks) : '--', icon: <MousePointerClick size={14} /> },
    { label: t('insightCPC'), value: insights ? formatDecimal(insights.cpc, currency) : '--', icon: <Target size={14} /> },
    { label: t('insightCPM'), value: insights ? formatDecimal(insights.cpm, currency) : '--', icon: <BarChart3 size={14} /> },
    { label: t('insightCTR'), value: insights ? formatPercent(insights.ctr) : '--', icon: <Percent size={14} /> },
    { label: t('insightReach'), value: insights ? formatNumber(insights.reach) : '--', icon: <Users size={14} /> },
  ];

  const hasConversations = insights?.conversations && parseFloat(insights.conversations) > 0;

  if (hasConversations) {
    metrics.push(
      { label: t('insightConversations'), value: formatNumber(insights!.conversations), icon: <MessageSquare size={14} /> },
    );
  }

  const colClass = compact
    ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-7';

  return (
    <div className={`grid gap-3 ${colClass}`}>
      {metrics.map((m) => (
        <InsightCard key={m.label} label={m.label} value={m.value} icon={m.icon} className={m.className} />
      ))}
    </div>
  );
}
