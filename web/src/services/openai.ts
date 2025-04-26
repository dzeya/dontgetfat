// --- Interfaces (consider moving to a shared types folder) ---
export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // More specific type
  name: string;
  ingredients: string[];
  estimated_time: number; // in minutes
}

export interface DayPlan {
  day: number; // e.g., 1 for Monday
  meals: Meal[];
}

export interface MealPlan {
  days: DayPlan[];
}
// --- End Interfaces ---

// Determine API base URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Generates a meal plan by calling the backend service.
 */
export async function generateMealPlan(
  diet: string,
  servings: number,
  calories?: number,
  dislikes?: string,
  preferences?: string
): Promise<MealPlan> {
  console.log('Generating meal plan with:', { diet, servings, calories, dislikes, preferences });

  // Build the request body conditionally
  const requestBody: any = {
    diet,
    servings,
    dislikes,
    preferences
  };

  // Only include calories if it's a valid positive number
  if (calories !== undefined && calories !== null && calories >= 1) {
    requestBody.calories = calories;
  }

  const res = await fetch(`${API_BASE_URL}/openai/generate-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody) // Send the conditionally built body
  });

  if (!res.ok) {
    let errorMsg = `HTTP error! status: ${res.status}`;
    try {
      const errorBody = await res.json();
      errorMsg = `${errorMsg} - ${errorBody.message || JSON.stringify(errorBody)}`;
    } catch (e) {
      // Ignore if response body is not JSON
    }
    console.error('Error generating meal plan:', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const data: MealPlan = await res.json();
    console.log('Received meal plan:', data);
    // Add basic validation (can be more robust)
    if (!data || !Array.isArray(data.days)) {
      throw new Error('Invalid meal plan format received from backend.');
    }
    return data;
  } catch (error) {
    console.error('Error parsing meal plan JSON:', error);
    throw new Error('Failed to parse meal plan data from backend.');
  }
}

/**
 * Regenerates specific meals by calling the backend service.
 */
export const regenerateMealsService = async (
    preferences: {
        diet: string;
        servings: number;
        calories?: number;
        dislikes?: string;
        preferences?: string;
    },
    mealTypesToRegenerate: string[],
    previousMealNames: string[]
): Promise<Meal[]> => {
    console.log('Regenerating meals for types:', mealTypesToRegenerate);
    console.log('With preferences:', preferences);
    console.log('Avoiding previous:', previousMealNames);

    const res = await fetch(`${API_BASE_URL}/openai/regenerate-meals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            preferences, // Pass the nested preferences object
            mealTypesToRegenerate,
            previousMealNames
        })
    });

    if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
            const errorBody = await res.json();
            errorMsg = `${errorMsg} - ${errorBody.message || JSON.stringify(errorBody)}`;
        } catch (e) {
            // Ignore if response body is not JSON
        }
        console.error('Error regenerating meals:', errorMsg);
        throw new Error(errorMsg);
    }

    try {
        const data: { meals: Meal[] } | Meal[] = await res.json(); // Backend might return {meals: Meal[]} or just Meal[]
        console.log('Received regenerated meals:', data);

        // Normalize response: backend service returns Meal[], controller returns it directly.
        const meals = Array.isArray(data) ? data : data.meals;

        // Basic validation
        if (!Array.isArray(meals)) {
            console.error('Invalid regenerated meals format:', data);
            throw new Error('Invalid regenerated meals format received from backend.');
        }
        if (meals.length !== mealTypesToRegenerate.length) {
             console.warn(`Requested ${mealTypesToRegenerate.length} meals, received ${meals.length}. Proceeding with received meals.`);
             // Allow proceeding even if the count mismatches slightly, maybe log this discrepancy
        }
        return meals;
    } catch (error) {
        console.error('Error parsing regenerated meals JSON:', error);
        throw new Error('Failed to parse regenerated meals data from backend.');
    }
};

// --- New function to call the image generation endpoint ---
export async function generateMealImageAPI(mealName: string): Promise<{ imageUrl: string | null }> {
  console.log(`Requesting image generation for: ${mealName}`);
  const res = await fetch(`${API_BASE_URL}/openai/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mealName: mealName })
  });

  if (!res.ok) {
    let errorMsg = `HTTP error! status: ${res.status}`;
    try {
      const errorBody = await res.json();
      errorMsg = `${errorMsg} - ${errorBody.message || JSON.stringify(errorBody)}`;
    } catch (e) {
      // Ignore if response body is not JSON
    }
    console.error('Error generating meal image:', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const data = await res.json();
    console.log(`Received image data for ${mealName}:`, data);
    if (data && typeof data.imageUrl === 'string') {
        return { imageUrl: data.imageUrl };
    } else if (data && data.imageUrl === null) {
        return { imageUrl: null }; // Explicitly handle null case if API returns it
    } else {
        // Handle unexpected response structure
        console.warn('Unexpected image generation response structure:', data);
        throw new Error('Invalid image data received from backend.');
    }
  } catch (error) {
    console.error('Error parsing image generation JSON:', error);
    throw new Error('Failed to parse image data from backend.');
  }
}
