import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import config from '../config';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. The token is missing.');
    }
  }, [token]);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[a-z]/.test(pwd)) errors.push('Password must contain at least one lowercase letter');
    if (!/[A-Z]/.test(pwd)) errors.push('Password must contain at least one uppercase letter');
    if (!/\d/.test(pwd)) errors.push('Password must contain at least one number');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setFieldErrors({ newPassword: pwdErrors });
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ['Passwords do not match'] });
      return;
    }

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/accounts/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        if (response.status === 410 || data.message?.toLowerCase().includes('expired')) {
          setError('Your reset link has expired. Please request a new password reset.');
          setIsExpired(true);
        } else if (data.fieldErrors?.newPassword) {
          setFieldErrors({ newPassword: data.fieldErrors.newPassword });
        } else {
          setError(data.message || 'An error occurred. Please try again.');
        }
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const sharedLayout = (children) => (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #16a085 100%)',
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
            Password Reset Successfully
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your password has been reset. You can now sign in with your new password.
          </Typography>
        </Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your password has been reset. You can now sign in with your new password.
        </Alert>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => navigate('/')}
          sx={{ py: 1.5, textTransform: 'none' }}
        >
          Sign In
        </Button>
      </>
    );
  }

  if (!token) {
    return sharedLayout(
      <>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The reset link is invalid or missing. Please request a new password reset.
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => navigate('/forgot-password')}
          sx={{ py: 1.5, textTransform: 'none' }}
        >
          Request New Reset Link
        </Button>
      </>
    );
  }

  return sharedLayout(
    <>
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => navigate('/')}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          ← Back to Sign In
        </Button>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Reset Your Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your new password. It must be at least 8 characters with uppercase, lowercase, and a number.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => { setError(null); setIsExpired(false); }}>
          {error}
        </Alert>
      )}

      {isExpired && (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate('/forgot-password')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Request New Reset Link
        </Button>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoFocus
            error={!!fieldErrors.newPassword}
            helperText={fieldErrors.newPassword?.join(' ')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            error={!!fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword?.join(' ')}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ py: 1.5, textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/')}
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

export default ResetPasswordPage;
