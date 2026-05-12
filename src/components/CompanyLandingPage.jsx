import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { Person, Store, Login } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../config';

/**
 * Company store landing page at /:slug
 * Displayed when a company is created. Provides links to staff sign-in, customer sign-in, etc.
 */
const CompanyLandingPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError('Invalid store link.');
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/accounts/company-by-slug/${encodeURIComponent(slug)}`);
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.data) {
          setCompanyName(data.data.companyName || slug);
          // Logo would come from company profile if we expand the API - for now we use company name
        } else {
          setError('Store not found. Please check your link.');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Unable to load store. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  if (loading) {
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
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
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
              {error}
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
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Button
              onClick={() => navigate('/')}
              sx={{ mb: 3, textTransform: 'none', alignSelf: 'flex-start' }}
            >
              ← RetroStore Manager
            </Button>
            <Store sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {companyName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to our store
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Card
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  boxShadow: 2,
                },
              }}
              onClick={() => navigate(`/${slug}/login`)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
                <Login sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Staff Sign In
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employees and store owners
                  </Typography>
                </Box>
                <Typography color="primary" sx={{ fontWeight: 600 }}>
                  →
                </Typography>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  boxShadow: 2,
                },
              }}
              onClick={() => navigate(`/${slug}/customer`)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
                <Person sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Customer Sign In
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer portal coming soon (loyalty & purchase history)
                  </Typography>
                </Box>
                <Typography color="primary" sx={{ fontWeight: 600 }}>
                  →
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              New store owner?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/signup')}
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                Create your store
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanyLandingPage;
