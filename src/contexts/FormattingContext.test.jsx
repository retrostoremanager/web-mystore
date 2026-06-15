import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FormattingProvider, useFormatting } from './FormattingContext';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    getAuthHeaders: () => ({}),
  }),
}));

// Mock profileApi
vi.mock('../services/profileApi', () => ({
  getCompanyProfile: vi.fn(),
}));

describe('FormattingContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides default formatDate when unauthenticated', () => {
    const wrapper = ({ children }) => <FormattingProvider>{children}</FormattingProvider>;
    const { result } = renderHook(() => useFormatting(), { wrapper });

    expect(result.current.formatDate('2024-01-15')).toBeTruthy();
    expect(typeof result.current.formatDate('2024-01-15')).toBe('string');
  });

  it('provides formatNumber', () => {
    const wrapper = ({ children }) => <FormattingProvider>{children}</FormattingProvider>;
    const { result } = renderHook(() => useFormatting(), { wrapper });

    expect(result.current.formatNumber(1234)).toMatch(/\d/);
    expect(typeof result.current.formatNumber(1234.56)).toBe('string');
  });

  it('provides formatYear', () => {
    const wrapper = ({ children }) => <FormattingProvider>{children}</FormattingProvider>;
    const { result } = renderHook(() => useFormatting(), { wrapper });

    expect(result.current.formatYear('2024-06-15')).toBe('2024');
  });

  it('provides formatDateTime', () => {
    const wrapper = ({ children }) => <FormattingProvider>{children}</FormattingProvider>;
    const { result } = renderHook(() => useFormatting(), { wrapper });

    const formatted = result.current.formatDateTime('2024-01-15T14:30:00Z');
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});
