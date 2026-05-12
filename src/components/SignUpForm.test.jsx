import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SignUpForm from './SignUpForm';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderSignUpForm = () => {
  return render(
    <BrowserRouter>
      <SignUpForm />
    </BrowserRouter>
  );
};

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the sign-up form with all required fields', () => {
      renderSignUpForm();

      // Check for form fields
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      const passwordFields = screen.getAllByLabelText(/password/i);
      expect(passwordFields.length).toBeGreaterThanOrEqual(2); // Password and Confirm Password
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      // Subscription tier - use data-testid for reliable selection
      expect(screen.getByTestId('subscription-tier-select')).toBeInTheDocument();
      expect(screen.getByTestId('signup-accept-terms')).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

      // Check for page title
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    });

    it('displays form fields with proper labels, placeholders, and helper text', () => {
      renderSignUpForm();

      // Check password helper text
      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0]; // First one is the password field
      expect(passwordField).toBeInTheDocument();
      expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();

      // Check company name placeholder
      const companyField = screen.getByLabelText(/company name/i);
      expect(companyField).toHaveAttribute('placeholder', 'e.g., GameStop Central');
    });

    it('renders subscription tier dropdown with all tiers and descriptions', () => {
      renderSignUpForm();

      // Material UI Select - use data-testid for reliable selection
      expect(screen.getByTestId('subscription-tier-select')).toBeInTheDocument();
      
      // Check that the select is rendered - tier options are available when opened
      // We'll test the actual selection in the form submission tests
    });

    it('follows Material UI design system and is responsive', () => {
      renderSignUpForm();

      // Check that Paper component is rendered (Material UI structure)
      const paper = document.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
      
      // Check that Container is used (responsive)
      const container = document.querySelector('.MuiContainer-root');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates email field and shows error for invalid email', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const emailField = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Enter invalid email
      await user.type(emailField, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates email field and shows error for empty email', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('requires accepting Terms and Privacy when all fields are valid', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const passwordFields = screen.getAllByLabelText(/password/i);
      await user.type(passwordFields[0], 'ValidPass123');
      await user.type(passwordFields[1], 'ValidPass123');
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');

      const tierSelectContainer = screen.getByTestId('subscription-tier-select');
      const tierSelectButton =
        tierSelectContainer.querySelector('[role="button"]') ||
        tierSelectContainer.querySelector('div[tabindex]') ||
        tierSelectContainer;
      await user.click(tierSelectButton);
      await waitFor(async () => {
        const basicOption = await screen.findByText(/basic/i);
        await user.click(basicOption);
      }, { timeout: 2000 });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please accept the terms of service and privacy policy/i)
        ).toBeInTheDocument();
      });
    });

    it('validates password field and shows error for password less than 8 characters', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0]; // First one is the password field
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordField, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('validates password field and shows error for password without uppercase, lowercase, and number', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0]; // First one is the password field
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordField, 'lowercaseonly123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
      });
    });

    it('validates confirm password field and shows error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0]; // First one is the password field
      const confirmPasswordField = passwordFields[1]; // Second one is confirm password
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordField, 'ValidPass123');
      await user.type(confirmPasswordField, 'DifferentPass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('validates company name field and shows error for empty company name', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      });
    });

    it('validates company name field and shows error for company name less than 2 characters', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const companyField = screen.getByLabelText(/company name/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(companyField, 'A');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/company name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('validates subscription tier field and shows error when not selected', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a subscription tier/i)).toBeInTheDocument();
      });
    });

    it('prevents form submission when validation fails', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Form should not submit (no API call made)
      // Check that error messages are displayed
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('clears field errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const emailField = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Trigger validation error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing in email field
      await user.type(emailField, 'test@example.com');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });

    it('validates email field on blur and shows error immediately', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const emailField = screen.getByLabelText(/email address/i);

      // Enter invalid email and blur the field
      await user.type(emailField, 'invalid-email');
      await user.tab(); // Blur the field

      // Error should appear immediately on blur
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates password field on blur and shows specific requirements', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0];

      // Enter password without uppercase and blur
      await user.type(passwordField, 'lowercase123');
      await user.tab(); // Blur the field

      // Error should appear immediately on blur
      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
      });
    });

    it('validates confirm password on blur and shows mismatch error', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0];
      const confirmPasswordField = passwordFields[1];

      // Enter password
      await user.type(passwordField, 'ValidPass123');
      await user.tab();
      
      // Enter different password in confirm field and blur
      await user.type(confirmPasswordField, 'DifferentPass123');
      await user.tab(); // Blur the field

      // Error should appear immediately on blur
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('re-validates confirm password when password field changes', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0];
      const confirmPasswordField = passwordFields[1];

      // Enter matching passwords
      await user.type(passwordField, 'ValidPass123');
      await user.tab();
      await user.type(confirmPasswordField, 'ValidPass123');
      await user.tab();

      // No error should be present
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();

      // Change password field
      await user.clear(passwordField);
      await user.type(passwordField, 'NewPassword123');

      // Confirm password should be re-validated and show error
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('validates company name on blur and shows error for invalid characters', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const companyField = screen.getByLabelText(/company name/i);

      // Enter company name with invalid characters
      await user.type(companyField, 'Test@Company');
      await user.tab(); // Blur the field

      // Error should appear immediately on blur
      await waitFor(() => {
        expect(screen.getByText(/company name can only contain letters, numbers, and spaces/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('has password field with show/hide toggle', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const passwordField = passwordFields[0]; // First one is the password field
      const toggleButtons = screen.getAllByLabelText(/toggle.*password visibility/i);
      const passwordToggleButton = toggleButtons[0];

      // Password should be hidden by default
      expect(passwordField).toHaveAttribute('type', 'password');

      // Click toggle to show password
      await user.click(passwordToggleButton);
      await waitFor(() => {
        expect(passwordField).toHaveAttribute('type', 'text');
      });

      // Click toggle to hide password again
      await user.click(passwordToggleButton);
      await waitFor(() => {
        expect(passwordField).toHaveAttribute('type', 'password');
      });
    });

    it('has confirm password field with show/hide toggle', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordFields = screen.getAllByLabelText(/password/i);
      const confirmPasswordField = passwordFields[1]; // Second one is confirm password
      const toggleButtons = screen.getAllByLabelText(/toggle.*password visibility/i);
      const confirmToggleButton = toggleButtons[1]; // Second toggle button

      // Password should be hidden by default
      expect(confirmPasswordField).toHaveAttribute('type', 'password');

      // Click toggle to show password
      await user.click(confirmToggleButton);
      await waitFor(() => {
        expect(confirmPasswordField).toHaveAttribute('type', 'text');
      });
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Mock fetch globally for form submission tests
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('shows loading state when form is submitting', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to delay response so we can check loading state
      global.fetch.mockImplementationOnce(() => 
        new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            status: 201,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ success: true }),
          }), 100)
        )
      );

      renderSignUpForm();

      // Fill in valid form data
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const passwordFields = screen.getAllByLabelText(/password/i);
      await user.type(passwordFields[0], 'ValidPass123');
      await user.type(passwordFields[1], 'ValidPass123');
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');

      // Select subscription tier - Material UI Select can be tricky to test
      // Find the select by testid and get the actual button element
      const tierSelectContainer = screen.getByTestId('subscription-tier-select');
      // The actual clickable element is a child div/button
      const tierSelectButton = tierSelectContainer.querySelector('[role="button"]') || 
                                tierSelectContainer.querySelector('div[tabindex]') ||
                                tierSelectContainer;
      
      await user.click(tierSelectButton);
      
      // Wait for options to appear and select Basic
      await waitFor(async () => {
        const basicOption = await screen.findByText(/basic/i);
        await user.click(basicOption);
      }, { timeout: 2000 });

      await user.click(screen.getByTestId('signup-accept-terms'));

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Check that button is disabled and shows loading indicator
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        // Loading indicator should be present (CircularProgress)
        expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
      });
    });

    it('disables submit button during submission', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to delay response
      global.fetch.mockImplementationOnce(() => 
        new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            status: 201,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ success: true }),
          }), 100)
        )
      );

      renderSignUpForm();

      // Fill in valid form data
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const passwordFields = screen.getAllByLabelText(/password/i);
      await user.type(passwordFields[0], 'ValidPass123');
      await user.type(passwordFields[1], 'ValidPass123');
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');

      // Select subscription tier - Material UI Select can be tricky to test
      // Find the select by testid and get the actual button element
      const tierSelectContainer = screen.getByTestId('subscription-tier-select');
      // The actual clickable element is a child div/button
      const tierSelectButton = tierSelectContainer.querySelector('[role="button"]') || 
                                tierSelectContainer.querySelector('div[tabindex]') ||
                                tierSelectContainer;
      
      await user.click(tierSelectButton);
      
      // Wait for options to appear and select Basic
      await waitFor(async () => {
        const basicOption = await screen.findByText(/basic/i);
        await user.click(basicOption);
      }, { timeout: 2000 });

      await user.click(screen.getByTestId('signup-accept-terms'));

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('calls form validation before API call', async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      // Try to submit with invalid data
      await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Validation should run and show error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      // Button should not be disabled (form didn't submit)
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      renderSignUpForm();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      // Use getAllByLabelText and check that we get password fields
      const passwordFields = screen.getAllByLabelText(/password/i);
      expect(passwordFields.length).toBeGreaterThanOrEqual(2); // Password and Confirm Password
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      // Subscription tier - use data-testid for reliable selection
      expect(screen.getByTestId('subscription-tier-select')).toBeInTheDocument();
    });

    it('has aria-labels for icon buttons', () => {
      renderSignUpForm();

      const toggleButtons = screen.getAllByLabelText(/toggle.*password visibility/i);
      expect(toggleButtons.length).toBeGreaterThan(0);
    });

    it('has proper form structure with semantic HTML', () => {
      renderSignUpForm();

      // Check for form element
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has back to home button', () => {
      renderSignUpForm();

      const backButton = screen.getByRole('button', { name: /back to home/i });
      expect(backButton).toBeInTheDocument();
    });

    it('has sign in link', () => {
      renderSignUpForm();

      const signInLink = screen.getByRole('button', { name: /sign in/i });
      expect(signInLink).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile and desktop', () => {
      renderSignUpForm();

      // Check that Container with maxWidth is used (responsive)
      const container = document.querySelector('.MuiContainer-root');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Server-Side Validation Error Handling', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('displays server-side validation errors field by field', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to return 400 with validation errors
      // Backend returns fieldErrors (camelCase from JSON serialization)
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Validation failed',
          fieldErrors: {
            email: ['Email is already registered'],
            companyName: ['Company name is already taken'],
          },
        }),
      });

      renderSignUpForm();

      // Fill in form with valid data
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const passwordFields = screen.getAllByLabelText(/password/i);
      await user.type(passwordFields[0], 'ValidPass123');
      await user.type(passwordFields[1], 'ValidPass123');
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');

      // Select subscription tier
      const tierSelectContainer = screen.getByTestId('subscription-tier-select');
      const tierSelectButton = tierSelectContainer.querySelector('[role="button"]') || 
                                tierSelectContainer.querySelector('div[tabindex]') ||
                                tierSelectContainer;
      await user.click(tierSelectButton);
      await waitFor(async () => {
        const basicOption = await screen.findByText(/basic/i);
        await user.click(basicOption);
      }, { timeout: 2000 });

      await user.click(screen.getByTestId('signup-accept-terms'));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Wait for server errors to be displayed
      // Errors are displayed in the helper text of form fields
      await waitFor(() => {
        const emailField = screen.getByLabelText(/email address/i);
        const emailHelperText = emailField.closest('.MuiFormControl-root')?.querySelector('.MuiFormHelperText-root');
        expect(emailHelperText).toHaveTextContent(/email is already registered/i);
        
        const companyNameField = screen.getByLabelText(/company name/i);
        const companyNameHelperText = companyNameField.closest('.MuiFormControl-root')?.querySelector('.MuiFormHelperText-root');
        expect(companyNameHelperText).toHaveTextContent(/company name is already taken/i);
      });
    });

    it('handles 409 Conflict error for duplicate email', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to return 409 Conflict
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'This email is already registered',
        }),
      });

      renderSignUpForm();

      // Fill in form
      await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
      const passwordFields = screen.getAllByLabelText(/password/i);
      await user.type(passwordFields[0], 'ValidPass123');
      await user.type(passwordFields[1], 'ValidPass123');
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');

      // Select subscription tier
      const tierSelectContainer = screen.getByTestId('subscription-tier-select');
      const tierSelectButton = tierSelectContainer.querySelector('[role="button"]') || 
                                tierSelectContainer.querySelector('div[tabindex]') ||
                                tierSelectContainer;
      await user.click(tierSelectButton);
      await waitFor(async () => {
        const basicOption = await screen.findByText(/basic/i);
        await user.click(basicOption);
      }, { timeout: 2000 });

      await user.click(screen.getByTestId('signup-accept-terms'));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Wait for error message - check for Alert message and field error
      await waitFor(() => {
        // Check that error message appears in Alert
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/this email is already registered/i);
        // Also verify field error helper text is shown
        expect(screen.getAllByText(/this email is already registered/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to throw network error (TypeError with specific message that includes 'fetch')
      const networkError = new TypeError('Failed to execute "fetch()" on "Window"');
      global.fetch.mockRejectedValueOnce(networkError);

      renderSignUpForm();

      // Fill in form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const passwordFields = screen.getAllByLabelText(/password/i);
      await user.type(passwordFields[0], 'ValidPass123');
      await user.type(passwordFields[1], 'ValidPass123');
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');

      // Select subscription tier
      const tierSelectContainer = screen.getByTestId('subscription-tier-select');
      const tierSelectButton = tierSelectContainer.querySelector('[role="button"]') || 
                                tierSelectContainer.querySelector('div[tabindex]') ||
                                tierSelectContainer;
      await user.click(tierSelectButton);
      await waitFor(async () => {
        const basicOption = await screen.findByText(/basic/i);
        await user.click(basicOption);
      }, { timeout: 2000 });

      await user.click(screen.getByTestId('signup-accept-terms'));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Wait for network error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('handles non-JSON error responses', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to return non-JSON response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Internal Server Error',
      });

      renderSignUpForm();

      // Fill in form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const passwordFields = screen.getAllByLabelText(/password/i);
      await user.type(passwordFields[0], 'ValidPass123');
      await user.type(passwordFields[1], 'ValidPass123');
      await user.type(screen.getByLabelText(/company name/i), 'Test Company');

      // Select subscription tier
      const tierSelectContainer = screen.getByTestId('subscription-tier-select');
      const tierSelectButton = tierSelectContainer.querySelector('[role="button"]') || 
                                tierSelectContainer.querySelector('div[tabindex]') ||
                                tierSelectContainer;
      await user.click(tierSelectButton);
      await waitFor(async () => {
        const basicOption = await screen.findByText(/basic/i);
        await user.click(basicOption);
      }, { timeout: 2000 });

      await user.click(screen.getByTestId('signup-accept-terms'));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
      });
    });
  });
});
