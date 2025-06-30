import { useState, useEffect, useCallback, useRef } from 'react';
import {
  gameStorage,
  cacheManager,
  settingsManager,
  storageListener,
} from '../utils/storage';

// 使用本地存储的Hook
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    encrypt?: boolean;
    compress?: boolean;
    ttl?: number;
  } = {}
) {
  const [value, setValue] = useState<T>(() => {
    const stored = gameStorage.get<T>(key);
    return stored !== null ? stored : defaultValue;
  });

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      setValue(valueToStore);
      gameStorage.set(key, valueToStore, options);
      storageListener.emit(key, valueToStore);
    },
    [key, value, options]
  );

  const removeValue = useCallback(() => {
    setValue(defaultValue);
    gameStorage.remove(key);
    storageListener.emit(key, null);
  }, [key, defaultValue]);

  // 监听存储变化
  useEffect(() => {
    const unsubscribe = storageListener.on(key, newValue => {
      setValue(newValue !== null ? newValue : defaultValue);
    });

    return unsubscribe;
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue] as const;
}

// 使用用户令牌的Hook
export function useUserToken() {
  const [token, setToken] = useState<string | null>(() =>
    gameStorage.getUserToken()
  );

  const saveToken = useCallback((newToken: string) => {
    setToken(newToken);
    gameStorage.saveUserToken(newToken);
    storageListener.emit('userToken', newToken);
  }, []);

  const clearToken = useCallback(() => {
    setToken(null);
    gameStorage.remove('game_user_token');
    storageListener.emit('userToken', null);
  }, []);

  // 监听令牌变化
  useEffect(() => {
    const unsubscribe = storageListener.on('userToken', newToken => {
      setToken(newToken);
    });

    return unsubscribe;
  }, []);

  return { token, saveToken, clearToken };
}

// 使用用户配置的Hook
export function useUserProfile() {
  const [profile, setProfile] = useState<any>(() =>
    gameStorage.getUserProfile()
  );

  const saveProfile = useCallback((newProfile: any) => {
    setProfile(newProfile);
    gameStorage.saveUserProfile(newProfile);
    storageListener.emit('userProfile', newProfile);
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    gameStorage.remove('game_user_profile');
    storageListener.emit('userProfile', null);
  }, []);

  // 监听配置变化
  useEffect(() => {
    const unsubscribe = storageListener.on('userProfile', newProfile => {
      setProfile(newProfile);
    });

    return unsubscribe;
  }, []);

  return { profile, saveProfile, clearProfile };
}

// 使用游戏状态的Hook
export function useGameState() {
  const [gameState, setGameState] = useState<any>(() =>
    gameStorage.getGameState()
  );

  const saveGameState = useCallback((newState: any) => {
    setGameState(newState);
    gameStorage.saveGameState(newState);
    storageListener.emit('gameState', newState);
  }, []);

  const updateGameState = useCallback(
    (updater: (prev: any) => any) => {
      const newState = updater(gameState || {});
      saveGameState(newState);
    },
    [gameState, saveGameState]
  );

  const clearGameState = useCallback(() => {
    setGameState(null);
    gameStorage.remove('game_state');
    storageListener.emit('gameState', null);
  }, []);

  // 监听游戏状态变化
  useEffect(() => {
    const unsubscribe = storageListener.on('gameState', newState => {
      setGameState(newState);
    });

    return unsubscribe;
  }, []);

  return { gameState, saveGameState, updateGameState, clearGameState };
}

// 使用应用设置的Hook
export function useAppSettings() {
  const [settings, setSettings] = useState(() =>
    settingsManager.getAppSettings()
  );

  const updateSettings = useCallback(
    (newSettings: Partial<any>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      settingsManager.saveAppSettings(updatedSettings);
      storageListener.emit('appSettings', updatedSettings);
    },
    [settings]
  );

  const resetSettings = useCallback(() => {
    const defaultSettings = {
      theme: 'dark',
      language: 'zh-CN',
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      autoSave: true,
    };
    setSettings(defaultSettings);
    settingsManager.saveAppSettings(defaultSettings);
    storageListener.emit('appSettings', defaultSettings);
  }, []);

  // 监听设置变化
  useEffect(() => {
    const unsubscribe = storageListener.on('appSettings', newSettings => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  return { settings, updateSettings, resetSettings };
}

// 使用缓存的Hook
export function useCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleWhileRevalidate?: boolean;
    revalidateOnFocus?: boolean;
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 默认5分钟
    staleWhileRevalidate = true,
    revalidateOnFocus = true,
  } = options;

  const [data, setData] = useState<T | null>(() =>
    cacheManager.getApiCache(cacheKey)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);

  // 更新fetcher引用
  fetcherRef.current = fetcher;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // 如果有缓存且不是强制刷新，先使用缓存
        if (!forceRefresh) {
          const cached = cacheManager.getApiCache(cacheKey);
          if (cached !== null) {
            setData(cached);
            if (!staleWhileRevalidate) {
              setLoading(false);
              return cached;
            }
          }
        }

        // 获取新数据
        const newData = await fetcherRef.current();

        if (!mountedRef.current) return;

        setData(newData);
        cacheManager.setApiCache(cacheKey, newData, ttl);
        storageListener.emit(cacheKey, newData);

        return newData;
      } catch (err) {
        if (!mountedRef.current) return;

        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error(`Cache fetch error for ${cacheKey}:`, error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [cacheKey, ttl, staleWhileRevalidate]
  );

  const invalidate = useCallback(() => {
    cacheManager.remove(`api_${cacheKey.replace(/[^a-zA-Z0-9]/g, '_')}`);
    fetchData(true);
  }, [cacheKey, fetchData]);

  // 初始加载
  useEffect(() => {
    if (data === null) {
      fetchData();
    }
  }, [fetchData, data]);

  // 页面焦点重新验证
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (staleWhileRevalidate) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, revalidateOnFocus, staleWhileRevalidate]);

  // 监听缓存变化
  useEffect(() => {
    const unsubscribe = storageListener.on(cacheKey, newData => {
      setData(newData);
    });

    return unsubscribe;
  }, [cacheKey]);

  // 清理
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate,
  };
}

// 使用持久化状态的Hook
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options: {
    syncAcrossTabs?: boolean;
    debounceMs?: number;
  } = {}
) {
  const { syncAcrossTabs = true, debounceMs = 0 } = options;
  const [state, setState, removeState] = useLocalStorage(key, defaultValue);
  const timeoutRef = useRef<number | null>(null);

  const debouncedSetState = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      if (debounceMs > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          setState(newValue);
        }, debounceMs) as unknown as number;
      } else {
        setState(newValue);
      }
    },
    [setState, debounceMs]
  );

  // 跨标签页同步
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `three_kingdoms_game_${key}` && event.newValue) {
        try {
          const item = JSON.parse(event.newValue);
          setState(item.value);
        } catch (error) {
          console.error('Storage sync error:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, setState, syncAcrossTabs]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, debouncedSetState, removeState] as const;
}

// 使用存储状态的Hook
export function useStorageState() {
  const [usage, setUsage] = useState(() => gameStorage.getUsage());

  const updateUsage = useCallback(() => {
    setUsage(gameStorage.getUsage());
  }, []);

  // 定期更新使用情况
  useEffect(() => {
    const interval = setInterval(updateUsage, 10000); // 每10秒更新
    return () => clearInterval(interval);
  }, [updateUsage]);

  const clearUserData = useCallback(() => {
    gameStorage.clearUserData();
    updateUsage();
  }, [updateUsage]);

  const clearCache = useCallback(() => {
    const cleared = cacheManager.clearExpiredCache();
    updateUsage();
    return cleared;
  }, [updateUsage]);

  return {
    usage,
    updateUsage,
    clearUserData,
    clearCache,
    isLowSpace: usage.available < 1024 * 1024, // 小于1MB
  };
}
