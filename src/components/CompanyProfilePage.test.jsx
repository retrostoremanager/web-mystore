import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompanyProfilePage, { validateLogoFile } from './CompanyProfilePage';

const makeFile = (name, type, size = 100) =>
  new File(['x'.repeat(size)], name, { type });

describe('validateLogoFile', () => {
  it('returns invalid when no file provided', () => {
    const result = validateLogoFile(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('accepts image/jpeg', () => {
    const result = validateLogoFile(makeFile('logo.jpg', 'image/jpeg'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts image/jpg', () => {
    const result = validateLogoFile(makeFile('logo.jpg', 'image/jpg'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts image/png', () => {
    const result = validateLogoFile(makeFile('logo.png', 'image/png'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts image/webp', () => {
    const result = validateLogoFile(makeFile('logo.webp', 'image/webp'));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('rejects image/svg+xml', () => {
    const result = validateLogoFile(makeFile('logo.svg', 'image/svg+xml'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid file type/i);
  });

  it('rejects image/gif', () => {
    const result = validateLogoFile(makeFile('logo.gif', 'image/gif'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid file type/i);
  });

  it('rejects application/pdf', () => {
    const result = validateLogoFile(makeFile('doc.pdf', 'application/pdf'));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid file type/i);
  });

  it('rejects files over 5MB', () => {
    const over5MB = 5 * 1024 * 1024 + 1;
    const result = validateLogoFile(makeFile('logo.png', 'image/png', over5MB));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });

  it('accepts files exactly at 5MB', () => {
    const exactly5MB = 5 * 1024 * 1024;
    const result = validateLogoFile(makeFile('logo.png', 'image/png', exactly5MB));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts small valid files', () => {
    const result = validateLogoFile(makeFile('tiny.png', 'image/png', 1024));
    expect(result.valid).toBe(true);
  });
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../contexts/AuthContext', () => {
  const stableAuthHeaders = () => ({ Authorization: 'Bearer tok' });
  const auth = {
    isAuthenticated: true,
    getAuthHeaders: stableAuthHeaders,
  };
  return { useAuth: () => auth };
});

vi.mock('../contexts/FormattingContext', () => ({
  useFormatting: () => ({ refresh: vi.fn() }),
}));

vi.mock('../services/profileApi', () => ({
  getCompanyProfile: vi.fn(),
  updateCompanyProfile: vi.fn(),
  uploadLogo: vi.fn(),
  deleteLogo: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn(),
  getLocationDeletionInfo: vi.fn(),
  getTaxSettings: vi.fn(),
  updateTaxSettings: vi.fn(),
}));

vi.mock('../services/billingApi', () => ({
  getTrialStatus: vi.fn(),
}));

import {
  getCompanyProfile,
  updateCompanyProfile,
  getTaxSettings,
} from '../services/profileApi';
import { getTrialStatus } from '../services/billingApi';

function renderPage() {
  return render(
    <BrowserRouter>
      <CompanyProfilePage />
    </BrowserRouter>
  );
}

const baseProfileResponse = {
  success: true,
  data: {
    profile: {
      companyName: 'Acme Co',
      companyAddress: '123 Main St',
      companyAddress2: 'Suite 100',
      companyCity: 'Springfield',
      companyState: 'IL',
      companyZipCode: '62701',
      companyCountry: 'USA',
      companyPhone: '555-1234',
      locale: 'en-US',
      logoUrl: '',
    },
    locations: [],
  },
};

describe('CompanyProfilePage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCompanyProfile.mockResolvedValue(baseProfileResponse);
    getTaxSettings.mockResolvedValue({
      success: true,
      data: { taxEnabled: false, taxRate: 0, taxLabel: '' },
    });
    getTrialStatus.mockResolvedValue({ data: { subscriptionTier: 'Basic' } });
    updateCompanyProfile.mockResolvedValue({ success: true });
  });

  it('renders all required form fields', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/address line 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address line 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /company info/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /company logo/i })).toBeInTheDocument();
  });

  it('save triggers updateCompanyProfile PUT with companyCountry', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Acme Co')).toBeInTheDocument();
    });

    const countryField = screen.getByLabelText(/country/i);
    fireEvent.change(countryField, { target: { value: 'Canada' } });

    const saveButton = screen.getByRole('button', { name: /save info/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateCompanyProfile).toHaveBeenCalledTimes(1);
    });
    const sentPayload = updateCompanyProfile.mock.calls[0][0];
    expect(sentPayload.companyCountry).toBe('Canada');
    expect(sentPayload.companyName).toBe('Acme Co');
  });

  it('shows success snackbar after successful save', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Acme Co')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save info/i }));

    await waitFor(() => {
      expect(screen.getByText(/company info saved successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error alert when save fails', async () => {
    updateCompanyProfile.mockRejectedValueOnce(new Error('Server exploded'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Acme Co')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save info/i }));

    await waitFor(() => {
      expect(screen.getByText(/server exploded/i)).toBeInTheDocument();
    });
  });

  it('Country field renders placeholder and helperText', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Acme Co')).toBeInTheDocument();
    });

    const countryField = screen.getByLabelText(/country/i);
    expect(countryField).toHaveAttribute('placeholder', 'e.g. United States');
    expect(
      screen.getByText(/Country name or code \(e\.g\. USA, Canada, United Kingdom\)/i)
    ).toBeInTheDocument();
  });
});
