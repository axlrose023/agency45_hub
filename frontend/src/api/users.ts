import apiClient from './client';
import type { UserResponse, UsersPaginationResponse, UsersPaginationParams, CreateUserRequest } from '@/types/user';

export async function getUsers(params?: UsersPaginationParams): Promise<UsersPaginationResponse> {
  const response = await apiClient.get<UsersPaginationResponse>('/users', { params });
  return response.data;
}

export async function getUserById(userId: string): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(`/users/${userId}`);
  return response.data;
}

export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>('/users', data);
  return response.data;
}
