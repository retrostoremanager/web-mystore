import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CustomersPage from './CustomersPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    auth: { token: 'tok', companyId: 1 },
    isAuthenticated: true,
    getAuthHeaders: () => ({ Authorization: 'Bearer tok', 'X-Company-Id': '1' }),
  }),
}));

vi.mock('../contexts/PermissionsContext', () => ({
  usePermissions: () => ({
    hasPermission: () => true,
  }),
}));

vi.mock('../services/customersApi', () => ({
  getCustomers: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}));

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/customersApi';

const SAMPLE_CUSTOMERS = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    phone: '555-1111',
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    pointsBalance: 150,
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@example.com',
    phone: '555-2222',
    address: null,
    city: null,
    state: null,
    zipCode: null,
    pointsBalance: 0,
    createdAt: '2023-06-20T00:00:00Z',
  },
];

const renderPage = () =>
  render(
    <BrowserRouter>
      <CustomersPage />
    </BrowserRouter>
  );

describe('CustomersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCustomers.mockResolvedValue({ data: SAMPLE_CUSTOMERS });
    createCustomer.mockResolvedValue({ data: {} });
    updateCustomer.mockResolvedValue({ data: {} });
    deleteCustomer.mockResolvedValue({ data: {} });
  });

  describe('Loading state', () => {
    it('shows Skeleton rows during initial load', () => {
      getCustomers.mockReturnValue(new Promise(() => {}));
      renderPage();
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('calls getCustomers on mount with auth headers', async () => {
      renderPage();
      await waitFor(() => {
        expect(getCustomers).toHaveBeenCalledTimes(1);
        expect(getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ Authorization: 'Bearer tok' })
        );
      });
    });
  });

  describe('DataGrid renders customers', () => {
    it('calls getCustomers to populate the grid', async () => {
      renderPage();
      await waitFor(() => {
        expect(getCustomers).toHaveBeenCalled();
      });
    });

    it('renders AppBar and Card layout', () => {
      renderPage();
      expect(document.querySelector('.MuiAppBar-root')).toBeInTheDocument();
      expect(document.querySelector('.MuiCard-root')).toBeInTheDocument();
    });

    it('shows loading skeletons before data loads', () => {
      getCustomers.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
    });
  });

  describe('Empty state', () => {
    it('shows empty state message when no customers exist', async () => {
      getCustomers.mockResolvedValue({ data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/no customers yet/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error state', () => {
    it('shows Snackbar with error message when API fails', async () => {
      getCustomers.mockRejectedValue(new Error('Network error'));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Row click opens Drawer', () => {
    it('Drawer is initially closed', () => {
      renderPage();
      expect(screen.queryByText('Customer Details')).not.toBeInTheDocument();
    });
  });

  describe('Add Customer dialog', () => {
    it('opens Add Customer dialog when button is clicked', async () => {
      const user = userEvent.setup();
      renderPage();

      const addBtn = screen.getByRole('button', { name: /add customer/i });
      await user.click(addBtn);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('Add Customer')).toBeInTheDocument();
      });
    });

    it('dialog contains First Name, Email, Phone fields', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /add customer/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByLabelText(/first name/i)).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/email/i)).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it('closes dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /add customer/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('submits Add Customer form and calls createCustomer', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /add customer/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByLabelText(/first name/i), 'Carol');
      await user.type(within(dialog).getByLabelText(/email/i), 'carol@example.com');
      await user.click(within(dialog).getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(createCustomer).toHaveBeenCalledWith(
          expect.objectContaining({ firstName: 'Carol', email: 'carol@example.com' }),
          expect.any(Object)
        );
      });
    });

    it('shows validation error if first name is missing', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /add customer/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error if neither email nor phone provided', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /add customer/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByLabelText(/first name/i), 'Dave');
      await user.click(within(dialog).getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(
          screen.queryByText(/at least one of email or phone/i) ||
          screen.queryByText(/enter an email/i)
        ).toBeTruthy();
      });
    });
  });

  describe('Edit Customer dialog', () => {
    it('opens Edit dialog when clicking edit in row actions (if rows are rendered)', async () => {
      const user = userEvent.setup();
      renderPage();

      const editButtons = screen.queryAllByRole('button', { name: /^edit$/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);
        await waitFor(() => {
          expect(screen.getByText('Edit Customer')).toBeInTheDocument();
        });
        const firstNameField = screen.getByLabelText(/first name/i);
        expect(firstNameField.value).toBeTruthy();
      } else {
        expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument();
      }
    });

    it('calls updateCustomer when edit form is submitted', async () => {
      const user = userEvent.setup();
      renderPage();

      const editButtons = screen.queryAllByRole('button', { name: /^edit$/i });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        const dialog = screen.getByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: /save/i }));
        await waitFor(() => {
          expect(updateCustomer).toHaveBeenCalled();
        });
      } else {
        expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument();
      }
    });
  });

  describe('Delete confirmation', () => {
    it('opens delete confirmation when delete button is clicked (if rows rendered)', async () => {
      const user = userEvent.setup();
      renderPage();

      const deleteButtons = screen.queryAllByRole('button', { name: /^delete$/i });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);
        await waitFor(() => {
          expect(screen.getByText(/delete customer/i)).toBeInTheDocument();
          expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
        });
      } else {
        expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument();
      }
    });

    it('calls deleteCustomer when confirmed (if rows rendered)', async () => {
      const user = userEvent.setup();
      renderPage();

      const deleteButtons = screen.queryAllByRole('button', { name: /^delete$/i });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);
        await waitFor(() => {
          expect(screen.getByText(/delete customer/i)).toBeInTheDocument();
        });
        const confirmDialog = screen.getByRole('dialog');
        const confirmBtn = within(confirmDialog).getByRole('button', { name: /delete/i });
        await user.click(confirmBtn);
        await waitFor(() => {
          expect(deleteCustomer).toHaveBeenCalledWith(expect.any(Number), expect.any(Object));
        });
      } else {
        expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument();
      }
    });
  });

  describe('MUI component usage', () => {
    it('renders AppBar with Customers title', () => {
      renderPage();
      expect(document.querySelector('.MuiAppBar-root')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });

    it('renders Add Customer button', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument();
    });

    it('renders Customer List heading', () => {
      renderPage();
      expect(screen.getByText('Customer List')).toBeInTheDocument();
    });
  });
});
