import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { inventoryApi } from '../store/inventoryApi';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    auth: { token: 'tok', companyId: 1, slug: 'test' },
    isAuthenticated: true,
    loading: false,
    logout: vi.fn(),
    getAuthHeaders: () => ({ Authorization: 'Bearer tok', 'X-Company-Id': '1' }),
  }),
}));

vi.mock('../contexts/PermissionsContext', () => ({
  usePermissions: () => ({
    hasPermission: (p) => ['inventory.view', 'customers.view', 'users.view', 'sales.view', 'sales.create', 'inventory.create', 'settings.manage', 'billing.view'].includes(p),
    loading: false,
    permissions: new Set(['inventory.view', 'customers.view', 'users.view', 'sales.view']),
  }),
}));

vi.mock('../contexts/FormattingContext', () => ({
  useFormatting: () => ({
    formatNumber: (n) => String(n),
    locale: 'en-US',
    timezone: 'America/New_York',
  }),
}));

vi.mock('../services/profileApi', () => ({
  getCompanyProfile: vi.fn().mockResolvedValue({ data: { profile: { companyName: 'Test Store' } } }),
}));

vi.mock('../services/billingApi', () => ({
  getTrialStatus: vi.fn().mockResolvedValue({ data: null }),
}));

vi.mock('../services/usersApi', () => ({
  getUsers: vi.fn().mockResolvedValue({ data: [{ status: 'active' }, { status: 'active' }] }),
}));

vi.mock('../services/customersApi', () => ({
  getCustomers: vi.fn().mockResolvedValue({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] }),
}));

vi.mock('../services/salesApi', () => ({
  getSalesByDateRange: vi.fn(),
}));

import { getCustomers } from '../services/customersApi';
import { getSalesByDateRange } from '../services/salesApi';

const makeSale = (id, daysAgo, customerName, total) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { id, saleDate: d.toISOString(), customerName, total, customerId: id };
};

const makeStore = () =>
  configureStore({
    reducer: { [inventoryApi.reducerPath]: inventoryApi.reducer },
    middleware: (gDM) => gDM().concat(inventoryApi.middleware),
  });

const renderDashboard = (store) =>
  render(
    <Provider store={store ?? makeStore()}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </Provider>
  );

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCustomers.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    getSalesByDateRange.mockResolvedValue({
      success: true,
      data: [
        makeSale(1, 0, 'Alice Smith', 49.99),
        makeSale(2, 0, 'Bob Jones', 19.99),
        makeSale(3, 1, 'Carol White', 99.00),
        makeSale(4, 1, 'Dave Brown', 14.99),
        makeSale(5, 2, 'Eve Davis', 29.99),
        makeSale(6, 2, 'Frank Miller', 9.99),
      ],
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, data: [] }),
    });
  });

  describe('Skeleton loading states', () => {
    it('shows Skeleton for stat cards while data is loading', async () => {
      let resolveCustomers;
      getCustomers.mockReturnValue(new Promise((res) => { resolveCustomers = res; }));

      getSalesByDateRange.mockReturnValue(new Promise(() => {}));

      renderDashboard();

      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);

      resolveCustomers({ data: [] });
    });

    it('shows Skeleton rows in Recent Sales table while sales are loading', async () => {
      getSalesByDateRange.mockReturnValue(new Promise(() => {}));
      getCustomers.mockResolvedValue({ data: [] });

      renderDashboard();

      await waitFor(() => {
        const skeletons = document.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Stat cards with real data', () => {
    it('displays customer count after API resolves', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });

    it("displays today's sales total after API resolves", async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/\$69\.98/)).toBeInTheDocument();
      });
    });

    it('renders stat cards using MUI Card components', async () => {
      renderDashboard();

      await waitFor(() => {
        const cards = document.querySelectorAll('.MuiCard-root');
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Recent sales list', () => {
    it('renders Recent Sales section heading', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Recent Sales')).toBeInTheDocument();
      });
    });

    it('renders at most 5 recent sales rows', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBeLessThanOrEqual(5);
    });

    it('displays customer names in recent sales table', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      });
    });

    it('shows empty state message when no sales', async () => {
      getSalesByDateRange.mockResolvedValue({ success: true, data: [] });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/no recent sales found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error states', () => {
    it('shows MUI Alert when customer API fails', async () => {
      getCustomers.mockRejectedValue(new Error('Failed to load customers'));

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/failed to load customers/i)).toBeInTheDocument();
      });
    });

    it('shows MUI Alert when sales API fails', async () => {
      getSalesByDateRange.mockRejectedValue(new Error('Failed to load sales'));

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/failed to load sales/i)).toBeInTheDocument();
      });
    });
  });

  describe('Theme and MUI consistency', () => {
    it('renders table with MUI Table components', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Recent Sales')).toBeInTheDocument();
      });

      expect(document.querySelector('.MuiTable-root')).toBeInTheDocument();
      expect(document.querySelector('.MuiTableContainer-root')).toBeInTheDocument();
    });

    it('renders AppBar navigation', () => {
      renderDashboard();

      expect(document.querySelector('.MuiAppBar-root')).toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
