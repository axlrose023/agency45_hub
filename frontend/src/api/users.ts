import apiClient from './client';
import type {
  UserResponse,
  UsersPaginationResponse,
  UsersPaginationParams,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types/user';

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

export async function updateUser(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
  const response = await apiClient.patch<UserResponse>(`/users/${userId}`, data);
  return response.data;
}
