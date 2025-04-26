import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Container,
  Stack,
  Card,
  CardContent,
  Collapse,
  useTheme,
  useMediaQuery,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import SpaIcon from '@mui/icons-material/Spa';
import NoFoodIcon from '@mui/icons-material/NoFood';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KitchenIcon from '@mui/icons-material/Kitchen';
import { useMealPlan, Preferences } from '../MealPlanContext';
import { generateMealPlan } from '../services/openai';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setMealPlan, setPreferences } = useMealPlan();
  const [diet, setDiet] = React.useState('omnivore');
  const [servings, setServings] = React.useState(1);
  const [calories, setCalories] = React.useState<number | ''>('');
  const [dislikes, setDislikes] = React.useState('');
  const [generalPreferences, setGeneralPreferences] = React.useState('');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate a delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Collect preferences correctly, ensuring type matches Context Preferences
      const currentPrefsPayload: Preferences = {
        diet,
        servings: Number(servings),
        calories: calories, // Pass the state value directly (it's already number | '')
        dislikes,
        preferences: generalPreferences // Use renamed state variable
      };

      // Generate the plan (Put this back)
      const plan = await generateMealPlan(
        currentPrefsPayload.diet,
        currentPrefsPayload.servings,
        currentPrefsPayload.calories,
        currentPrefsPayload.dislikes,
        currentPrefsPayload.preferences
      );

      // Store preferences and plan in context
      setPreferences(currentPrefsPayload); // Use the correctly typed payload
      setMealPlan(plan); // Use the actual plan from generateMealPlan

      // Navigate to planner page without state
      navigate('/planner');

    } catch (e: any) {
      console.error('Failed to generate meal plan:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dietOptions = [
    { value: 'omnivore', label: 'Omnivore', icon: <RestaurantMenuIcon /> },
    { value: 'vegetarian', label: 'Vegetarian', icon: <SpaIcon /> },
    { value: 'vegan', label: 'Vegan', icon: <RamenDiningIcon /> },
    { value: 'keto', label: 'Keto', icon: <LocalDiningIcon /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'radial-gradient(circle at top right, rgba(230, 245, 255, 0.5), rgba(255, 255, 255, 0))',
        backgroundSize: 'cover',
        py: { xs: 2, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center">
          {/* Header */}
          <Box textAlign="center" sx={{ mb: 2 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="700"
              sx={{
                mb: 1,
                background: 'linear-gradient(90deg, #3bb78f 0%, #0bab64 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Meal Planner
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto' }}
            >
              Simplify your week with an AI-generated meal plan tailored just for you
            </Typography>
          </Box>

          {/* Main Form Card with hover effect */}
          <Card
            elevation={0}
            sx={{
              width: '100%',
              borderRadius: 4,
              overflow: 'visible',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                transform: 'translateY(-4px)',
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}> {/* Use Grid for layout */}
                  {/* Diet Type */}
                  {/* @ts-ignore */}
                  <Grid item xs={12} sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>Diet Type</Typography>
                    <ToggleButtonGroup
                      color="primary"
                      value={diet}
                      exclusive
                      onChange={(_, newVal) => { if (newVal !== null) setDiet(newVal); }}
                      aria-label="Diet selection"
                      fullWidth
                      sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
                    >
                      {dietOptions.map((option) => (
                        <ToggleButton
                          key={option.value}
                          value={option.value}
                          aria-label={option.label}
                          sx={{ m: 0.5 }}
                        >
                          {option.icon && React.cloneElement(option.icon, { sx: { mr: 1 } })}
                          {option.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>

                  {/* Household Size & Calories - Structure: Outer Item -> Inner Container -> Two Items */}
                  {/* @ts-ignore - For the outer item Grid */}
                  <Grid item xs={12} sx={{ mb: 2 }}> {/* Outer item for the row */} 
                    <Grid container spacing={isMobile ? 2 : 3}> {/* Inner container for the two fields */} 
                      {/* @ts-ignore */}
                      <Grid item xs={12} sm={6}> {/* First field item */} 
                        <TextField
                          label="Household Size"
                          type="number"
                          value={servings}
                          onChange={e => setServings(+e.target.value)}
                          inputProps={{ min: 1 }}
                          fullWidth
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PeopleIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid item xs={12} sm={6}> {/* Second field item */} 
                        <TextField
                          label="Target Calories/Day (Optional)"
                          type="number"
                          value={calories}
                          onChange={e => setCalories(e.target.value === '' ? '' : +e.target.value)}
                          inputProps={{ min: 0 }}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalFireDepartmentIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid> {/* End Inner container */} 
                  </Grid> {/* End Outer item for the row */} 

                  {/* Advanced Options Toggle */}
                   {/* @ts-ignore */}
                  <Grid item xs={12} sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      variant="text"
                      sx={{ justifyContent: 'space-between', color: 'text.secondary', textTransform: 'none', py: 1 }}
                      endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      Advanced Options (Dislikes, Preferences)
                    </Button>
                  </Grid>

                  {/* Collapsible Advanced Options */}
                  {/* @ts-ignore */}
                  <Grid item xs={12} sx={{ mb: 3 }}>
                    <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
                      <Stack spacing={3} sx={{ pt: 2, borderTop: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'action.hover' }}>
                        {/* Dislikes */}
                        <TextField
                          label="Disliked Ingredients or Foods (comma-separated)"
                          value={dislikes}
                          onChange={e => setDislikes(e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <NoFoodIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        {/* Preferences */}
                        <TextField
                          label="Specific Preferences or Cuisines (e.g., quick meals, Italian)"
                          value={generalPreferences}
                          onChange={e => setGeneralPreferences(e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <FavoriteIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Stack>
                    </Collapse>
                  </Grid>

                  {/* Submit Button */}
                  {/* @ts-ignore */}
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <KitchenIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #0bab64 0%, #3bb78f 100%)',
                        '&:hover': {
                          opacity: 0.9
                        }
                      }}
                    >
                      {isSubmitting ? 'Generating...' : 'Generate Meal Plan'}
                    </Button>
                  </Grid>
                </Grid> {/* End Grid container */}
              </form>
            </CardContent>
          </Card>

          {/* Bottom Tagline */}
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', mr: 0.5, color: 'error.main' }} />
            Your personalized plan helps reduce food waste and save money
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Onboarding;
