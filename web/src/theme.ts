import { createTheme } from '@mui/material/styles';

// Define the color palette based on the screenshots
const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: { main: '#ff5851' },
    secondary: { main: '#2d3047' },
    success: { main: '#a7ff83' }, // Accent color mapped to 'success'
    background: { default: '#f3f2ee', paper: '#ffffff' },
    text: { primary: '#16161e', secondary: '#555666' },
  },
  typography: {
    fontFamily: '"Space Grotesk", sans-serif',
    h1: { fontSize: '4.5rem', fontWeight: 700, letterSpacing: '-3px' },
    h2: { fontSize: '3rem', fontWeight: 700 },
    h3: { fontSize: '2.5rem', fontWeight: 600 },
    h4: { fontSize: '2rem', fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, 
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)', 
          border: '1px solid #E2E8F0', 
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none', 
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', 
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: '#EDF2F7', 
          border: '1px solid #E2E8F0',
          borderRadius: 12,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: 'none',
          color: '#718096', 
          '&.Mui-selected': {
            backgroundColor: '#FFFFFF', 
            color: '#4299E1', 
            fontWeight: 600,
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', 
            '&:hover': {
              backgroundColor: '#FFFFFF',
            },
          },
          '&:not(.Mui-selected):hover': {
             backgroundColor: '#E2E8F0', 
          },
        },
      },
    },
  },
});

export default theme;
