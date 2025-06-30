// Environment configuration utilities

export interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  wsUrl: string;
  env: string;

  // Application Info
  appName: string;
  appVersion: string;
  appDescription: string;

  // Feature Flags
  enableDevtools: boolean;
  enableMockData: boolean;
  enableSound: boolean;
  enableAnalytics: boolean;
  enableWebSocket: boolean;

  // Debug Configuration
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Optional Services
  cdnUrl?: string;
  staticUrl?: string;
  googleAnalyticsId?: string;
  sentryDsn?: string;
}

// Get environment variable with fallback
const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

// Get boolean environment variable
const getBooleanEnvVar = (key: string, fallback: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

// Application configuration
export const config: AppConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:1337/api'),
  wsUrl: getEnvVar('VITE_WS_URL', 'ws://localhost:1337'),
  env: getEnvVar('VITE_APP_ENV', 'development'),

  // Application Info
  appName: getEnvVar('VITE_APP_NAME', '三国志卡牌'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', '征战沙场，统一天下'),

  // Feature Flags
  enableDevtools: getBooleanEnvVar('VITE_ENABLE_DEVTOOLS', true),
  enableMockData: getBooleanEnvVar('VITE_ENABLE_MOCK_DATA', true),
  enableSound: getBooleanEnvVar('VITE_ENABLE_SOUND', true),
  enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  enableWebSocket: getBooleanEnvVar('VITE_ENABLE_WEBSOCKET', false),

  // Debug Configuration
  debugMode: getBooleanEnvVar('VITE_DEBUG_MODE', true),
  logLevel: getEnvVar('VITE_LOG_LEVEL', 'debug') as AppConfig['logLevel'],

  // Optional Services
  cdnUrl: getEnvVar('VITE_CDN_URL'),
  staticUrl: getEnvVar('VITE_STATIC_URL'),
  googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
};

// Environment checks
export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
export const isTest = config.env === 'test';

// Validation
export const validateConfig = (): void => {
  const required = ['apiBaseUrl', 'wsUrl', 'appName', 'appVersion'];

  const missing = required.filter(key => !config[key as keyof AppConfig]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Validate URLs
  try {
    new URL(config.apiBaseUrl);
    new URL(config.wsUrl);
  } catch (error) {
    throw new Error('Invalid URL configuration');
  }
};

// Initialize and validate configuration
try {
  validateConfig();
  if (config.debugMode) {
    console.log('🔧 Application Configuration:', config);
    console.log('🔗 WebSocket URL:', config.wsUrl);
    console.log('📡 WebSocket Enabled:', config.enableWebSocket);
  }
} catch (error) {
  console.error('❌ Configuration Error:', error);
  throw error;
}

export default config;
