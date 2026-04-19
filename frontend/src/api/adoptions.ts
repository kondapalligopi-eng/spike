import apiClient from './client';
import type { Adoption, AdoptionCreateData, AdoptionStatus } from '@/types';

export async function getAdoptions(): Promise<Adoption[]> {
  const response = await apiClient.get<Adoption[]>('/adoptions');
  return response.data;
}

export async function getAdoptionById(id: number): Promise<Adoption> {
  const response = await apiClient.get<Adoption>(`/adoptions/${id}`);
  return response.data;
}

export async function createAdoption(data: AdoptionCreateData): Promise<Adoption> {
  const response = await apiClient.post<Adoption>('/adoptions', data);
  return response.data;
}

export async function updateAdoptionStatus(
  id: number,
  status: AdoptionStatus
): Promise<Adoption> {
  const response = await apiClient.patch<Adoption>(`/adoptions/${id}`, { status });
  return response.data;
}

export async function cancelAdoption(id: number): Promise<Adoption> {
  return updateAdoptionStatus(id, 'cancelled');
}
