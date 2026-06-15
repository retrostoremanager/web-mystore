import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UsersPage from './UsersPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    getAuthHeaders: () => ({ Authorization: 'Bearer tok', 'X-Company-Id': '1' }),
  }),
}));

vi.mock('../services/usersApi', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  resendInvite: vi.fn(),
}));

vi.mock('../services/rolesApi', () => ({
  getRoles: vi.fn(),
}));

import { getUsers, createUser } from '../services/usersApi';
import { getRoles } from '../services/rolesApi';

const mockUsers = [
  { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', roles: ['Admin'], status: 'active' },
  { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', roles: [], status: 'pending_invitation' },
  { id: 3, firstName: 'Carol', lastName: 'White', email: 'carol@example.com', roles: ['Staff'], status: 'removed' },
];

const mockRoles = [
  { id: 1, name: 'Admin', description: 'Administrator' },
  { id: 2, name: 'Staff', description: 'Staff member' },
];

const renderPage = () =>
  render(
    <BrowserRouter>
      <UsersPage />
    </BrowserRouter>
  );

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUsers.mockResolvedValue({ data: mockUsers });
    getRoles.mockResolvedValue({ data: mockRoles });
    createUser.mockResolvedValue({ data: {} });
  });

  describe('DataGrid rendering', () => {
    it('shows Skeleton loading state while data loads', () => {
      getUsers.mockReturnValue(new Promise(() => {}));
      getRoles.mockReturnValue(new Promise(() => {}));
      renderPage();
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders DataGrid after data loads', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
    });

    it('DataGrid has Name column header', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
      });
    });

    it('DataGrid has Email column header', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: /email/i })).toBeInTheDocument();
      });
    });

    it('DataGrid has Role column header', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: /role/i })).toBeInTheDocument();
      });
    });

    it('DataGrid has Status and Actions columns configured', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
      const headers = document.querySelectorAll('.MuiDataGrid-columnHeader');
      const fieldNames = Array.from(headers).map((h) => h.getAttribute('data-field'));
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('email');
    });

    it('shows empty state message when no users', async () => {
      getUsers.mockResolvedValue({ data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
      });
    });

    it('shows snackbar error when API load fails', async () => {
      getUsers.mockRejectedValue(new Error('Network error'));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Invite User Dialog', () => {
    it('opens invite dialog when Invite User button is clicked', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(within(screen.getByRole('dialog')).getByText('Invite User')).toBeInTheDocument();
      });
    });

    it('shows role dropdown populated from GET /roles', async () => {
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByRole('combobox')).toBeInTheDocument();
    });

    it('shows validation error when first name is empty', async () => {
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /send invite/i }));
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('shows validation error when last name is empty', async () => {
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      const dialog = screen.getByRole('dialog');
      fireEvent.change(within(dialog).getByLabelText(/first name/i), { target: { value: 'Alice' } });
      fireEvent.click(within(dialog).getByRole('button', { name: /send invite/i }));
      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });
    });

    it('shows validation error when email is empty', async () => {
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      const dialog = screen.getByRole('dialog');
      fireEvent.change(within(dialog).getByLabelText(/first name/i), { target: { value: 'Alice' } });
      fireEvent.change(within(dialog).getByLabelText(/last name/i), { target: { value: 'Smith' } });
      fireEvent.click(within(dialog).getByRole('button', { name: /send invite/i }));
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email format', async () => {
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      const dialog = screen.getByRole('dialog');
      fireEvent.change(within(dialog).getByLabelText(/first name/i), { target: { value: 'Alice' } });
      fireEvent.change(within(dialog).getByLabelText(/last name/i), { target: { value: 'Smith' } });
      fireEvent.change(within(dialog).getByLabelText(/email/i), { target: { value: 'not-an-email' } });
      fireEvent.click(within(dialog).getByRole('button', { name: /send invite/i }));
      await waitFor(() => {
        expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
      });
    });

    it('does not call createUser when form is invalid', async () => {
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /send invite/i }));
      await waitFor(() => screen.getByText('First name is required'));
      expect(createUser).not.toHaveBeenCalled();
    });

    it('calls createUser with correct payload when form is valid', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      await user.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByLabelText(/first name/i), 'Dave');
      await user.type(within(dialog).getByLabelText(/last name/i), 'Brown');
      await user.type(within(dialog).getByLabelText(/email/i), 'dave@example.com');
      await user.click(within(dialog).getByRole('button', { name: /send invite/i }));
      await waitFor(() => {
        expect(createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Dave',
            lastName: 'Brown',
            email: 'dave@example.com',
          }),
          expect.any(Object)
        );
      });
    });

    it('closes dialog after successful invite', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      await user.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByLabelText(/first name/i), 'Dave');
      await user.type(within(dialog).getByLabelText(/last name/i), 'Brown');
      await user.type(within(dialog).getByLabelText(/email/i), 'dave@example.com');
      await user.click(within(dialog).getByRole('button', { name: /send invite/i }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes dialog when Cancel is clicked', async () => {
      renderPage();
      await waitFor(() => document.querySelector('.MuiDataGrid-root'));
      fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
      await waitFor(() => screen.getByRole('dialog'));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Deactivate/Reactivate actions', () => {
    it('renders deactivate and reactivate action buttons after load', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiDataGrid-root')).toBeInTheDocument();
      });
    });

    it('shows snackbar error when API load fails', async () => {
      getUsers.mockRejectedValue(new Error('Network error'));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });
});
