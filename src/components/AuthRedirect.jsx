import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify'];

/**
 * Redirects authenticated users from public pages to the dashboard.
 * Redirects unauthenticated users from protected pages to login.
 */
const AuthRedirect = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    const isPublicPath = PUBLIC_PATHS.includes(path);

    if (isAuthenticated && isPublicPath) {
      navigate('/dashboard', { replace: true });
    } else if (!isAuthenticated && !isPublicPath) {
      navigate('/login', { replace: true, state: { from: path } });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return children;
};

export default AuthRedirect;
