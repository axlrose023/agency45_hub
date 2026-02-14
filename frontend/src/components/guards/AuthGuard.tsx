import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getUserById } from '@/api/users';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuthGuard() {
  const { isAuthenticated, loadFromStorage, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const hasTokens = loadFromStorage();
      if (hasTokens) {
        const currentUserId = useAuthStore.getState().userId;
        const currentUser = useAuthStore.getState().user;
        if (currentUserId && !currentUser) {
          try {
            const userData = await getUserById(currentUserId);
            setUser(userData);
          } catch {
            useAuthStore.getState().clearAuth();
          }
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
