import apiClient from './client';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';
import { MOCK_USERS, delay } from '@/mocks/data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockCurrentUser: User | null = null;

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(500);
    const user = MOCK_USERS.find((u) => u.email === credentials.email);
    if (!user || credentials.password.length < 3) {
      throw new Error('Invalid email or password');
    }
    mockCurrentUser = user;
    return {
      access_token: 'mock-jwt-token-' + user.id,
      token_type: 'bearer',
      user,
    };
  }

  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await apiClient.post<AuthResponse>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(600);
    const existing = MOCK_USERS.find((u) => u.email === data.email);
    if (existing) throw new Error('Email already registered');
    const newUser: User = {
      id: MOCK_USERS.length + 1,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    mockCurrentUser = newUser;
    return {
      access_token: 'mock-jwt-token-' + newUser.id,
      token_type: 'bearer',
      user: newUser,
    };
  }

  const { confirm_password, ...payload } = data;
  void confirm_password;
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function refreshToken(): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(200);
    if (!mockCurrentUser) throw new Error('Not authenticated');
    return {
      access_token: 'mock-jwt-token-' + mockCurrentUser.id,
      token_type: 'bearer',
      user: mockCurrentUser,
    };
  }
  const response = await apiClient.post<AuthResponse>('/auth/refresh');
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCK) {
    await delay(200);
    if (!mockCurrentUser) throw new Error('Not authenticated');
    return mockCurrentUser;
  }
  const response = await apiClient.get<User>('/users/me');
  return response.data;
}

export async function updateCurrentUser(data: { full_name?: string; phone?: string }): Promise<User> {
  if (USE_MOCK) {
    await delay(400);
    if (!mockCurrentUser) throw new Error('Not authenticated');
    Object.assign(mockCurrentUser, data);
    return mockCurrentUser;
  }
  const response = await apiClient.patch<User>('/users/me', data);
  return response.data;
}
