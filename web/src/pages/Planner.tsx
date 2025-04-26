import React from 'react'
import { useMealPlan } from '../MealPlanContext'
import {
  Box,
  Card,
  Chip, // Add Chip import
  Typography,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Container,
  Checkbox
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'; // Icon for download button
import ListAltIcon from '@mui/icons-material/ListAlt'; // Icon for grocery list button
import RefreshIcon from '@mui/icons-material/Refresh'; // Icon for regenerate button
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink for navigation
import { useTheme } from '@mui/material/styles'; // Import useTheme

import { PDFDownloadLink } from '@react-pdf/renderer'; // Import PDFDownloadLink
import MealPlanPDF from '../components/MealPlanPDF'; // Import the PDF document component

// Define Props for Planner component
interface PlannerProps {
}

// Map meal types to emojis (like reference)
const emojiMap: { [key: string]: string } = { 
  Breakfast: "🍳", 
  Lunch: "🥪", 
  Dinner: "🍽️", 
  Snack: "🍎", 
  Supper: "🥣" 
}; 

const getDayName = (dayNumber: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // Adjust for 1-based indexing if dayNumber starts from 1
  return days[dayNumber - 1] || `Day ${dayNumber}`;
}

const Planner: React.FC<PlannerProps> = () => { 
  const theme = useTheme(); // Get theme for transitions
  const { 
    mealPlan, 
    isLoading: contextIsLoading, 
    error: contextError, 
    regenerateSelectedMeals, // Get the function from context
    isRegenerating,        // Get loading state
    regenerateError        // Get error state
  } = useMealPlan()
  const [selectedMeals, setSelectedMeals] = React.useState<Set<string>>(new Set());

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

  // Define the handler function for regeneration
  const handleRegenerateSelected = async () => { // Make async
    console.log("Regenerate clicked for meals:", Array.from(selectedMeals));
    // Call context function
    await regenerateSelectedMeals(Array.from(selectedMeals));
    // Optionally clear selection after regeneration
    // setSelectedMeals(new Set()); 
  };

  // Loading state
  if (contextIsLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (contextError) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Alert severity="error">Error loading or generating meal plan: {contextError}</Alert>
        <Button 
          component={RouterLink} // Use RouterLink here
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

  // No meal plan generated yet state
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
          component={RouterLink} // Use RouterLink here
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
      
      {/* Removed Preferences Card */}

      {/* Action Buttons Grouped */}
      <Box display="flex" justifyContent="center" gap={2} sx={{ mb: 5 }}>
        <Button
          component={RouterLink} // Use RouterLink here
          to="/grocery"
          variant="contained"
          color="secondary" 
          startIcon={<ListAltIcon />}
          disabled={!mealPlan} // Disable if no plan exists
        >
          View Grocery List
        </Button>
        {mealPlan && (
          <PDFDownloadLink
            document={<MealPlanPDF mealPlan={mealPlan} />}
            fileName="weekly-meal-plan.pdf"
            style={{ textDecoration: 'none' }} // Remove underline from link
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
        {/* Regenerate Button */}
        <Button
          variant="contained"
          color="secondary" // Using secondary for consistency, can change
          onClick={handleRegenerateSelected}
          disabled={selectedMeals.size === 0 || isRegenerating || contextIsLoading} // Disable when regenerating or initially loading
          startIcon={isRegenerating ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        >
          {isRegenerating ? 'Regenerating...' : `Regenerate Selected (${selectedMeals.size})`}
        </Button>
      </Box>

      {/* Display Regeneration Error */} 
      {regenerateError && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Alert severity="error" sx={{ width: 'fit-content' }}>
            Regeneration failed: {regenerateError}
          </Alert>
        </Box>
      )}

      {/* Planner Content Area */}
      {/* Display Meal Plan Grid */}
      {!contextIsLoading && !contextError && mealPlan && mealPlan.days && mealPlan.days.length > 0 ? (
        <Stack spacing={5}> {/* Increased spacing between days */}
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
                gap: { xs: 2, sm: 3 }, // Consistent gap between cards (16-20px)
                maxWidth: '1200px',
                mx: 'auto'
              }}> 
                {day.meals && day.meals.map((meal, mealIndex) => {
                  if (!meal) return null; // Skip if meal is undefined
                  
                  const { name, type, ingredients } = meal;
                  
                  const randomImageUrl = `https://source.unsplash.com/random/300x200?food,${name.split(' ')[0]}`;
                  
                  // ** Updated Ingredient Display Logic: Show all ingredients, allow wrapping **
                  const ingredientsArray = Array.isArray(ingredients) ? ingredients : 
                    (typeof ingredients === 'string' ? [ingredients] : []);
                  
                  // Filter out empty strings and null/undefined values
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
                          height: '380px', // Fixed height for all cards
                          display: 'flex', 
                          flexDirection: 'column',
                          borderRadius: '12px', // More modern look
                          bgcolor: 'white',
                          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', // Subtle drop shadow
                          border: '1px solid #eaeaea', // Light border
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0px 4px 12px rgba(0,0,0,0.12)', // Elevated shadow on hover
                            borderColor: '#d0d0d0' // Border highlight on hover
                          }
                      }}>
                        {/* Image container with fixed 3:2 aspect ratio */}
                        <Box sx={{ 
                          position: 'relative',
                          width: '100%',
                          height: '200px', // 3:2 aspect ratio for 400px width (reduced height)
                          overflow: 'hidden',
                          bgcolor: '#f8f8f8' // Light background for images
                        }}>
                          {/* Meal Type Emoji */}
                          <Chip
                            label={(() => {
                              const formattedType = typeof type === 'string' && type.length > 0
                                ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
                                : '';
                              return emojiMap[formattedType] || '🍲'; // Use formatted type for lookup
                            })()}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: theme.spacing(1),
                              left: theme.spacing(1),
                              bgcolor: 'rgba(0, 0, 0, 0.6)',
                              color: 'white',
                              fontWeight: 500,
                              '.MuiChip-label': { px: 1 }, // Compact padding
                            }}
                          />

                          {/* Estimated Time */}
                          <Chip
                            label={`⏱️ ${meal.estimated_time} min.`} // Use estimated_time
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: theme.spacing(1),
                              right: theme.spacing(1), // Position top-right
                              bgcolor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
                              color: theme.palette.text.primary, // Dark text
                              fontWeight: 500,
                              '.MuiChip-label': { px: 1 }, // Compact padding
                              backdropFilter: 'blur(2px)', // Optional: slight blur effect
                            }}
                          />

                          <img 
                            src={randomImageUrl} 
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

                        {/* Card content */}
                        <Box sx={{ 
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          flexGrow: 1,
                          position: 'relative',
                          height: '180px' // Remaining space of the 380px height
                        }}>
                          {/* Meal name - fixed height with consistent styling */}
                          <Box sx={{ height: '48px', mb: 1 }}>
                            <Typography 
                              variant="h6"
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '1.125rem', // 18px
                                lineHeight: 1.5, // Improved readability
                                color: '#333', // Dark gray for titles
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                              {name || 'Untitled Meal'}
                            </Typography>
                          </Box>
                          
                          {/* Ingredients - fixed container with consistent styling */}
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
                                    bgcolor: '#f5f7fa', // Subtle background for tags
                                    color: '#666', // Medium gray for ingredients
                                    px: 1.5, // 12px horizontal padding
                                    py: 0.75, // 8px vertical padding
                                    fontSize: '0.875rem', // 14px
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
                          
                          {/* Footer section with action button */}
                          <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 1,
                            position: 'absolute',
                            bottom: 16,
                            right: 16
                          }}>
                            {/* Replace custom checkbox with MUI Checkbox */}
                            <Checkbox 
                              color="primary"
                              checked={selectedMeals.has(`${dayIndex}-${mealIndex}`)} // Set checked state
                              onChange={() => handleCheckboxChange(dayIndex, mealIndex)} // Set onChange handler
                              aria-label={`Select ${name}`}
                              // Add state management here if needed later
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
      ) : (
        // Fallback if no meal plan
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, flexDirection: 'column', textAlign: 'center' }}>
          <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            No meal plan data to display.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default Planner
