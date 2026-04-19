import apiClient from './client';
import type {
  Dog,
  DogCreateData,
  DogUpdateData,
  DogFilters,
  PaginatedResponse,
  AdminStats,
} from '@/types';

export async function getDogs(
  filters: DogFilters = {},
  page = 1
): Promise<PaginatedResponse<Dog>> {
  const params: Record<string, string | number | boolean> = { page, size: filters.size_per_page ?? 12 };

  if (filters.search) params.search = filters.search;
  if (filters.breed) params.breed = filters.breed;
  if (filters.status) params.status = filters.status;
  if (filters.gender) params.gender = filters.gender;
  if (filters.min_age !== undefined) params.min_age = filters.min_age;
  if (filters.max_age !== undefined) params.max_age = filters.max_age;
  if (filters.size && filters.size.length > 0) {
    params.size_filter = filters.size.join(',');
  }

  const response = await apiClient.get<PaginatedResponse<Dog>>('/dogs', { params });
  return response.data;
}

export async function getDogById(id: number): Promise<Dog> {
  const response = await apiClient.get<Dog>(`/dogs/${id}`);
  return response.data;
}

export async function getMyDogs(): Promise<Dog[]> {
  const response = await apiClient.get<Dog[]>('/dogs/my');
  return response.data;
}

export async function createDog(data: DogCreateData): Promise<Dog> {
  const response = await apiClient.post<Dog>('/dogs', data);
  return response.data;
}

export async function updateDog(id: number, data: DogUpdateData): Promise<Dog> {
  const response = await apiClient.patch<Dog>(`/dogs/${id}`, data);
  return response.data;
}

export async function deleteDog(id: number): Promise<void> {
  await apiClient.delete(`/dogs/${id}`);
}

export async function uploadDogImage(id: number, file: File): Promise<Dog> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<Dog>(`/dogs/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getFeaturedDogs(): Promise<Dog[]> {
  const response = await apiClient.get<PaginatedResponse<Dog>>('/dogs', {
    params: { page: 1, size: 6, status: 'available' },
  });
  return response.data.items;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
}
