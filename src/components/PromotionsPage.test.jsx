import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PromotionsPage from './PromotionsPage';

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

vi.mock('../services/promotionsApi', () => ({
  getPromotions: vi.fn(),
  createPromotion: vi.fn(),
  updatePromotion: vi.fn(),
  deletePromotion: vi.fn(),
}));

import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../services/promotionsApi';

const SAMPLE_PROMOTIONS = [
  {
    id: 1,
    name: 'Summer Sale',
    type: 'percentage',
    discountPercent: 20,
    scope: 'store_wide',
    scopeValue: null,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    isActive: true,
  },
  {
    id: 2,
    name: 'Buy 2 Get 1',
    type: 'bxgy',
    buyQuantity: 2,
    getQuantity: 1,
    scope: 'category',
    scopeValue: 'Games',
    startDate: '2024-07-01',
    endDate: null,
    isActive: false,
  },
];

const renderPage = () =>
  render(
    <BrowserRouter>
      <PromotionsPage />
    </BrowserRouter>
  );

describe('PromotionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPromotions.mockResolvedValue({ data: SAMPLE_PROMOTIONS });
    createPromotion.mockResolvedValue({ data: { id: 3 } });
    updatePromotion.mockResolvedValue({ data: {} });
    deletePromotion.mockResolvedValue({ data: {} });
  });

  describe('Page rendering', () => {
    it('renders the AppBar and Promotions heading', async () => {
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });
      expect(document.querySelector('.MuiAppBar-root')).toBeInTheDocument();
      const headings = screen.getAllByText('Promotions');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('calls getPromotions on mount with auth headers', async () => {
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalledTimes(1);
        expect(getPromotions).toHaveBeenCalledWith(
          expect.objectContaining({ Authorization: 'Bearer tok' })
        );
      });
    });

    it('shows Skeleton loaders during initial load', () => {
      getPromotions.mockReturnValue(new Promise(() => {}));
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
  });

  describe('Empty state', () => {
    it('shows empty state message when no promotions exist', async () => {
      getPromotions.mockResolvedValue({ data: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/no promotions found/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error state', () => {
    it('shows error Snackbar when API fails', async () => {
      getPromotions.mockRejectedValue(new Error('Network failure'));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Network failure')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Create Promotion dialog', () => {
    it('opens Create Promotion dialog when button clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });

      const createBtn = screen.getByRole('button', { name: /create promotion/i });
      await user.click(createBtn);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('Create Promotion')).toBeInTheDocument();
      });
    });

    it('dialog contains required fields: Name, Type, Start Date', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: /create promotion/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByLabelText(/name/i)).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/start date/i)).toBeInTheDocument();
    });

    it('shows Discount Percent field when type is percentage', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: /create promotion/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByLabelText(/discount percent/i)).toBeInTheDocument();
    });

    it('closes dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: /create promotion/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form validation', () => {
    it('shows error when Name is empty on submit', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: /create promotion/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /^create$/i }));

      await waitFor(() => {
        expect(within(dialog).getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when Start Date is missing', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: /create promotion/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByLabelText(/name/i), 'Test Promo');
      await user.type(within(dialog).getByLabelText(/discount percent/i), '15');
      await user.click(within(dialog).getByRole('button', { name: /^create$/i }));

      await waitFor(() => {
        expect(within(dialog).getByText(/start date is required/i)).toBeInTheDocument();
      });
    });

    it('does not call createPromotion when form is invalid', async () => {
      const user = userEvent.setup();
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: /create promotion/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /^create$/i }));

      await waitFor(() => {
        expect(within(dialog).getByText(/name is required/i)).toBeInTheDocument();
      });
      expect(createPromotion).not.toHaveBeenCalled();
    });
  });

  describe('MUI component usage', () => {
    it('renders the Create Promotion button in toolbar', async () => {
      renderPage();
      await waitFor(() => {
        expect(getPromotions).toHaveBeenCalled();
      });
      expect(screen.getByRole('button', { name: /create promotion/i })).toBeInTheDocument();
    });
  });
});
