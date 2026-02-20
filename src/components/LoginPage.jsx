import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { isAuthConfigured } from '../auth/msalInstance';

const LoginPage = () => {
  const navigate = useNavigate();
  const { instance, inProgress, accounts } = useMsal();
  const authConfigured = isAuthConfigured();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  if (inProgress === 'login') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Redirecting to sign in...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (accounts.length > 0) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  if (!authConfigured) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Alert severity="info" sx={{ maxWidth: 400 }}>
            Authentication is not configured. Set VITE_ENTRA_CLIENT_ID in your environment to enable
            sign-in with Microsoft Entra External ID.
          </Alert>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/dashboard')}
          >
            Continue to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight={600}>
              Sign in to MyStore
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Use your Microsoft Entra account to sign in.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLogin}
              disabled={inProgress !== 'none'}
              sx={{ py: 1.5 }}
            >
              Sign in with Microsoft
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/')}
            >
              Back to home
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
