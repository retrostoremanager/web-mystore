import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'mystore_auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.companyId) {
          setAuth(parsed);
        }
      }
    } catch {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token, companyId, email) => {
    const authData = { token, companyId, email };
    setAuth(authData);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const getAuthHeaders = useCallback(() => {
    if (!auth?.token) return {};
    const headers = {
      Authorization: `Bearer ${auth.token}`,
      'X-Company-Id': String(auth.companyId),
    };
    if (auth.email) headers['X-User-Email'] = auth.email;
    return headers;
  }, [auth]);

  const value = {
    auth,
    isAuthenticated: !!auth?.token,
    loading,
    login,
    logout,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
