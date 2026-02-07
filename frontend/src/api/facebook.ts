import apiClient from './client';
import type { AdAccountResponse, CampaignResponse, AdSetResponse, AdResponse, DateRange } from '@/types/facebook';

export async function getAdAccounts(): Promise<AdAccountResponse[]> {
  const response = await apiClient.get<AdAccountResponse[]>('/facebook/ad-accounts');
  return response.data;
}

export async function getCampaigns(accountId: string, dateRange?: DateRange): Promise<CampaignResponse[]> {
  const params: Record<string, string> = {};
  if (dateRange) {
    params.since = dateRange.since;
    params.until = dateRange.until;
  }
  const response = await apiClient.get<CampaignResponse[]>(
    `/facebook/ad-accounts/${accountId}/campaigns`,
    { params },
  );
  return response.data;
}

export async function getAdSets(
  accountId: string,
  campaignId: string,
  dateRange?: DateRange,
): Promise<AdSetResponse[]> {
  const params: Record<string, string> = {};
  if (dateRange) {
    params.since = dateRange.since;
    params.until = dateRange.until;
  }
  const response = await apiClient.get<AdSetResponse[]>(
    `/facebook/ad-accounts/${accountId}/campaigns/${campaignId}/adsets`,
    { params },
  );
  return response.data;
}

export async function getAds(adsetId: string, dateRange?: DateRange): Promise<AdResponse[]> {
  const params: Record<string, string> = {};
  if (dateRange) {
    params.since = dateRange.since;
    params.until = dateRange.until;
  }
  const response = await apiClient.get<AdResponse[]>(`/facebook/adsets/${adsetId}/ads`, { params });
  return response.data;
}

export async function getFacebookAuthStatus(): Promise<{ connected: boolean; app_id: string }> {
  const response = await apiClient.get<{ connected: boolean; app_id: string }>('/facebook/auth/status');
  return response.data;
}

export async function exchangeToken(shortLivedToken: string): Promise<void> {
  await apiClient.post('/facebook/auth/exchange-token', {
    short_lived_token: shortLivedToken,
  });
}

export async function exchangeCode(code: string, redirectUri: string): Promise<void> {
  await apiClient.post('/facebook/auth/exchange-code', {
    code,
    redirect_uri: redirectUri,
  });
}
