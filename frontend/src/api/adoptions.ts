import apiClient from './client';
import type { Adoption, AdoptionCreateData, AdoptionStatus } from '@/types';
import { delay, getMockAdoptions, createMockAdoption } from '@/mocks/data';
import { useAuthStore } from '@/store/authStore';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getAdoptions(): Promise<Adoption[]> {
  if (USE_MOCK) {
    await delay(350);
    const userId = useAuthStore.getState().user?.id ?? 0;
    return getMockAdoptions(userId);
  }
  const response = await apiClient.get<Adoption[]>('/adoptions');
  return response.data;
}

export async function getAdoptionById(id: number): Promise<Adoption> {
  if (USE_MOCK) {
    await delay(200);
    const userId = useAuthStore.getState().user?.id ?? 0;
    const adoption = getMockAdoptions(userId).find((a) => a.id === id);
    if (!adoption) throw new Error('Adoption not found');
    return adoption;
  }
  const response = await apiClient.get<Adoption>(`/adoptions/${id}`);
  return response.data;
}

export async function createAdoption(data: AdoptionCreateData): Promise<Adoption> {
  if (USE_MOCK) {
    await delay(500);
    const userId = useAuthStore.getState().user?.id ?? 2;
    return createMockAdoption(data.dog_id, userId, data.message);
  }
  const response = await apiClient.post<Adoption>('/adoptions', data);
  return response.data;
}

export async function updateAdoptionStatus(
  id: number,
  status: AdoptionStatus
): Promise<Adoption> {
  if (USE_MOCK) {
    await delay(400);
    const userId = useAuthStore.getState().user?.id ?? 0;
    const adoptions = getMockAdoptions(userId);
    const adoption = adoptions.find((a) => a.id === id);
    if (!adoption) throw new Error('Adoption not found');
    adoption.status = status;
    adoption.updated_at = new Date().toISOString();
    return adoption;
  }
  const response = await apiClient.patch<Adoption>(`/adoptions/${id}`, { status });
  return response.data;
}

export async function cancelAdoption(id: number): Promise<Adoption> {
  return updateAdoptionStatus(id, 'cancelled');
}
