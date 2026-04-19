import apiClient from './client';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // FastAPI OAuth2 expects form data
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await apiClient.post<AuthResponse>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const { confirm_password, ...payload } = data;
  void confirm_password; // used only for client-side validation
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function refreshToken(): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/refresh');
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
}

export async function updateCurrentUser(data: { full_name?: string; phone?: string }): Promise<User> {
  const response = await apiClient.patch<User>('/users/me', data);
  return response.data;
}
