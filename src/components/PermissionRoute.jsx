import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';

/**
 * Wraps a route and redirects to /dashboard if user lacks the required permission.
 */
const PermissionRoute = ({ permission, element }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, loading } = usePermissions();

  useEffect(() => {
    if (loading) return;
    if (permission && !hasPermission(permission)) {
      navigate('/dashboard', { replace: true, state: { from: location.pathname } });
    }
  }, [permission, hasPermission, loading, navigate, location.pathname]);

  if (loading) return null;
  if (permission && !hasPermission(permission)) return null;

  return element;
};

export default PermissionRoute;
