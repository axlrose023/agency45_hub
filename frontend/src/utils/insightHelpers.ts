import type { InsightsData, CampaignResponse, ObjectiveGroup } from '@/types/facebook';

export function parseInsightValue(val: string | null | undefined): number {
  if (val == null || val === '') return 0;
  return parseFloat(val) || 0;
}

export function sumInsights(insightsArray: (InsightsData | null | undefined)[]): InsightsData {
  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalReach = 0;
  let totalConversations = 0;

  for (const ins of insightsArray) {
    if (!ins) continue;
    totalSpend += parseInsightValue(ins.spend);
    totalImpressions += parseInsightValue(ins.impressions);
    totalClicks += parseInsightValue(ins.clicks);
    totalReach += parseInsightValue(ins.reach);
    totalConversations += parseInsightValue(ins.conversations);
  }

  return {
    spend: totalSpend.toFixed(2),
    impressions: totalImpressions.toString(),
    clicks: totalClicks.toString(),
    reach: totalReach.toString(),
    cpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00',
    cpm: totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000).toFixed(2) : '0.00',
    ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
    conversations: totalConversations > 0 ? totalConversations.toString() : null,
  };
}

export function groupCampaignsByObjective(campaigns: CampaignResponse[]): ObjectiveGroup[] {
  const groups: Record<string, CampaignResponse[]> = {};
  for (const c of campaigns) {
    const obj = c.objective || 'UNKNOWN';
    if (!groups[obj]) groups[obj] = [];
    groups[obj].push(c);
  }
  return Object.entries(groups)
    .map(([objective, camps]) => ({
      objective,
      campaigns: camps,
      aggregatedInsights: sumInsights(camps.map((c) => c.insights)),
    }))
    .sort((a, b) => a.objective.localeCompare(b.objective));
}
