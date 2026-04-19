import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelAdoption,
  createAdoption,
  getAdoptions,
  updateAdoptionStatus,
} from '@/api/adoptions';
import type { AdoptionCreateData, AdoptionStatus } from '@/types';
import { toast } from '@/store/toastStore';

export const adoptionKeys = {
  all: ['adoptions'] as const,
  lists: () => [...adoptionKeys.all, 'list'] as const,
};

export function useAdoptionsQuery() {
  return useQuery({
    queryKey: adoptionKeys.lists(),
    queryFn: getAdoptions,
  });
}

export function useCreateAdoption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdoptionCreateData) => createAdoption(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adoptionKeys.lists() });
      toast.success('Adoption request submitted! We will be in touch soon.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAdoptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdoptionStatus }) =>
      updateAdoptionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adoptionKeys.lists() });
      toast.success('Adoption status updated.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCancelAdoption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelAdoption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adoptionKeys.lists() });
      toast.success('Adoption request cancelled.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
