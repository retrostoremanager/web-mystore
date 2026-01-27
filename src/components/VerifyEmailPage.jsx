import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../config';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  HourglassEmpty as ExpiredIcon,
  EmailOutlined as EmailIcon
} from '@mui/icons-material';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [isPendingVerification, setIsPendingVerification] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const emailParam = searchParams.get('email');

      // If no token but email is provided, show "check your email" message
      if (!token && emailParam) {
        setEmail(emailParam);
        setIsPendingVerification(true);
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Invalid verification link. The token is missing.');
        setLoading(false);
        return;
      }

      try {
        // Call the verify email API endpoint
        const response = await fetch(`${config.apiUrl}/accounts/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess(true);
          setEmail(data.data?.email || '');
          
          // Check if account was already verified
          if (data.message?.toLowerCase().includes('already verified')) {
            setIsAlreadyVerified(true);
          }
        } else {
          // Check if token is expired
          if (response.status === 410 || 
              data.message?.toLowerCase().includes('expired') ||
              data.errors?.some(e => e.toLowerCase().includes('expired'))) {
            setIsExpired(true);
            setError('Your verification link has expired. Please request a new verification email.');
          } else if (response.status === 404) {
            setError('Invalid verification link. The token may have been used already or does not exist.');
          } else {
            setError(data.message || 'An error occurred while verifying your email. Please try again later.');
          }
        }
      } catch (err) {
        console.error('Error verifying email:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendVerification = () => {
    // TODO: Implement resend verification (EPIC-0-001-006)
    alert('Resend verification functionality will be implemented in the next task.');
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '100%' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying your email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your account.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {isPendingVerification ? (
            <Stack spacing={3} alignItems="center">
              <EmailIcon sx={{ fontSize: 80, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                We've sent a verification email to:
              </Typography>
              <Alert severity="info" sx={{ width: '100%' }}>
                {email}
              </Alert>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Please check your inbox and click the verification link to activate your account.
                The link will expire in 24 hours.
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontStyle: 'italic' }}>
                Don't see the email? Check your spam or junk folder.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
              >
                Back to Home
              </Button>
            </Stack>
          ) : success ? (
            <Stack spacing={3} alignItems="center">
              <SuccessIcon sx={{ fontSize: 80, color: 'success.main' }} />
              <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
                {isAlreadyVerified ? 'Account Already Verified' : 'Email Verified Successfully!'}
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                {isAlreadyVerified 
                  ? 'Your account is already verified. You can log in now.'
                  : 'Your email has been verified successfully! You can now log in to your account.'}
              </Typography>
              {email && (
                <Alert severity="info" sx={{ width: '100%' }}>
                  Account: {email}
                </Alert>
              )}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGoToLogin}
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3} alignItems="center">
              {isExpired ? (
                <ExpiredIcon sx={{ fontSize: 80, color: 'warning.main' }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />
              )}
              <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
                {isExpired ? 'Verification Link Expired' : 'Verification Failed'}
              </Typography>
              <Alert severity={isExpired ? 'warning' : 'error'} sx={{ width: '100%' }}>
                {error}
              </Alert>
              <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                {isExpired && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleResendVerification}
                  >
                    Resend Verification Email
                  </Button>
                )}
                <Button
                  variant={isExpired ? 'outlined' : 'contained'}
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  Go to Home
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
