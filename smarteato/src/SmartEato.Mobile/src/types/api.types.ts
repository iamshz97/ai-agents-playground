/**
 * API Response Types
 * 
 * Define TypeScript interfaces for API responses
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  status: string;
}

// Add more types as needed for your domain models
// Example for SmartEato (calorie tracking):
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  entries: FoodEntry[];
}

