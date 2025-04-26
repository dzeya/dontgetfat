import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Sample meal plan data for demonstration
const sampleMealPlan = {
  days: [
    {
      day: 1, // Monday
      meals: [
        {
          name: "Avocado Toast",
          type: "Breakfast",
          ingredients: ["Gluten-free bread", "Avocado", "Salt", "Pepper", "Lemon juice", "Red pepper flakes", "Olive oil"],
          estimated_time: 10
        },
        {
          name: "Chickpea Salad",
          type: "Lunch",
          ingredients: ["Canned chickpeas", "Cherry tomatoes", "Cucumber", "Red onion", "Olive oil", "Lemon juice", "Salt", "Pepper", "Feta cheese", "Parsley"],
          estimated_time: 15
        },
        {
          name: "Vegetable Stir Fry",
          type: "Dinner",
          ingredients: ["Mixed vegetables", "Garlic", "Ginger", "Gluten-free soy sauce", "Sesame oil", "Cooked rice", "Tofu", "Green onions"],
          estimated_time: 25
        },
        {
          name: "Greek Yogurt with Berries",
          type: "Snack",
          ingredients: ["Greek yogurt", "Mixed berries", "Honey", "Granola"],
          estimated_time: 5
        }
      ]
    }
  ]
};

// Map meal types to emojis
const emojiMap: { [key: string]: string } = { 
  Breakfast: "🍳", 
  Lunch: "🥪", 
  Dinner: "🍽️", 
  Snack: "🍎" 
};

const getDayName = (dayNumber: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayNumber - 1] || `Day ${dayNumber}`;
}

const MealCardDemo: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="xl">
      <Box p={3}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Meal Card Design Demo
        </Typography>
      
        {sampleMealPlan.days.map((day, dayIndex) => (
          <Box key={dayIndex}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, borderBottom: 1, borderColor: 'divider', pb: 1, mb: 3 }}>
              {getDayName(day.day)}
            </Typography>
            <Grid container spacing={3} alignItems="stretch"> 
              {day.meals.map((meal, mealIndex) => {
                const estimatedTime = meal.estimated_time || '?';
                const randomImageUrl = `https://picsum.photos/320/160?random=${dayIndex}-${mealIndex}`;
                
                // Updated Ingredient Display Logic: Show limited ingredients with "+X more"
                const ingredients = meal.ingredients || [];
                const maxVisibleIngredients = 5;
                const visibleIngredients = ingredients.slice(0, maxVisibleIngredients);
                const hiddenCount = ingredients.length - maxVisibleIngredients;

                return (
                  // @ts-ignore - Handling Grid item prop issue
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={mealIndex} sx={{ display: 'flex' }}> 
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: 4, 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
                        bgcolor: 'rgba(255, 255, 255, 0.9)', 
                        transform: 'scale(1)',
                        transition: theme.transitions.create(['box-shadow', 'transform'], { 
                          duration: theme.transitions.duration.short 
                        }),
                        '&:hover': { 
                          boxShadow: '0 6px 16px rgba(0,0,0,0.1)', 
                          transform: 'scale(1.03)' 
                        },
                        height: '100%' // Ensure all cards have same height
                    }}>
                      <Box sx={{ 
                        position: 'relative', 
                        height: 160, 
                        borderTopLeftRadius: 'inherit', 
                        borderTopRightRadius: 'inherit', 
                        overflow: 'hidden',
                        bgcolor: 'grey.100'
                      }}>
                        {/* Time indicator moved to top center - Position 1 */}
                        <Box sx={{
                          position: 'absolute',
                          top: 10,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'white',
                          borderRadius: '16px',
                          px: 1.5,
                          py: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '70px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          zIndex: 2
                        }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#555',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:before': {
                                content: '"⏱"',
                                marginRight: '4px',
                                fontSize: '0.875rem'
                              }
                            }}
                          >
                            {estimatedTime}{typeof estimatedTime === 'number' ? ' min' : ''}
                          </Typography>
                        </Box>
                        <img 
                          src={randomImageUrl} 
                          alt={meal.name} 
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', 
                          }}
                          loading="lazy" 
                        />
                        <Box sx={{ 
                          position: 'absolute', 
                          top: theme.spacing(1), 
                          right: theme.spacing(1), 
                          bgcolor: 'rgba(255, 255, 255, 0.9)', 
                          borderRadius: '50%', 
                          px: 1, 
                          fontSize: '0.8rem', 
                          lineHeight: 1.5 
                        }}>
                          {emojiMap[meal.type] || '🍴'}
                        </Box>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
                        <Typography 
                          variant="body2" 
                          component="div" 
                          sx={{ 
                            fontWeight: 600, 
                            lineHeight: 1.3, 
                            mb: 0.5, // Reduced spacing between title and ingredients
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                          {meal.name}
                        </Typography>
                        
                        {/* Ingredient Chips Area - Show limited ingredients with "+X more" chip */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'nowrap', // Prevent wrapping to second line
                          gap: 0.5, 
                          mb: 1.5,
                          overflow: 'hidden', // Hide overflow
                          width: '100%' // Use full width
                        }}>
                          {/* Display limited number of ingredients */}
                          {visibleIngredients.map((ingredient, index) => (
                            <Chip 
                              key={index}
                              label={ingredient} 
                              size="small" 
                              sx={{ 
                                fontSize: '10px', 
                                fontWeight: 400, 
                                height: 'auto', 
                                py: '1px', 
                                px: '6px', 
                                bgcolor: 'grey.100', 
                                color: 'text.secondary',
                                borderRadius: 1,
                                maxWidth: '80px',
                                '& .MuiChip-label': {
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }
                              }} 
                            />
                          ))}
                          {/* Add "+X" chip if there are hidden ingredients */}
                          {hiddenCount > 0 && (
                            <Chip
                              label={`+${hiddenCount}`}
                              size="small"
                              sx={{
                                fontSize: '10px',
                                fontWeight: 500,
                                height: 'auto',
                                py: '1px',
                                px: '6px',
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                borderRadius: 1
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}
                        
                        {/* Position 2 - Checkbox in place of ? */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                          <Box 
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              bgcolor: '#ff5757',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: '#ff3434',
                                transform: 'scale(1.05)'
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              id={`meal-${dayIndex}-${mealIndex}`}
                              style={{ 
                                opacity: 0,
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer'
                              }}
                              aria-label={`Select ${meal.name}`}
                            />
                            <label 
                              htmlFor={`meal-${dayIndex}-${mealIndex}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer',
                                fontSize: '1.25rem',
                                fontWeight: 'bold'
                              }}
                            >
                              ✓
                            </label>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default MealCardDemo;
