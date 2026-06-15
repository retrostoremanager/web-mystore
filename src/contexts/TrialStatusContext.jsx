import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getTrialStatus } from '../services/billingApi';

const TrialStatusContext = createContext(null);

export const useTrialStatus = () => {
  const context = useContext(TrialStatusContext);
  if (!context) {
    throw new Error('useTrialStatus must be used within TrialStatusProvider');
  }
  return context;
};

export const TrialStatusProvider = ({ children }) => {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshTrialStatus = useCallback(async () => {
    if (!isAuthenticated || !getAuthHeaders().Authorization) return;
    setLoading(true);
    try {
      const result = await getTrialStatus(getAuthHeaders());
      setTrialStatus(result.data || null);
    } catch {
      setTrialStatus(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshTrialStatus();
    } else {
      setTrialStatus(null);
    }
  }, [isAuthenticated, refreshTrialStatus]);

  const value = {
    trialStatus,
    loading,
    refreshTrialStatus,
    accessRestricted: trialStatus?.accessRestricted ?? false,
    accessSuspended: trialStatus?.accessSuspended ?? false,
  };

  return (
    <TrialStatusContext.Provider value={value}>{children}</TrialStatusContext.Provider>
  );
};
