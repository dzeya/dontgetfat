import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import { FormData } from '../types'; // Restore FormData import
import { useMealPlan } from '../MealPlanContext'; // Import context hook
import { useAuth } from '../context/AuthContext'; // Import Auth context hook
import { supabase } from '../lib/supabaseClient'; // Import Supabase client
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  TextField,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  CircularProgress, // For loading indicator
  Alert, // For error display
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

// Removed local options definitions

// Restore Prop types interface definition
interface MealPlanOnboardingProps {
  cookingTimeOptions: string[];
  householdSizeOptions: string[];
  goalOptions: string[];
  allergyOptions: string[];
  dietaryChoiceOptions: string[];
  cuisineOptions: string[];
}

const steps = [
  'Introduction',
  'Goals',
  'Restrictions & Dislikes',
  'Time, Effort & Household',
  'Preferences & Favorites',
  'Confirmation',
];

// Restore props in signature
const MealPlanOnboarding: React.FC<MealPlanOnboardingProps> = ({ 
  cookingTimeOptions, 
  householdSizeOptions,
  goalOptions,
  allergyOptions,
  dietaryChoiceOptions,
  cuisineOptions
}) => { 
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, fetchProfile } = useAuth(); // Get user, profile, loading state
  const { generateAndSetMealPlan, isLoading: isGenerating, error: generationError } = useMealPlan(); 
  const [activeStep, setActiveStep] = React.useState(0);
  const [isSaving, setIsSaving] = useState(false); // Loading state for saving profile
  const [saveError, setSaveError] = useState<string | null>(null); // Error state for saving

  // Internal state for form data, initialized from profile or defaults
  const [formData, setFormData] = useState<FormData>(() => {
    // Initial default state
    const defaults: FormData = {
      goals: [],
      otherGoals: '',
      allergies: [],
      specificAllergies: '',
      dietaryChoice: 'None/No specific diet',
      dislikes: '',
      cookingTime: '🍳 Standard (15-30 mins)',
      batchCooking: false,
      householdSize: 'Just Me (1)',
      mealsPerDay: '3', // Added default
      cookingDaysPerWeek: '5', // Added default
      favoriteCuisines: [],
      favoriteMeals: '',
    };
    // If profile exists, use it, otherwise use defaults
    // Note: We only initialize once. Updates after initial load need useEffect.
    return profile ? { ...defaults, ...profile } : defaults;
  });

  // Effect to update local formData if profile changes *after* initial load
  // (e.g., profile finishes loading after component mounts)
  useEffect(() => {
    if (profile && !authLoading) {
      console.log("Profile loaded/updated, updating onboarding form state:", profile);
      setFormData(prevData => ({ ...prevData, ...profile }));
    }
     // Consider if we need to reset to defaults if profile becomes null (e.g., user logs out while on page)?
     // else if (!profile && !authLoading) {
     //  setFormData(defaults); // Reset to defaults if profile disappears? Or handle via redirect?
     // }
  }, [profile, authLoading]);

  // Loading state check
   if (authLoading) {
     return (
       <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
         <CircularProgress />
         <Typography sx={{ ml: 2 }}>Loading preferences...</Typography>
       </Container>
     );
   }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // --- Handlers for Screen 1: Goals --- 
  const handleGoalToggle = (goal: string) => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      goals: prevData.goals.includes(goal)
        ? prevData.goals.filter((g: string) => g !== goal) 
        : [...prevData.goals, goal], 
    }));
  };

  const handleOtherGoalsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      otherGoals: event.target.value,
    }));
  };

  // --- Handlers for Screen 2: Restrictions & Dislikes ---
  const handleAllergyToggle = (allergy: string) => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      allergies: prevData.allergies.includes(allergy)
        ? prevData.allergies.filter((a: string) => a !== allergy)
        : [...prevData.allergies, allergy],
    }));
  };

  const handleSpecificAllergyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      specificAllergies: event.target.value,
    }));
  };

  const handleDietaryChoiceChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      dietaryChoice: event.target.value,
    }));
  };

  const handleDislikesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      dislikes: event.target.value,
    }));
  };

  // --- Handlers for Screen 3: Time, Effort & Household ---
  const handleCookingTimeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      cookingTime: event.target.value,
    }));
  };

  const handleBatchCookingToggle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      batchCooking: event.target.checked,
    }));
  };

  const handleHouseholdSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      householdSize: event.target.value,
    }));
  };

  const handleMealsPerDayChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    // Basic validation: allow empty string, otherwise check range [1, 5]
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5)) {
      setFormData((prevData: FormData): FormData => ({
        ...prevData,
        mealsPerDay: value,
      }));
    }
  };

  const handleCookingDaysPerWeekChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    // Basic validation: allow empty string (for clearing), otherwise check range
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 7)) {
      setFormData((prevData: FormData): FormData => ({
        ...prevData,
        cookingDaysPerWeek: value, // Store as string as defined in type
      }));
    }
    // Optionally: Add feedback if value is invalid (e.g., set an error state)
  };

  // --- Handlers for Screen 4: Preferences & Favorites ---
  const handleCuisineToggle = (cuisine: string) => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => {
      const currentCuisines = prevData.favoriteCuisines || []; // Default to empty array
      return {
        ...prevData,
        favoriteCuisines: currentCuisines.includes(cuisine)
          ? currentCuisines.filter((c: string) => c !== cuisine)
          : [...currentCuisines, cuisine],
      };
    });
  };

  const handleFavoriteMealsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Restore FormData type
    setFormData((prevData: FormData): FormData => ({
      ...prevData,
      favoriteMeals: event.target.value,
    }));
  };

  // Handler for saving profile data to Supabase
  const handleSaveProfile = async (dataToSave: FormData): Promise<boolean> => {
    if (!user) {
      setSaveError('User not found. Please log in again.');
      return false;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          // Map formData fields to profiles table columns
          goals: dataToSave.goals,
          other_goals: dataToSave.otherGoals,
          allergies: dataToSave.allergies,
          specific_allergies: dataToSave.specificAllergies,
          dietary_choice: dataToSave.dietaryChoice,
          dislikes: dataToSave.dislikes,
          cooking_time: dataToSave.cookingTime,
          batch_cooking: dataToSave.batchCooking,
          household_size: dataToSave.householdSize,
          meals_per_day: dataToSave.mealsPerDay, // Added
          cooking_days_per_week: dataToSave.cookingDaysPerWeek, // Added
          favorite_cuisines: dataToSave.favoriteCuisines,
          favorite_meals: dataToSave.favoriteMeals,
          updated_at: new Date().toISOString(), // Add updated timestamp
        })
        .eq('id', user.id);

      if (error) throw error;
      console.log('Profile saved successfully!');
      setIsSaving(false);
      return true; // Indicate success
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'Failed to save profile.');
      setIsSaving(false);
      return false; // Indicate failure
    }
  };

  // Handler for the final submission/navigation
  const handleFinishAndGenerate = async () => {
    setSaveError(null); // Clear previous errors
    const savedSuccessfully = await handleSaveProfile(formData);

    if (savedSuccessfully) {
      // Only generate and navigate if save was successful
      await generateAndSetMealPlan(); 
      console.log('Profile saved and meal plan generation triggered.');
      navigate('/planner'); // Navigate to planner after successful generation
    } else {
      // Handle save failure (error message is already set by handleSaveProfile)
      console.error("Profile save failed, not generating plan or navigating.")
    }
  };

  // Function to render content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        // Screen 0: Introduction
        return (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Let's Personalize Your Meal Plan!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Answering these 4 quick questions helps us tailor a plan you'll love and stick to (aiming for 99% perfect!). It should only take a minute or two.
            </Typography>
            {/* The 'Get Started' button is essentially the 'Next' button for this step */}
          </Box>
        );
      case 1:
        // Screen 1: Goals
        return (
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              What are your main health & wellness goals for this plan?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Select all that apply.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
              {goalOptions.map((goal) => (
                <Chip
                  key={goal}
                  label={goal}
                  clickable
                  color={formData.goals.includes(goal) ? 'primary' : 'default'}
                  variant={formData.goals.includes(goal) ? 'filled' : 'outlined'}
                  onClick={() => handleGoalToggle(goal)}
                  // Optional: Add icons later
                  // icon={/* Add icon based on goal */} 
                />
              ))}
            </Stack>
            <TextField
              label="Specify health conditions or other goals (optional)"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={formData.otherGoals}
              onChange={handleOtherGoalsChange}
              sx={{ mt: 2 }}
            />
          </Box>
        );
      case 2:
        // Screen 2: Restrictions & Dislikes
        return (
          <Box sx={{ my: 2 }}> 
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
              Any foods you need to avoid?
            </Typography>

            <Stack spacing={4}> 
              {/* Section 1: Allergies & Intolerances */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  Allergies & Intolerances (Please be precise for safety)
                </FormLabel>
                <FormGroup>
                  {allergyOptions.map((allergy) => (
                    <FormControlLabel
                      key={allergy}
                      control={
                        <Checkbox
                          checked={formData.allergies.includes(allergy)}
                          onChange={() => handleAllergyToggle(allergy)}
                          name={allergy}
                        />
                      }
                      label={allergy}
                    />
                  ))}
                </FormGroup>
                <TextField
                  label="Specify Nut/Other Allergies"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.specificAllergies}
                  onChange={handleSpecificAllergyChange}
                  sx={{ mt: 1.5 }}
                  disabled={!formData.allergies.includes('Nuts (Specify below)') && !formData.allergies.some((a: string) => a.toLowerCase().includes('other'))} 
                />
              </FormControl>

              {/* Section 2: Dietary Preferences */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  Dietary Choices
                </FormLabel>
                <RadioGroup
                  aria-label="dietary-choice"
                  name="dietary-choice-group"
                  value={formData.dietaryChoice}
                  onChange={handleDietaryChoiceChange}
                >
                  {dietaryChoiceOptions.map((choice) => (
                    <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Section 3: Strong Dislikes */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  Foods You Strongly Dislike
                </FormLabel>
                <TextField
                  label="List foods here, separated by commas"
                  placeholder="e.g., Olives, Cilantro, Beets"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.dislikes}
                  onChange={handleDislikesChange}
                />
              </FormControl>
            </Stack>
          </Box>
        );
      case 3:
        // Screen 3: Time, Effort & Household
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
              How do you like to cook?
            </Typography>
            <Stack spacing={4}> 
              {/* Sub-section 1: Cooking Time & Batch Cooking */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  Preferred Cooking Time Per Meal
                </FormLabel>
                <RadioGroup
                  aria-label="cooking-time"
                  name="cooking-time-group"
                  value={formData.cookingTime}
                  onChange={handleCookingTimeChange}
                >
                  {cookingTimeOptions.map((choice) => ( 
                    <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
                  ))}
                </RadioGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.batchCooking}
                      onChange={handleBatchCookingToggle}
                      name="batchCooking"
                    />
                  }
                  label="I'm open to batch cooking on weekends"
                  sx={{ mt: 1 }} 
                />
              </FormControl>

              {/* Sub-section 2: Household Size */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  Household Size
                </FormLabel>
                <RadioGroup
                  aria-label="household-size"
                  name="household-size-group"
                  value={formData.householdSize}
                  onChange={handleHouseholdSizeChange}
                >
                  {householdSizeOptions.map((choice) => ( 
                    <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Sub-section 3: Meals Per Day & Cooking Days Per Week */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  Cooking Habits
                </FormLabel>
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="How many meals do you typically eat per day?"
                    value={formData.mealsPerDay || ''} // Ensure controlled component
                    onChange={handleMealsPerDayChange}
                    helperText="e.g., 2, 3, 4+"
                  />
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="How many days a week do you usually cook meals?"
                    value={formData.cookingDaysPerWeek || ''} // Ensure controlled component
                    onChange={handleCookingDaysPerWeekChange}
                    helperText="Enter a number (e.g., 3, 5, 7)"
                    type="number" // Optional: Enforce number input
                    inputProps={{ min: 0, max: 7 }} // Optional: Add constraints
                  />
                </FormControl>
              </FormControl>
            </Stack>
          </Box>
        );
      case 4:
        // Screen 4: Preferences & Favorites
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
              What kind of food do you enjoy?
            </Typography>
            <Stack spacing={4}> 
              {/* Sub-section 1: Favorite Cuisines */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  Select cuisines you enjoy (Choose as many as you like)
                </FormLabel>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                  {cuisineOptions.map((cuisine) => (
                    <Chip
                      key={cuisine}
                      label={cuisine}
                      clickable
                      color={(formData.favoriteCuisines || []).includes(cuisine) ? 'primary' : 'default'} // Default to empty array
                      variant={(formData.favoriteCuisines || []).includes(cuisine) ? 'filled' : 'outlined'} // Default to empty array
                      onClick={() => handleCuisineToggle(cuisine)}
                    />
                  ))}
                </Stack>
              </FormControl>

              {/* Sub-section 2: Favorite Meals/Ingredients */} 
              <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}> 
                  List some specific meals or foods you'd love to see included
                </FormLabel>
                <TextField
                  label="Favorite meals or ingredients"
                  placeholder="e.g., Tacos, Pasta, Salmon, Stir-fry, Salads"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.favoriteMeals}
                  onChange={handleFavoriteMealsChange}
                />
              </FormControl>
            </Stack>
          </Box>
        );
      case 5:
        // Screen 5: Confirmation (Final step before completion)
        return (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Thanks! We've got your preferences.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generating your personalized meal plan...
            </Typography>
            {/* Add loading indicator maybe */}
            {/* Button here might navigate away, handled separately */}
          </Box>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 } }}> 
        {/* Subtle Progress Indicator - Keep or remove, Stepper is more prominent */}
        {activeStep < steps.length - 1 && (
          <Typography variant="caption" display="block" align="center" sx={{ mb: 3 }}> 
            Step {activeStep + 1} of {steps.length - 1} 
          </Typography>
        )}
        {/* Optional: Full Stepper for visual progress */} 
        <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 1, pb: 4 }}> 
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper> 

        {/* Content Area */} 
        <Box sx={{ mt: 2, mb: 4, minHeight: '350px' }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Footer Navigation */} 
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && activeStep !== steps.length - 1 && ( 
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              // disabled={/* Add validation logic here */} 
            >
              {activeStep === 0 ? "Let's Get Started!" : 'Next'}
            </Button>
          ) : (
            // Final Step: Confirmation and Generation Trigger
            <Button 
              variant="contained" 
              onClick={handleFinishAndGenerate} 
              disabled={isSaving || isGenerating} // Disable while saving or generating
              sx={{ mt: 1, mr: 1 }}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Save Preferences & Generate Plan'}
            </Button>
          )}
          {/* Display save error */} 
          {saveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}
          {/* Display generation error (if save was ok but generation failed - handled on Planner page) */} 
          {generationError && !saveError && (
             <Alert severity="warning" sx={{ mt: 2 }}>
               Preferences saved, but failed to generate initial plan: {generationError}. Proceeding to planner.
            </Alert>
          )}
        </Box>

        {/* Display Generation Error if it occurs on the last step */}
        {activeStep === steps.length - 1 && generationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {generationError}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default MealPlanOnboarding;
