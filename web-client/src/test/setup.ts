// 测试环境设置
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => 
      require('react').createElement('div', props, children),
    button: ({ children, ...props }: any) => 
      require('react').createElement('button', props, children),
    span: ({ children, ...props }: any) => 
      require('react').createElement('span', props, children),
    img: ({ children, ...props }: any) => 
      require('react').createElement('img', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
}));

// Mock Intersection Observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor() {}
  close() {}
  send() {}
  readyState = 1;
  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;
};

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn().mockResolvedValue({}),
    getRegistration: jest.fn().mockResolvedValue({}),
    ready: Promise.resolve({}),
  },
  writable: true,
});

// Mock Notification
Object.defineProperty(global, 'Notification', {
  value: class Notification {
    constructor() {}
    static permission = 'granted';
    static requestPermission = jest.fn().mockResolvedValue('granted');
  },
  writable: true,
});

// Mock PushManager
Object.defineProperty(global, 'PushManager', {
  value: class PushManager {
    subscribe = jest.fn().mockResolvedValue({});
    getSubscription = jest.fn().mockResolvedValue(null);
  },
  writable: true,
});

// Mock crypto for PWA
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => arr,
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      generateKey: jest.fn(),
    },
  },
});

// 清理函数
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear.mockClear();
  sessionStorageMock.clear.mockClear();
});