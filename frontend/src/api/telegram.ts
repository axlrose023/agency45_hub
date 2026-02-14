import apiClient from './client';
import type { TelegramRegisterResponse, TelegramChatIdResponse } from '@/types/telegram';

export async function getRegistrationLink(
  locale: 'ua' | 'ru' = 'ua',
): Promise<TelegramRegisterResponse> {
  const response = await apiClient.get<TelegramRegisterResponse>('/telegram/register', {
    params: { locale },
  });
  return response.data;
}

export async function telegramLogout(): Promise<void> {
  await apiClient.delete('/telegram/logout');
}

export async function getChatId(): Promise<TelegramChatIdResponse> {
  const response = await apiClient.get<TelegramChatIdResponse>('/telegram/chat_id');
  return response.data;
}

export type BroadcastPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'last30';

export async function sendBroadcast(period: BroadcastPeriod, locale: 'ua' | 'ru' = 'ua'): Promise<void> {
  await apiClient.post('/telegram/broadcast', { period, locale });
}

export async function toggleDailyReports(enabled: boolean): Promise<void> {
  await apiClient.post('/telegram/daily-toggle', { enabled });
}
