import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiCall } from './useApiCall';

describe('useApiCall', () => {
  it('starts with loading=false, data=null, error=null', () => {
    const { result } = renderHook(() => useApiCall());
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets loading=true while the API call is in flight', async () => {
    let resolvePromise;
    const apiFn = vi.fn(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useApiCall());

    let executePromise;
    act(() => {
      executePromise = result.current.execute(apiFn);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise({ data: [1, 2, 3] });
      await executePromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('returns data on successful API call', async () => {
    const apiFn = vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test' } });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute(apiFn);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ id: 1, name: 'Test' });
  });

  it('returns the result directly when response has no .data field', async () => {
    const apiFn = vi.fn().mockResolvedValue([1, 2, 3]);

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute(apiFn);
    });

    expect(result.current.data).toEqual([1, 2, 3]);
  });

  it('sets error state when the API call rejects', async () => {
    const apiFn = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute(apiFn);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('uses err.data.message when available on rejected promise', async () => {
    const apiFn = vi.fn().mockRejectedValue({ data: { message: 'Forbidden' } });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute(apiFn);
    });

    expect(result.current.error).toBe('Forbidden');
  });

  it('falls back to a generic message when the error has no message', async () => {
    const apiFn = vi.fn().mockRejectedValue({});

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute(apiFn);
    });

    expect(result.current.error).toBe('An unexpected error occurred');
  });

  it('execute returns { data, error } tuple', async () => {
    const apiFn = vi.fn().mockResolvedValue({ data: 'value' });

    const { result } = renderHook(() => useApiCall());

    let returnValue;
    await act(async () => {
      returnValue = await result.current.execute(apiFn);
    });

    expect(returnValue).toEqual({ data: 'value', error: null });
  });

  it('execute returns { data: null, error } tuple on failure', async () => {
    const apiFn = vi.fn().mockRejectedValue(new Error('Bad request'));

    const { result } = renderHook(() => useApiCall());

    let returnValue;
    await act(async () => {
      returnValue = await result.current.execute(apiFn);
    });

    expect(returnValue).toEqual({ data: null, error: 'Bad request' });
  });

  it('passes arguments to the API function', async () => {
    const apiFn = vi.fn().mockResolvedValue({ data: null });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute(apiFn, 'arg1', { key: 'val' });
    });

    expect(apiFn).toHaveBeenCalledWith('arg1', { key: 'val' });
  });

  it('reset clears all state', async () => {
    const apiFn = vi.fn().mockResolvedValue({ data: 'something' });

    const { result } = renderHook(() => useApiCall());

    await act(async () => {
      await result.current.execute(apiFn);
    });

    expect(result.current.data).toBe('something');

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
