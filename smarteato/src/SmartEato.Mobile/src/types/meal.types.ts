export interface Ingredient {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  userId: string;
  mealName: string;
  mealTime: string;
  photoUrl?: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients?: Ingredient[];
  aiAnalysis?: {
    visionOutput?: string;
    confidence?: number;
    identifiedItems?: string[];
  };
  createdAt: string;
}

export interface DailySummary {
  id: string;
  userId: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  calorieGoal: number;
  mealsCount: number;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  date: string;
  recommendationText: string;
  reason: string;
  priority: number;
  createdAt: string;
}

export interface LogMealDto {
  mealName?: string;
  mealTime?: string;
  description: string;
  imageBase64?: string;
}

export interface MealAnalysisResult {
  mealId: string;
  mealName: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients?: Ingredient[];
  visionAnalysis?: string;
  timestamp: string;
}

export interface DailySummaryResponse {
  summary: DailySummary;
  recommendation?: Recommendation;
  meals: Meal[];
}

