import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../store/slices/authSlice';
import { uiSlice } from '../store/slices/uiSlice';
import { gameSlice } from '../store/slices/gameSlice';

// 测试用的Store配置
export const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
      game: gameSlice.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// 默认的初始状态
export const defaultTestState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  ui: {
    theme: 'dark',
    screenSize: { width: 1920, height: 1080 },
    isMobile: false,
    sidebarOpen: true,
    notifications: [],
    loading: false,
  },
  game: {
    heroes: [],
    inventory: { items: [], equipment: [] },
    formation: { positions: [] },
    battle: { currentBattle: null, history: [] },
    city: { buildings: [], resources: {} },
    player: {
      id: '1',
      username: 'testuser',
      level: 1,
      experience: 0,
      gold: 1000,
      gems: 100,
    },
  },
};

// 自定义渲染函数
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
  withRouter?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore({ ...defaultTestState, ...preloadedState }),
    withRouter = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const content = <Provider store={store}>{children}</Provider>;
    
    if (withRouter) {
      return <BrowserRouter>{content}</BrowserRouter>;
    }
    
    return content;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// 模拟用户数据
export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  level: 10,
  experience: 2500,
  gold: 5000,
  gems: 250,
  avatar: 'avatar1.png',
  createdAt: '2024-01-01T00:00:00Z',
  lastLogin: '2024-01-15T10:30:00Z',
};

// 模拟英雄数据
export const mockHeroes = [
  {
    id: 1,
    name: '关羽',
    title: '武圣',
    rarity: 'legendary' as const,
    level: 30,
    stars: 5,
    experience: 15000,
    health: 2800,
    attack: 450,
    defense: 380,
    speed: 320,
    skills: [
      { id: 1, name: '青龙偃月', level: 5, type: 'active' },
      { id: 2, name: '义薄云天', level: 3, type: 'passive' },
    ],
    equipment: {
      weapon: { id: 1, name: '青龙偃月刀', level: 10 },
      armor: { id: 2, name: '虎胆甲', level: 8 },
    },
    faction: '蜀',
    position: 'front',
    isLocked: false,
    obtainedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '诸葛亮',
    title: '卧龙',
    rarity: 'legendary' as const,
    level: 25,
    stars: 4,
    experience: 8000,
    health: 1800,
    attack: 380,
    defense: 250,
    speed: 420,
    skills: [
      { id: 3, name: '八卦阵', level: 4, type: 'active' },
      { id: 4, name: '智谋', level: 5, type: 'passive' },
    ],
    equipment: {
      weapon: { id: 3, name: '羽扇', level: 12 },
      armor: { id: 4, name: '道袍', level: 6 },
    },
    faction: '蜀',
    position: 'back',
    isLocked: false,
    obtainedAt: '2024-01-02T00:00:00Z',
  },
];

// 模拟物品数据
export const mockItems = [
  {
    id: 1,
    name: '生命药水',
    type: 'consumable' as const,
    rarity: 'common' as const,
    description: '恢复500点生命值',
    quantity: 10,
    icon: 'potion_health.png',
    effects: [{ type: 'heal', value: 500 }],
  },
  {
    id: 2,
    name: '经验书',
    type: 'consumable' as const,
    rarity: 'rare' as const,
    description: '增加1000点经验值',
    quantity: 5,
    icon: 'book_exp.png',
    effects: [{ type: 'experience', value: 1000 }],
  },
];

// 模拟装备数据
export const mockEquipment = [
  {
    id: 1,
    name: '青龙偃月刀',
    type: 'weapon' as const,
    rarity: 'legendary' as const,
    level: 10,
    description: '关羽的专属武器',
    stats: {
      attack: 120,
      criticalRate: 15,
      criticalDamage: 30,
    },
    requirements: {
      level: 20,
      faction: '蜀',
    },
    icon: 'weapon_guan_yu.png',
    isEquipped: true,
    equippedBy: 1,
  },
];

// 测试工具函数
export const mockApiResponse = <T>(data: T, delay = 100) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message = 'API Error', status = 500, delay = 100) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error = new Error(message);
      (error as any).status = status;
      reject(error);
    }, delay);
  });
};

// 事件模拟器
export const fireCustomEvent = (type: string, detail?: any) => {
  const event = new CustomEvent(type, { detail });
  window.dispatchEvent(event);
};

// 等待工具
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟触摸事件
export const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  return new TouchEvent(type, {
    touches: touches.map(touch => ({
      ...touch,
      identifier: 0,
      target: document.body,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
      pageX: touch.clientX,
      pageY: touch.clientY,
      screenX: touch.clientX,
      screenY: touch.clientY,
    })) as any,
  });
};

// 模拟网络状态
export const mockNetworkStatus = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: online,
  });
  
  const event = new Event(online ? 'online' : 'offline');
  window.dispatchEvent(event);
};

// 模拟设备方向
export const mockDeviceOrientation = (orientation: 'portrait' | 'landscape') => {
  Object.defineProperty(screen, 'orientation', {
    value: {
      type: orientation === 'portrait' ? 'portrait-primary' : 'landscape-primary',
      angle: orientation === 'portrait' ? 0 : 90,
    },
  });
  
  const event = new Event('orientationchange');
  window.dispatchEvent(event);
};

// 清理测试环境
export const cleanupTest = () => {
  // 清理所有定时器
  jest.clearAllTimers();
  
  // 清理本地存储
  localStorage.clear();
  sessionStorage.clear();
  
  // 重置网络状态
  mockNetworkStatus(true);
  
  // 重置设备方向
  mockDeviceOrientation('portrait');
};