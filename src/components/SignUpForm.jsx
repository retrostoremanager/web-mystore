import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import config from '../config';
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

const cardElementOptions = {
  style: {
    base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
    invalid: { color: '#9e2146' },
  },
};

/**
 * SignUpFormInner - Form with Stripe Elements context (card required at sign-up)
 */
function SignUpFormInner() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
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
    paymentMethod: '',
  });

  // Track which fields have been touched/blurred for real-time validation
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    companyName: false,
    subscriptionTier: false,
  });

  /**
   * Handles input changes for all form fields.
   * Updates form data state and validates in real-time if field has been touched.
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
    
    // Clear general error message
    setError('');
    
    // Validate in real-time if field has been touched/blurred
    if (touchedFields[field]) {
      const error = validateField(field, value);
      setFieldErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
      
      // Special handling for password confirmation: re-validate when password changes
      // Use the new password value for comparison to avoid stale closure
      if (field === 'password' && touchedFields.confirmPassword) {
        // Re-validate confirmPassword using the new password value
        const currentConfirmPassword = formData.confirmPassword;
        const confirmError = validateField('confirmPassword', currentConfirmPassword, value);
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: confirmError,
        }));
      }
    }
  };

  /**
   * Handles field blur events to trigger validation.
   * Marks the field as touched and validates it immediately.
   * 
   * @param {string} field - The name of the field that lost focus
   * @returns {Function} Event handler function that receives the blur event
   */
  const handleFieldBlur = (field) => () => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
    
    // Validate the field when it loses focus
    const value = formData[field];
    const error = validateField(field, value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
    
    // Special handling for password confirmation: re-validate when password field is blurred
    if (field === 'password' && touchedFields.confirmPassword && formData.confirmPassword) {
      // Use the current password value from the blurred field for comparison
      const confirmError = validateField('confirmPassword', formData.confirmPassword, value);
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  /**
   * Validates a single form field based on its type and value.
   * 
   * Validation rules:
   * - Email: Required, must match RFC 5322 compliant email format
   * - Password: Required, minimum 8 characters, must contain uppercase, lowercase, and number
   * - Confirm Password: Required, must match the password field
   * - Company Name: Required, 2-100 characters, alphanumeric and spaces allowed
   * - Subscription Tier: Required selection
   * 
   * @param {string} field - The name of the field to validate
   * @param {string} value - The current value of the field
   * @param {string} [passwordValue] - Optional: current password value for confirmPassword validation
   * @returns {string} Error message if validation fails, empty string if valid
   */
  const validateField = (field, value, passwordValue = null) => {
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
        } else {
          // Check individual password requirements and provide specific feedback
          const hasLowercase = /[a-z]/.test(value);
          const hasUppercase = /[A-Z]/.test(value);
          const hasNumber = /\d/.test(value);
          
          if (!hasLowercase || !hasUppercase || !hasNumber) {
            const missing = [];
            if (!hasLowercase) missing.push('lowercase letter');
            if (!hasUppercase) missing.push('uppercase letter');
            if (!hasNumber) missing.push('number');
            
            error = `Password must contain at least one ${missing.join(', ')}`;
          }
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else {
          // Use provided passwordValue if available (for real-time validation),
          // otherwise fall back to formData.password
          const passwordToCompare = passwordValue !== null ? passwordValue : formData.password;
          if (value !== passwordToCompare) {
            error = 'Passwords do not match';
          }
        }
        break;
      case 'companyName':
        if (!value.trim()) {
          error = 'Company name is required';
        } else if (value.trim().length < 2) {
          error = 'Company name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          error = 'Company name must be 100 characters or less';
        } else if (!/^[a-zA-Z0-9\s]+$/.test(value.trim())) {
          // Alphanumeric and spaces only
          error = 'Company name can only contain letters, numbers, and spaces';
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
      // For confirmPassword, pass the current password value for accurate comparison
      const passwordValue = field === 'confirmPassword' ? formData.password : null;
      const error = validateField(field, formData[field], passwordValue);
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
   * Handles server-side validation errors and displays them field by field.
   * 
   * @param {Event} event - The form submission event
   * @async
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    // Mark all fields as touched before validation
    setTouchedFields({
      email: true,
      password: true,
      confirmPassword: true,
      companyName: true,
      subscriptionTier: true,
    });

    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      setError('Payment form is not ready. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Stripe payment method first (card required at sign-up)
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setFieldErrors((prev) => ({ ...prev, paymentMethod: stripeError.message || 'Card validation failed' }));
        setLoading(false);
        return;
      }

      if (!paymentMethod) {
        setFieldErrors((prev) => ({ ...prev, paymentMethod: 'Please enter your card details' }));
        setLoading(false);
        return;
      }

      const response = await fetch(`${config.apiUrl}/accounts/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          companyName: formData.companyName.trim(),
          subscriptionTier: formData.subscriptionTier,
          paymentMethodId: paymentMethod.id,
        }),
      });

      // Check if response has JSON content before parsing
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (e.g., plain text errors)
        const text = await response.text();
        data = { message: text || 'An error occurred' };
      }

      if (!response.ok) {
        // Handle server-side validation errors
        // Backend returns field-level errors in data.fieldErrors (camelCase from JSON serialization)
        if (response.status === 400 && data.fieldErrors) {
          // Server returned field-level validation errors
          const serverErrors = {};
          Object.keys(data.fieldErrors).forEach((field) => {
            // Map server field names to form field names if needed
            const formField = field === 'email' ? 'email' :
                            field === 'password' ? 'password' :
                            field === 'companyName' || field === 'company_name' ? 'companyName' :
                            field === 'subscriptionTier' || field === 'subscription_tier' ? 'subscriptionTier' :
                            field === 'paymentMethod' || field === 'payment_method' ? 'paymentMethod' :
                            field;
            
            // fieldErrors is a Dictionary<string, List<string>>, so each field has an array of errors
            if (Array.isArray(data.fieldErrors[field])) {
              serverErrors[formField] = data.fieldErrors[field][0]; // Take first error message
            } else {
              serverErrors[formField] = data.fieldErrors[field];
            }
          });
          
          setFieldErrors((prev) => ({
            ...prev,
            ...serverErrors,
          }));
          
          setError(data.message || 'Please correct the errors below and try again.');
        } else if (response.status === 409) {
          // Email already exists - may also have fieldErrors
          if (data.fieldErrors && data.fieldErrors.email) {
            setFieldErrors((prev) => ({
              ...prev,
              email: Array.isArray(data.fieldErrors.email) 
                ? data.fieldErrors.email[0] 
                : data.fieldErrors.email,
            }));
          } else {
            setFieldErrors((prev) => ({
              ...prev,
              email: data.message || 'This email is already registered',
            }));
          }
          setError(data.message || 'This email is already registered');
        } else {
          // Other server errors (500, etc.) - show backend error details if available
          const errorDetail = data.errors?.[0] || data.message;
          setError(errorDetail || 'Failed to create account. Please try again.');
        }
        return;
      }

      // Success - account created, navigate to verification page
      navigate(`/verify?email=${encodeURIComponent(formData.email.trim())}`);
      
    } catch (err) {
      // Network errors, JSON parsing errors, or other exceptions
      console.error('Sign-up error:', err);
      
      // Provide more specific error messages based on error type
      if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed to execute'))) {
        setError('Network error. Please check your connection and try again.');
      } else if (err instanceof SyntaxError) {
        setError('Invalid response from server. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
                onBlur={handleFieldBlur('email')}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email || (touchedFields.email ? '' : 'Enter your email address')}
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
                onBlur={handleFieldBlur('password')}
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
                onBlur={handleFieldBlur('confirmPassword')}
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword || 'Re-enter your password to confirm'}
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
                onBlur={handleFieldBlur('companyName')}
                error={!!fieldErrors.companyName}
                helperText={fieldErrors.companyName || '2-100 characters, letters, numbers, and spaces only'}
                placeholder="e.g., GameStop Central"
                autoComplete="organization"
              />

              {/* Subscription Tier Selection */}
              <FormControl fullWidth required error={!!fieldErrors.subscriptionTier}>
                <InputLabel>Subscription Tier</InputLabel>
                <Select
                  value={formData.subscriptionTier}
                  onChange={handleInputChange('subscriptionTier')}
                  onBlur={handleFieldBlur('subscriptionTier')}
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

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Payment method (required)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Your card will not be charged until your 30-day free trial ends.
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: fieldErrors.paymentMethod ? 'error.main' : 'divider',
                    borderRadius: 1,
                    minHeight: 50,
                    width: '100%',
                  }}
                >
                  <CardElement options={cardElementOptions} />
                </Box>
                {fieldErrors.paymentMethod && (
                  <FormHelperText error sx={{ mt: 0.5 }}>{fieldErrors.paymentMethod}</FormHelperText>
                )}
              </Box>

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
                    onClick={() => navigate('/login')}
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
}

/**
 * SignUpForm - Wraps form in Stripe Elements (card required at sign-up)
 */
export default function SignUpForm() {
  const publishableKey = config.stripePublishableKey;

  if (!publishableKey) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4, display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Paper elevation={24} sx={{ p: 4, borderRadius: 3 }}>
            <Alert severity="warning">
              Sign-up is not available. Payment processing (Stripe) must be configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your environment.
            </Alert>
          </Paper>
        </Container>
      </Box>
    );
  }

  const stripePromise = loadStripe(publishableKey);
  return (
    <Elements stripe={stripePromise}>
      <SignUpFormInner />
    </Elements>
  );
}
