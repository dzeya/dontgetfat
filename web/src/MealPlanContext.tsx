import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { generateMealPlan as generateMealPlanAPI, regenerateMealsService } from './services/openai';
import { useAuth } from './context/AuthContext';
import { Meal, MealPlan } from '../../types/meal';
import { GroceryItem } from './types';

const aisleMapping: { [key: string]: string } = {
  'lettuce': 'Produce', 'banana': 'Produce', 'onion': 'Produce', 'garlic': 'Produce', 'celery': 'Produce', 'apple': 'Produce', 'orange': 'Produce', 'spinach': 'Produce', 'tomato': 'Produce', 'potato': 'Produce', 'carrot': 'Produce', 'broccoli': 'Produce',
  'milk': 'Dairy', 'cheese': 'Dairy', 'yogurt': 'Dairy', 'eggs': 'Dairy', 'butter': 'Dairy',
  'chicken': 'Meat', 'beef': 'Meat', 'pork': 'Meat', 'fish': 'Meat', 'shrimp': 'Meat',
  'oats': 'Pantry', 'pasta': 'Pantry', 'rice': 'Pantry', 'flour': 'Pantry', 'sugar': 'Pantry', 'salt': 'Pantry', 'pepper': 'Pantry', 'oil': 'Pantry', 'vinegar': 'Pantry', 'sauce': 'Pantry', 'canned': 'Pantry', 'bread': 'Pantry', 'mayonnaise': 'Pantry', 'beans': 'Pantry',
  'frozen vegetables': 'Frozen', 'ice cream': 'Frozen',
};

const getAisle = (ingredient: string): string => {
  const lowerIngredient = ingredient.toLowerCase();
  for (const keyword in aisleMapping) {
    if (lowerIngredient.includes(keyword)) {
      return aisleMapping[keyword];
    }
  }
  return 'Miscellaneous'; 
};

interface MealPlanContextType {
  mealPlan: MealPlan | null;
  setMealPlan: (plan: MealPlan | null) => void;
  preferences: Preferences | null;
  setPreferences: (prefs: Preferences) => void;
  groceryList: GroceryItem[];
  generateGroceryList: () => void;
  toggleGroceryItem: (itemIndex: number) => void;
  clearCheckedGroceryItems: () => void;
  isLoading: boolean;
  error: string | null;
  generateAndSetMealPlan: () => Promise<void>; 
  isRegenerating: boolean; 
  regenerateError: string | null; 
  regenerateSelectedMeals: (selectedMealKeys: string[]) => Promise<void>; 
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

interface MealPlanProviderProps {
  children: ReactNode;
}

const PREFERENCES_KEY = 'dontGetFat_preferences';
const MEAL_PLAN_KEY = 'dontGetFat_mealPlan';
const GROCERY_LIST_KEY = 'dontGetFat_groceryList';

export interface Preferences {
  diet: string;
  servings: number;
  calories: string;
  dislikes: string;
  preferences: string;
}

export const MealPlanProvider: React.FC<MealPlanProviderProps> = ({ children }) => {
  const { profile } = useAuth(); 

  const [preferences, setPreferencesState] = useState<Preferences | null>(() => {
    try {
      const savedPrefs = localStorage.getItem(PREFERENCES_KEY);
      return savedPrefs ? JSON.parse(savedPrefs) : null;
    } catch (error) {
      console.error('Failed to load preferences from localStorage:', error);
      localStorage.removeItem(PREFERENCES_KEY); 
      return null;
    }
  });

  const [mealPlan, setMealPlanState] = useState<MealPlan | null>(() => {
      try {
          const savedPlan = localStorage.getItem(MEAL_PLAN_KEY);
          return savedPlan ? JSON.parse(savedPlan) : null;
      } catch (error) {
          console.error('Failed to load meal plan from localStorage:', error);
          localStorage.removeItem(MEAL_PLAN_KEY); 
          return null;
      }
  });

  const [groceryList, setGroceryList] = useState<GroceryItem[]>(() => {
      try {
          const savedList = localStorage.getItem(GROCERY_LIST_KEY);
          return savedList ? JSON.parse(savedList) : [];
      } catch (error) {
          console.error('Failed to load grocery list from localStorage:', error);
          localStorage.removeItem(GROCERY_LIST_KEY); 
          return [];
      }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false); 
  const [regenerateError, setRegenerateError] = useState<string | null>(null); 

  useEffect(() => {
    try {
      if (preferences) {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      } else {
        localStorage.removeItem(PREFERENCES_KEY); 
      }
    } catch (error) {
        console.error('Failed to save preferences to localStorage:', error);
    }
  }, [preferences]);

  useEffect(() => {
    try {
        if (mealPlan) {
            localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan));
        } else {
            localStorage.removeItem(MEAL_PLAN_KEY); 
        }
    } catch (error) {
        console.error('Failed to save meal plan to localStorage:', error);
    }
  }, [mealPlan]);

  useEffect(() => {
    try {
        localStorage.setItem(GROCERY_LIST_KEY, JSON.stringify(groceryList));
    } catch (error) {
        console.error('Failed to save grocery list to localStorage:', error);
    }
  }, [groceryList]);

  const setPreferencesHandler = (prefs: Preferences) => {
    setPreferencesState(prefs);
  };

  const setMealPlanHandler = (plan: MealPlan | null) => {
    setMealPlanState(plan);
    if (plan) {
        generateGroceryListInternal(plan);
    } else {
        setGroceryList([]); 
    }
  };

  const generateGroceryListInternal = (currentPlan: MealPlan) => {
    console.log('Generating grocery list in context...');
    const items = currentPlan.days.flatMap(d => d.meals.flatMap(m => m.ingredients));
    const countMap: Record<string, number> = {};
    items.forEach(i => {
        const normalizedItem = i.trim().toLowerCase();
        countMap[normalizedItem] = (countMap[normalizedItem] || 0) + 1;
    });
    const list: GroceryItem[] = Object.entries(countMap)
      .map(([item, qty]) => ({
          item: item.charAt(0).toUpperCase() + item.slice(1),
          quantity: qty,
          unit: '',
          checked: false,
          aisle: getAisle(item)
      }))
      .sort((a, b) => a.item.localeCompare(b.item));
    setGroceryList(list); 
  };

  const generateGroceryList = () => {
      if (mealPlan) {
          generateGroceryListInternal(mealPlan);
      } else {
          console.warn("Cannot generate grocery list without a meal plan.");
      }
  };

  const toggleGroceryItem = (itemIndex: number) => {
    setGroceryList(prevList => {
        const newList = structuredClone(prevList);
        if (newList[itemIndex]) {
            newList[itemIndex].checked = !newList[itemIndex].checked;
        }
        return newList; 
    });
  };

  const clearCheckedGroceryItems = () => {
    setGroceryList(prevList => prevList.map(item => ({ ...item, checked: false }))); 
  };

  const regenerateSelectedMeals = async (selectedMealKeys: string[]): Promise<void> => {
    if (!preferences || !mealPlan || selectedMealKeys.length === 0) {
        console.warn("Cannot regenerate: Preferences, meal plan, or selected meals missing.");
        setRegenerateError("Missing necessary data to regenerate meals.");
        return;
    }

    setIsRegenerating(true);
    setRegenerateError(null);

    try {
        // 1. Identify meals to replace (get their type and index)
        const mealsToReplace: { dayIndex: number; mealIndex: number; type: string; name: string }[] = [];
        selectedMealKeys.forEach(key => {
            const [dayIdxStr, mealIdxStr] = key.split('-');
            const dayIndex = parseInt(dayIdxStr, 10);
            const mealIndex = parseInt(mealIdxStr, 10);
            const meal = mealPlan.days[dayIndex]?.meals[mealIndex];
            if (meal) {
                mealsToReplace.push({ dayIndex, mealIndex, type: meal.type, name: meal.name });
            }
        });

        if (mealsToReplace.length === 0) {
            throw new Error("Could not identify valid meals to replace from keys.");
        }

        // 2. Prepare request for the backend service (we need to implement regenerateMealsService)
        const mealTypesToRegenerate = mealsToReplace.map(m => m.type);
        const previousMealNames = mealsToReplace.map(m => m.name);

        console.log(`Requesting regeneration for ${mealsToReplace.length} meals:`, mealTypesToRegenerate);
        console.log(`Avoiding names (if possible):`, previousMealNames);

        // === Call the actual service function ===
        const newMeals: Meal[] = await regenerateMealsService(
            {
              ...preferences,
              calories: preferences.calories === "" ? undefined : Number(preferences.calories)
            },
            mealTypesToRegenerate,
            previousMealNames 
        ); 
        // === End Service Call ===

        if (newMeals.length !== mealsToReplace.length) {
            throw new Error(`Regeneration service returned ${newMeals.length} meals, expected ${mealsToReplace.length}`);
        }

        // 3. Update the meal plan state
        const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan)) as MealPlan; // Deep clone
        
        mealsToReplace.forEach((originalMealInfo, index) => {
            updatedMealPlan.days[originalMealInfo.dayIndex].meals[originalMealInfo.mealIndex] = newMeals[index];
        });

        setMealPlanHandler(updatedMealPlan); // Update state (this also triggers grocery list update)
        console.log("Meal plan updated with regenerated meals.");

    } catch (err: any) {
        console.error('Failed to regenerate meals:', err);
        setRegenerateError(err.message || 'An unknown error occurred during regeneration.');
    } finally {
        setIsRegenerating(false);
    }
  };

  const generateAndSetMealPlan = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // Check if profile exists (should be loaded by the time user clicks generate)
    if (!profile) {
      console.error("Cannot generate meal plan: User profile not loaded.");
      setError("User preferences not available. Please ensure you are logged in and have completed onboarding.");
      setIsLoading(false);
      return;
    }

    console.log("Generating meal plan using profile:", profile);

    // --- Construct Preferences directly from profile --- 
    let servings = 1; // Default
    if (profile.householdSize?.includes('(1)')) servings = 1;
    if (profile.householdSize?.includes('(2)')) servings = 2;
    if (profile.householdSize?.includes('(3+)')) servings = 3; // Or adjust as needed

    const dislikes = [
      ...(profile.allergies || []),
      profile.specificAllergies,
      profile.dislikes
    ].filter(Boolean).join(', ');

    const preferencesString = [
      `Goals: ${profile.goals?.join(', ') || 'Not specified'}${profile.otherGoals ? '; Other: ' + profile.otherGoals : ''}`,
      `Dietary Choice: ${profile.dietaryChoice || 'Not specified'}`,
      `Dislikes/Allergies: ${dislikes || 'None'}`,
      `Cooking Time Preference: ${profile.cookingTime || 'Not specified'}`,
      `Likes Batch Cooking: ${profile.batchCooking ? 'Yes' : 'No'}`,
      `Household Size/Servings: ${profile.householdSize || 'Not specified'} (${servings} servings planned)`,
      `Meals Per Day: ${profile.mealsPerDay || 'Not specified'}`,
      `Cooking Days Per Week: ${profile.cookingDaysPerWeek || 'Not specified'}`,
      `Favorite Cuisines: ${profile.favoriteCuisines?.join(', ') || 'None'}`,
      `Favorite Meals Examples: ${profile.favoriteMeals || 'None specified'}`,
    ].join('\n');

    console.log("Constructed Preferences String:\n", preferencesString);

    const prefsToSave: Preferences = {
      diet: profile.dietaryChoice || 'None', 
      servings: servings,
      calories: '', // Profile doesn't have calories yet
      dislikes: dislikes,
      preferences: preferencesString, 
    };
    // --- End Preferences construction --- 

    setPreferencesHandler(prefsToSave); // Update local state/storage (optional, profile is source of truth)

    try {
      console.log("Calling OpenAI with preferences:", prefsToSave);
      // Convert servings and calories *before* calling the API
      const servingsNum = Number(prefsToSave.servings);
      const caloriesNum = prefsToSave.calories === "" ? undefined : Number(prefsToSave.calories);

      const plan = await generateMealPlanAPI(
        prefsToSave.diet,
        servingsNum,       // Pass converted number
        caloriesNum,       // Pass converted number or undefined
        prefsToSave.dislikes,
        prefsToSave.preferences
      );
      setMealPlanHandler(plan); // Sets local state & triggers grocery list generation
      console.log("Meal plan generated:", plan);
    } catch (error: any) {
      console.error('Failed to load or generate meal plan:', error);
      setError(`Error loading or generating meal plan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MealPlanContext.Provider value={{
      mealPlan, 
      setMealPlan: setMealPlanHandler, 
      preferences, 
      setPreferences: setPreferencesHandler,
      groceryList,
      generateGroceryList,
      toggleGroceryItem,
      clearCheckedGroceryItems,
      isLoading,
      error,
      generateAndSetMealPlan,
      isRegenerating, 
      regenerateError, 
      regenerateSelectedMeals 
    }}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = (): MealPlanContextType => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};
