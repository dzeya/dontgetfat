import React, { useState, useEffect } from 'react'
import { useMealPlan } from '../MealPlanContext'
import {
  Box,
  Card,
  Chip, 
  Typography,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Container,
  Checkbox
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'; 
import ListAltIcon from '@mui/icons-material/ListAlt'; 
import RefreshIcon from '@mui/icons-material/Refresh'; 
import { Link as RouterLink } from 'react-router-dom'; 
import { useTheme } from '@mui/material/styles'; 

import { PDFDownloadLink } from '@react-pdf/renderer'; 
import MealPlanPDF from '../components/MealPlanPDF'; 

import { generateAllMealImagesAPI } from '../services/openai'; 

import { useAuth } from '../context/AuthContext';

interface PlannerProps {
}

const emojiMap: { [key: string]: string } = { 
  Breakfast: "🍳", 
  Lunch: "🥪", 
  Dinner: "🍽️", 
  Snack: "🍎", 
  Supper: "🥣" 
}; 

const getDayName = (dayNumber: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayNumber - 1] || `Day ${dayNumber}`;
}

const Planner: React.FC<PlannerProps> = () => { 
  const theme = useTheme(); 
  const { 
    mealPlan, 
    isLoading, 
    error, 
    regenerateSelectedMeals, 
    isRegenerating,        
    regenerateError,        
    generateAndSetMealPlan
  } = useMealPlan()
  const { profile } = useAuth(); 
  const [selectedMeals, setSelectedMeals] = React.useState<Set<string>>(new Set());

  const [allMealImages, setAllMealImages] = useState<Record<string, string | null>>({});
  const [isGeneratingAllImages, setIsGeneratingAllImages] = useState<boolean>(false);
  const [generateAllError, setGenerateAllError] = useState<string | null>(null);

  const handleCheckboxChange = (dayIndex: number, mealIndex: number) => {
    const mealKey = `${dayIndex}-${mealIndex}`;
    setSelectedMeals(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(mealKey)) {
        newSelected.delete(mealKey);
      } else {
        newSelected.add(mealKey);
      }
      return newSelected;
    });
  };

  const handleRegenerateSelected = async () => { 
    console.log("Regenerate clicked for meals:", Array.from(selectedMeals));
    await regenerateSelectedMeals(Array.from(selectedMeals));
  };

  const handleGenerateAllImages = async () => {
    if (!mealPlan) return;

    console.log('Starting generation for all meal images...');
    setIsGeneratingAllImages(true);
    setGenerateAllError(null);
    setAllMealImages({}); 

    const mealNames = new Set<string>();
    mealPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        if (meal && meal.name) {
          mealNames.add(meal.name);
        }
      });
    });

    const mealsToGenerate = Array.from(mealNames).map(name => ({ name }));

    if (mealsToGenerate.length === 0) {
      console.log('No meal names found to generate images for.');
      setIsGeneratingAllImages(false);
      return;
    }

    try {
      const results = await generateAllMealImagesAPI(mealsToGenerate);
      setAllMealImages(results);
      console.log('Bulk image generation successful:', results);
    } catch (error: any) {
      console.error('Error generating all images:', error);
      setGenerateAllError(error?.message || 'Failed to generate images.');
    } finally {
      setIsGeneratingAllImages(false);
      console.log('Finished bulk image generation attempt.');
    }
  };

  useEffect(() => {
    console.log("[Planner Effect] Checking for initial generation. Profile:", !!profile, "Meal Plan:", !!mealPlan, "Loading:", isLoading);
    if (profile && !mealPlan && !isLoading && !error) {
      console.log("[Planner Effect] Conditions met for initial generation. Calling generateAndSetMealPlan...");
      generateAndSetMealPlan(profile); 
    }
  }, [profile, mealPlan, isLoading, error, generateAndSetMealPlan]); 

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Alert severity="error">Error loading or generating meal plan: {error}</Alert>
        <Button 
          component={RouterLink} 
          to="/meal-plan-onboarding" 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
        >
          Try Onboarding Again
        </Button>
      </Container>
    );
  }

  if (!mealPlan) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          No meal plan found.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please complete the onboarding process to generate your personalized plan.
        </Typography>
        <Button 
          component={RouterLink} 
          to="/meal-plan-onboarding" 
          variant="contained" 
          color="primary"
        >
          Go to Onboarding
        </Button>
      </Container>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
        Your Weekly Meal Plan
      </Typography>
      
      <Box display="flex" justifyContent="center" gap={2} sx={{ mb: 5 }}>
        <Button
          component={RouterLink} 
          to="/grocery"
          variant="contained"
          color="secondary" 
          startIcon={<ListAltIcon />}
          disabled={!mealPlan} 
        >
          View Grocery List
        </Button>
        {mealPlan && (
          <PDFDownloadLink
            document={<MealPlanPDF mealPlan={mealPlan} />}
            fileName="weekly-meal-plan.pdf"
            style={{ textDecoration: 'none' }} 
          >
            {({ loading }) => (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
        <Button
          variant="contained"
          color="secondary" 
          onClick={handleRegenerateSelected}
          disabled={selectedMeals.size === 0 || isRegenerating || isLoading} 
          startIcon={isRegenerating ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        >
          {isRegenerating ? 'Regenerating...' : `Regenerate Selected (${selectedMeals.size})`}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleGenerateAllImages}
          disabled={isGeneratingAllImages || !mealPlan || isLoading}
          startIcon={isGeneratingAllImages ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        >
          {isGeneratingAllImages ? 'Generating...' : `Generate All Images`}
        </Button>
      </Box>

      {regenerateError && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Alert severity="error" sx={{ width: 'fit-content' }}>
            Regeneration failed: {regenerateError}
          </Alert>
        </Box>
      )}
      {generateAllError && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Alert severity="error" sx={{ width: 'fit-content' }}>
            Image generation failed: {generateAllError}
          </Alert>
        </Box>
      )}

      <Stack spacing={5}> 
        {mealPlan.days.map((day, dayIndex) => (
          <Box key={dayIndex}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, borderBottom: 1, borderColor: 'divider', pb: 1, mb: 3 }}>
              {getDayName(day.day)} 
            </Typography>
            <Grid container spacing={3} sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(3, 1fr)'
              },
              gap: { xs: 2, sm: 3 }, 
              maxWidth: '1200px',
              mx: 'auto'
            }}> 
              {day.meals && day.meals.map((meal, mealIndex) => {
                if (!meal) return null; 
                
                const { name, type, ingredients } = meal;

                const ingredientsArray = Array.isArray(ingredients) ? ingredients : 
                  (typeof ingredients === 'string' ? [ingredients] : []);
                
                const filteredIngredients = ingredientsArray.filter(ingredient => 
                  ingredient && typeof ingredient === 'string' && ingredient.trim() !== ''
                );
                
                return (
                  <Box 
                    key={mealIndex} 
                    sx={{ 
                      width: '100%',
                      maxWidth: '400px',
                      minWidth: '300px',
                      margin: '0 auto'
                    }}
                  >
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        width: '100%',
                        height: '380px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: '12px', 
                        bgcolor: 'white',
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', 
                        border: '1px solid #eaeaea', 
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0px 4px 12px rgba(0,0,0,0.12)', 
                          borderColor: '#d0d0d0' 
                        }
                      }}>
                        <Box sx={{ 
                          position: 'relative',
                          width: '100%',
                          height: '200px', 
                          overflow: 'hidden',
                          bgcolor: '#f8f8f8' 
                        }}>
                          <Chip
                            label={(() => {
                              const formattedType = typeof type === 'string' && type.length > 0
                                ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
                                : '';
                              return emojiMap[formattedType] || '🍲'; 
                            })()}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: theme.spacing(1),
                              left: theme.spacing(1),
                              bgcolor: 'rgba(0, 0, 0, 0.6)',
                              color: 'white',
                              fontWeight: 500,
                              '.MuiChip-label': { px: 1 }, 
                            }}
                          />

                          <Chip
                            label={`⏱️ ${meal.estimated_time} min.`} 
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: theme.spacing(1),
                              right: theme.spacing(1), 
                              bgcolor: 'rgba(255, 255, 255, 0.8)', 
                              color: theme.palette.text.primary, 
                              fontWeight: 500,
                              '.MuiChip-label': { px: 1 }, 
                              backdropFilter: 'blur(2px)', 
                            }}
                          />

                          <img 
                            src={allMealImages[name || ''] || `https://source.unsplash.com/random/300x200?food,${name ? name.split(' ')[0] : 'plate'}`} 
                            alt={meal.name || 'Meal image'} 
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover', 
                            }}
                            loading="lazy" 
                          />
                        </Box>

                        <Box sx={{ 
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          flexGrow: 1,
                          position: 'relative',
                          height: '180px' 
                        }}>
                          <Box sx={{ height: '48px', mb: 1 }}>
                            <Typography 
                              variant="h6"
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '1.125rem', 
                                lineHeight: 1.5, 
                                color: '#333', 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                              {name || 'Untitled Meal'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            height: '72px',
                            overflow: 'hidden',
                            pl: 0.5
                          }}>
                            {filteredIngredients.length > 0 ? (
                              filteredIngredients.map((ingredient, index) => (
                                <Box
                                  key={`ingredient-${index}-${dayIndex}-${mealIndex}`}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '16px',
                                    bgcolor: '#f5f7fa', 
                                    color: '#666', 
                                    px: 1.5, 
                                    py: 0.75, 
                                    fontSize: '0.875rem', 
                                    fontWeight: 400,
                                    lineHeight: 1.4,
                                    mb: 0.5,
                                    height: '28px',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {ingredient}
                                </Box>
                              ))
                            ) : (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#666',
                                  fontStyle: 'italic'
                                }}
                              >
                                No ingredients listed
                              </Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 1,
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                          }}>
                            <Checkbox 
                              color="primary"
                              checked={selectedMeals.has(`${dayIndex}-${mealIndex}`)} 
                              onChange={() => handleCheckboxChange(dayIndex, mealIndex)} 
                              aria-label={`Select ${name}`}
                            />
                          </Box>
                        </Box>
                      </Card>
                    </Box>
                  );
                })}
              </Grid>
            </Box>
          ))}
        </Stack>
    </Box>
  )
}

export default Planner
