import apiClient from './client';
import type { LoginRequest, TokenPairResponse } from '@/types/auth';

export async function login(data: LoginRequest): Promise<TokenPairResponse> {
  const response = await apiClient.post<TokenPairResponse>('/auth/login', data);
  return response.data;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPairResponse> {
  const response = await apiClient.post<TokenPairResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
}
