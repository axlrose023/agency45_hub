import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, isAuthenticated, userId } = useAuthStore();
  return {
    user,
    isAuthenticated,
    userId,
    isAdmin: user?.is_admin ?? false,
  };
}
