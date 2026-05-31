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

const SetPasswordPage = () => {
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
      setError('Invalid invite link. The token is missing.');
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
      setFieldErrors({ password: pwdErrors });
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ['Passwords do not match'] });
      return;
    }

    if (!token) {
      setError('Invalid invite link. Please contact your administrator for a new invitation.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/accounts/set-password-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setSuccess(true);
        const slug = data.data?.slug;
        const userType = data.data?.userType || 'employee';
        if (slug && slug.trim()) {
          const nextPath = userType === 'customer' ? `/${slug}/customer` : `/${slug}/login`;
          setTimeout(() => {
            navigate(nextPath, { replace: true });
          }, 2000);
        }
      } else {
        if (response.status === 410 || data.message?.toLowerCase().includes('expired') || data.message?.toLowerCase().includes('invalid')) {
          setError('Your invite link has expired or is invalid. Please contact your administrator for a new invitation.');
          setIsExpired(true);
        } else if (data.fieldErrors?.password) {
          setFieldErrors({ password: data.fieldErrors.password });
        } else if (data.errors?.length) {
          setFieldErrors({ password: data.errors });
        } else {
          setError(data.message || 'An error occurred. Please try again.');
        }
      }
    } catch (err) {
      console.error('Set password error:', err);
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
            Password Set Successfully
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your password has been set. Redirecting you to your company login page...
          </Typography>
        </Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          You can now sign in with your new password.
        </Alert>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => navigate('/')}
          sx={{ py: 1.5, textTransform: 'none' }}
        >
          Go to Home
        </Button>
      </>
    );
  }

  if (!token) {
    return sharedLayout(
      <>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Invalid Invite Link
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The invite link is invalid or missing. Please contact your administrator for a new invitation.
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => navigate('/')}
          sx={{ py: 1.5, textTransform: 'none' }}
        >
          Back to Home
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
          ← Back to Home
        </Button>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Set Up Your Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You&apos;ve been invited to join your company on Retro Store Manager. Create a password to activate your account.
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
          onClick={() => navigate('/')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Home
        </Button>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoFocus
            error={!!fieldErrors.password}
            helperText={Array.isArray(fieldErrors.password) ? fieldErrors.password.join(' ') : fieldErrors.password}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Set Password'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
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

export default SetPasswordPage;
