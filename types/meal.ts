// Shared type definitions for Meal Planning

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // More specific type
  name: string;
  ingredients: string[];
  estimated_time: number; // in minutes
  imageUrl?: string; // Optional: Added for image generation
}

export interface DayPlan {
  day: number; // e.g., 1 for Monday
  meals: Meal[];
}

export interface MealPlan {
  days: DayPlan[];
}
