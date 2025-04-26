import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMealPlan } from '../MealPlanContext';
import { GroceryItem } from '../types';

const Grocery: React.FC = () => {
  const { groceryList, toggleGroceryItem, clearCheckedGroceryItems } = useMealPlan();

  const handleToggleItem = (itemToToggle: GroceryItem) => {
    const index = groceryList.findIndex(item => item.item === itemToToggle.item);
    if (index !== -1) {
      toggleGroceryItem(index);
    } else {
      console.warn("Item not found in grocery list:", itemToToggle);
    }
  };

  const handleClearChecked = () => {
    clearCheckedGroceryItems();
  };

  const groupedItems = groceryList.reduce((acc, item) => {
    const aisle = item.aisle || 'Miscellaneous';
    if (!acc[aisle]) {
      acc[aisle] = [];
    }
    acc[aisle].push(item);
    acc[aisle].sort((a, b) => a.item.localeCompare(b.item));
    return acc;
  }, {} as { [key: string]: GroceryItem[] });

  const aisleOrder = ['Produce', 'Meat', 'Dairy', 'Pantry', 'Frozen', 'Miscellaneous'];

  const sortedAisles = Object.keys(groupedItems).sort((a, b) => {
    const indexA = aisleOrder.indexOf(a);
    const indexB = aisleOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Grocery Checklist</Typography>
      {sortedAisles.length === 0 ? (
        <Typography sx={{ mt: 2 }}>Your grocery list is empty. Generate a meal plan first!</Typography>
      ) : (
        sortedAisles.map(aisle => (
          <Accordion key={aisle} defaultExpanded sx={{ '&:before': { display: 'none' }, boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${aisle}-content`}
              id={`${aisle}-header`}
              sx={{ paddingX: 1 }} // Adjust padding
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{aisle}</Typography> 
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <List disablePadding>
                {groupedItems[aisle].map(item => (
                  <ListItem 
                    key={item.item} 
                    disablePadding 
                    onClick={() => handleToggleItem(item)} 
                    sx={{ cursor: 'pointer', pl: 2 }} // Add padding left for indentation
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}> {/* Adjust spacing */}
                      <Checkbox edge="start" checked={item.checked} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    {/* Apply strikethrough based on checked status */}
                    <ListItemText 
                      primary={`${item.item}${item.quantity > 1 ? ` (${item.quantity})` : ''}`}
                      sx={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'text.disabled' : 'text.primary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}
      {groceryList.length > 0 && (
        <Button variant="outlined" onClick={handleClearChecked} sx={{ mt: 2 }}>Clear Checked</Button>
      )}
    </Box>
  );
}

export default Grocery;
