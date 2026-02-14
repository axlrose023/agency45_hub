export interface TelegramRegisterResponse {
  registration_link: string;
}

export interface TelegramChatIdResponse {
  chat_id: number | null;
  telegram_username: string | null;
  telegram_daily_enabled: boolean;
}
