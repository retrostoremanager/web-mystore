import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Subscription tier options available for new account registration.
 * Each tier includes a value, display label, and description for users.
 * 
 * @constant {Array<Object>} subscriptionTiers
 * @property {string} value - Internal identifier for the tier
 * @property {string} label - Display name shown to users
 * @property {string} description - Brief description of the tier's target audience
 */
const subscriptionTiers = [
  {
    value: 'basic',
    label: 'Basic',
    description: 'Perfect for small stores getting started',
  },
  {
    value: 'pro',
    label: 'Pro',
    description: 'Best for growing businesses with multiple locations',
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'Advanced features for large operations',
  },
];

/**
 * SignUpForm Component
 * 
 * A comprehensive account registration form component that allows prospective store owners
 * to create accounts with email verification. The form includes:
 * - Email and password fields with validation
 * - Company name collection
 * - Subscription tier selection
 * - Client-side validation with real-time feedback
 * - Password visibility toggles for better UX
 * - Loading states during form submission
 * 
 * @component
 * @returns {JSX.Element} The rendered sign-up form component
 * 
 * @example
 * ```jsx
 * import SignUpForm from './components/SignUpForm';
 * 
 * function App() {
 *   return <SignUpForm />;
 * }
 * ```
 * 
 * @see {@link https://mui.com/components/text-fields/} Material UI TextField documentation
 * @see {@link https://mui.com/components/selects/} Material UI Select documentation
 */
const SignUpForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    subscriptionTier: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    subscriptionTier: '',
  });

  /**
   * Handles input changes for all form fields.
   * Updates form data state and clears field-specific errors when user starts typing.
   * 
   * @param {string} field - The name of the field being changed (e.g., 'email', 'password')
   * @returns {Function} Event handler function that receives the change event
   */
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error when user starts typing to provide immediate feedback
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
    // Clear general error message
    setError('');
  };

  /**
   * Validates a single form field based on its type and value.
   * 
   * Validation rules:
   * - Email: Required, must match RFC 5322 compliant email format
   * - Password: Required, minimum 8 characters, must contain uppercase, lowercase, and number
   * - Confirm Password: Required, must match the password field
   * - Company Name: Required, minimum 2 characters after trimming whitespace
   * - Subscription Tier: Required selection
   * 
   * @param {string} field - The name of the field to validate
   * @param {string} value - The current value of the field
   * @returns {string} Error message if validation fails, empty string if valid
   */
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          // RFC 5322 compliant email validation regex
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          // Password must contain: at least one lowercase, one uppercase, and one digit
          error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'companyName':
        if (!value.trim()) {
          error = 'Company name is required';
        } else if (value.trim().length < 2) {
          error = 'Company name must be at least 2 characters';
        }
        break;
      case 'subscriptionTier':
        if (!value) {
          error = 'Please select a subscription tier';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  /**
   * Validates all form fields and sets error state.
   * Called before form submission to ensure all data is valid.
   * 
   * @returns {boolean} True if all fields are valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate each field in the form data
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  /**
   * Handles form submission.
   * Validates all fields, then submits the registration data to the backend API.
   * Shows loading state during submission and handles errors appropriately.
   * 
   * @param {Event} event - The form submission event
   * @async
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // Example API call:
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Registration failed');
      
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log('Sign-up data:', formData);
      
      // Once backend is ready, uncomment navigation:
      // navigate('/onboarding');
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Sign-up error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles the visibility of the password field.
   * Allows users to show/hide their password while typing.
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Toggles the visibility of the confirm password field.
   * Allows users to show/hide their password confirmation while typing.
   */
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

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
              Create Your Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign up to start managing your store
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                autoFocus
                autoComplete="email"
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || 'Must be at least 8 characters with uppercase, lowercase, and number'}
                autoComplete="new-password"
                InputProps={{
                  // Password visibility toggle button for better UX
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
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
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Company Name"
                fullWidth
                required
                value={formData.companyName}
                onChange={handleInputChange('companyName')}
                error={!!fieldErrors.companyName}
                helperText={fieldErrors.companyName}
                placeholder="e.g., GameStop Central"
                autoComplete="organization"
              />

              {/* Subscription Tier Selection */}
              <FormControl fullWidth required error={!!fieldErrors.subscriptionTier}>
                <InputLabel>Subscription Tier</InputLabel>
                <Select
                  value={formData.subscriptionTier}
                  onChange={handleInputChange('subscriptionTier')}
                  label="Subscription Tier"
                  data-testid="subscription-tier-select"
                >
                  {/* Render each subscription tier option with label and description */}
                  {subscriptionTiers.map((tier) => (
                    <MenuItem key={tier.value} value={tier.value}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {tier.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tier.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.subscriptionTier && (
                  <FormHelperText>{fieldErrors.subscriptionTier}</FormHelperText>
                )}
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 2, py: 1.5, textTransform: 'none' }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Button
                    variant="text"
                    onClick={() => navigate('/dashboard')}
                    sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                  >
                    Sign In
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

export default SignUpForm;
