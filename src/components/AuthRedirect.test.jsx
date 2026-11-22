import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthRedirect from './AuthRedirect';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    loading: false,
  }),
}));

vi.mock('../contexts/TrialStatusContext', () => ({
  useTrialStatus: () => ({
    accessRestricted: false,
    accessSuspended: false,
    loading: false,
  }),
}));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthRedirect>
        <Routes>
          <Route path="/consignment" element={<div>CONSIGNMENT_PAGE</div>} />
          <Route path="/trade-ins" element={<div>TRADE_INS_PAGE</div>} />
          <Route path="/settings/billing" element={<div>SETTINGS_BILLING_PAGE</div>} />
          <Route path="/dashboard" element={<div>DASHBOARD_PAGE</div>} />
          <Route path="/:slug" element={<div>COMPANY_LANDING</div>} />
        </Routes>
      </AuthRedirect>
    </MemoryRouter>
  );

describe('AuthRedirect - top-level protected routes', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('does not redirect authenticated user away from /consignment', async () => {
    renderAt('/consignment');
    await waitFor(() => {
      expect(screen.getByText('CONSIGNMENT_PAGE')).toBeInTheDocument();
    });
    expect(navigateMock).not.toHaveBeenCalledWith('/dashboard', expect.any(Object));
  });

  it('does not redirect authenticated user away from /trade-ins', async () => {
    renderAt('/trade-ins');
    await waitFor(() => {
      expect(screen.getByText('TRADE_INS_PAGE')).toBeInTheDocument();
    });
    expect(navigateMock).not.toHaveBeenCalledWith('/dashboard', expect.any(Object));
  });

  it('does not redirect authenticated user away from /settings/billing', async () => {
    renderAt('/settings/billing');
    await waitFor(() => {
      expect(screen.getByText('SETTINGS_BILLING_PAGE')).toBeInTheDocument();
    });
    expect(navigateMock).not.toHaveBeenCalledWith('/dashboard', expect.any(Object));
  });

  it('still redirects authenticated user from a real company slug to /dashboard', async () => {
    renderAt('/some-company');
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
