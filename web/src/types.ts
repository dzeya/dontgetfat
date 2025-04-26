import { MealPlan as SharedMealPlan } from '../../types/meal'; // Import directly from shared types

// Represents the detailed data collected during onboarding
export interface FormData {
  goals: string[];
  otherGoals?: string;
  allergies: string[];
  specificAllergies?: string;
  dietaryChoice: string; // Can be 'None', 'Vegetarian', 'Vegan', 'Pescatarian', etc.
  dislikes?: string;
  cookingTime: string; // e.g., 'Quick (<15 min)', 'Standard (15-30 min)', 'Leisurely (>30 min)'
  batchCooking?: boolean;
  householdSize: string; // e.g., '1', '2', '3-4', '5+'
  mealsPerDay?: string; // e.g., '2', '3', '4+' 
  cookingDaysPerWeek?: string; // e.g., '3', '5', '7' 
  favoriteCuisines?: string[];
  favoriteMeals?: string;
}

// Represents the simplified preferences used for meal plan generation & context
export interface Preferences {
  diet: string;
  servings: number;
  calories: number | '';
  dislikes: string;
  preferences: string; 
}

// Represents a single item in the grocery list
export interface GroceryItem { 
  item: string;
  quantity: number;
  unit: string;
  checked: boolean;
  aisle: string;
}

// Re-exporting the MealPlan type from the service for easier access if needed elsewhere
export type MealPlan = SharedMealPlan; // Use the imported shared type
