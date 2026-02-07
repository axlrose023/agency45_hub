export interface UserResponse {
  id: string;
  username: string;
  is_admin: boolean;
  ad_account_id: string | null;
  telegram_chat_id: number | null;
  telegram_username: string | null;
  telegram_token: string | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  ad_account_id?: string | null;
}

export interface UpdateUserRequest {
  ad_account_id: string | null;
}

export interface UsersPaginationResponse {
  items: UserResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UsersPaginationParams {
  page?: number;
  page_size?: number;
  username__search?: string;
}
