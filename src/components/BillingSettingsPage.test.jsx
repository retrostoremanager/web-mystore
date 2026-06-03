import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { getSubscriptionChipProps } from './BillingSettingsPage';
import BillingSettingsPage from './BillingSettingsPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    getAuthHeaders: () => ({ Authorization: 'Bearer tok' }),
  }),
}));

vi.mock('../contexts/TrialStatusContext', () => ({
  useTrialStatus: () => ({ refreshTrialStatus: vi.fn() }),
}));

vi.mock('../services/billingApi', () => ({
  getSubscription: vi.fn(),
  getPaymentMethods: vi.fn(),
  getInvoices: vi.fn(),
  storePaymentMethod: vi.fn(),
  setDefaultPaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
}));

vi.mock('../utils/billingErrorUtils', () => ({
  getBillingErrorMessage: (err) => ({ message: err?.message || 'Error' }),
}));

vi.mock('./PaymentMethodForm', () => ({
  default: () => <div>PaymentMethodForm</div>,
}));

import {
  getSubscription,
  getPaymentMethods,
  getInvoices,
} from '../services/billingApi';

function renderPage() {
  return render(
    <BrowserRouter>
      <BillingSettingsPage />
    </BrowserRouter>
  );
}

describe('getSubscriptionChipProps', () => {
  it('returns success color for active status', () => {
    const result = getSubscriptionChipProps('active');
    expect(result.color).toBe('success');
    expect(result.label).toBe('Active');
  });

  it('returns success color for ACTIVE (case-insensitive)', () => {
    const result = getSubscriptionChipProps('ACTIVE');
    expect(result.color).toBe('success');
  });

  it('returns info color for trial status', () => {
    const result = getSubscriptionChipProps('trial');
    expect(result.color).toBe('info');
    expect(result.label).toBe('Trial');
  });

  it('returns info color for trialing status', () => {
    const result = getSubscriptionChipProps('trialing');
    expect(result.color).toBe('info');
    expect(result.label).toBe('Trial');
  });

  it('returns error color for cancelled status', () => {
    const result = getSubscriptionChipProps('cancelled');
    expect(result.color).toBe('error');
    expect(result.label).toBe('Cancelled');
  });

  it('returns error color for canceled (US spelling)', () => {
    const result = getSubscriptionChipProps('canceled');
    expect(result.color).toBe('error');
    expect(result.label).toBe('Cancelled');
  });

  it('returns warning color for past_due status', () => {
    const result = getSubscriptionChipProps('past_due');
    expect(result.color).toBe('warning');
    expect(result.label).toBe('Past Due');
  });

  it('returns default color for paused status', () => {
    const result = getSubscriptionChipProps('paused');
    expect(result.color).toBe('default');
    expect(result.label).toBe('Paused');
  });

  it('returns default color and Unknown label for null', () => {
    const result = getSubscriptionChipProps(null);
    expect(result.color).toBe('default');
    expect(result.label).toBe('Unknown');
  });

  it('returns default color and Unknown label for undefined', () => {
    const result = getSubscriptionChipProps(undefined);
    expect(result.color).toBe('default');
    expect(result.label).toBe('Unknown');
  });

  it('returns default color and original label for unknown status', () => {
    const result = getSubscriptionChipProps('suspended');
    expect(result.color).toBe('default');
    expect(result.label).toBe('suspended');
  });
});

describe('BillingSettingsPage render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section headings', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    expect(screen.getByText('Subscription Summary')).toBeInTheDocument();
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('Invoice History')).toBeInTheDocument();
  });

  it('shows subscription plan name and status chip after loading', async () => {
    getSubscription.mockResolvedValue({
      data: {
        plan: 'Premium',
        status: 'active',
        currentPeriodStart: '2025-01-01T00:00:00Z',
        currentPeriodEnd: '2025-02-01T00:00:00Z',
        nextInvoiceAmount: 2999,
        currency: 'usd',
      },
    });
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Premium/)).toBeInTheDocument();
      expect(screen.getByTestId('subscription-status-chip')).toHaveTextContent('Active');
    });
  });

  it('shows trial info when subscription is in trial', async () => {
    getSubscription.mockResolvedValue({
      data: {
        plan: 'Basic',
        status: 'trialing',
        trialEnd: '2025-03-01T00:00:00Z',
        daysRemaining: 7,
      },
    });
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Trial ends:/)).toBeInTheDocument();
      expect(screen.getByText(/7 days remaining/)).toBeInTheDocument();
    });
  });

  it('shows payment method card with brand, last4, and expiry', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockResolvedValue({
      data: [
        { id: 1, brand: 'visa', last4: '4242', expirationMonth: 12, expirationYear: 2027, isDefault: true },
      ],
    });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/VISA/)).toBeInTheDocument();
      expect(screen.getByText(/4242/)).toBeInTheDocument();
      expect(screen.getByText(/12\/27/)).toBeInTheDocument();
    });
  });

  it('shows payment method card with last4 and expiry when brand field is absent', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockResolvedValue({
      data: [
        { id: 1, last4: '4242', expirationMonth: 12, expirationYear: 2035, isDefault: true },
      ],
    });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/4242/)).toBeInTheDocument();
      expect(screen.getByText(/12\/35/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no payment methods', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/No payment methods on file/)).toBeInTheDocument();
    });
  });

  it('shows invoice table rows after loading', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockResolvedValue({
      data: [
        { id: 'inv_1', date: '2025-01-15T00:00:00Z', amount: 2999, currency: 'usd', status: 'paid', pdfUrl: 'https://example.com/inv1.pdf' },
        { id: 'inv_2', date: '2024-12-15T00:00:00Z', amount: 2999, currency: 'usd', status: 'paid', pdfUrl: null },
      ],
      pagination: { totalPages: 1 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
    expect(screen.getByText('Invoice History')).toBeInTheDocument();
  });

  it('shows empty state when no invoices', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No invoices found.')).toBeInTheDocument();
    });
  });

  it('shows subscription error alert when subscription API fails', async () => {
    getSubscription.mockRejectedValue(new Error('Subscription unavailable'));
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Subscription unavailable')).toBeInTheDocument();
    });
  });

  it('shows payment methods error alert when payment methods API fails', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockRejectedValue(new Error('Payment methods unavailable'));
    getInvoices.mockResolvedValue({ data: [], pagination: { totalPages: 1 } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Payment methods unavailable')).toBeInTheDocument();
    });
  });

  it('shows invoices error alert when invoices API fails', async () => {
    getSubscription.mockResolvedValue({ data: null });
    getPaymentMethods.mockResolvedValue({ data: [] });
    getInvoices.mockRejectedValue(new Error('Invoices unavailable'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Invoices unavailable')).toBeInTheDocument();
    });
  });
});
