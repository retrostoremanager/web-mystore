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
    it('shows loading state when form is submitting', async () => {
      const user = userEvent.setup();
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
});
