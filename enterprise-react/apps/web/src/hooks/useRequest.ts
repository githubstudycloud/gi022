import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRequestOptions<T> {
  immediate?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

interface UseRequestResult<T, P extends unknown[]> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  run: (...args: P) => Promise<T | undefined>;
  refresh: () => void;
  reset: () => void;
}

/**
 * 统一的异步请求 Hook
 * @example
 * const { data, loading, error } = useRequest(() => api.getUsers(), { immediate: true })
 */
export function useRequest<T, P extends unknown[] = []>(
  service: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {},
): UseRequestResult<T, P> {
  const { immediate = false, initialData, onSuccess, onError } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lastArgsRef = useRef<P | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(
    async (...args: P): Promise<T | undefined> => {
      lastArgsRef.current = args;
      setLoading(true);
      setError(null);
      try {
        const result = await service(...args);
        if (mountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(e);
          onError?.(e);
        }
        return undefined;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [service],
  );

  const refresh = useCallback(() => {
    if (lastArgsRef.current) run(...lastArgsRef.current);
  }, [run]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    if (immediate) run(...([] as unknown as P));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, run, refresh, reset };
}
