import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// MUI Theme imports
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme' // Our custom theme
import { MealPlanProvider } from './MealPlanContext'; // Import the provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalizes CSS */}
        {/* AuthProvider should wrap MealPlanProvider */}
        <AuthProvider> 
          <MealPlanProvider> 
            <App />
          </MealPlanProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </StrictMode>,
)
