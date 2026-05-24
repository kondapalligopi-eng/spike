import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach Authorization header from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// 401 handling: silent refresh + retry, toast on hard expiry
// ---------------------------------------------------------------------------
//
// Behaviour:
//   1. On a 401, try to swap our refresh token for a new access token by
//      calling /auth/refresh. If it works, replay the original request
//      with the new token and the caller never sees the blip.
//   2. If multiple requests 401 at once (e.g. dashboard loads in parallel),
//      a single refresh promise is shared — they all wait on it, then
//      retry, so we don't fire N parallel refresh calls.
//   3. If refresh fails (no refresh token, or refresh itself returns 401
//      because the 7-day refresh window has elapsed), THEN we tell the
//      user with a toast and bounce them to /login.
//
// Anything tagged with the X-Skip-Auth-Refresh header (notably the refresh
// call itself, see api/auth.ts) bypasses this logic entirely so we don't
// recurse.

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let pendingRefresh: Promise<string | null> | null = null;

async function performTokenRefresh(): Promise<string | null> {
  const refreshTokenValue = localStorage.getItem('auth_refresh_token');
  if (!refreshTokenValue) return null;
  // Lazy import avoids a circular import between client.ts and api/auth.ts.
  const { refreshAccessToken } = await import('./auth');
  try {
    const { access_token } = await refreshAccessToken(refreshTokenValue);
    localStorage.setItem('auth_token', access_token);
    // Best-effort sync of the zustand store so reactive consumers update too.
    try {
      const { useAuthStore } = await import('@/store/authStore');
      useAuthStore.getState().setTokens(access_token);
    } catch {
      // store not available (SSR pre-render) — localStorage update is enough
    }
    return access_token;
  } catch {
    return null;
  }
}

function handleHardExpiry() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_user');

  // Tell the user what happened before we redirect.
  // Import lazily so this file stays SSR-safe.
  import('@/store/toastStore')
    .then(({ toast }) =>
      toast.error('Your session has expired. Please sign in again to continue.'),
    )
    .catch(() => {});

  // Reset the store so guarded routes immediately know we're logged out.
  import('@/store/authStore')
    .then(({ useAuthStore }) => useAuthStore.getState().logout())
    .catch(() => {});

  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      // Small delay so the toast actually renders before the page navigates.
      window.setTimeout(() => {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }, 600);
    }
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const skipRefresh = original?.headers?.['X-Skip-Auth-Refresh'] === '1';

    if (status === 401 && original && !original._retried && !skipRefresh) {
      original._retried = true;

      // Coalesce concurrent refreshes
      if (!pendingRefresh) {
        pendingRefresh = performTokenRefresh().finally(() => {
          pendingRefresh = null;
        });
      }

      const newToken = await pendingRefresh;
      if (newToken) {
        // Swap the auth header and replay the original call.
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }

      // Refresh failed → session is truly dead.
      handleHardExpiry();
    }

    // Normalize error message for everything else (including the final
    // 401 we couldn't recover from).
    const detail = error.response?.data?.detail;
    let message = 'An unexpected error occurred';

    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail) && detail.length > 0) {
      message = detail.map((d) => d.msg).join(', ');
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
