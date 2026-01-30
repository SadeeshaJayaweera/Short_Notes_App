import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { ErrorLogger } from '@/lib/errors';

export interface UseQueryOptions<T> {
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

export interface UseQueryReturn<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data with caching and error handling
 */
export function useQuery<T>(
  url: string,
  options: UseQueryOptions<T> = {}
): UseQueryReturn<T> {
  const { enabled = true, retry = 3, retryDelay = 1000, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(
    async (currentRetry = 0) => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsError(false);
        const response = await axios.get(url);
        const result = response.data.data || response.data;
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        ErrorLogger.log(err, { url, retryAttempt: currentRetry });

        if (currentRetry < retry) {
          setRetryCount(currentRetry + 1);
          setTimeout(() => fetchData(currentRetry + 1), retryDelay);
        } else {
          setError(err);
          setIsError(true);
          onError?.(err);
        }
      } finally {
        if (currentRetry === retry) {
          setIsLoading(false);
        }
      }
    },
    [url, retry, retryDelay, enabled, onSuccess, onError]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export interface UseMutationOptions<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  onMutate?: () => void;
}

export interface UseMutationReturn<T = any> {
  mutate: (data?: any) => Promise<T>;
  mutateAsync: (data?: any) => Promise<T>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: unknown;
  reset: () => void;
}

export function useMutation<T = any>(
  method: 'POST' | 'PUT' | 'DELETE',
  url: string,
  options: UseMutationOptions<T> = {}
): UseMutationReturn<T> {
  const { onSuccess, onError, onMutate } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutateAsync = useCallback(
    async (data?: any): Promise<T> => {
      try {
        onMutate?.();
        setIsLoading(true);
        setIsError(false);
        setIsSuccess(false);

        const response = await axios({
          method,
          url,
          data,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = response.data.data || response.data;
        setIsSuccess(true);
        onSuccess?.(result);
        return result;
      } catch (err) {
        ErrorLogger.log(err, { method, url });
        setError(err);
        setIsError(true);
        onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [method, url, onSuccess, onError, onMutate]
  );

  const mutate = useCallback(
    (data?: any) => {
      return mutateAsync(data);
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Hook for form state management
 */
export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
      setIsDirty(true);
    },
    []
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    []
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isDirty,
    handleChange,
    handleBlur,
    setFieldError,
    setFieldValue,
    reset,
  };
}
