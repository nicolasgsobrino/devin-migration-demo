import { useEffect, useState, useRef, useCallback } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], pollInterval?: number): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback((isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    }

    fetcherRef.current()
      .then((result) => {
        setData(result);
        if (isInitial) setLoading(false);
      })
      .catch((err) => {
        if (isInitial) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    doFetch(true);

    if (pollInterval && pollInterval > 0) {
      intervalRef.current = setInterval(() => doFetch(false), pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, pollInterval]);

  return { data, loading, error };
}
