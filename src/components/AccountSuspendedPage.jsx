import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Block, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Shown when account is suspended (trial expired 7+ days ago with no payment).
 * User can sign out. Data is retained for 30 days per business rules.
 */
const AccountSuspendedPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

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
          <Block sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Account Suspended
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your account has been suspended because your free trial expired and no payment method was
            added within 7 days. Your data will be retained for 30 days.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            To restore access, please contact support.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ExitToApp />}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default AccountSuspendedPage;
