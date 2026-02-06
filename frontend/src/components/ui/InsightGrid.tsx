import type { InsightsData } from '@/types/facebook';
import { formatCurrency, formatNumber, formatPercent, formatDecimal } from '@/utils/formatters';
import InsightCard from './InsightCard';
import { DollarSign, Eye, MousePointerClick, Target, BarChart3, Percent, Users } from 'lucide-react';

interface InsightGridProps {
  insights: InsightsData | null;
  currency?: string;
  compact?: boolean;
}

export default function InsightGrid({ insights, currency = 'USD', compact = false }: InsightGridProps) {
  const metrics = [
    { label: 'Spend', value: insights ? formatCurrency(insights.spend, currency) : '--', icon: <DollarSign size={14} /> },
    { label: 'Impressions', value: insights ? formatNumber(insights.impressions) : '--', icon: <Eye size={14} /> },
    { label: 'Clicks', value: insights ? formatNumber(insights.clicks) : '--', icon: <MousePointerClick size={14} /> },
    { label: 'CPC', value: insights ? formatDecimal(insights.cpc, currency) : '--', icon: <Target size={14} /> },
    { label: 'CPM', value: insights ? formatDecimal(insights.cpm, currency) : '--', icon: <BarChart3 size={14} /> },
    { label: 'CTR', value: insights ? formatPercent(insights.ctr) : '--', icon: <Percent size={14} /> },
    { label: 'Reach', value: insights ? formatNumber(insights.reach) : '--', icon: <Users size={14} /> },
  ];

  return (
    <div className={`grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-7'}`}>
      {metrics.map((m) => (
        <InsightCard key={m.label} {...m} />
      ))}
    </div>
  );
}
