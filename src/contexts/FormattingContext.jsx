import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import { getCompanyProfile } from '../services/profileApi';

const DEFAULT_TIMEZONE = 'America/New_York';
const DEFAULT_LOCALE = 'en-US';

const FormattingContext = createContext(null);

export const useFormatting = () => {
  const context = useContext(FormattingContext);
  if (!context) {
    throw new Error('useFormatting must be used within a FormattingProvider');
  }
  return context;
};

/**
 * Derives timezone from locations: primary location first, then first with timezone, else default.
 */
function deriveTimezone(locations) {
  if (!locations?.length) return DEFAULT_TIMEZONE;
  const primary = locations.find((l) => l.isPrimary);
  if (primary?.timezone) return primary.timezone;
  const withTz = locations.find((l) => l.timezone);
  return withTz?.timezone || DEFAULT_TIMEZONE;
}

export const FormattingProvider = ({ children }) => {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [locale, setLocale] = useState(DEFAULT_LOCALE);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !getAuthHeaders().Authorization) {
      setTimezone(DEFAULT_TIMEZONE);
      setLocale(DEFAULT_LOCALE);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await getCompanyProfile(getAuthHeaders());
      const p = result.data?.profile || {};
      const locs = result.data?.locations || [];
      setLocale(p.locale || DEFAULT_LOCALE);
      setTimezone(deriveTimezone(locs));
    } catch {
      setTimezone(DEFAULT_TIMEZONE);
      setLocale(DEFAULT_LOCALE);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const formatDate = useCallback(
    (dateOrString) => {
      const d = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
      if (Number.isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        dateStyle: 'medium',
      }).format(d);
    },
    [locale, timezone]
  );

  const formatDateTime = useCallback(
    (dateOrString) => {
      const d = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
      if (Number.isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    },
    [locale, timezone]
  );

  const formatNumber = useCallback(
    (value, options = {}) => {
      if (value == null || Number.isNaN(Number(value))) return '';
      return new Intl.NumberFormat(locale, options).format(Number(value));
    },
    [locale]
  );

  const formatYear = useCallback(
    (dateOrString) => {
      const d = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
      if (Number.isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        year: 'numeric',
      }).format(d);
    },
    [locale, timezone]
  );

  const value = useMemo(
    () => ({
      timezone,
      locale,
      loading,
      formatDate,
      formatDateTime,
      formatNumber,
      formatYear,
      refresh: loadProfile,
    }),
    [timezone, locale, loading, formatDate, formatDateTime, formatNumber, formatYear, loadProfile]
  );

  return (
    <FormattingContext.Provider value={value}>
      {children}
    </FormattingContext.Provider>
  );
};
