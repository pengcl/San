import { useEffect, useCallback, useRef, useState } from 'react';
import {
  apiManager,
  ApiCallStatus,
  type ApiCallState,
} from '../services/apiManager';

export interface UseApiOptions<T> {
  immediate?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  deps?: React.DependencyList;
}

export interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  status: ApiCallStatus;
  lastUpdated: number | null;
  execute: () => Promise<T>;
  cancel: () => void;
  reset: () => void;
  refresh: () => Promise<T>;
}

// 主要的API Hook
export function useApi<T>(
  key: string,
  apiCall: () => Promise<T>,
  options?: UseApiOptions<T>
): UseApiReturn<T> {
  const {
    immediate = false,
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    deps = [],
  } = options || {};

  const [state, setState] = useState<ApiCallState<T>>(() =>
    apiManager.getCallState(key)
  );
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const apiCallRef = useRef(apiCall);

  // 更新refs
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  apiCallRef.current = apiCall;

  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = apiManager.subscribe(key, newState => {
      setState(newState as ApiCallState<T>);
    });

    return unsubscribe;
  }, [key]);

  // 执行API调用
  const execute = useCallback(async (): Promise<T> => {
    return apiManager.executeCall(key, apiCallRef.current, {
      maxRetries,
      retryDelay,
      onSuccess: onSuccessRef.current
        ? (data: unknown) => onSuccessRef.current!(data as T)
        : undefined,
      onError: onErrorRef.current,
    });
  }, [key, maxRetries, retryDelay]);

  // 取消API调用
  const cancel = useCallback(() => {
    apiManager.cancelCall(key);
  }, [key]);

  // 重置状态
  const reset = useCallback(() => {
    apiManager.resetCall(key);
  }, [key]);

  // 刷新数据
  const refresh = useCallback(async (): Promise<T> => {
    return apiManager.refreshCall(key, apiCallRef.current, {
      maxRetries,
      retryDelay,
      onSuccess: onSuccessRef.current
        ? (data: unknown) => onSuccessRef.current!(data as T)
        : undefined,
      onError: onErrorRef.current,
    });
  }, [key, maxRetries, retryDelay]);

  // 自动执行
  useEffect(() => {
    if (immediate) {
      execute().catch(() => {
        // 错误已经在apiManager中处理
      });
    }
  }, [execute, immediate, ...deps]);

  return {
    data: state.data,
    error: state.error,
    loading: state.status === ApiCallStatus.LOADING,
    status: state.status,
    lastUpdated: state.lastUpdated,
    execute,
    cancel,
    reset,
    refresh,
  };
}

// 专门用于分页数据的Hook
export function usePaginatedApi<T>(
  key: string,
  apiCall: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options?: UseApiOptions<{
    data: T[];
    total: number;
    page: number;
    limit: number;
  }> & {
    initialPage?: number;
    initialLimit?: number;
  }
) {
  const { initialPage = 1, initialLimit = 20, ...apiOptions } = options || {};
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const paginatedKey = `${key}-page-${page}-limit-${limit}`;
  const paginatedApiCall = useCallback(
    () => apiCall(page, limit),
    [apiCall, page, limit]
  );

  const api = useApi(paginatedKey, paginatedApiCall, {
    ...apiOptions,
    deps: [page, limit, ...(apiOptions.deps || [])],
  });

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // 重置到第一页
  }, []);

  const nextPage = useCallback(() => {
    if (api.data && page < Math.ceil(api.data.total / limit)) {
      setPage(prev => prev + 1);
    }
  }, [api.data, page, limit]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  return {
    ...api,
    page,
    limit,
    totalPages: api.data ? Math.ceil(api.data.total / limit) : 0,
    hasNextPage: api.data ? page < Math.ceil(api.data.total / limit) : false,
    hasPrevPage: page > 1,
    goToPage,
    changeLimit,
    nextPage,
    prevPage,
  };
}

// 用于搜索的Hook，包含防抖
export function useSearchApi<T>(
  key: string,
  searchApiCall: (query: string) => Promise<T>,
  options?: UseApiOptions<T> & {
    debounceMs?: number;
    minQueryLength?: number;
  }
) {
  const { debounceMs = 300, minQueryLength = 1, ...apiOptions } = options || {};
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const searchKey = `${key}-search-${debouncedQuery}`;
  const searchCall = useCallback(
    () => searchApiCall(debouncedQuery),
    [searchApiCall, debouncedQuery]
  );

  const api = useApi(searchKey, searchCall, {
    ...apiOptions,
    immediate: debouncedQuery.length >= minQueryLength,
    deps: [debouncedQuery, ...(apiOptions.deps || [])],
  });

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    api.reset();
  }, [api]);

  return {
    ...api,
    query,
    debouncedQuery,
    search,
    clearSearch,
    isSearching: debouncedQuery.length >= minQueryLength && api.loading,
  };
}

// 用于无限滚动的Hook
export function useInfiniteApi<T>(
  key: string,
  apiCall: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; hasMore: boolean; nextPage?: number }>,
  options?: UseApiOptions<{ allData: T[]; hasMore: boolean }> & {
    limit?: number;
  }
) {
  const { limit = 20, ...apiOptions } = options || {};
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const infiniteKey = `${key}-infinite`;
  const infiniteApiCall = useCallback(async () => {
    const result = await apiCall(page, limit);

    if (page === 1) {
      setAllData(result.data);
    } else {
      setAllData(prev => [...prev, ...result.data]);
    }

    setHasMore(result.hasMore);

    return { allData: allData.concat(result.data), hasMore: result.hasMore };
  }, [apiCall, page, limit, allData]);

  const api = useApi(infiniteKey, infiniteApiCall, {
    ...apiOptions,
    deps: [page, ...(apiOptions.deps || [])],
  });

  const loadMore = useCallback(() => {
    if (hasMore && !api.loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, api.loading]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    api.reset();
  }, [api]);

  const refresh = useCallback(async () => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    return api.refresh();
  }, [api]);

  return {
    ...api,
    data: { allData, hasMore },
    loadMore,
    reset,
    refresh,
    canLoadMore: hasMore && !api.loading,
  };
}

// 用于实时数据的Hook，支持轮询
export function usePollingApi<T>(
  key: string,
  apiCall: () => Promise<T>,
  options?: UseApiOptions<T> & {
    interval?: number;
    enabled?: boolean;
  }
) {
  const { interval = 5000, enabled = true, ...apiOptions } = options || {};
  const intervalRef = useRef<number | undefined>(undefined);

  const api = useApi(key, apiCall, {
    ...apiOptions,
    immediate: enabled,
  });

  // 设置轮询
  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = window.setInterval(() => {
        if (!api.loading) {
          api.execute().catch(() => {
            // 错误已经在apiManager中处理
          });
        }
      }, interval);

      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, interval, api.execute, api.loading]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, []);

  const startPolling = useCallback(() => {
    if (!intervalRef.current && interval > 0) {
      intervalRef.current = window.setInterval(() => {
        if (!api.loading) {
          api.execute().catch(() => {
            // 错误已经在apiManager中处理
          });
        }
      }, interval);
    }
  }, [interval, api.execute, api.loading]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  return {
    ...api,
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current,
  };
}

export default useApi;
