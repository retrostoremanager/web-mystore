import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const steps = ['Account Information', 'Store Details', 'Complete'];

const AccountWizard = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
  });

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.storeName.trim()) {
      setError('Store name is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (activeStep === 0 && !validateStep1()) {
      return;
    }
    if (activeStep === 1 && !validateStep2()) {
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call here
      console.log('Account created:', formData);
      
      // Move to completion step
      setActiveStep(2);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Create Your Account
            </Typography>
            <TextField
              label="First Name"
              fullWidth
              required
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              autoFocus
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
            />
            <TextField
              label="Email Address"
              fullWidth
              required
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
            />
            <TextField
              label="Password"
              fullWidth
              required
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              helperText="Must be at least 8 characters"
            />
            <TextField
              label="Confirm Password"
              fullWidth
              required
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
            />
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Tell Us About Your Store
            </Typography>
            <TextField
              label="Store Name"
              fullWidth
              required
              value={formData.storeName}
              onChange={handleInputChange('storeName')}
              placeholder="e.g., GameStop Central"
              autoFocus
            />
          </Stack>
        );
      
      case 2:
        return (
          <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Welcome to MyStore!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 500 }}>
              Your account has been created successfully. You can now start managing your store.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{ mt: 2, px: 4 }}
            >
              Go to Dashboard
            </Button>
          </Stack>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            mt: 4,
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
              Get Started
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account in just a few simple steps
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: 400, mb: 4 }}>
            {renderStepContent()}
          </Box>

          {activeStep < 2 && (
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={activeStep === 1 ? handleSubmit : handleNext}
                disabled={loading}
                sx={{ textTransform: 'none', px: 4 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeStep === 1 ? (
                  'Create Account'
                ) : (
                  'Next'
                )}
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AccountWizard;

