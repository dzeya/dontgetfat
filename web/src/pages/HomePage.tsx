import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ pt: 6, pb: 10, position: 'relative' }}>
      {/* Accent Blob */}
      <Box sx={{
        position: 'absolute',
        top: { xs: '-60px', md: '-120px' },
        right: { xs: '-40px', md: '-120px' },
        width: { xs: 180, md: 340 },
        height: { xs: 180, md: 340 },
        borderRadius: '50%',
        bgcolor: 'success.main',
        opacity: 0.22,
        zIndex: 0,
      }} />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
        {/* Hero Content */}
        <Box sx={{ flex: 1, pr: { md: 6 } }}>
          <Typography variant="h1" sx={{ color: 'secondary.main', fontWeight: 700, mb: 3, lineHeight: 1.1, letterSpacing: '-3px', fontSize: { xs: '2.5rem', md: '4.5rem' } }}>
            Create your <Box component="span" sx={{ position: 'relative', display: 'inline-block', bgcolor: 'success.main', px: 1, borderRadius: 2, zIndex: 1, boxDecorationBreak: 'clone', color: 'inherit', opacity: 0.95 }}>personalized</Box> meal plan
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 500, mb: 4 }}>
            Effortlessly design nutritious and delicious meals that match your dietary preferences and lifestyle goals.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={() => navigate('/meal-plan-onboarding')} // Navigate to Planner
            sx={{ borderRadius: 3, fontWeight: 700, px: 4, py: 1.5, fontSize: 18, boxShadow: '0 10px 20px rgba(255,88,81,0.2)' }}>
            Start Creating
          </Button>
        </Box>
        {/* Hero Image */}
        <Box sx={{ flex: 1, minWidth: 260, maxWidth: 420, height: { xs: 220, md: 340 }, borderRadius: 5, overflow: 'hidden', boxShadow: 3, position: 'relative', bgcolor: 'background.paper' }}>
          <img
            src="/vite.svg" // Placeholder image
            alt="Beautiful meal preparation"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;
