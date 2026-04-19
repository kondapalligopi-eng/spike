import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, setUser } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const displayName = user?.full_name ?? user?.email ?? 'User';

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isUser,
    displayName,
    login,
    logout,
    setUser,
  };
}
