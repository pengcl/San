import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// API基础配置
const API_BASE_URL = config.apiBaseUrl;
const API_TIMEOUT = 10000;

// 创建axios实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 添加认证token
    const token =
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求时间戳
    config.metadata = { startTime: new Date() };

    logger.apiRequest(config.method || 'GET', config.url || '', config.data);
    return config;
  },
  error => {
    logger.error('Request Error', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 计算请求耗时
    const endTime = new Date();
    const duration =
      endTime.getTime() - (response.config.metadata?.startTime?.getTime() || 0);

    logger.apiResponse(
      response.config.method || 'GET',
      response.config.url || '',
      response.status,
      duration
    );

    return response;
  },
  error => {
    const { response, request, config } = error;

    if (response) {
      // 服务器响应了错误状态码
      logger.apiError(config?.method || 'GET', config?.url || '', {
        status: response.status,
        data: response.data,
      });

      // 处理特定错误状态码
      switch (response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
        case 403:
          logger.warn('Access forbidden', response.data);
          break;
        case 404:
          logger.warn('Resource not found', { url: config?.url });
          break;
        case 500:
          logger.error('Internal server error', response.data);
          break;
        default:
          logger.error('Unknown API error occurred', response.data);
      }
    } else if (request) {
      logger.error('Network Error: No response received', { url: config?.url });
    } else {
      logger.error('Request Setup Error', error.message);
    }

    return Promise.reject(error);
  }
);

// 通用API请求方法
export class ApiService {
  // GET请求
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  }

  // POST请求
  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  }

  // PUT请求
  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  }

  // PATCH请求
  static async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  }

  // DELETE请求
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  }

  // 文件上传
  static async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('files', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };

    const response = await apiClient.post<T>(url, formData, config);
    return response.data;
  }

  // 批量请求
  static async batch<T>(requests: Promise<any>[]): Promise<T[]> {
    const responses = await Promise.allSettled(requests);
    return responses.map(response => {
      if (response.status === 'fulfilled') {
        return response.value;
      } else {
        throw response.reason;
      }
    });
  }
}

// API错误处理工具
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 重试机制
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // 如果是最后一次重试或者是不应该重试的错误，直接抛出
      if (i === maxRetries || error.response?.status < 500) {
        throw error;
      }

      // 等待指定时间后重试
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
};

// 缓存机制
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const withCache = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 默认5分钟
): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();

  // 如果缓存存在且未过期，返回缓存数据
  if (cached && now - cached.timestamp < cached.ttl) {
    logger.debug(`Cache Hit: ${key}`, undefined, 'CACHE');
    return cached.data;
  }

  // 调用API获取新数据
  const data = await apiCall();

  // 缓存新数据
  cache.set(key, { data, timestamp: now, ttl });
  logger.debug(`Cache Set: ${key}`, undefined, 'CACHE');

  return data;
};

// 清除缓存
export const clearCache = (key?: string) => {
  if (key) {
    cache.delete(key);
    logger.debug(`Cache Cleared: ${key}`, undefined, 'CACHE');
  } else {
    cache.clear();
    logger.debug('All Cache Cleared', undefined, 'CACHE');
  }
};

export default ApiService;
