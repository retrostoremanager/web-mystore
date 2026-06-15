import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { CreditCard, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Shown when trial has expired and no payment method on file.
 * Prompts user to add payment to restore access.
 */
const TrialExpiredPrompt = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Schedule sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Trial Expired
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your free trial has ended. Add a payment method to continue using the platform.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CreditCard />}
            onClick={() => navigate('/dashboard/billing')}
            sx={{ mr: 2 }}
          >
            Add Payment Method
          </Button>
          <Button variant="outlined" onClick={() => { const slug = auth?.slug; logout(); navigate(slug ? `/${slug}` : '/'); }}>
            Sign Out
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default TrialExpiredPrompt;
