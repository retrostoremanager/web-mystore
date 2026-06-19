import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrialStatus } from '../contexts/TrialStatusContext';
import AccountSuspendedPage from './AccountSuspendedPage';
import TrialExpiredPrompt from './TrialExpiredPrompt';

const PUBLIC_PATHS = ['/', '/signup', '/verify', '/forgot-password', '/reset-password', '/set-password'];
const RESERVED_SLUGS = new Set(['dashboard', 'signup', 'verify', 'forgot-password', 'reset-password', 'set-password', 'login', 'c', 'api', 'admin', 'consignment', 'trade-ins', 'settings', 'privacy', 'terms']);

const isCompanyPath = (path) => {
  const m = path.match(/^\/([^/]+)(?:\/(login|customer))?$/);
  if (!m) return false;
  const slug = m[1]?.toLowerCase();
  const sub = m[2];
  if (sub && sub !== 'login' && sub !== 'customer') return false;
  if (!slug || RESERVED_SLUGS.has(slug)) return false;
  return true;
};

const isPublicPath = (path) => {
  if (PUBLIC_PATHS.includes(path)) return true;
  return isCompanyPath(path);
};
const BILLING_PATH = '/dashboard/billing';

/**
 * Redirects authenticated users from public pages to the dashboard.
 * Redirects unauthenticated users from protected pages to login.
 * When trial expired or account suspended, restricts access (EPIC-0-006-005).
 */
const AuthRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { accessRestricted, accessSuspended, loading: trialLoading } = useTrialStatus();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    const pathIsPublic = isPublicPath(path);

    if (isAuthenticated && pathIsPublic) {
      navigate('/dashboard', { replace: true });
    } else if (!isAuthenticated && !pathIsPublic) {
      navigate('/', { replace: true, state: { from: path } });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  // Trial/access checks (only when authenticated and auth done loading)
  useEffect(() => {
    if (!isAuthenticated || loading || trialLoading) return;

    const path = location.pathname;

    if (accessSuspended) {
      // Already showing AccountSuspendedPage via render below
      return;
    }

    if (accessRestricted && path !== BILLING_PATH) {
      navigate(BILLING_PATH, { replace: true });
    }
  }, [isAuthenticated, loading, trialLoading, accessRestricted, accessSuspended, location.pathname, navigate]);

  // Show suspended or trial-expired prompt when access is blocked
  if (isAuthenticated && !loading) {
    if (accessSuspended) {
      return <AccountSuspendedPage />;
    }
    if (accessRestricted && location.pathname !== BILLING_PATH) {
      return <TrialExpiredPrompt />;
    }
  }

  return children;
};

export default AuthRedirect;
