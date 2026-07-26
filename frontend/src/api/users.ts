import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Admin-only: every registered user, newest first. */
export async function listUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) {
    return [
      {
        id: 'mock-1',
        email: 'admin@hispike.in',
        full_name: 'HiSpike Admin',
        phone: null,
        avatar_url: null,
        role: 'admin',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'mock-2',
        email: 'jane@example.com',
        full_name: 'Jane Doe',
        phone: '+91 98765 43210',
        avatar_url: null,
        role: 'user',
        is_active: true,
        created_at: '2026-06-15T00:00:00Z',
        updated_at: '2026-06-15T00:00:00Z',
      },
    ];
  }
  const res = await apiClient.get<AdminUser[]>('/users');
  return res.data;
}

/**
 * Admin-only: permanently delete a user and everything they own (pet pages,
 * shops, dogs, adoption requests) via DB cascade. Admin accounts are rejected
 * by the backend. Handy for clearing out test accounts.
 */
export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/users/${id}`);
}
