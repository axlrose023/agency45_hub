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
