import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/accounts/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        if (response.status === 429) {
          setError(data.message || 'Too many requests. Please wait before trying again.');
        } else {
          setError(data.message || 'An error occurred. Please try again.');
        }
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const sharedLayout = (children) => (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );

  if (success) {
    return sharedLayout(
      <>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Check Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            If an account exists with this email, a password reset link has been sent.
          </Typography>
        </Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          Please check your inbox. The link will expire in 1 hour. Don&apos;t see the email? Check your spam or junk folder.
        </Alert>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => navigate('/login')}
          sx={{ py: 1.5, textTransform: 'none' }}
        >
          Back to Sign In
        </Button>
      </>
    );
  }

  return sharedLayout(
    <>
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => navigate('/login')}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          ← Back to Sign In
        </Button>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Forgot Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ py: 1.5, textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </Stack>
      </form>
    </>
  );
};

export default ForgotPasswordPage;
