/**
 * React Query Hooks
 * 
 * Custom hooks using TanStack Query for data fetching
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from './client';
import { API_ENDPOINTS } from '../config/api.config';
import { ApiInfo, ApiError } from '../types/api.types';

/**
 * Example hook to fetch API info
 */
export const useApiInfo = (): UseQueryResult<ApiInfo, ApiError> => {
  return useQuery<ApiInfo, ApiError>({
    queryKey: ['apiInfo'],
    queryFn: () => apiClient.get<ApiInfo>(API_ENDPOINTS.info),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Add more hooks as needed
// Example:
// export const useFoodEntries = (userId: string) => {
//   return useQuery<FoodEntry[], ApiError>({
//     queryKey: ['foodEntries', userId],
//     queryFn: () => apiClient.get<FoodEntry[]>(`/api/users/${userId}/entries`),
//   });
// };

// Example mutation:
// export const useAddFoodEntry = () => {
//   return useMutation<FoodEntry, ApiError, Partial<FoodEntry>>({
//     mutationFn: (entry) => apiClient.post<FoodEntry>('/api/entries', entry),
//   });
// };

