import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import config from '../config';

/**
 * Customer portal/sign-in page at /:slug/customer
 * Placeholder for future customer loyalty/rewards login.
 */
const CompanyCustomerPage = () => {
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
        } else {
          setError('Store not found.');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Unable to load store.');
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              onClick={() => navigate(`/${slug}`)}
              sx={{ mb: 3, textTransform: 'none' }}
            >
              ← Back to {companyName}
            </Button>
            <Person sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Customer Portal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {companyName}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Customer sign-in and loyalty features are coming soon. Check back later to access your
            rewards, purchase history, and more.
          </Alert>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate(`/${slug}`)}
            sx={{ py: 1.5 }}
          >
            Return to Store
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanyCustomerPage;
