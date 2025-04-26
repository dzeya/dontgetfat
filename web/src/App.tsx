import './App.css'
import { Routes, Route } from 'react-router-dom';
import Planner from './pages/Planner'
import Grocery from './pages/Grocery'
import MealPlanOnboarding from './pages/MealPlanOnboarding';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import MealCardDemo from './pages/MealCardDemo'; 
import AuthPage from './pages/AuthPage'; 
import ProtectedRoute from './components/ProtectedRoute'; 

// Define options constants here (or import from a constants file)
const cookingTimeOptions = [
  '⚡️ Quickest (<15 mins)',
  '🍳 Standard (15-30 mins)',
  '🧑‍🍳 Involved (30-60 mins)',
  'gourmet (Love cooking, >60 mins)',
];
const householdSizeOptions = [
  'Just Me (1)',
  'Me + 1 (2)',
  'Family/Group (3+)',
];
const goalOptions = [
  'Weight Loss',
  'Weight Gain',
  'Muscle Building',
  'Maintain Weight',
  'Improve Energy',
  'Eat Healthier',
  'Manage Health Condition',
  'Convenience/Save Time',
];
const allergyOptions = [
  'Gluten/Wheat',
  'Dairy/Lactose',
  'Nuts (Specify below)',
  'Peanuts',
  'Soy',
  'Eggs',
  'Fish',
  'Shellfish',
];
const dietaryChoiceOptions = [
  'None/No specific diet',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Halal',
  'Kosher',
];
const cuisineOptions = [
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Japanese',
  'Thai',
  'Mediterranean',
  'American',
  'French',
];

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} /> {/* Public auth page */}

        {/* Protected Routes within MainLayout */}
        <Route 
          element={(
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/planner" element={<Planner />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/meal-card-demo" element={<MealCardDemo />} />
          <Route
            path="/meal-plan-onboarding"
            element={(
              <MealPlanOnboarding
                cookingTimeOptions={cookingTimeOptions}
                householdSizeOptions={householdSizeOptions}
                goalOptions={goalOptions}
                allergyOptions={allergyOptions}
                dietaryChoiceOptions={dietaryChoiceOptions}
                cuisineOptions={cuisineOptions}
              />
            )}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App
