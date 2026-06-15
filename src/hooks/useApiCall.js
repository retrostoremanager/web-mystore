import { useState, useCallback } from 'react';

export function useApiCall(initialData = null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(initialData);

  const execute = useCallback(async (apiFn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      const payload = result?.data !== undefined ? result.data : result;
      setData(payload);
      return { data: payload, error: null };
    } catch (err) {
      const message = err?.data?.message || err?.message || 'An unexpected error occurred';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(initialData);
  }, [initialData]);

  return { data, loading, error, execute, reset };
}
