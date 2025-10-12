import { apiClient } from './client';
import type { LogMealDto, MealAnalysisResult, DailySummaryResponse } from '../types/meal.types';

export const mealsApi = {
  logMeal: async (data: LogMealDto): Promise<MealAnalysisResult> => {
    return apiClient.post('/api/meals', data);
  },

  deleteMeal: async (mealId: string): Promise<void> => {
    return apiClient.delete(`/api/meals/${mealId}`);
  },

  getDailySummary: async (date?: string): Promise<DailySummaryResponse> => {
    const params = date ? `?date=${date}` : '';
    return apiClient.get(`/api/meals/daily-summary${params}`);
  },
};

