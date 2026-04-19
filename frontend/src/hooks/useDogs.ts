import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDog,
  deleteDog,
  getDogById,
  getDogs,
  getFeaturedDogs,
  getMyDogs,
  updateDog,
  uploadDogImage,
  getAdminStats,
} from '@/api/dogs';
import type { DogCreateData, DogFilters, DogUpdateData } from '@/types';
import { toast } from '@/store/toastStore';

export const dogKeys = {
  all: ['dogs'] as const,
  lists: () => [...dogKeys.all, 'list'] as const,
  list: (filters: DogFilters, page: number) =>
    [...dogKeys.lists(), { filters, page }] as const,
  details: () => [...dogKeys.all, 'detail'] as const,
  detail: (id: number) => [...dogKeys.details(), id] as const,
  myDogs: () => [...dogKeys.all, 'my'] as const,
  featured: () => [...dogKeys.all, 'featured'] as const,
  stats: () => [...dogKeys.all, 'stats'] as const,
};

export function useDogsQuery(filters: DogFilters = {}, page = 1) {
  return useQuery({
    queryKey: dogKeys.list(filters, page),
    queryFn: () => getDogs(filters, page),
    placeholderData: (prev) => prev,
  });
}

export function useDogQuery(id: number) {
  return useQuery({
    queryKey: dogKeys.detail(id),
    queryFn: () => getDogById(id),
    enabled: id > 0,
  });
}

export function useMyDogsQuery() {
  return useQuery({
    queryKey: dogKeys.myDogs(),
    queryFn: getMyDogs,
  });
}

export function useFeaturedDogsQuery() {
  return useQuery({
    queryKey: dogKeys.featured(),
    queryFn: getFeaturedDogs,
  });
}

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: dogKeys.stats(),
    queryFn: getAdminStats,
  });
}

export function useCreateDog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DogCreateData) => createDog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dogKeys.myDogs() });
      toast.success('Dog listing created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DogUpdateData }) =>
      updateDog(id, data),
    onSuccess: (updatedDog) => {
      queryClient.invalidateQueries({ queryKey: dogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dogKeys.detail(updatedDog.id) });
      queryClient.invalidateQueries({ queryKey: dogKeys.myDogs() });
      toast.success('Dog updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dogKeys.myDogs() });
      toast.success('Dog listing deleted.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUploadDogImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadDogImage(id, file),
    onSuccess: (updatedDog) => {
      queryClient.invalidateQueries({ queryKey: dogKeys.detail(updatedDog.id) });
      queryClient.invalidateQueries({ queryKey: dogKeys.myDogs() });
      toast.success('Image uploaded successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
