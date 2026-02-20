import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { isAuthConfigured } from '../auth/msalInstance';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify'];

/**
 * Redirects authenticated users from public pages to the dashboard.
 * Only runs when auth is configured.
 */
const AuthRedirect = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthConfigured() || !isAuthenticated) return;
    const path = location.pathname;
    if (PUBLIC_PATHS.includes(path)) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return children;
};

export default AuthRedirect;
