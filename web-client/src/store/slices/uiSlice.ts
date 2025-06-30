import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../types';

interface UIState {
  // 主题和外观
  theme: 'light' | 'dark';
  language: 'zh' | 'en';

  // 音频设置
  audio: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    effectsEnabled: boolean;
    masterVolume: number;
    soundVolume: number;
    musicVolume: number;
    effectsVolume: number;
  };

  // 通知系统
  notifications: Notification[];

  // 模态框状态
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };

  // 加载状态
  loading: {
    global: boolean;
    components: { [key: string]: boolean };
  };

  // 侧边栏和导航
  sidebar: {
    isOpen: boolean;
    activeTab: string;
  };

  // 游戏设置
  gameSettings: {
    autoSave: boolean;
    autoSaveInterval: number;
    showDamageNumbers: boolean;
    showHealingNumbers: boolean;
    animationSpeed: number;
    skipAnimations: boolean;
    confirmActions: boolean;
  };

  // 屏幕状态
  screen: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    orientation: 'portrait' | 'landscape';
  };
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  language: (localStorage.getItem('language') as 'zh' | 'en') || 'zh',

  audio: {
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    musicEnabled: localStorage.getItem('musicEnabled') !== 'false',
    effectsEnabled: localStorage.getItem('effectsEnabled') !== 'false',
    masterVolume: parseFloat(localStorage.getItem('masterVolume') || '1'),
    soundVolume: parseFloat(localStorage.getItem('soundVolume') || '1'),
    musicVolume: parseFloat(localStorage.getItem('musicVolume') || '0.7'),
    effectsVolume: parseFloat(localStorage.getItem('effectsVolume') || '0.8'),
  },

  notifications: [],

  modals: {},

  loading: {
    global: false,
    components: {},
  },

  sidebar: {
    isOpen: false,
    activeTab: 'heroes',
  },

  gameSettings: {
    autoSave: localStorage.getItem('autoSave') !== 'false',
    autoSaveInterval: parseInt(
      localStorage.getItem('autoSaveInterval') || '30000'
    ),
    showDamageNumbers: localStorage.getItem('showDamageNumbers') !== 'false',
    showHealingNumbers: localStorage.getItem('showHealingNumbers') !== 'false',
    animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || '1'),
    skipAnimations: localStorage.getItem('skipAnimations') === 'true',
    confirmActions: localStorage.getItem('confirmActions') !== 'false',
  },

  screen: {
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    orientation:
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 主题和语言
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action: PayloadAction<'zh' | 'en'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },

    // 音频设置
    setAudioSettings: (
      state,
      action: PayloadAction<Partial<UIState['audio']>>
    ) => {
      state.audio = { ...state.audio, ...action.payload };
      // 保存到localStorage
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
      });
    },
    toggleSound: state => {
      state.audio.soundEnabled = !state.audio.soundEnabled;
      localStorage.setItem('soundEnabled', state.audio.soundEnabled.toString());
    },
    toggleMusic: state => {
      state.audio.musicEnabled = !state.audio.musicEnabled;
      localStorage.setItem('musicEnabled', state.audio.musicEnabled.toString());
    },
    toggleEffects: state => {
      state.audio.effectsEnabled = !state.audio.effectsEnabled;
      localStorage.setItem(
        'effectsEnabled',
        state.audio.effectsEnabled.toString()
      );
    },

    // 通知系统
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },
    clearNotifications: state => {
      state.notifications = [];
    },

    // 模态框管理
    openModal: (state, action: PayloadAction<{ name: string; data?: any }>) => {
      state.modals[action.payload.name] = {
        isOpen: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
        delete state.modals[action.payload].data;
      }
    },
    closeAllModals: state => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key].isOpen = false;
        delete state.modals[key].data;
      });
    },

    // 加载状态
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (
      state,
      action: PayloadAction<{ component: string; loading: boolean }>
    ) => {
      state.loading.components[action.payload.component] =
        action.payload.loading;
    },
    clearComponentLoading: (state, action: PayloadAction<string>) => {
      delete state.loading.components[action.payload];
    },

    // 侧边栏
    toggleSidebar: state => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    setSidebarTab: (state, action: PayloadAction<string>) => {
      state.sidebar.activeTab = action.payload;
    },

    // 游戏设置
    setGameSettings: (
      state,
      action: PayloadAction<Partial<UIState['gameSettings']>>
    ) => {
      state.gameSettings = { ...state.gameSettings, ...action.payload };
      // 保存到localStorage
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
      });
    },

    // 屏幕状态
    updateScreenSize: state => {
      state.screen.isMobile = window.innerWidth < 768;
      state.screen.isTablet =
        window.innerWidth >= 768 && window.innerWidth < 1024;
      state.screen.isDesktop = window.innerWidth >= 1024;
      state.screen.orientation =
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setAudioSettings,
  toggleSound,
  toggleMusic,
  toggleEffects,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalLoading,
  setComponentLoading,
  clearComponentLoading,
  toggleSidebar,
  setSidebarOpen,
  setSidebarTab,
  setGameSettings,
  updateScreenSize,
} = uiSlice.actions;

export default uiSlice.reducer;

// 选择器
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLanguage = (state: { ui: UIState }) => state.ui.language;
export const selectAudioSettings = (state: { ui: UIState }) => state.ui.audio;
export const selectNotifications = (state: { ui: UIState }) =>
  state.ui.notifications;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectGlobalLoading = (state: { ui: UIState }) =>
  state.ui.loading.global;
export const selectComponentLoading = (
  state: { ui: UIState },
  component: string
) => state.ui.loading.components[component] || false;
export const selectSidebar = (state: { ui: UIState }) => state.ui.sidebar;
export const selectGameSettings = (state: { ui: UIState }) =>
  state.ui.gameSettings;
export const selectScreen = (state: { ui: UIState }) => state.ui.screen;
