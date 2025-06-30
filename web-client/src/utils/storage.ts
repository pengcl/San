// 本地存储工具类

interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // 过期时间（毫秒）
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  version: string;
}

// 存储键名常量
export const STORAGE_KEYS = {
  // 用户数据
  USER_TOKEN: 'game_user_token',
  USER_PROFILE: 'game_user_profile',
  USER_SETTINGS: 'game_user_settings',

  // 游戏数据
  GAME_STATE: 'game_state',
  HEROES_DATA: 'game_heroes_data',
  FORMATION_DATA: 'game_formation_data',
  INVENTORY_DATA: 'game_inventory_data',

  // 缓存数据
  API_CACHE: 'game_api_cache',
  BATTLE_HISTORY: 'game_battle_history',
  ACHIEVEMENT_CACHE: 'game_achievement_cache',

  // 应用设置
  APP_VERSION: 'game_app_version',
  LAST_LOGIN: 'game_last_login',
  THEME_SETTINGS: 'game_theme_settings',
  SOUND_SETTINGS: 'game_sound_settings',
} as const;

// 当前应用版本
const APP_VERSION = '1.0.0';

class StorageManager {
  private prefix: string;

  constructor(prefix: string = 'three_kingdoms_') {
    this.prefix = prefix;
  }

  // 获取完整键名
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // 设置数据
  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        version: APP_VERSION,
      };

      if (options.ttl) {
        item.ttl = options.ttl;
      }

      let dataString = JSON.stringify(item);

      // 压缩数据（简单的实现）
      if (options.compress) {
        dataString = this.compress(dataString);
      }

      // 加密数据（简单的实现）
      if (options.encrypt) {
        dataString = this.encrypt(dataString);
      }

      localStorage.setItem(this.getKey(key), dataString);
      return true;
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      return false;
    }
  }

  // 获取数据
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const dataString = localStorage.getItem(this.getKey(key));
      if (!dataString) {
        return defaultValue ?? null;
      }

      // 解密数据
      let decryptedData = dataString;
      try {
        decryptedData = this.decrypt(dataString);
      } catch {
        // 如果解密失败，尝试直接解析（向后兼容）
      }

      // 解压数据
      try {
        decryptedData = this.decompress(decryptedData);
      } catch {
        // 如果解压失败，使用原数据
      }

      const item: StorageItem<T> = JSON.parse(decryptedData);

      // 检查版本兼容性
      if (item.version && item.version !== APP_VERSION) {
        console.warn(
          `Storage version mismatch for key ${key}. Expected: ${APP_VERSION}, Got: ${item.version}`
        );
      }

      // 检查过期时间
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return item.value;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return defaultValue ?? null;
    }
  }

  // 删除数据
  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error);
      return false;
    }
  }

  // 清空所有数据
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  // 获取存储使用情况
  getUsage(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);

      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      });

      // 估算可用空间（localStorage通常为5-10MB）
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.error('Storage usage error:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  // 检查是否支持localStorage
  isSupported(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // 获取所有键
  getKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Storage getKeys error:', error);
      return [];
    }
  }

  // 批量设置
  setBatch<T>(items: Record<string, T>, options: StorageOptions = {}): boolean {
    try {
      for (const [key, value] of Object.entries(items)) {
        if (!this.set(key, value, options)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Storage setBatch error:', error);
      return false;
    }
  }

  // 批量获取
  getBatch<T>(keys: string[], defaultValue?: T): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key, defaultValue);
    });
    return result;
  }

  // 简单的压缩实现（使用JSON压缩）
  private compress(data: string): string {
    // 这里可以实现更复杂的压缩算法
    // 目前只是简单的JSON最小化
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed);
    } catch {
      return data;
    }
  }

  // 简单的解压实现
  private decompress(data: string): string {
    return data;
  }

  // 简单的加密实现（Base64编码）
  private encrypt(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  }

  // 简单的解密实现
  private decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  }
}

// 游戏专用存储管理器
class GameStorageManager extends StorageManager {
  constructor() {
    super('three_kingdoms_game_');
  }

  // 保存用户令牌
  saveUserToken(token: string): boolean {
    return this.set(STORAGE_KEYS.USER_TOKEN, token, { encrypt: true });
  }

  // 获取用户令牌
  getUserToken(): string | null {
    return this.get<string>(STORAGE_KEYS.USER_TOKEN);
  }

  // 保存用户配置
  saveUserProfile(profile: any): boolean {
    return this.set(STORAGE_KEYS.USER_PROFILE, profile, {
      ttl: 24 * 60 * 60 * 1000,
    }); // 24小时过期
  }

  // 获取用户配置
  getUserProfile(): any {
    return this.get(STORAGE_KEYS.USER_PROFILE);
  }

  // 保存游戏状态
  saveGameState(state: any): boolean {
    return this.set(STORAGE_KEYS.GAME_STATE, state, { compress: true });
  }

  // 获取游戏状态
  getGameState(): any {
    return this.get(STORAGE_KEYS.GAME_STATE);
  }

  // 保存英雄数据
  saveHeroesData(heroes: any[]): boolean {
    return this.set(STORAGE_KEYS.HEROES_DATA, heroes, {
      compress: true,
      ttl: 60 * 60 * 1000, // 1小时过期
    });
  }

  // 获取英雄数据
  getHeroesData(): any[] {
    return this.get<any[]>(STORAGE_KEYS.HEROES_DATA, []) || [];
  }

  // 保存阵容数据
  saveFormationData(formation: any): boolean {
    return this.set(STORAGE_KEYS.FORMATION_DATA, formation);
  }

  // 获取阵容数据
  getFormationData(): any {
    return this.get(STORAGE_KEYS.FORMATION_DATA);
  }

  // 保存背包数据
  saveInventoryData(inventory: any): boolean {
    return this.set(STORAGE_KEYS.INVENTORY_DATA, inventory, { compress: true });
  }

  // 获取背包数据
  getInventoryData(): any {
    return this.get(STORAGE_KEYS.INVENTORY_DATA);
  }

  // 清除用户相关数据
  clearUserData(): boolean {
    const userKeys = [
      STORAGE_KEYS.USER_TOKEN,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.GAME_STATE,
      STORAGE_KEYS.HEROES_DATA,
      STORAGE_KEYS.FORMATION_DATA,
      STORAGE_KEYS.INVENTORY_DATA,
    ];

    let success = true;
    userKeys.forEach(key => {
      if (!this.remove(key)) {
        success = false;
      }
    });

    return success;
  }
}

// 缓存管理器
class CacheManager extends StorageManager {
  constructor() {
    super('three_kingdoms_cache_');
  }

  // 设置API缓存
  setApiCache(
    endpoint: string,
    data: any,
    ttl: number = 5 * 60 * 1000
  ): boolean {
    const cacheKey = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return this.set(cacheKey, data, { ttl, compress: true });
  }

  // 获取API缓存
  getApiCache(endpoint: string): any {
    const cacheKey = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return this.get(cacheKey);
  }

  // 清除过期缓存
  clearExpiredCache(): number {
    let cleared = 0;
    const keys = this.getKeys();

    keys.forEach(key => {
      const data = this.get(key);
      if (data === null) {
        cleared++;
      }
    });

    return cleared;
  }
}

// 设置管理器
class SettingsManager extends StorageManager {
  constructor() {
    super('three_kingdoms_settings_');
  }

  // 保存应用设置
  saveAppSettings(settings: any): boolean {
    return this.set(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  // 获取应用设置
  getAppSettings(): any {
    return this.get(STORAGE_KEYS.USER_SETTINGS, {
      theme: 'dark',
      language: 'zh-CN',
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      autoSave: true,
    });
  }

  // 保存主题设置
  saveThemeSettings(theme: any): boolean {
    return this.set(STORAGE_KEYS.THEME_SETTINGS, theme);
  }

  // 获取主题设置
  getThemeSettings(): any {
    return this.get(STORAGE_KEYS.THEME_SETTINGS, { mode: 'dark' });
  }

  // 保存音效设置
  saveSoundSettings(sound: any): boolean {
    return this.set(STORAGE_KEYS.SOUND_SETTINGS, sound);
  }

  // 获取音效设置
  getSoundSettings(): any {
    return this.get(STORAGE_KEYS.SOUND_SETTINGS, {
      master: 100,
      music: 80,
      sfx: 90,
      voice: 85,
    });
  }
}

// 创建实例
export const storage = new StorageManager();
export const gameStorage = new GameStorageManager();
export const cacheManager = new CacheManager();
export const settingsManager = new SettingsManager();

// 存储监听器
class StorageListener {
  private listeners: Map<string, ((value: any) => void)[]> = new Map();

  // 添加监听器
  on(key: string, callback: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);

    // 返回移除函数
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // 触发监听器
  emit(key: string, value: any): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Storage listener error for key ${key}:`, error);
        }
      });
    }
  }

  // 清除所有监听器
  clear(): void {
    this.listeners.clear();
  }
}

export const storageListener = new StorageListener();

// 存储工具函数
export const storageUtils = {
  // 检查存储空间
  checkSpace(): boolean {
    const { available, total } = storage.getUsage();
    const usagePercent = ((total - available) / total) * 100;

    if (usagePercent > 90) {
      console.warn('Storage space is running low');
      return false;
    }

    return true;
  },

  // 清理存储空间
  cleanup(): number {
    let cleaned = 0;

    // 清理过期缓存
    cleaned += cacheManager.clearExpiredCache();

    // 可以添加更多清理逻辑

    return cleaned;
  },

  // 导出数据
  exportData(): string {
    const data = {
      game: gameStorage.getBatch(Object.values(STORAGE_KEYS)),
      settings: settingsManager.getAppSettings(),
      timestamp: Date.now(),
      version: APP_VERSION,
    };

    return JSON.stringify(data, null, 2);
  },

  // 导入数据
  importData(dataString: string): boolean {
    try {
      const data = JSON.parse(dataString);

      if (data.version !== APP_VERSION) {
        console.warn('Version mismatch during import');
      }

      // 导入游戏数据
      if (data.game) {
        return gameStorage.setBatch(data.game);
      }

      return true;
    } catch (error) {
      console.error('Import data error:', error);
      return false;
    }
  },
};

export default {
  storage,
  gameStorage,
  cacheManager,
  settingsManager,
  storageListener,
  storageUtils,
  STORAGE_KEYS,
};
