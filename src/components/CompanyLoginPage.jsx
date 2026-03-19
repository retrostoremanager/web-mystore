import { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

const CompanyLoginPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { login, isAuthenticated } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch company by slug to validate and display name
  useEffect(() => {
    if (!slug) {
      setCompanyError('Invalid login link. Please use the link provided by your company.');
      setCompanyLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/accounts/company-by-slug/${encodeURIComponent(slug)}`);
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.data) {
          setCompanyName(data.data.companyName || slug);
        } else {
          setCompanyError('Company not found. Please check your login link.');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setCompanyError('Unable to load company. Please try again.');
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!slug) {
      setError('Invalid login link.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/accounts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          slug,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Sign-in failed. Please check your email and password.');
        return;
      }

      if (data.data?.token && data.data?.companyId) {
        login(data.data.token, data.data.companyId, data.data.email, slug);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (companyLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (companyError) {
    return (
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
          <Paper elevation={24} sx={{ p: 4, borderRadius: 3 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {companyError}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
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
          <Box sx={{ mb: 4 }}>
            <Button
              onClick={() => navigate('/')}
              sx={{ mb: 3, textTransform: 'none' }}
            >
              ← Back to Home
            </Button>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Sign in to {companyName || slug}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email and password to access your store.
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
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
              <Typography
                variant="body2"
                color="primary"
                sx={{
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                  alignSelf: 'flex-start',
                }}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </Typography>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 2, py: 1.5, textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{' '}
                  <Button
                    variant="text"
                    onClick={() => navigate('/signup')}
                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                  >
                    Sign up
                  </Button>
                </Typography>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanyLoginPage;
