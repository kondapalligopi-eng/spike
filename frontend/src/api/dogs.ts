import apiClient from './client';
import type {
  Dog,
  DogCreateData,
  DogUpdateData,
  DogFilters,
  PaginatedResponse,
  AdminStats,
} from '@/types';
import {
  delay,
  getMockDogs,
  getMockDogById,
  getMockMyDogs,
  createMockDog,
  updateMockDog,
  deleteMockDog,
  MOCK_DOGS,
  MOCK_STATS,
} from '@/mocks/data';
import { useAuthStore } from '@/store/authStore';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getDogs(
  filters: DogFilters = {},
  page = 1
): Promise<PaginatedResponse<Dog>> {
  if (USE_MOCK) {
    await delay(400);
    return getMockDogs(
      {
        breed: filters.breed,
        status: filters.status,
        gender: filters.gender,
        size: filters.size,
        min_age: filters.min_age,
        max_age: filters.max_age,
      },
      page,
      filters.size_per_page ?? 12
    );
  }

  const params: Record<string, string | number | boolean> = { page, size: filters.size_per_page ?? 12 };
  if (filters.search) params.search = filters.search;
  if (filters.breed) params.breed = filters.breed;
  if (filters.status) params.status = filters.status;
  if (filters.gender) params.gender = filters.gender;
  if (filters.size && filters.size.length > 0) params.size_filter = filters.size.join(',');
  if (filters.min_age !== undefined) params.min_age = filters.min_age;
  if (filters.max_age !== undefined) params.max_age = filters.max_age;

  const response = await apiClient.get<PaginatedResponse<Dog>>('/dogs', { params });
  return response.data;
}

export async function getDogById(id: number): Promise<Dog> {
  if (USE_MOCK) {
    await delay(300);
    const dog = getMockDogById(id);
    if (!dog) throw new Error('Dog not found');
    return dog;
  }
  const response = await apiClient.get<Dog>(`/dogs/${id}`);
  return response.data;
}

export async function getMyDogs(): Promise<Dog[]> {
  if (USE_MOCK) {
    await delay(300);
    const userId = useAuthStore.getState().user?.id ?? 0;
    return getMockMyDogs(userId);
  }
  const response = await apiClient.get<Dog[]>('/dogs/my');
  return response.data;
}

export async function createDog(data: DogCreateData): Promise<Dog> {
  if (USE_MOCK) {
    await delay(500);
    const userId = useAuthStore.getState().user?.id ?? 2;
    return createMockDog(data, userId);
  }
  const response = await apiClient.post<Dog>('/dogs', data);
  return response.data;
}

export async function updateDog(id: number, data: DogUpdateData): Promise<Dog> {
  if (USE_MOCK) {
    await delay(400);
    const updated = updateMockDog(id, data);
    if (!updated) throw new Error('Dog not found');
    return updated;
  }
  const response = await apiClient.patch<Dog>(`/dogs/${id}`, data);
  return response.data;
}

export async function deleteDog(id: number): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    deleteMockDog(id);
    return;
  }
  await apiClient.delete(`/dogs/${id}`);
}

export async function uploadDogImage(id: number, file: File): Promise<Dog> {
  if (USE_MOCK) {
    await delay(800);
    const updated = updateMockDog(id, {
      image_url: URL.createObjectURL(file),
    });
    if (!updated) throw new Error('Dog not found');
    return updated;
  }
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<Dog>(`/dogs/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getFeaturedDogs(): Promise<Dog[]> {
  if (USE_MOCK) {
    await delay(400);
    return MOCK_DOGS.filter((d) => d.status === 'available').slice(0, 6);
  }
  const response = await apiClient.get<PaginatedResponse<Dog>>('/dogs', {
    params: { page: 1, size: 6, status: 'available' },
  });
  return response.data.items;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_STATS;
  }
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
}
