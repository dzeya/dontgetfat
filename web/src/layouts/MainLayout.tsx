import { Box, Typography, Link } from '@mui/material';
import { Outlet, Link as RouterLink } from 'react-router-dom';

function MainLayout() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header/Nav */}
      <Box component="header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, md: 6 }, py: 4, position: 'relative', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-1px', color: 'text.primary', zIndex: 2 }}>
          NOUR<span style={{ color: '#ff5851' }}>IS</span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Link component={RouterLink} to="/planner" underline="none" sx={{ color: 'text.primary', fontWeight: 500, fontSize: 18, px: 1, pb: 0.5, position: 'relative', '&:hover': { color: 'primary.main' } }}>Planner</Link>
          <Link component={RouterLink} to="/grocery" underline="none" sx={{ color: 'text.primary', fontWeight: 500, fontSize: 18, px: 1, pb: 0.5, position: 'relative', '&:hover': { color: 'primary.main' } }}>Grocery</Link>
          {/* Add other nav links if needed */}
        </Box>
      </Box>

      {/* Page Content Area */}
      <Box component="main" sx={{ p: { xs: 2, md: 4 } }}>
        <Outlet /> {/* Child routes will render here */}
      </Box>

      {/* Optional Footer can go here */}
    </Box>
  );
}

export default MainLayout;
