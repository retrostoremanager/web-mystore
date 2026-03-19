import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getPermissions } from '../services/permissionsApi';

const PermissionsContext = createContext(null);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [permissions, setPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated || !getAuthHeaders().Authorization) {
      setPermissions(new Set());
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await getPermissions(getAuthHeaders());
      setPermissions(new Set(result.data || []));
    } catch {
      setPermissions(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return false;
      return permissions.has(permission);
    },
    [permissions]
  );

  const value = {
    permissions,
    hasPermission,
    loading,
    refreshPermissions: loadPermissions,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};
