import { createListenerMiddleware } from '@reduxjs/toolkit';
import { gameStorage, storageListener } from '../../utils/storage';

// 需要持久化的action类型
const PERSISTABLE_ACTIONS = [
  // 用户相关
  'auth/loginSuccess',
  'auth/updateProfile',
  'auth/logout',

  // 游戏状态
  'game/updateStats',
  'game/updateCurrency',
  'game/updateLevel',

  // 英雄相关
  'heroes/addHero',
  'heroes/updateHero',
  'heroes/removeHero',
  'heroes/levelUpHero',

  // 阵容相关 (暂时注释，需要实现对应的slice)
  // 'formation/updateFormation',
  // 'formation/savePreset',
  // 'formation/removePreset',

  // 背包相关
  'inventory/addItem',
  'inventory/removeItem',
  'inventory/updateItem',

  // 设置相关 (暂时注释，需要实现对应的slice)
  // 'settings/updateTheme',
  // 'settings/updateSound',
  // 'settings/updateGeneral',
];

// 创建存储中间件
export const storageMiddleware = createListenerMiddleware();

// 状态持久化监听器
storageMiddleware.startListening({
  predicate: action => {
    return PERSISTABLE_ACTIONS.some(actionType =>
      action.type.startsWith(actionType)
    );
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as any;

    try {
      // 根据action类型保存相应的状态
      if (action.type.startsWith('auth/')) {
        await saveAuthState(state);
      }

      if (action.type.startsWith('game/')) {
        await saveGameState(state);
      }

      if (action.type.startsWith('heroes/')) {
        await saveHeroesState(state);
      }

      // if (action.type.startsWith('formation/')) {
      //   await saveFormationState(state);
      // }

      if (action.type.startsWith('inventory/')) {
        await saveInventoryState(state);
      }

      // if (action.type.startsWith('settings/')) {
      //   await saveSettingsState(state);
      // }
    } catch (error) {
      console.error('Storage middleware error:', error);
    }
  },
});

// 自动保存监听器（每30秒保存一次完整状态）
storageMiddleware.startListening({
  predicate: () => true,
  effect: async (_, listenerApi) => {
    // 防抖机制：只在最后一个action后30秒执行保存
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = window.setTimeout(async () => {
      const state = listenerApi.getState() as any;
      await saveCompleteState(state);
    }, 30000) as unknown as number;
  },
});

let autoSaveTimer: number | null = null;

// 保存认证状态
async function saveAuthState(state: any): Promise<void> {
  const authState = {
    token: state.auth.token,
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
  };

  if (authState.token) {
    gameStorage.saveUserToken(authState.token);
  }

  if (authState.user) {
    gameStorage.saveUserProfile(authState.user);
  }

  // 通知存储监听器
  storageListener.emit('authState', authState);
}

// 保存游戏状态
async function saveGameState(state: any): Promise<void> {
  const gameState = {
    stats: state.game.stats,
    userProfile: state.game.userProfile,
    achievements: state.game.achievements,
    currency: {
      gold: state.game.stats?.gold || 0,
      gems: state.game.stats?.gems || 0,
      energy: state.game.stats?.energy || 0,
    },
  };

  gameStorage.saveGameState(gameState);
  storageListener.emit('gameState', gameState);
}

// 保存英雄状态
async function saveHeroesState(state: any): Promise<void> {
  const heroesState = {
    heroes: state.heroes.heroes,
    selectedHero: state.heroes.selectedHero,
    lastUpdated: Date.now(),
  };

  // gameStorage.saveHeroesData 期望数组，但我们传递的是对象
  gameStorage.saveHeroesData(heroesState.heroes);
  storageListener.emit('heroesState', heroesState);
}

// 保存阵容状态 (暂时注释，需要实现formation slice)
// async function saveFormationState(state: any): Promise<void> {
//   const formationState = {
//     currentFormation: state.formation.currentFormation,
//     presets: state.formation.presets,
//     lastUsed: state.formation.lastUsed,
//   };
//
//   gameStorage.saveFormationData(formationState);
//   storageListener.emit('formationState', formationState);
// }

// 保存背包状态
async function saveInventoryState(state: any): Promise<void> {
  const inventoryState = {
    items: state.inventory.items,
    // equipment: state.inventory.equipment, // 当前inventory slice没有equipment字段
    // capacity: state.inventory.capacity,   // 当前inventory slice没有capacity字段
  };

  gameStorage.saveInventoryData(inventoryState);
  storageListener.emit('inventoryState', inventoryState);
}

// 保存设置状态 (暂时注释，需要实现settings slice)
// async function saveSettingsState(state: any): Promise<void> {
//   const settingsState = {
//     theme: state.settings.theme,
//     sound: state.settings.sound,
//     general: state.settings.general,
//   };
//
//   // 使用设置管理器保存
//   if (state.settings.theme) {
//     gameStorage.set('theme_settings', state.settings.theme);
//   }
//
//   if (state.settings.sound) {
//     gameStorage.set('sound_settings', state.settings.sound);
//   }
//
//   storageListener.emit('settingsState', settingsState);
// }

// 保存完整状态
async function saveCompleteState(state: any): Promise<void> {
  console.log('Auto-saving complete game state...');

  try {
    await Promise.all([
      saveAuthState(state),
      saveGameState(state),
      saveHeroesState(state),
      // saveFormationState(state),
      saveInventoryState(state),
      // saveSettingsState(state),
    ]);

    console.log('Auto-save completed successfully');
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}

// 状态恢复中间件
export const stateRestoreMiddleware = createListenerMiddleware();

stateRestoreMiddleware.startListening({
  predicate: action => action.type === 'app/initialize',
  effect: async (_, listenerApi) => {
    try {
      await restoreState(listenerApi.dispatch);
    } catch (error) {
      console.error('State restore error:', error);
    }
  },
});

// 恢复状态
async function restoreState(dispatch: any): Promise<void> {
  console.log('Restoring state from storage...');

  try {
    // 恢复认证状态
    const token = gameStorage.getUserToken();
    const userProfile = gameStorage.getUserProfile();

    if (token && userProfile) {
      dispatch({
        type: 'auth/restoreSession',
        payload: { token, user: userProfile },
      });
    }

    // 恢复游戏状态
    const gameState = gameStorage.getGameState();
    if (gameState) {
      dispatch({
        type: 'game/restoreState',
        payload: gameState,
      });
    }

    // 恢复英雄状态
    const heroesState = gameStorage.getHeroesData();
    if (heroesState && Array.isArray(heroesState)) {
      dispatch({
        type: 'heroes/restoreState',
        payload: heroesState,
      });
    }

    // 恢复阵容状态 (暂时注释)
    // const formationState = gameStorage.getFormationData();
    // if (formationState) {
    //   dispatch({
    //     type: 'formation/restoreState',
    //     payload: formationState
    //   });
    // }

    // 恢复背包状态
    const inventoryState = gameStorage.getInventoryData();
    if (inventoryState) {
      dispatch({
        type: 'inventory/restoreState',
        payload: inventoryState,
      });
    }

    // 恢复设置状态 (暂时注释)
    // const themeSettings = gameStorage.get('theme_settings');
    // const soundSettings = gameStorage.get('sound_settings');
    //
    // if (themeSettings) {
    //   dispatch({
    //     type: 'settings/restoreTheme',
    //     payload: themeSettings
    //   });
    // }
    //
    // if (soundSettings) {
    //   dispatch({
    //     type: 'settings/restoreSound',
    //     payload: soundSettings
    //   });
    // }

    console.log('State restored successfully');
  } catch (error) {
    console.error('Failed to restore state:', error);
  }
}

// 清理中间件
export const cleanupMiddleware = createListenerMiddleware();

cleanupMiddleware.startListening({
  predicate: action =>
    action.type === 'auth/logout' || action.type === 'app/reset',
  effect: async action => {
    if (action.type === 'auth/logout') {
      // 登出时只清理用户相关数据，保留设置
      gameStorage.clearUserData();
      console.log('User data cleared on logout');
    } else if (action.type === 'app/reset') {
      // 重置应用时清理所有数据
      gameStorage.clear();
      console.log('All storage cleared on app reset');
    }
  },
});

// 导出所有中间件
export const allStorageMiddleware = [
  storageMiddleware.middleware,
  stateRestoreMiddleware.middleware,
  cleanupMiddleware.middleware,
];

// 存储统计工具
export const storageStats = {
  // 获取存储使用情况
  getUsage: () => gameStorage.getUsage(),

  // 检查存储健康状况
  checkHealth: () => {
    const usage = gameStorage.getUsage();
    const usagePercent = (usage.used / usage.total) * 100;

    return {
      isHealthy: usagePercent < 80,
      usagePercent,
      recommendation:
        usagePercent > 80 ? 'Consider clearing cache' : 'Storage is healthy',
    };
  },

  // 获取存储项目数量
  getItemCount: () => {
    return gameStorage.getKeys().length;
  },

  // 获取最后保存时间
  getLastSaveTime: () => {
    return gameStorage.get('last_save_time') || null;
  },

  // 更新最后保存时间
  updateLastSaveTime: () => {
    gameStorage.set('last_save_time', Date.now());
  },
};

export default {
  storageMiddleware,
  stateRestoreMiddleware,
  cleanupMiddleware,
  allStorageMiddleware,
  storageStats,
};
