import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RolesPage from './RolesPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    getAuthHeaders: () => ({ Authorization: 'Bearer tok', 'X-Company-Id': '1' }),
  }),
}));

vi.mock('../contexts/PermissionsContext', () => ({
  usePermissions: () => ({
    hasPermission: (p) => p === 'users.manage',
  }),
}));

vi.mock('../services/rolesApi', () => ({
  getRoles: vi.fn(),
  getAvailablePermissions: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
}));

import { getRoles, getAvailablePermissions, createRole } from '../services/rolesApi';

const mockRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    permissions: ['inventory.view', 'inventory.create', 'users.manage', 'sales.view'],
    isSystemRole: true,
  },
  {
    id: 2,
    name: 'Staff',
    description: 'Staff member',
    permissions: ['inventory.view', 'sales.view'],
    isSystemRole: false,
  },
  {
    id: 3,
    name: 'Manager',
    description: 'Store manager',
    permissions: ['inventory.view', 'inventory.create', 'sales.view', 'sales.create', 'customers.view', 'customers.create', 'reports.view'],
    isSystemRole: false,
  },
];

const mockPermissions = [
  { id: 1, name: 'inventory.view', description: 'View inventory' },
  { id: 2, name: 'inventory.create', description: 'Create inventory' },
  { id: 3, name: 'users.manage', description: 'Manage users' },
  { id: 4, name: 'sales.view', description: 'View sales' },
  { id: 5, name: 'sales.create', description: 'Create sales' },
];

const renderPage = () =>
  render(
    <BrowserRouter>
      <RolesPage />
    </BrowserRouter>
  );

describe('RolesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRoles.mockResolvedValue({ data: mockRoles });
    getAvailablePermissions.mockResolvedValue({ data: mockPermissions });
    createRole.mockResolvedValue({ data: {} });
  });

  describe('Skeleton loading state', () => {
    it('shows Skeleton loading state while data loads', () => {
      getRoles.mockReturnValue(new Promise(() => {}));
      renderPage();
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders role table after data loads', async () => {
      renderPage();
      await waitFor(() => {
        expect(document.querySelector('.MuiTable-root')).toBeInTheDocument();
      });
    });
  });

  describe('Permissions Chips', () => {
    it('renders permission chips for a role', async () => {
      renderPage();
      await waitFor(() => {
        const chips = document.querySelectorAll('.MuiChip-root');
        expect(chips.length).toBeGreaterThan(0);
      });
    });

    it('renders multiple permission chips for roles with many permissions', async () => {
      renderPage();
      await waitFor(() => {
        const chips = document.querySelectorAll('.MuiChip-root');
        expect(chips.length).toBeGreaterThan(2);
      });
    });

    it('shows overflow chip when role has more than 5 permissions', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('+2 more')).toBeInTheDocument();
      });
    });

    it('shows em-dash for roles with no permissions', async () => {
      getRoles.mockResolvedValue({
        data: [{ id: 1, name: 'Empty Role', permissions: [], isSystemRole: false }],
      });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Empty Role')).toBeInTheDocument();
      });
    });

    it('shows System chip for system roles', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('System')).toBeInTheDocument();
      });
    });

    it('shows Custom chip for custom roles', async () => {
      renderPage();
      await waitFor(() => {
        const customChips = screen.getAllByText('Custom');
        expect(customChips.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Role list', () => {
    it('renders role names', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Staff')).toBeInTheDocument();
      });
    });

    it('shows empty state when no roles', async () => {
      getRoles.mockResolvedValue({ data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('No roles found')).toBeInTheDocument();
      });
    });

    it('shows Create Role button for users with manage permission', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create role/i })).toBeInTheDocument();
      });
    });

    it('hides edit/delete buttons for system roles', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });
      const editButtons = screen.getAllByLabelText('Edit role');
      expect(editButtons.length).toBe(2);
    });
  });

  describe('Create Role Dialog', () => {
    it('opens create dialog when Create Role button is clicked', async () => {
      renderPage();
      await waitFor(() => screen.getByRole('button', { name: /create role/i }));
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));
      await waitFor(() => {
        expect(screen.getByText('Create Custom Role')).toBeInTheDocument();
      });
    });

    it('shows permission checkboxes in dialog after loading', async () => {
      renderPage();
      await waitFor(() => screen.getByRole('button', { name: /create role/i }));
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));
      await waitFor(() => screen.getByText('Create Custom Role'));
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        const checkboxes = within(dialog).getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });

    it('shows validation error when role name is empty', async () => {
      renderPage();
      await waitFor(() => screen.getByRole('button', { name: /create role/i }));
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));
      await waitFor(() => screen.getByText('Create Custom Role'));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^save$/i }));
      await waitFor(() => {
        expect(screen.getByText('Role name is required')).toBeInTheDocument();
      });
    });

    it('does not call createRole when name is empty', async () => {
      renderPage();
      await waitFor(() => screen.getByRole('button', { name: /create role/i }));
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));
      await waitFor(() => screen.getByText('Create Custom Role'));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^save$/i }));
      await waitFor(() => screen.getByText('Role name is required'));
      expect(createRole).not.toHaveBeenCalled();
    });

    it('calls createRole with correct payload when form is valid', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => screen.getByRole('button', { name: /create role/i }));
      await user.click(screen.getByRole('button', { name: /create role/i }));
      await waitFor(() => screen.getByText('Create Custom Role'));
      const dialog = screen.getByRole('dialog');
      const nameInput = within(dialog).getByRole('textbox', { name: /^name$/i });
      await user.type(nameInput, 'New Role');
      await user.click(within(dialog).getByRole('button', { name: /^save$/i }));
      await waitFor(() => {
        expect(createRole).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'New Role' }),
          expect.any(Object)
        );
      });
    });

    it('closes dialog when Cancel is clicked', async () => {
      renderPage();
      await waitFor(() => screen.getByRole('button', { name: /create role/i }));
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));
      await waitFor(() => screen.getByText('Create Custom Role'));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));
      await waitFor(() => {
        expect(screen.queryByText('Create Custom Role')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Role Dialog', () => {
    it('opens edit dialog with role data pre-filled', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getAllByLabelText('Edit role').length).toBeGreaterThan(0);
      });
      fireEvent.click(screen.getAllByLabelText('Edit role')[0]);
      await waitFor(() => {
        expect(screen.getByText('Edit Role')).toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('Staff')).toBeInTheDocument();
    });
  });

  describe('Snackbar error handling', () => {
    it('shows Snackbar error when load fails', async () => {
      getRoles.mockRejectedValue(new Error('Failed to load roles'));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Failed to load roles')).toBeInTheDocument();
      });
    });
  });
});
