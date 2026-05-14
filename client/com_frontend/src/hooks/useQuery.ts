import { useState, useEffect, useCallback, useRef } from "react";
import type { ApiError } from "../types/api";

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Simple data-fetching hook. For production, replace with TanStack Query.
 * Handles loading, error, and abort on unmount.
 */
export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);

  const fetch_ = useCallback(async () => {
    const id = ++counter.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (id === counter.current) {
        setData(result);
      }
    } catch (e) {
      if (id === counter.current) {
        const apiErr = e as ApiError;
        setError(apiErr.message ?? "An unexpected error occurred");
      }
    } finally {
      if (id === counter.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

/**
 * Mutation hook for form submissions / API writes.
 */
interface UseMutationResult<T, P> {
  mutate: (payload: P) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useMutation<T, P>(
  mutator: (payload: P) => Promise<T>
): UseMutationResult<T, P> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (payload: P): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(payload);
        return result;
      } catch (e) {
        const apiErr = e as ApiError;
        setError(apiErr.message ?? "An unexpected error occurred");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  const clearError = useCallback(() => setError(null), []);

  return { mutate, loading, error, clearError };
}
