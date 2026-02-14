export interface InsightsData {
  spend: string | null;
  impressions: string | null;
  clicks: string | null;
  cpc: string | null;
  cpm: string | null;
  ctr: string | null;
  reach: string | null;
  conversations: string | null;
}

export interface AdAccountResponse {
  account_id: string;
  name: string | null;
  currency: string | null;
  account_status: number | null;
}

export interface CampaignResponse {
  campaign_id: string;
  campaign_name: string | null;
  objective: string | null;
  status: string | null;
  updated_time: string | null;
  insights: InsightsData | null;
}

export interface AdSetResponse {
  adset_id: string;
  adset_name: string | null;
  targeting: Record<string, unknown>;
  status: string | null;
  insights: InsightsData | null;
}

export interface CreativeData {
  id: string | null;
  thumbnail_url: string | null;
  body: string | null;
  title: string | null;
  link_url: string | null;
  image_url: string | null;
  video_id: string | null;
}

export interface AdResponse {
  ad_id: string;
  ad_name: string | null;
  status: string | null;
  creative: CreativeData;
  insights: InsightsData | null;
}

export interface ObjectiveGroup {
  objective: string;
  campaigns: CampaignResponse[];
  aggregatedInsights: InsightsData;
}

export interface DateRange {
  since: string;
  until: string;
}
