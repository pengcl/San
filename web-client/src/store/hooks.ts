import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';

// 认证相关hooks
export const useAuth = () => {
  const auth = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();

  return {
    ...auth,
    dispatch,
  };
};

// 游戏状态相关hooks
export const useGame = () => {
  const game = useAppSelector((state: any) => state.game);
  const dispatch = useAppDispatch();

  return {
    ...game,
    dispatch,
  };
};

// 英雄系统相关hooks
export const useHeroes = () => {
  const heroes = useAppSelector((state: any) => state.heroes);
  const dispatch = useAppDispatch();

  return {
    ...heroes,
    dispatch,
  };
};

// 战斗系统相关hooks
export const useBattle = () => {
  const battle = useAppSelector((state: any) => state.battle);
  const dispatch = useAppDispatch();

  return {
    ...battle,
    dispatch,
  };
};

// 背包系统相关hooks
export const useInventory = () => {
  const inventory = useAppSelector((state: any) => state.inventory);
  const dispatch = useAppDispatch();

  return {
    ...inventory,
    dispatch,
  };
};

// 城池系统相关hooks
export const useCity = () => {
  const city = useAppSelector((state: any) => state.city);
  const dispatch = useAppDispatch();

  return {
    ...city,
    dispatch,
  };
};

// UI状态相关hooks
export const useUI = () => {
  const ui = useAppSelector((state: any) => state.ui);
  const dispatch = useAppDispatch();

  return {
    ...ui,
    dispatch,
  };
};

// WebSocket相关hooks
export const useWebSocket = () => {
  const websocket = useAppSelector((state: any) => state.websocket);
  const dispatch = useAppDispatch();

  return {
    ...websocket,
    dispatch,
  };
};

// 组合hooks - 获取用户基本信息
export const useUserInfo = () => {
  const auth = useAppSelector((state: any) => state.auth);
  const game = useAppSelector((state: any) => state.game);

  return {
    // 认证信息
    isAuthenticated: auth.isAuthenticated,
    authUser: auth.user,
    token: auth.token,

    // 游戏信息
    gameProfile: game.userProfile,
    gameStats: game.stats,

    // 组合数据
    user: game.userProfile || auth.user,
    currency: {
      gold: game.userProfile?.gold || game.stats?.gold || 0,
      gems: game.userProfile?.gems || game.stats?.gems || 0,
      energy: game.userProfile?.energy || game.stats?.energy || 0,
    },
    level: {
      current: game.userProfile?.level || game.stats?.level || 1,
      experience: game.userProfile?.experience || game.stats?.experience || 0,
      maxExperience: game.stats?.maxExperience || 100,
    },
  };
};

// 游戏加载状态hooks
export const useGameLoading = () => {
  const auth = useAppSelector((state: any) => state.auth);
  const game = useAppSelector((state: any) => state.game);
  const heroes = useAppSelector((state: any) => state.heroes);
  const battle = useAppSelector((state: any) => state.battle);
  const inventory = useAppSelector((state: any) => state.inventory);

  return {
    auth: auth.isLoading,
    gameStats: game.isLoadingStats,
    gameProfile: game.isLoadingProfile,
    heroes: heroes.isLoading,
    battle: {
      starting: battle.isStartingBattle,
      ending: battle.isEndingBattle,
      history: battle.isLoadingHistory,
      leaderboard: battle.isLoadingLeaderboard,
    },
    inventory: inventory.isLoading,

    // 任何一个正在加载
    isAnyLoading:
      auth.isLoading ||
      game.isLoadingStats ||
      game.isLoadingProfile ||
      heroes.isLoading ||
      battle.isStartingBattle ||
      battle.isEndingBattle ||
      inventory.isLoading,
  };
};

// 游戏错误状态hooks
export const useGameErrors = () => {
  const auth = useAppSelector((state: any) => state.auth);
  const game = useAppSelector((state: any) => state.game);
  const heroes = useAppSelector((state: any) => state.heroes);
  const battle = useAppSelector((state: any) => state.battle);
  const inventory = useAppSelector((state: any) => state.inventory);

  const errors = [
    auth.error,
    game.statsError,
    game.profileError,
    heroes.error,
    battle.error,
    inventory.error,
  ].filter(Boolean);

  return {
    auth: auth.error,
    gameStats: game.statsError,
    gameProfile: game.profileError,
    heroes: heroes.error,
    battle: battle.error,
    inventory: inventory.error,

    // 所有错误
    allErrors: errors,
    hasAnyError: errors.length > 0,
    latestError: errors[0] || null,
  };
};

// 战斗状态hooks
export const useBattleState = () => {
  const battle = useAppSelector((state: any) => state.battle);

  return {
    // 基本状态
    isInBattle: battle.isInBattle,
    isPaused: battle.isPaused,
    battleId: battle.battleId,

    // 回合信息
    currentTurn: battle.currentTurn,
    maxTurns: battle.maxTurns,
    isPlayerTurn: battle.isPlayerTurn,

    // 选择状态
    selectedHeroId: battle.selectedHeroId,
    selectedSkillId: battle.selectedSkillId,
    targetHeroId: battle.targetHeroId,

    // 战斗设置
    battleSpeed: battle.battleSpeed,
    autoPlay: battle.autoPlay,

    // 阵容
    playerFormation: battle.playerFormation,
    enemyFormation: battle.enemyFormation,

    // 动画
    activeAnimations: battle.animations.activeAnimations,
    animationQueue: battle.animations.animationQueue,

    // 结果
    battleResult: battle.battleResult,
    rewards: battle.rewards,

    // 是否可以行动
    canAct:
      battle.isInBattle &&
      !battle.isPaused &&
      battle.isPlayerTurn &&
      battle.animations.activeAnimations.length === 0,
  };
};

// 自定义action hooks
export const useGameActions = () => {
  const dispatch = useAppDispatch();

  return {
    // 认证actions
    login: useCallback(
      (_payload: any) => {
        // 这里可以导入并dispatch相关action
        console.log('Login action placeholder');
      },
      [dispatch]
    ),

    logout: useCallback(() => {
      // 这里可以导入并dispatch相关action
      console.log('Logout action placeholder');
    }, [dispatch]),

    // 游戏actions
    updateCurrency: useCallback(
      (_payload: { gold?: number; gems?: number; energy?: number }) => {
        // 这里可以导入并dispatch相关action
        console.log('Update currency action placeholder');
      },
      [dispatch]
    ),

    updateExperience: useCallback(
      (_payload: { experience: number; levelUp?: boolean }) => {
        // 这里可以导入并dispatch相关action
        console.log('Update experience action placeholder');
      },
      [dispatch]
    ),

    // 战斗actions
    startBattle: useCallback(
      (_params: any) => {
        // 这里可以导入并dispatch相关action
        console.log('Start battle action placeholder');
      },
      [dispatch]
    ),

    endBattle: useCallback(
      (_params: any) => {
        // 这里可以导入并dispatch相关action
        console.log('End battle action placeholder');
      },
      [dispatch]
    ),
  };
};

// 缓存和刷新状态hooks
export const useCacheStatus = () => {
  const game = useAppSelector((state: any) => state.game);
  const battle = useAppSelector((state: any) => state.battle);

  const now = Date.now();
  const CACHE_DURATION = {
    stats: 5 * 60 * 1000, // 5分钟
    profile: 2 * 60 * 1000, // 2分钟
    history: 10 * 60 * 1000, // 10分钟
    leaderboard: 60 * 1000, // 1分钟
  };

  return {
    stats: {
      lastUpdate: game.lastStatsUpdate,
      isStale:
        !game.lastStatsUpdate ||
        now - game.lastStatsUpdate > CACHE_DURATION.stats,
    },
    profile: {
      lastUpdate: game.lastProfileUpdate,
      isStale:
        !game.lastProfileUpdate ||
        now - game.lastProfileUpdate > CACHE_DURATION.profile,
    },
    battleHistory: {
      lastUpdate: battle.lastHistoryUpdate,
      isStale:
        !battle.lastHistoryUpdate ||
        now - battle.lastHistoryUpdate > CACHE_DURATION.history,
    },
    leaderboard: {
      lastUpdate: battle.lastLeaderboardUpdate,
      isStale:
        !battle.lastLeaderboardUpdate ||
        now - battle.lastLeaderboardUpdate > CACHE_DURATION.leaderboard,
    },
  };
};

export default {
  useAuth,
  useGame,
  useHeroes,
  useBattle,
  useInventory,
  useCity,
  useUI,
  useWebSocket,
  useUserInfo,
  useGameLoading,
  useGameErrors,
  useBattleState,
  useGameActions,
  useCacheStatus,
};
