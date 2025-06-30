import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { AppDispatch } from '../index';
import {
  updateCurrency,
  updateExperience,
  unlockAchievement,
  updateAchievementProgress,
} from '../slices/gameSlice';
import { endBattle, addToBattleHistory } from '../slices/battleSlice';
import { updateHero, levelUpHero } from '../slices/heroesSlice';

// 创建监听器中间件
export const gameMiddleware = createListenerMiddleware();

// 游戏事件监听器类型定义（预留扩展用）
// type GameEvent =
//   | { type: 'HERO_LEVEL_UP'; payload: { heroId: number; newLevel: number; experience: number } }
//   | { type: 'BATTLE_END'; payload: { victory: boolean; rewards: any[]; experience: number; gold: number } }
//   | { type: 'ITEM_ACQUIRED'; payload: { itemId: number; quantity: number } }
//   | { type: 'ACHIEVEMENT_PROGRESS'; payload: { achievementId: number; progress: number } }
//   | { type: 'CURRENCY_CHANGE'; payload: { gold?: number; gems?: number; energy?: number } };

// 英雄升级事件处理
gameMiddleware.startListening({
  actionCreator: levelUpHero,
  effect: async (action, listenerApi) => {
    const { id, newLevel, newExperience } = action.payload;
    const state = listenerApi.getState() as any;
    const dispatch = listenerApi.dispatch as AppDispatch;

    // 更新游戏统计中的经验值
    dispatch(
      updateExperience({
        experience:
          newExperience -
          (state.heroes.heroes.find(h => h.id === id)?.experience || 0),
      })
    );

    // 检查是否解锁新成就
    const hero = state.heroes.heroes.find(h => h.id === id);
    if (hero) {
      // 检查英雄等级相关成就
      if (newLevel >= 10) {
        dispatch(updateAchievementProgress({ id: 1001, progress: newLevel })); // 英雄达到10级
      }
      if (newLevel >= 50) {
        dispatch(updateAchievementProgress({ id: 1002, progress: newLevel })); // 英雄达到50级
      }
      if (newLevel >= 100) {
        dispatch(unlockAchievement(1003)); // 英雄达到100级
      }
    }

    console.log(`Hero ${id} leveled up to ${newLevel}!`);
  },
});

// 战斗结束事件处理
gameMiddleware.startListening({
  predicate: action => endBattle.fulfilled.match(action),
  effect: async (action, listenerApi) => {
    const battleResult = action.payload;
    const dispatch = listenerApi.dispatch as AppDispatch;
    const state = listenerApi.getState() as any;

    // 更新货币
    if (battleResult.gold > 0) {
      dispatch(updateCurrency({ gold: battleResult.gold }));
    }

    // 更新经验值
    if (battleResult.experience > 0) {
      dispatch(updateExperience({ experience: battleResult.experience }));
    }

    // 添加到战斗历史
    dispatch(addToBattleHistory(battleResult));

    // 检查战斗相关成就
    const totalBattles = state.game.stats?.totalBattles || 0;
    const totalVictories = state.game.stats?.totalVictories || 0;

    if (battleResult.victory) {
      // 胜利次数成就
      if (totalVictories + 1 >= 10) {
        dispatch(
          updateAchievementProgress({ id: 2001, progress: totalVictories + 1 })
        );
      }
      if (totalVictories + 1 >= 100) {
        dispatch(
          updateAchievementProgress({ id: 2002, progress: totalVictories + 1 })
        );
      }
      if (totalVictories + 1 >= 1000) {
        dispatch(unlockAchievement(2003));
      }
    }

    // 总战斗次数成就
    if (totalBattles + 1 >= 50) {
      dispatch(
        updateAchievementProgress({ id: 2004, progress: totalBattles + 1 })
      );
    }

    console.log(`Battle ended: ${battleResult.victory ? 'Victory' : 'Defeat'}`);
  },
});

// 货币变化事件处理
gameMiddleware.startListening({
  actionCreator: updateCurrency,
  effect: async (action, listenerApi) => {
    const { gold, gems } = action.payload;
    const state = listenerApi.getState() as any;
    const dispatch = listenerApi.dispatch as AppDispatch;

    // 检查财富相关成就
    const currentGold =
      state.game.userProfile?.gold || state.game.stats?.gold || 0;
    const currentGems =
      state.game.userProfile?.gems || state.game.stats?.gems || 0;

    if (gold && gold > 0) {
      const newGold = currentGold + gold;
      if (newGold >= 10000) {
        dispatch(updateAchievementProgress({ id: 3001, progress: newGold }));
      }
      if (newGold >= 100000) {
        dispatch(updateAchievementProgress({ id: 3002, progress: newGold }));
      }
      if (newGold >= 1000000) {
        dispatch(unlockAchievement(3003));
      }
    }

    if (gems && gems > 0) {
      const newGems = currentGems + gems;
      if (newGems >= 1000) {
        dispatch(updateAchievementProgress({ id: 3004, progress: newGems }));
      }
      if (newGems >= 10000) {
        dispatch(unlockAchievement(3005));
      }
    }

    // 保存到本地存储
    try {
      const gameData = {
        gold: currentGold + (gold || 0),
        gems: currentGems + (gems || 0),
        lastUpdate: Date.now(),
      };
      localStorage.setItem('game_currency', JSON.stringify(gameData));
    } catch (error) {
      console.warn('Failed to save currency to localStorage:', error);
    }
  },
});

// 成就解锁事件处理
gameMiddleware.startListening({
  actionCreator: unlockAchievement,
  effect: async (action, listenerApi) => {
    const achievementId = action.payload;
    const state = listenerApi.getState() as any;

    const achievement = state.game.achievements.find(
      a => a.id === achievementId
    );
    if (achievement) {
      // 显示成就解锁通知
      console.log(`Achievement unlocked: ${achievement.name}!`);

      // 这里可以触发UI通知
      // dispatch(showNotification({
      //   type: 'achievement',
      //   title: 'Achievement Unlocked!',
      //   message: achievement.name
      // }));

      // 给予成就奖励
      if (achievement.rewards?.length > 0) {
        achievement.rewards.forEach(reward => {
          switch (reward.type) {
            case 'gold':
              listenerApi.dispatch(updateCurrency({ gold: reward.amount }));
              break;
            case 'gems':
              listenerApi.dispatch(updateCurrency({ gems: reward.amount }));
              break;
            case 'experience':
              listenerApi.dispatch(
                updateExperience({ experience: reward.amount })
              );
              break;
          }
        });
      }
    }
  },
});

// 自动保存游戏状态
gameMiddleware.startListening({
  predicate: action => {
    // 监听所有会改变游戏状态的action
    return isAnyOf(
      updateCurrency,
      updateExperience,
      unlockAchievement,
      levelUpHero,
      updateHero
    )(action);
  },
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as any;

    // 自动保存关键游戏数据到本地存储
    try {
      const saveData = {
        user: state.game.userProfile,
        stats: state.game.stats,
        achievements: state.game.unlockedAchievements,
        heroes: state.heroes.heroes.map(hero => ({
          id: hero.id,
          level: hero.level,
          experience: hero.experience,
          equipment: hero.equipment,
        })),
        lastSave: Date.now(),
      };

      localStorage.setItem('game_save', JSON.stringify(saveData));
    } catch (error) {
      console.warn('Failed to auto-save game data:', error);
    }
  },
});

// 错误处理中间件
gameMiddleware.startListening({
  predicate: action => {
    return action.type.endsWith('/rejected');
  },
  effect: async (action, _listenerApi) => {
    // 忽略查询取消错误 (AbortError)
    if (action.payload?.name === 'AbortError' || 
        action.payload?.message?.includes('aborted') ||
        action.payload === undefined) {
      return;
    }

    // 只记录真正的错误
    console.error('Game action failed:', action.type, action.payload);

    // 这里可以添加错误上报逻辑
    // errorReporter.report(action.type, action.payload);
  },
});

// 服务器时间同步
let serverTimeInterval: number | null = null;

gameMiddleware.startListening({
  predicate: action => action.type === 'websocket/connected',
  effect: async (_action, _listenerApi) => {
    // const dispatch = listenerApi.dispatch as AppDispatch;

    // 开始定期同步服务器时间
    if (serverTimeInterval) {
      clearInterval(serverTimeInterval);
    }

    serverTimeInterval = window.setInterval(() => {
      // 这里应该从WebSocket或API获取服务器时间
      // dispatch(updateServerTime(Date.now()));
    }, 30000); // 每30秒同步一次
  },
});

gameMiddleware.startListening({
  predicate: action => action.type === 'websocket/disconnected',
  effect: async (_action, _listenerApi) => {
    // 停止服务器时间同步
    if (serverTimeInterval) {
      clearInterval(serverTimeInterval);
      serverTimeInterval = null;
    }
  },
});

export default gameMiddleware;
