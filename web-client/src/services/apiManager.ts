import { logger } from '../utils/logger';
import { clearCache } from './api';

// API调用状态枚举
export enum ApiCallStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// API调用状态接口
export interface ApiCallState<T = any> {
  status: ApiCallStatus;
  data: T | null;
  error: string | null;
  lastUpdated: number | null;
}

// API管理器类
export class ApiManager {
  private static instance: ApiManager;
  private callStates: Map<string, ApiCallState> = new Map();
  private retryQueues: Map<
    string,
    { count: number; maxRetries: number; delay: number }
  > = new Map();
  private listeners: Map<string, Set<(state: ApiCallState) => void>> =
    new Map();

  private constructor() {}

  // 获取单例实例
  static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  // 注册API调用状态监听器
  subscribe(key: string, listener: (state: ApiCallState) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // 立即调用一次监听器，传递当前状态
    const currentState = this.getCallState(key);
    listener(currentState);

    // 返回取消订阅函数
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // 获取API调用状态
  getCallState(key: string): ApiCallState {
    return (
      this.callStates.get(key) || {
        status: ApiCallStatus.IDLE,
        data: null,
        error: null,
        lastUpdated: null,
      }
    );
  }

  // 设置API调用状态
  private setCallState(key: string, state: Partial<ApiCallState>): void {
    const currentState = this.getCallState(key);
    const newState: ApiCallState = {
      ...currentState,
      ...state,
      lastUpdated: Date.now(),
    };

    this.callStates.set(key, newState);

    // 通知所有监听器
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener(newState));
    }

    logger.debug(`API State Updated: ${key}`, newState, 'API_MANAGER');
  }

  // 执行API调用并管理状态
  async executeCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    options?: {
      skipLoading?: boolean;
      maxRetries?: number;
      retryDelay?: number;
      onSuccess?: (data: unknown) => void;
      onError?: (error: any) => void;
    }
  ): Promise<T> {
    const {
      skipLoading = false,
      maxRetries = 3,
      retryDelay = 1000,
      onSuccess,
      onError,
    } = options || {};

    // 检查是否已经在加载中
    const currentState = this.getCallState(key);
    if (currentState.status === ApiCallStatus.LOADING) {
      throw new Error(`API call ${key} is already in progress`);
    }

    // 设置加载状态
    if (!skipLoading) {
      this.setCallState(key, {
        status: ApiCallStatus.LOADING,
        error: null,
      });
    }

    // 初始化重试队列
    this.retryQueues.set(key, {
      count: 0,
      maxRetries,
      delay: retryDelay,
    });

    try {
      const data = await this.executeWithRetry(key, apiCall);

      // 设置成功状态
      this.setCallState(key, {
        status: ApiCallStatus.SUCCESS,
        data,
        error: null,
      });

      // 清除重试队列
      this.retryQueues.delete(key);

      // 调用成功回调
      if (onSuccess) {
        onSuccess(data);
      }

      logger.debug(`API Call Success: ${key}`, data, 'API_MANAGER');
      return data;
    } catch (error: any) {
      // 设置错误状态
      const errorMessage = this.extractErrorMessage(error);
      this.setCallState(key, {
        status: ApiCallStatus.ERROR,
        error: errorMessage,
      });

      // 清除重试队列
      this.retryQueues.delete(key);

      // 调用错误回调
      if (onError) {
        onError(error);
      }

      logger.error(`API Call Failed: ${key}`, error, 'API_MANAGER');
      throw error;
    }
  }

  // 带重试机制的API调用执行
  private async executeWithRetry<T>(
    key: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const retryQueue = this.retryQueues.get(key);
    if (!retryQueue) {
      throw new Error(`No retry queue found for ${key}`);
    }

    try {
      return await apiCall();
    } catch (error: any) {
      retryQueue.count++;

      // 检查是否应该重试
      if (
        retryQueue.count <= retryQueue.maxRetries &&
        this.shouldRetry(error)
      ) {
        logger.warn(
          `API Call Retry ${retryQueue.count}/${retryQueue.maxRetries}: ${key}`,
          error,
          'API_MANAGER'
        );

        // 计算退避延迟
        const delay = retryQueue.delay * Math.pow(2, retryQueue.count - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        // 递归重试
        return this.executeWithRetry(key, apiCall);
      }

      // 达到最大重试次数或不应该重试的错误
      throw error;
    }
  }

  // 判断是否应该重试
  private shouldRetry(error: any): boolean {
    // 网络错误或5xx服务器错误应该重试
    if (!error.response) {
      return true; // 网络错误
    }

    const status = error.response.status;
    return status >= 500; // 服务器错误
  }

  // 提取错误消息
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }

  // 取消API调用
  cancelCall(key: string): void {
    const currentState = this.getCallState(key);
    if (currentState.status === ApiCallStatus.LOADING) {
      this.setCallState(key, {
        status: ApiCallStatus.IDLE,
        error: 'Request cancelled',
      });

      // 清除重试队列
      this.retryQueues.delete(key);

      logger.debug(`API Call Cancelled: ${key}`, undefined, 'API_MANAGER');
    }
  }

  // 重置API调用状态
  resetCall(key: string): void {
    this.setCallState(key, {
      status: ApiCallStatus.IDLE,
      data: null,
      error: null,
      lastUpdated: null,
    });

    // 清除重试队列
    this.retryQueues.delete(key);

    logger.debug(`API State Reset: ${key}`, undefined, 'API_MANAGER');
  }

  // 批量重置
  resetMultipleCalls(keys: string[]): void {
    keys.forEach(key => this.resetCall(key));
  }

  // 重置所有调用状态
  resetAllCalls(): void {
    this.callStates.clear();
    this.retryQueues.clear();
    logger.debug('All API States Reset', undefined, 'API_MANAGER');
  }

  // 刷新API调用（清除缓存并重新调用）
  async refreshCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    options?: {
      skipLoading?: boolean;
      maxRetries?: number;
      retryDelay?: number;
      onSuccess?: (data: unknown) => void;
      onError?: (error: any) => void;
    }
  ): Promise<T> {
    // 清除相关缓存
    clearCache(key);

    // 重置状态
    this.resetCall(key);

    // 重新执行调用
    return this.executeCall(key, apiCall, options);
  }

  // 获取所有加载中的API调用
  getLoadingCalls(): string[] {
    const loadingCalls: string[] = [];
    this.callStates.forEach((state, key) => {
      if (state.status === ApiCallStatus.LOADING) {
        loadingCalls.push(key);
      }
    });
    return loadingCalls;
  }

  // 获取所有错误状态的API调用
  getErrorCalls(): Array<{ key: string; error: string }> {
    const errorCalls: Array<{ key: string; error: string }> = [];
    this.callStates.forEach((state, key) => {
      if (state.status === ApiCallStatus.ERROR && state.error) {
        errorCalls.push({ key, error: state.error });
      }
    });
    return errorCalls;
  }

  // 重试所有失败的API调用
  async retryFailedCalls(
    apiCallMap: Map<string, () => Promise<any>>
  ): Promise<void> {
    const errorCalls = this.getErrorCalls();
    const retryPromises = errorCalls.map(({ key }) => {
      const apiCall = apiCallMap.get(key);
      if (apiCall) {
        return this.executeCall(key, apiCall).catch(error => {
          logger.warn(`Retry failed for ${key}`, error, 'API_MANAGER');
        });
      }
      return Promise.resolve();
    });

    await Promise.allSettled(retryPromises);
  }

  // 获取统计信息
  getStats(): {
    total: number;
    idle: number;
    loading: number;
    success: number;
    error: number;
  } {
    const stats = {
      total: this.callStates.size,
      idle: 0,
      loading: 0,
      success: 0,
      error: 0,
    };

    this.callStates.forEach(state => {
      switch (state.status) {
        case ApiCallStatus.IDLE:
          stats.idle++;
          break;
        case ApiCallStatus.LOADING:
          stats.loading++;
          break;
        case ApiCallStatus.SUCCESS:
          stats.success++;
          break;
        case ApiCallStatus.ERROR:
          stats.error++;
          break;
      }
    });

    return stats;
  }
}

// 导出单例实例
export const apiManager = ApiManager.getInstance();

// 导出便捷的Hook接口用于React组件
export const useApiCall = <T>(
  key: string,
  apiCall: () => Promise<T>,
  options?: {
    immediate?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    onSuccess?: (data: unknown) => void;
    onError?: (error: any) => void;
  }
) => {
  const { immediate = false, ...executeOptions } = options || {};

  // 这里应该在实际的React Hook中实现
  // 这只是类型定义，实际实现需要在React组件中使用
  const execute = () => apiManager.executeCall(key, apiCall, executeOptions);
  const cancel = () => apiManager.cancelCall(key);
  const reset = () => apiManager.resetCall(key);
  const refresh = () => apiManager.refreshCall(key, apiCall, executeOptions);

  return {
    execute,
    cancel,
    reset,
    refresh,
    state: apiManager.getCallState(key),
  };
};

export default apiManager;
