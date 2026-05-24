import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiCall } from './useApiCall';

describe('useApiCall', () => {
  it('starts with loading=false, data=null, error=null', () => {
    const apiFn = vi.fn();
    const { result } = renderHook(() => useApiCall(apiFn));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('uses initialData when provided', () => {
    const apiFn = vi.fn();
    const { result } = renderHook(() => useApiCall(apiFn, { initialData: [] }));
    expect(result.current.data).toEqual([]);
  });

  it('sets loading=true while the promise is pending', async () => {
    let resolve;
    const apiFn = vi.fn(() => new Promise((r) => { resolve = r; }));
    const { result } = renderHook(() => useApiCall(apiFn));

    act(() => { result.current.execute(); });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolve('done'); });
    expect(result.current.loading).toBe(false);
  });

  it('sets data on successful resolution and returns it', async () => {
    const apiFn = vi.fn().mockResolvedValue({ items: [1, 2, 3] });
    const { result } = renderHook(() => useApiCall(apiFn));

    let returnValue;
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(result.current.data).toEqual({ items: [1, 2, 3] });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(returnValue).toEqual({ data: { items: [1, 2, 3] }, error: null });
  });

  it('sets error on rejected promise and clears data', async () => {
    const apiFn = vi.fn().mockRejectedValue(new Error('Network failure'));
    const { result } = renderHook(() => useApiCall(apiFn));

    let returnValue;
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(result.current.error).toBe('Network failure');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(returnValue).toEqual({ data: null, error: 'Network failure' });
  });

  it('uses fallback error message when error has no message', async () => {
    const apiFn = vi.fn().mockRejectedValue({});
    const { result } = renderHook(() => useApiCall(apiFn));

    await act(async () => { await result.current.execute(); });
    expect(result.current.error).toBe('An unexpected error occurred');
  });

  it('clears previous error on subsequent successful call', async () => {
    const apiFn = vi.fn()
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useApiCall(apiFn));

    await act(async () => { await result.current.execute(); });
    expect(result.current.error).toBe('First error');

    await act(async () => { await result.current.execute(); });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ ok: true });
  });

  it('passes arguments through to the API function', async () => {
    const apiFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useApiCall(apiFn));

    await act(async () => { await result.current.execute('arg1', 'arg2'); });
    expect(apiFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('returns stable execute reference across re-renders', () => {
    const apiFn = vi.fn();
    const { result, rerender } = renderHook(() => useApiCall(apiFn));
    const firstExecute = result.current.execute;
    rerender();
    expect(result.current.execute).toBe(firstExecute);
  });
});
